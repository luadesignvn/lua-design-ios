/*
 * Lúa Design – Capacitor onboarding UI preview v2.
 * Native iOS Wi-Fi provisioning is isolated behind the LuaD1Wifi bridge.
 * QR, Keychain/native auth, relay/PWM and schedule saving remain disabled.
 * A sample device can be shown explicitly to review the existing card layout;
 * it MUST NOT be treated as a paired/authorized device.
 */
(function () {
  'use strict';

  const channels = [
    { id: 1, icon: '💧', vi: 'Ẩm', en: 'Humidity', pwm: false, cycle: true },
    { id: 2, icon: '🌧️', vi: 'Mưa', en: 'Rain', pwm: true, cycle: false },
    { id: 3, icon: '💡', vi: 'Đèn', en: 'Light', pwm: false, cycle: false },
    { id: 4, icon: '💨', vi: 'Khói', en: 'Smoke', pwm: false, cycle: false },
    { id: 5, icon: '🌊', vi: 'Suối', en: 'Stream', pwm: true, cycle: false }
  ];
  const dictionary = {
    vi: {
      sampleDevice: 'Hồ mẫu — không có thiết bị thật',
      deviceList: 'Thiết bị của bạn', addDevice: '+ Thêm thiết bị',
      welcome: 'Chào mừng đến với Lúa Design',
      welcomeDescription: 'Quét mã QR để thêm thiết bị đầu tiên, hoặc cấu hình Wi-Fi cho D1 mini mới.',
      firstDevice: 'Thêm thiết bị',
      emptyHint: 'Đây là bản thử nghiệm offline. Sau khi native auth hoàn tất, app mới có thể xác nhận danh sách thiết bị thật.',
      sampleButton: 'Xem thử giao diện khi có thiết bị (demo)',
      sampleTitle: 'Đang xem giao diện mẫu',
      sampleNotice: 'Không có thiết bị thật. Các nút điều khiển, PWM và lịch đều bị vô hiệu hóa.',
      leaveSample: 'Quay lại màn hình thêm thiết bị',
      dialogTitle: 'Thêm thiết bị', dialogPrompt: 'Chọn cách thêm thiết bị Lúa Design vào ứng dụng.',
      wifiChoiceTitle: 'Cài đặt Wi-Fi cho D1 mới',
      wifiChoiceText: 'Kết nối tạm thời với Wi-Fi AP của D1 và cấu hình mạng gia đình ngay trong app.',
      qrChoiceTitle: 'Quét QR để ghép quyền',
      qrChoiceText: 'Dùng QR owner hoặc QR chia sẻ khi thiết bị đã có kết nối Internet.',
      wifiTitle: 'Cài đặt Wi-Fi D1 mini',
      wifiSteps: [
        'Kết nối iPhone với Wi-Fi AP của đúng D1 (iOS sẽ yêu cầu bạn xác nhận).',
        'Chọn Wi-Fi gia đình từ danh sách D1 tự quét và nhập mật khẩu.',
        'Kiểm tra D1 đã trực tuyến, sau đó quét QR để ghép quyền nếu cần.'
      ],
      apLabel: 'Mã 6 ký tự hoặc tên Wi-Fi AP của D1', apPlaceholder: 'A1B2C3',
      connectAp: 'Kết nối với D1',
      homeWifi: 'Wi-Fi gia đình', rescan: 'Quét lại',
      wifiListEmpty: 'Chưa có mạng Wi-Fi. Danh sách sẽ xuất hiện sau khi plugin kết nối đúng D1 và gọi API quét mạng.',
      homePassword: 'Mật khẩu Wi-Fi đã chọn', homePasswordPlaceholder: 'Nhập mật khẩu Wi-Fi',
      saveWifi: 'Lưu và kết nối',
      wifiInitial: 'Nhập mã D1 để bắt đầu. Chỉ iPhone có bản app đã ký số mới kết nối được AP.',
      wifiEnterAp: 'Nhập đầy đủ tên AP của D1 để thử giao diện bước tiếp theo.',
      wifiPluginPending: 'Chưa tích hợp plugin iOS. Không có yêu cầu kết nối nào được gửi đến D1.',
      qrTitle: 'Quét QR để ghép thiết bị',
      qrDescription: 'Sau khi tích hợp camera và xác thực native, app sẽ quét QR owner hoặc QR chia sẻ và chỉ hiển thị thiết bị được backend cấp quyền.',
      openCamera: 'Mở camera quét QR',
      qrPending: 'Chưa kích hoạt camera và native auth trong bản preview.',
      back: 'Quay lại', close: 'Đóng',
      previewLabel: 'PREVIEW — KHÔNG KẾT NỐI',
      previewBadge: 'Demo',
      schedule: 'Lịch', scheduleSettings: 'Cài đặt lịch', notLoaded: 'Chưa tải',
      empty: 'Lịch của kênh này chưa được tải. Đây chỉ là dữ liệu mẫu.',
      configNote: 'Biểu mẫu xem trước; chưa thể lưu lịch.',
      timeOn: 'Giờ bật', timeOff: 'Giờ tắt',
      cycleOn: 'ON phút', cycleOff: 'OFF phút', days: 'Ngày áp dụng', save: 'Lưu lịch',
      dayNames: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    },
    en: {
      sampleDevice: 'Sample tank — no real device',
      deviceList: 'Your devices', addDevice: '+ Add device',
      welcome: 'Welcome to Lúa Design',
      welcomeDescription: 'Scan a QR code to add your first device, or set up Wi-Fi for a new D1 mini.',
      firstDevice: 'Add device',
      emptyHint: 'This is an offline preview. Once native authentication is ready, the app can verify your actual device list.',
      sampleButton: 'Preview the interface with a sample device',
      sampleTitle: 'Sample interface preview',
      sampleNotice: 'There is no real device. All controls, PWM sliders and schedule saving are disabled.',
      leaveSample: 'Back to add device',
      dialogTitle: 'Add device', dialogPrompt: 'Choose how to add your Lúa Design device.',
      wifiChoiceTitle: 'Set up Wi-Fi for a new D1',
      wifiChoiceText: 'Temporarily join the D1 access point and configure your home network inside the app.',
      qrChoiceTitle: 'Scan QR to pair access',
      qrChoiceText: 'Use an owner QR or a shared QR for a device that is already online.',
      wifiTitle: 'Set up D1 mini Wi-Fi',
      wifiSteps: [
        'Connect your iPhone to the correct D1 access point (iOS will ask you to confirm).',
        'Choose your home Wi-Fi from the list scanned by the D1 and enter its password.',
        'Verify that the D1 is online, then scan its QR code for access if required.'
      ],
      apLabel: '6-character code or D1 AP name', apPlaceholder: 'A1B2C3',
      connectAp: 'Join D1 network',
      homeWifi: 'Home Wi-Fi', rescan: 'Scan again',
      wifiListEmpty: 'No Wi-Fi networks yet. Networks will appear after the native plugin connects to the verified D1 and calls the scan API.',
      homePassword: 'Selected Wi-Fi password', homePasswordPlaceholder: 'Enter Wi-Fi password',
      saveWifi: 'Save and connect',
      wifiInitial: 'Enter your D1 code to begin. Joining its AP requires a signed iPhone app.',
      wifiEnterAp: 'Enter your D1 access point name to preview the next step.',
      wifiPluginPending: 'The native iOS plugin is not installed yet. No connection request was sent to the D1.',
      qrTitle: 'Scan QR to pair device',
      qrDescription: 'After camera and native authentication are integrated, scan an owner or shared QR. Only devices authorized by the backend will appear.',
      openCamera: 'Open QR camera', qrPending: 'Camera and native auth are not active in this preview.',
      back: 'Back', close: 'Close', previewLabel: 'PREVIEW — NOT CONNECTED',
      previewBadge: 'Demo',
      schedule: 'Schedule', scheduleSettings: 'Schedule settings', notLoaded: 'Not loaded',
      empty: 'This channel has no loaded schedules. These are sample controls only.',
      configNote: 'Preview form; schedule saving is not available.',
      timeOn: 'Start time', timeOff: 'End time',
      cycleOn: 'ON minutes', cycleOff: 'OFF minutes', days: 'Days', save: 'Save schedule',
      dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  };

  let language = 'vi';
  // 'empty' means the preview has no verified session. 'sample' is visual-only.
  let previewScreen = 'empty';
  let dialogScreen = 'closed';
  let focusBeforeDialog = null;
  let wifiStatus = 'wifiInitial';
  let wifiMessage = '';
  let verifiedAP = null;
  let networks = [];
  let selectedNetwork = null;
  let wifiBusy = false;
  let wifiSaveAccepted = false;
  let wifiGeneration = 0;
  let wifiPollTimer = null;
  let lastScanTime = 0;
  const AP_PREFIX = 'Lua Design Controller_';

  function nativeBridge() {
    const cap = window.Capacitor;
    if (!cap || cap.getPlatform?.() !== 'ios' || !cap.isNativePlatform?.()) return null;
    const plugin = cap.Plugins?.LuaD1Wifi || cap.registerPlugin?.('LuaD1Wifi');
    if (plugin) return plugin;
    if (typeof cap.nativePromise === 'function') {
      return new Proxy({}, { get: (_unused, name) => (args = {}) => cap.nativePromise('LuaD1Wifi', name, args) });
    }
    return null;
  }

  function resolvedApName(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    let suffix = text;
    if (text.startsWith(AP_PREFIX)) suffix = text.slice(AP_PREFIX.length);
    else if (/^[0-9a-fA-F]{6}$/.test(text)) suffix = text.toUpperCase();
    if (!/^[a-zA-Z0-9_-]{1,10}$/.test(suffix)) return '';
    const name = AP_PREFIX + suffix;
    return new TextEncoder().encode(name).length <= 32 ? name : '';
  }

  function setWifiMessage(message) {
    wifiMessage = String(message || '');
    text('nativeWifiSetupStatus', wifiMessage || dict()[wifiStatus]);
  }

  function renderNetworks() {
    const list = byId('nativeWifiNetworkList');
    if (!list) return;
    list.replaceChildren();
    if (!networks.length) {
      const p = document.createElement('p');
      p.className = 'native-muted';
      p.textContent = dict().wifiListEmpty;
      list.appendChild(p);
      return;
    }
    networks.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'native-network';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(selectedNetwork?.ssid === item.ssid));
      btn.disabled = wifiBusy || wifiSaveAccepted;
      const mark = document.createElement('span');
      mark.className = 'native-network-mark';
      mark.textContent = selectedNetwork?.ssid === item.ssid ? '🔘' : '📶';
      const main = document.createElement('span');
      main.className = 'native-network-main';
      const title = document.createElement('strong');
      title.textContent = item.ssid;
      const sub = document.createElement('small');
      sub.textContent = `${item.open ? (language === 'vi' ? 'Mạng mở' : 'Open') : (item.enc || 'Protected')} · ${item.rssi ?? '?'} dBm`;
      main.append(title, sub);
      btn.append(mark, main);
      btn.addEventListener('click', () => {
        selectedNetwork = item;
        byId('nativeHomeWifiPassword').value = '';
        byId('nativeConfirmOpenApRisk').checked = false;
        renderNetworks();
        renderDialog();
      });
      list.appendChild(btn);
    });
  }

  function updateWifiControls() {
    const active = dialogScreen === 'wifi';
    const password = byId('nativeHomeWifiPassword');
    const apInput = byId('nativeD1SsidInput');
    const ssid = resolvedApName(apInput?.value);
    text('nativeApResolved', ssid ? `AP: ${ssid}` : (apInput?.value ? (language === 'vi' ? 'Mã/AP không hợp lệ' : 'Invalid AP name') : ''));
    setDisabled('nativeConnectD1ApBtn', !active || !ssid || wifiBusy || !!verifiedAP || wifiSaveAccepted);
    if (apInput) apInput.disabled = wifiBusy || !!verifiedAP;
    setDisabled('nativeRescanWifiBtn', !active || !verifiedAP || wifiBusy || wifiSaveAccepted);
    if (password) {
      password.disabled = !active || !verifiedAP || !selectedNetwork || !!selectedNetwork.open || wifiBusy || wifiSaveAccepted;
      if (selectedNetwork?.open) { password.value = ''; password.placeholder = language === 'vi' ? 'Mạng mở: không cần mật khẩu' : 'Open network: no password'; }
      else password.placeholder = dict().homePasswordPlaceholder;
    }
    const consent = byId('nativeConfirmOpenApRisk');
    if (consent) consent.disabled = !active || !verifiedAP || !selectedNetwork || wifiBusy || wifiSaveAccepted;
    const pw = password?.value || '';
    const pwOk = selectedNetwork?.open || (pw.length >= 1 && new TextEncoder().encode(pw).length <= 63);
    setDisabled('nativeSaveD1WifiBtn', !active || !verifiedAP || !selectedNetwork || !pwOk || !consent?.checked || wifiBusy || wifiSaveAccepted);
  }

  async function scanD1() {
    const api = nativeBridge();
    if (!api || !verifiedAP || wifiBusy || wifiSaveAccepted) return;
    const now = Date.now();
    if (lastScanTime && now - lastScanTime < 10000) {
      setWifiMessage(language === 'vi' ? 'D1 yêu cầu đợi 10 giây giữa hai lần quét.' : 'Please wait 10 seconds between scans.');
      return;
    }
    lastScanTime = now;
    const token = wifiGeneration;
    wifiBusy = true;
    setWifiMessage(language === 'vi' ? 'Đang quét Wi-Fi bằng D1...' : 'D1 is scanning nearby networks...');
    updateWifiControls();
    try {
      const result = await api.scan();
      if (token !== wifiGeneration) return;
      const unique = new Map();
      (Array.isArray(result.networks) ? result.networks : []).forEach(item => {
        if (typeof item.ssid !== 'string' || !item.ssid || unique.has(item.ssid)) return;
        unique.set(item.ssid, {
          ssid: item.ssid, rssi: Number(item.rssi), enc: String(item.enc || ''), open: item.open === true
        });
      });
      networks = [...unique.values()].sort((a,b) => b.rssi - a.rssi);
      selectedNetwork = null;
      byId('nativeHomeWifiPassword').value = '';
      byId('nativeConfirmOpenApRisk').checked = false;
      setWifiMessage(networks.length ?
        (language === 'vi' ? `D1 tìm thấy ${networks.length} mạng. Chọn Wi-Fi gia đình.` : `D1 found ${networks.length} networks. Choose your home Wi-Fi.`) :
        (language === 'vi' ? 'D1 chưa tìm thấy mạng. Chờ 10 giây rồi quét lại.' : 'No networks found. Wait 10 seconds and rescan.'));
    } catch (err) {
      if (token === wifiGeneration) setWifiMessage(err?.message || 'Không quét được Wi-Fi D1.');
    } finally {
      if (token === wifiGeneration) { wifiBusy = false; renderNetworks(); updateWifiControls(); }
    }
  }

  async function connectD1() {
    if (wifiBusy || verifiedAP) return;
    const ssid = resolvedApName(byId('nativeD1SsidInput')?.value);
    if (!ssid) { setWifiMessage(language === 'vi' ? 'Vui lòng nhập mã 6 ký tự hoặc tên AP hợp lệ.' : 'Enter a valid D1 code or AP name.'); return; }
    const api = nativeBridge();
    if (!api) {
      setWifiMessage(language === 'vi' ? 'Trình duyệt chỉ xem giao diện. Kết nối thật cần bản iOS đã ký số trên iPhone.' : 'Browser preview only. Real Wi-Fi joining requires the signed iPhone app.');
      return;
    }
    const token = ++wifiGeneration;
    wifiBusy = true;
    setWifiMessage(language === 'vi' ? `iOS đang yêu cầu Join mạng ${ssid}. Hãy xác nhận trên iPhone.` : `iOS is requesting to join ${ssid}. Confirm on iPhone.`);
    updateWifiControls();
    try {
      const result = await api.joinAp({ ssid });
      if (token !== wifiGeneration) return;
      verifiedAP = result;
      text('nativeD1Identity', `${result.device_id} · ${result.mac_short} · ${result.ssid}`);
      setWifiMessage(language === 'vi' ? 'Đã xác minh đúng D1. Đang tải danh sách Wi-Fi gia đình...' : 'D1 verified. Loading home Wi-Fi networks...');
    } catch (err) {
      if (token === wifiGeneration) setWifiMessage(err?.message || 'Không thể kết nối D1.');
    } finally {
      if (token === wifiGeneration) { wifiBusy = false; updateWifiControls(); if (verifiedAP) scanD1(); }
    }
  }

  async function checkConnectedAfterSave(token, elapsed = 0) {
    if (token !== wifiGeneration || !wifiSaveAccepted || !verifiedAP) return;
    const api = nativeBridge();
    try {
      const result = await api.status();
      if (token !== wifiGeneration) return;
      if (result.connected === true && result.current_ssid === selectedNetwork?.ssid) {
        setWifiMessage(language === 'vi' ?
          `D1 đã kết nối Wi-Fi ${result.current_ssid}. Có thể thoát cấu hình và thực hiện ghép QR sau.` :
          `D1 connected to ${result.current_ssid}. You can now pair using QR later.`);
        return;
      }
    } catch (_err) {
      // D1 automatically shuts down SoftAP 15s after joining home Wi-Fi.
    }
    if (elapsed >= 16) {
      setWifiMessage(language === 'vi' ?
        'D1 đã xác nhận nhận cấu hình; AP có thể đã tắt theo firmware. Chưa xác minh được trạng thái cuối; kiểm tra trạng thái Online sau khi ghép quyền.' :
        'D1 accepted the settings. Its AP may have shut down. Final online state is not yet verified.');
      return;
    }
    wifiPollTimer = setTimeout(() => checkConnectedAfterSave(token, elapsed + 2), 2000);
  }

  async function saveD1Wifi() {
    if (!verifiedAP || wifiBusy || wifiSaveAccepted || !selectedNetwork || !byId('nativeConfirmOpenApRisk')?.checked) return;
    const api = nativeBridge();
    if (!api) return;
    const password = selectedNetwork.open ? '' : byId('nativeHomeWifiPassword').value;
    if (!selectedNetwork.open && !password) return;
    const token = wifiGeneration;
    wifiBusy = true;
    setWifiMessage(language === 'vi' ? `Đang gửi cấu hình ${selectedNetwork.ssid} tới D1...` : `Sending ${selectedNetwork.ssid} settings to D1...`);
    updateWifiControls();
    try {
      const reply = await api.saveWifi({ ssid: selectedNetwork.ssid, password });
      if (token !== wifiGeneration) return;
      if (reply.accepted !== true) throw new Error('D1 chưa xác nhận đã nhận cấu hình.');
      wifiSaveAccepted = true;
      byId('nativeHomeWifiPassword').value = '';
      setWifiMessage(language === 'vi' ? 'D1 đã xác nhận lưu cấu hình. Đang kiểm tra kết nối STA...' : 'D1 accepted the Wi-Fi settings. Checking STA connectivity...');
      checkConnectedAfterSave(token);
    } catch (err) {
      if (token === wifiGeneration) {
        byId('nativeHomeWifiPassword').value = '';
        byId('nativeConfirmOpenApRisk').checked = false;
        // Network may already have changed. Do not silently retry credentials.
        setWifiMessage(err?.message || 'Không nhận được xác nhận D1 đã lưu.');
      }
    } finally { if (token === wifiGeneration) { wifiBusy = false; renderNetworks(); updateWifiControls(); } }
  }

  function cancelWifiSession() {
    wifiGeneration += 1;
    clearTimeout(wifiPollTimer);
    wifiPollTimer = null;
    nativeBridge()?.leaveAp?.().catch(() => {});
    verifiedAP = null;
    selectedNetwork = null;
    networks = [];
    wifiBusy = false;
    wifiSaveAccepted = false;
    lastScanTime = 0;
    const password = byId('nativeHomeWifiPassword');
    if (password) password.value = '';
    if (byId('nativeConfirmOpenApRisk')) byId('nativeConfirmOpenApRisk').checked = false;
    text('nativeD1Identity', '');
  }

  const expandedScheduleChannels = new Set(channels.map(item => item.id));
  const expandedScheduleSettingsChannels = new Set();

  const byId = id => document.getElementById(id);
  const dict = () => dictionary[language];
  function text(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }
  function visible(id, enabled) {
    const element = byId(id);
    if (!element) return;
    element.classList.toggle('hidden', !enabled);
    if (enabled) element.style.removeProperty('display');
  }
  function setDisabled(id, disabled) {
    const element = byId(id);
    if (element) element.disabled = disabled;
  }

  function renderScheduleForm(item, d) {
    const days = d.dayNames.map((name, day) => `
      <label class="day-chip"><input type="checkbox" id="preview_day_${item.id}_${day}" checked disabled /><span>${name}</span></label>
    `).join('');
    return `
      <div class="schedule-form native-preview-schedule-form ${expandedScheduleSettingsChannels.has(item.id) ? '' : 'hidden'}"
           id="preview_schedule_form_${item.id}">
        <p class="hint">${d.configNote}</p>
        <div class="schedule-row">
          <div class="schedule-field"><label for="preview_on_${item.id}">${d.timeOn}</label><input id="preview_on_${item.id}" type="time" disabled /></div>
          <div class="schedule-field"><label for="preview_off_${item.id}">${d.timeOff}</label><input id="preview_off_${item.id}" type="time" disabled /></div>
        </div>
        ${item.cycle ? `<div class="cycle-grid">
          <div class="cycle-field"><label for="preview_onmin_${item.id}">${d.cycleOn}</label><input id="preview_onmin_${item.id}" type="number" disabled /></div>
          <div class="cycle-field"><label for="preview_offmin_${item.id}">${d.cycleOff}</label><input id="preview_offmin_${item.id}" type="number" disabled /></div>
        </div>` : ''}
        <div><p class="hint native-preview-days-label">${d.days}</p><div class="days-wrap">${days}</div></div>
        <button class="btn primary" type="button" disabled>${d.save}</button>
      </div>`;
  }

  function renderChannel(item, d) {
    const name = item[language];
    const open = expandedScheduleChannels.has(item.id);
    const settings = expandedScheduleSettingsChannels.has(item.id);
    const slider = item.pwm ? `<div class="pwm-wrap"><div class="pwm-row">
      <input class="slider" type="range" min="0" max="100" value="50" disabled aria-label="${name} PWM preview" />
      <span class="pct">50%</span></div></div>` : '';
    return `
      <article class="channel-card native-preview-channel" id="channel_card_${item.id}">
        <div class="channel-head"><div class="channel-title">${item.icon} <span>${name}</span></div><span class="state-chip state-off">OFF</span></div>
        <button class="btn relay-main off" type="button" disabled>OFF · ${d.previewBadge}</button>
        ${slider}
        <button class="btn schedule-toggle-btn ${open ? 'open' : ''}" type="button"
                data-preview-action="schedule" data-channel="${item.id}"
                aria-expanded="${open}" aria-controls="channel_schedule_panel_${item.id}">🗓️ ${d.schedule}</button>
        <div class="channel-schedule-panel ${open ? '' : 'hidden'}" id="channel_schedule_panel_${item.id}">
          <div class="channel-schedule-summary"><div class="schedule-name">${item.icon} ${name}</div><span class="schedule-count">${d.notLoaded}</span></div>
          <div class="schedule-list"><div class="schedule-empty native-preview-schedule-empty">${d.empty}</div></div>
          <button class="btn schedule-toggle-btn schedule-settings-toggle-btn ${settings ? 'open' : ''}"
                  type="button" data-preview-action="settings" data-channel="${item.id}"
                  aria-expanded="${settings}" aria-controls="preview_schedule_form_${item.id}">⚙️ ${d.scheduleSettings}</button>
          ${renderScheduleForm(item, d)}
        </div>
      </article>`;
  }

  function updateStaticLabels() {
    const d = dict();
    const pairs = {
      deviceSwitcherLabel: 'deviceList', nativeAddDeviceBtn: 'addDevice',
      nativeWelcomeTitle: 'welcome', nativeWelcomeDescription: 'welcomeDescription',
      nativeFirstDeviceBtn: 'firstDevice', nativeEmptyHint: 'emptyHint',
      nativeEnterSampleBtn: 'sampleButton', nativeSampleNoticeTitle: 'sampleTitle',
      nativeSampleNoticeText: 'sampleNotice', nativeLeaveSampleBtn: 'leaveSample',
      nativeAddDeviceTitle: 'dialogTitle', nativeWifiSetupTitle: 'wifiTitle',
      nativeQrPairTitle: 'qrTitle', nativeConnectD1ApBtn: 'connectAp',
      nativeRescanWifiBtn: 'rescan', nativeSaveD1WifiBtn: 'saveWifi',
      nativeLaunchQrCameraBtn: 'openCamera', nativeQrPairStatus: 'qrPending',
      nativeWifiSetupStatus: wifiStatus
    };
    Object.entries(pairs).forEach(([id, key]) => text(id, d[key]));
    const prompt = byId('nativeAddDeviceChoices')?.querySelector('p');
    if (prompt) prompt.textContent = d.dialogPrompt;
    const updateChoice = (id, title, description) => {
      const button = byId(id);
      if (!button) return;
      const name = button.querySelector('strong');
      const small = button.querySelector('small');
      if (name) name.textContent = title;
      if (small) small.textContent = description;
    };
    updateChoice('nativeStartWifiSetupBtn', d.wifiChoiceTitle, d.wifiChoiceText);
    updateChoice('nativeStartQrScanBtn', d.qrChoiceTitle, d.qrChoiceText);
    const wifiSteps = byId('nativeWifiSetupPanel')?.querySelectorAll('.native-setup-steps li') || [];
    wifiSteps.forEach((step, i) => { if (d.wifiSteps[i]) step.textContent = d.wifiSteps[i]; });
    const label = id => document.querySelector(`label[for="${id}"]`);
    if (label('nativeD1SsidInput')) label('nativeD1SsidInput').textContent = d.apLabel;
    if (label('nativeHomeWifiPassword')) label('nativeHomeWifiPassword').textContent = d.homePassword;
    const apInput = byId('nativeD1SsidInput');
    if (apInput) apInput.placeholder = d.apPlaceholder;
    const password = byId('nativeHomeWifiPassword');
    if (password) password.placeholder = d.homePasswordPlaceholder;
    const homeTitle = byId('nativeWifiSetupPanel')?.querySelector('.native-subheading strong');
    if (homeTitle) homeTitle.textContent = d.homeWifi;
    const listText = byId('nativeWifiNetworkList')?.querySelector('p');
    if (listText) listText.textContent = d.wifiListEmpty;
    const qrDescription = byId('nativeQrPairPanel')?.querySelector('p');
    if (qrDescription) qrDescription.textContent = d.qrDescription;
    const closeButton = byId('nativeCloseAddDeviceBtn');
    if (closeButton) closeButton.setAttribute('aria-label', d.close);
    const backButton = byId('nativeDialogBackBtn');
    if (backButton) backButton.setAttribute('aria-label', d.back);
    const identity = byId('nativeD1Identity');
    if (identity) identity.textContent = verifiedAP ? `${verifiedAP.device_id} · ${verifiedAP.mac_short} · ${verifiedAP.ssid}` : '';
    if (wifiMessage) text('nativeWifiSetupStatus', wifiMessage);
    renderNetworks();
  }

  function renderDialog() {
    const open = dialogScreen !== 'closed';
    const root = byId('nativeAddDeviceDialog');
    visible('nativeAddDeviceDialog', open);
    if (root) root.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('native-modal-open', open);
    visible('nativeAddDeviceChoices', dialogScreen === 'choices');
    visible('nativeWifiSetupPanel', dialogScreen === 'wifi');
    visible('nativeQrPairPanel', dialogScreen === 'qr');
    visible('nativeDialogBackBtn', open && dialogScreen !== 'choices');
    const d = dict();
    text('nativeAddDeviceTitle', dialogScreen === 'wifi' ? d.wifiTitle : dialogScreen === 'qr' ? d.qrTitle : d.dialogTitle);
    updateWifiControls();
    setDisabled('nativeLaunchQrCameraBtn', true); // QR-native-auth is a separate staging phase.
  }

  function render() {
    const d = dict();
    document.documentElement.lang = language;
    document.title = 'Lúa Design — Onboarding preview';
    const online = byId('onlinePill');
    if (online) { online.textContent = d.previewBadge; online.className = 'badge offline'; }
    // Do not show the legacy full-width offline banner or fake controls in empty state.
    visible('entryCard', false);
    visible('actionCard', false);
    visible('nativeEmptyStateCard', previewScreen === 'empty');
    visible('nativeSampleNotice', previewScreen === 'sample');
    visible('deviceSwitcherCard', previewScreen === 'sample');
    visible('controlCard', previewScreen === 'sample');
    ['shareCard', 'clientsCard', 'adminCard', 'adminClientsCard', 'serviceStatusCard'].forEach(id => visible(id, false));
    text('controlTitle', d.sampleDevice);
    text('deviceSwitcherCurrent', d.sampleDevice);
    setDisabled('deviceSwitcherBtn', true); // No actual verified device list in the preview.
    ['renameDeviceBtn', 'customerInfoBtn', 'scheduleAutoPresetBtn'].forEach(id => visible(id, false));
    const grid = byId('controlGrid');
    if (grid) grid.innerHTML = previewScreen === 'sample' ? channels.map(item => renderChannel(item, d)).join('') : '';
    ['langBtnVi', 'langBtnEn'].forEach(id => byId(id)?.classList.toggle('active', id === (language === 'vi' ? 'langBtnVi' : 'langBtnEn')));
    ['nativeFirstDeviceBtn', 'nativeAddDeviceBtn', 'nativeStartWifiSetupBtn', 'nativeStartQrScanBtn'].forEach(id => setDisabled(id, false));
    updateStaticLabels();
    renderDialog();
  }

  function openDialog() {
    focusBeforeDialog = document.activeElement;
    dialogScreen = 'choices';
    wifiStatus = 'wifiInitial';
    wifiMessage = '';
    render();
    byId('nativeCloseAddDeviceBtn')?.focus();
  }
  function closeDialog() {
    dialogScreen = 'closed';
    cancelWifiSession();
    const password = byId('nativeHomeWifiPassword');
    if (password) password.value = '';
    const apInput = byId('nativeD1SsidInput');
    if (apInput) apInput.value = '';
    wifiStatus = 'wifiInitial';
    wifiMessage = '';
    render();
    if (focusBeforeDialog?.isConnected) focusBeforeDialog.focus();
    focusBeforeDialog = null;
  }
  function openDialogPanel(next) {
    if (dialogScreen === 'wifi' && next !== 'wifi') cancelWifiSession();
    dialogScreen = next;
    wifiMessage = '';
    render();
    if (next === 'wifi') byId('nativeD1SsidInput')?.focus();
    if (next === 'qr') byId('nativeDialogBackBtn')?.focus();
  }

  byId('nativeFirstDeviceBtn')?.addEventListener('click', openDialog);
  byId('nativeAddDeviceBtn')?.addEventListener('click', openDialog);
  byId('nativeCloseAddDeviceBtn')?.addEventListener('click', closeDialog);
  byId('nativeDialogBackBtn')?.addEventListener('click', () => openDialogPanel('choices'));
  byId('nativeStartWifiSetupBtn')?.addEventListener('click', () => openDialogPanel('wifi'));
  byId('nativeStartQrScanBtn')?.addEventListener('click', () => openDialogPanel('qr'));
  byId('nativeEnterSampleBtn')?.addEventListener('click', () => { previewScreen = 'sample'; render(); });
  byId('nativeLeaveSampleBtn')?.addEventListener('click', () => { previewScreen = 'empty'; render(); });
  byId('nativeD1SsidInput')?.addEventListener('input', () => {
    wifiMessage = '';
    wifiStatus = 'wifiInitial';
    updateWifiControls();
  });
  byId('nativeConnectD1ApBtn')?.addEventListener('click', connectD1);
  byId('nativeRescanWifiBtn')?.addEventListener('click', scanD1);
  byId('nativeHomeWifiPassword')?.addEventListener('input', updateWifiControls);
  byId('nativeConfirmOpenApRisk')?.addEventListener('change', updateWifiControls);
  byId('nativeSaveD1WifiBtn')?.addEventListener('click', saveD1Wifi);
  byId('nativeAddDeviceDialog')?.addEventListener('click', event => {
    if (event.target === byId('nativeAddDeviceDialog')) closeDialog();
  });
  document.addEventListener('keydown', event => {
    if (dialogScreen === 'closed') return;
    if (event.key === 'Escape') { event.preventDefault(); closeDialog(); return; }
    if (event.key !== 'Tab') return;
    const dialog = byId('nativeAddDeviceDialog');
    const focusable = [...dialog.querySelectorAll('button:not([disabled]):not(.hidden), input:not([disabled])')]
      .filter(el => !el.closest('.hidden'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  byId('controlGrid')?.addEventListener('click', event => {
    const button = event.target.closest('button[data-preview-action]');
    if (!button || !byId('controlGrid').contains(button)) return;
    const channel = Number(button.dataset.channel);
    if (!channels.some(item => item.id === channel)) return;
    if (button.dataset.previewAction === 'schedule') {
      if (expandedScheduleChannels.has(channel)) {
        expandedScheduleChannels.delete(channel);
        expandedScheduleSettingsChannels.delete(channel);
      } else expandedScheduleChannels.add(channel);
    } else if (button.dataset.previewAction === 'settings') {
      if (!expandedScheduleChannels.has(channel)) return;
      if (expandedScheduleSettingsChannels.has(channel)) expandedScheduleSettingsChannels.delete(channel);
      else expandedScheduleSettingsChannels.add(channel);
    } else return;
    render();
  });
  window.setLanguage = function (next) {
    language = next === 'en' ? 'en' : 'vi';
    render();
  };

  // Native requests are restricted to D1 provisioning. No EventSource, localStorage, QR camera, relay or schedule mutations.
  // Pairing and device listing require the separately tested staging native-auth integration.
  render();
})();
