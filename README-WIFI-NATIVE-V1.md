# Lúa Design iOS — cấu hình Wi-Fi D1 mini trong app (v1, thử nghiệm)

## Phạm vi đã thực hiện

- Giao diện riêng trong app: nhập **6 ký tự cuối SoftAP MAC** hoặc tên/hậu tố AP đã đổi, nhấn Kết nối.
- Plugin Swift dùng `NEHotspotConfiguration` với `joinOnce` và hộp thoại **Join** của iOS. Sau khi iPhone kết nối, plugin **xác minh đồng thời** `/sta_info.ap_ssid` đúng tên AP và `/device.device_id`, `/device.mac_short` hợp lệ, rồi mới cho phép gửi lệnh.
- Native `URLSession` tới **duy nhất `http://192.168.4.1`** để gọi `GET /sta_scan`, `GET /sta_connect?ssid=...&pass=...`, `GET /sta_info`; **không cần mở captive portal**. Danh sách mạng do **D1 quét**, không phải iPhone.
- Giữ danh sách tự quét firmware; UI hiển thị RSSI, bảo mật, hỗ trợ mạng mở, quét lại có hạn mức 10 giây theo firmware. Mật khẩu không lưu trong localStorage; xóa trường nhập sau khi gửi hoặc đóng dialog.
- Giữ nguyên demo các kênh/lịch và trạng thái **chưa có thiết bị**; cấu hình Wi-Fi **không tự cấp quyền điều khiển**. QR, native-auth, điều khiển thật, backend production vẫn chưa tích hợp.
- File `scripts/configure_ios_d1.py` áp dụng lại entitlement `Hotspot Configuration`, mô tả quyền Local Network và ngoại lệ ATS *chỉ cho local networking* sau mỗi lần Codemagic tạo lại project `ios/`.

## ⚠️ Rào cản bảo mật trước khi phát hành

Firmware `Rainforest_FullToping_v1.0.14_polarity_v1` hiện dùng **AP mở** (`PASS_AP=""`) và **`HTTP_GET /sta_connect`**, chứa mật khẩu Wi-Fi gia đình trong URL, truyền qua HTTP. Đây là rủi ro lộ mật khẩu khi có người ở gần D1. Bản v1 chỉ dùng để **kiểm thử trên D1 của bạn trong môi trường tin cậy**, có checkbox xác nhận trước khi lưu. **Không phân phối bản thử nghiệm này cho khách hàng/App Store** trước khi chuyển firmware sang cơ chế provisioning an toàn (ví dụ AP được bảo vệ bằng mật khẩu duy nhất theo thiết bị và API POST truyền dữ liệu có bảo vệ, cân nhắc thêm xác thực/trao đổi khóa). Không commit firmware gốc, MQTT token, mật khẩu Wi-Fi hoặc Apple signing credentials lên GitHub.

## Cài đặt trên Ubuntu WSL2 (sau khi tải ZIP vào Downloads Windows)

Dừng server preview cũ nếu đang chạy, rồi nhập lần lượt:

```bash
cd ~/projects/lua-design-ios
unzip -o /mnt/c/Users/duyva/Downloads/lua-design-ios-wifi-native-v1.zip -d .

# Cài plugin cục bộ và cập nhật package.json + package-lock.json hiện có.
npm install ./plugins/lua-d1-wifi --save --save-exact

# Không chạy npm audit fix --force; các cảnh báo uuid CLI cũ đã biết.
node --check www/assets/native-preview.js
python3 -m py_compile scripts/configure_ios_d1.py

# Xác minh đúng plugin đã được cài.
node -p "require('./node_modules/@luadesign/capacitor-d1-wifi/package.json').name"
git status --short
```

Lệnh trên **không** chạm vào Hawkhost PWA hay firmware D1. Nếu `npm install` báo lỗi, dừng tại đây và gửi log, **chưa push Git**.

## Kiểm tra giao diện trên Windows

```bash
cd ~/projects/lua-design-ios
python3 -m http.server 4173 --directory www
```

Mở `http://localhost:4173` và `Ctrl+F5`. Thử: Thêm thiết bị → Cài đặt Wi-Fi → nhập `A1B2C3`; giao diện hiện tên `Lua Design Controller_A1B2C3`. Trình duyệt Windows cố ý **không kết nối D1**. Cần **bản iOS đã ký** chạy trên iPhone thật để gọi API iOS và D1. Dừng web server bằng `Ctrl+C`.

## Sau khi giao diện và npm install ổn: commit + push

```bash
cd ~/projects/lua-design-ios
git add www/ plugins/lua-d1-wifi/ scripts/configure_ios_d1.py \
  tests/test_wifi_ui.py README-WIFI-NATIVE-V1.md codemagic.yaml package.json package-lock.json
git -c core.pager=cat commit -m "Add native iOS D1 WiFi provisioning prototype"
git push origin main
```

Codemagic → `lua-design-ios` → nhánh `main` → workflow `ios-ui-smoke` → Start new build. Workflow kiểm tra plugin đã được phát hiện, cấu hình quyền, biên dịch unsigned. **Một bản unsigned thành công chỉ xác nhận biên dịch**, không xác nhận iOS Join AP hay giao tiếp D1.

## Điều kiện để kiểm thử iPhone thật

- Xác nhận Bundle ID `net.luadesign.controller` khả dụng trong Apple Developer; bật **Hotspot Configuration** cho App ID/provisioning profile và tạo ký số iOS phù hợp. Quyền Local Network sẽ được iOS hỏi khi ứng dụng truy cập D1.
- Cài một bản development/TestFlight **đã ký** trên iPhone. Không có đủ dữ liệu thực nghiệm để kết luận iOS đã Join thành công trước khi thử trên thiết bị thật.
- Kiểm thử cùng D1 của bạn: xác nhận đúng tên `Lua Design Controller_...` (có thể đổi hậu tố trong firmware), thấy hộp thoại Join, xác minh `/device`, thử `/sta_scan`, chọn Wi-Fi thử nghiệm và xác nhận trạng thái `/sta_info`. Nếu AP tự tắt trước khi iPhone đọc trạng thái, UI chỉ báo D1 đã **nhận cấu hình** chứ chưa khẳng định đã online.
- Khi hoàn thành provisioning, mới chuyển sang QR owner/shared và backend native-auth **staging**; không chạm backend production đang nâng cấp Active-Active.

## Ghi chú về kiến trúc

- `plugins/lua-d1-wifi`: plugin riêng trong Git, hỗ trợ CocoaPods và Swift Package Manager, không sửa template `ios/` thủ công. Codemagic vẫn tái tạo `ios/` trên Mac mỗi lần build.
- `scripts/configure_ios_d1.py`: sửa Info.plist và Xcode build settings sau `npx cap add ios`. Cần CocoaPods Ruby `xcodeproj` (có trên worker Codemagic hiện tại).
- Khi nâng cấp firmware sang API an toàn, cập nhật riêng `saveWifi` trong plugin để chuyển từ GET sang phương thức mới; UI không cần thay đổi lớn.
- Thư mục `reference-source/` trong máy của bạn vẫn giữ riêng, **không** thêm lên GitHub.

## Kiểm thử nguồn

`tests/test_wifi_ui.py` là test Playwright dùng **plugin giả lập trong trình duyệt**, không gửi request tới D1. Môi trường chạy test cần `playwright` Python và Chromium. Test đã chạy thành công cho nhánh không có plugin và kịch bản mocked JOIN/SCAN/SAVE/STATUS/LEAVE. Swift đã được kiểm tra cú pháp qua parser; việc compile và thử trên iPhone phải thực hiện ở Codemagic/thiết bị thật.
