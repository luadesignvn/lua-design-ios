import Foundation
import NetworkExtension
import Capacitor

/// Native-only D1 provisioning. All local requests are constrained to 192.168.4.1;
/// no arbitrary URL or credential persistence is exposed to JavaScript.
@objc(LuaD1WifiPlugin)
public class LuaD1WifiPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LuaD1WifiPlugin"
    public let jsName = "LuaD1Wifi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "joinAp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWifi", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "leaveAp", returnType: CAPPluginReturnPromise)
    ]

    private let d1URL = URL(string: "http://192.168.4.1")!
    private var configuredSSID: String?
    private var verifiedDeviceID: String?
    private var verifiedMacShort: String?
    private var generation = 0
    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.ephemeral
        config.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        config.urlCache = nil
        config.httpCookieStorage = nil
        config.httpShouldSetCookies = false
        config.waitsForConnectivity = false
        config.timeoutIntervalForRequest = 16
        return URLSession(configuration: config)
    }()

    private func request(_ path: String, query: [URLQueryItem] = [],
                         completion: @escaping (Result<[String: Any], Error>) -> Void) {
        guard var url = URLComponents(url: d1URL, resolvingAgainstBaseURL: false) else {
            completion(.failure(NSError(domain: "LuaD1Wifi", code: 1))); return
        }
        url.path = path
        url.queryItems = query.isEmpty ? nil : query
        guard let endpoint = url.url else {
            completion(.failure(NSError(domain: "LuaD1Wifi", code: 2))); return
        }
        var req = URLRequest(url: endpoint)
        req.httpMethod = "GET" // Compatibility with the EXISTING D1 HTTP_GET firmware routes.
        req.timeoutInterval = path == "/sta_scan" ? 16 : 7
        req.setValue("no-store", forHTTPHeaderField: "Cache-Control")
        session.dataTask(with: req) { data, response, error in
            if let error = error { completion(.failure(error)); return }
            guard let http = response as? HTTPURLResponse, let data = data,
                  data.count <= 65536,
                  let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                completion(.failure(NSError(domain: "LuaD1Wifi", code: 3,
                                             userInfo: [NSLocalizedDescriptionKey: "Phản hồi D1 không hợp lệ."]))); return
            }
            if !(200...299).contains(http.statusCode) {
                let message = (http.statusCode == 429) ? "D1 giới hạn quét mạng: vui lòng đợi 10 giây." :
                    ((object["error"] as? String) ?? "D1 HTTP \(http.statusCode)")
                completion(.failure(NSError(domain: "LuaD1Wifi", code: http.statusCode,
                                             userInfo: [NSLocalizedDescriptionKey: message]))); return
            }
            completion(.success(object))
        }.resume()
    }

    // NEHotspotConfiguration applies a configuration; it does not guarantee IP routing.
    // We verify BOTH local D1 endpoints and the exact advertised AP name before any write.
    private func verifyAP(_ ssid: String, attempt: Int, token: Int, call: CAPPluginCall) {
        guard token == generation else { return }
        request("/sta_info") { [weak self] infoResult in
            guard let self = self else { return }
            DispatchQueue.main.async {
                guard token == self.generation else { return }
                if case .success(let info) = infoResult,
                   (info["ap_ssid"] as? String) == ssid {
                    self.request("/device") { deviceResult in
                        DispatchQueue.main.async {
                            guard token == self.generation else { return }
                            if case .success(let device) = deviceResult,
                               let mac = device["mac_short"] as? String,
                               mac.range(of: "^[A-Fa-f0-9]{6}$", options: .regularExpression) != nil,
                               let deviceID = device["device_id"] as? String,
                               deviceID.lowercased() == "lua-\(mac.lowercased())" {
                                self.verifiedDeviceID = deviceID
                                self.verifiedMacShort = mac.uppercased()
                                call.resolve(["ssid": ssid, "mac_short": mac.uppercased(),
                                              "device_id": deviceID, "sta_connected": info["connected"] as? Bool ?? false])
                            } else { self.retryVerify(ssid, attempt: attempt, token: token, call: call) }
                        }
                    }
                } else {
                    // Wrong local device: do NOT send /sta_connect to it.
                    if case .success = infoResult {
                        self.resetAP()
                        call.reject("Đang kết nối nhầm AP. Vui lòng kiểm tra tên Wi-Fi D1.", "WRONG_AP")
                    } else { self.retryVerify(ssid, attempt: attempt, token: token, call: call) }
                }
            }
        }
    }

    private func retryVerify(_ ssid: String, attempt: Int, token: Int, call: CAPPluginCall) {
        guard token == generation else { return }
        guard attempt < 10 else {
            resetAP()
            call.reject("Không truy cập được D1 qua 192.168.4.1. Kiểm tra iPhone đã Join AP và cho phép Local Network.", "D1_UNREACHABLE")
            return
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) { [weak self] in
            self?.verifyAP(ssid, attempt: attempt + 1, token: token, call: call)
        }
    }

    private func resetAP() {
        if let ssid = configuredSSID { NEHotspotConfigurationManager.shared.removeConfiguration(forSSID: ssid) }
        configuredSSID = nil
        verifiedDeviceID = nil
        verifiedMacShort = nil
    }

    @objc public func joinAp(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let ssid = (call.getString("ssid") ?? "").trimmingCharacters(in: .whitespacesAndNewlines)
            guard ssid.hasPrefix("Lua Design Controller_"), ssid.utf8.count <= 32,
                  ssid.count > "Lua Design Controller_".count else {
                call.reject("Tên AP D1 không hợp lệ.", "BAD_SSID"); return
            }
            // Never expose a general-purpose hotspot API to arbitrary networks.
            self.generation += 1
            let token = self.generation
            if self.configuredSSID != ssid { self.resetAP() }
            let config = NEHotspotConfiguration(ssid: ssid) // Current firmware AP is open.
            config.joinOnce = true
            NEHotspotConfigurationManager.shared.apply(config) { [weak self] error in
                DispatchQueue.main.async {
                    guard let self = self else { return }
                    if token != self.generation {
                        NEHotspotConfigurationManager.shared.removeConfiguration(forSSID: ssid)
                        return
                    }
                    if let err = error as NSError? {
                        let associated = err.domain == NEHotspotConfigurationErrorDomain &&
                            err.code == NEHotspotConfigurationError.alreadyAssociated.rawValue
                        if !associated {
                            call.reject("iOS không thể kết nối AP D1: \(err.localizedDescription)", "IOS_JOIN_FAILED")
                            return
                        }
                    }
                    self.configuredSSID = ssid
                    self.verifiedDeviceID = nil
                    self.verifiedMacShort = nil
                    self.verifyAP(ssid, attempt: 0, token: token, call: call)
                }
            }
        }
    }

    private func withVerifiedAP(_ call: CAPPluginCall,
                                action: @escaping ([String: Any]) -> Void) {
        guard let ssid = configuredSSID, verifiedDeviceID != nil else {
            call.reject("Bạn phải kết nối và xác minh D1 trước.", "NOT_VERIFIED"); return
        }
        let token = generation
        request("/sta_info") { [weak self] result in
            DispatchQueue.main.async {
                guard let self = self, token == self.generation,
                      self.configuredSSID == ssid, self.verifiedDeviceID != nil else {
                    call.reject("Phiên kết nối AP đã kết thúc.", "SESSION_ENDED")
                    return
                }
                guard case .success(let info) = result,
                      (info["ap_ssid"] as? String) == ssid else {
                    call.reject("Mất kết nối hoặc không còn đúng AP D1.", "LOST_AP")
                    return
                }
                action(info)
            }
        }
    }

    @objc public func scan(_ call: CAPPluginCall) {
        withVerifiedAP(call) { [weak self] _ in
            self?.request("/sta_scan") { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success(let data):
                        call.resolve(["networks": data["networks"] as? [[String: Any]] ?? [],
                                      "saved_ssid": data["saved_ssid"] as? String ?? ""])
                    case .failure(let err): call.reject(err.localizedDescription, "SCAN_FAILED")
                    }
                }
            }
        }
    }

    @objc public func status(_ call: CAPPluginCall) {
        withVerifiedAP(call) { info in call.resolve(info) }
    }

    @objc public func saveWifi(_ call: CAPPluginCall) {
        guard let ssid = call.getString("ssid"), !ssid.isEmpty, ssid.utf8.count <= 32,
              let password = call.getString("password"), password.utf8.count <= 63 else {
            call.reject("Tên mạng hoặc độ dài mật khẩu không hợp lệ.", "BAD_INPUT"); return
        }
        // Firmware v1.0.14 only exposes HTTP_GET /sta_connect?ssid=...&pass=...
        // across an OPEN AP; this is a staging/test-only compatibility path.
        withVerifiedAP(call) { [weak self] _ in
            let fields = [URLQueryItem(name: "ssid", value: ssid), URLQueryItem(name: "pass", value: password)]
            self?.request("/sta_connect", query: fields) { result in
                DispatchQueue.main.async {
                    switch result {
                    case .success(let data):
                        if (data["ok"] as? Bool) == true {
                            call.resolve(["accepted": true, "saved_ssid": data["saved_ssid"] as? String ?? ssid])
                        } else { call.reject("D1 không xác nhận lưu Wi-Fi.", "SAVE_REJECTED") }
                    case .failure:
                        // The AP may drop before the HTTP response arrives. Never blindly retry
                        // and never claim saved/connected without an explicit D1 acknowledgement.
                        call.reject("Chưa nhận được xác nhận. D1 có thể đã lưu; kiểm tra mạng trước khi thử lại.", "SAVE_UNCERTAIN")
                    }
                }
            }
        }
    }

    @objc public func leaveAp(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.generation += 1
            self.resetAP()
            call.resolve()
        }
    }
}
