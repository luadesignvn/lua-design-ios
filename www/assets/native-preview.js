/*
 * OFFLINE UI PREVIEW ONLY.
 * All relay, PWM, schedule-saving, authentication and network operations are disabled.
 * Schedule layout follows the actual Hawkhost controller: each channel owns its
 * own expandable schedule button, panel, list and settings panel inside its card.
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
      device: 'Hồ mẫu — xem trước',
      note: 'Bản xem trước giao diện Capacitor, chưa kết nối backend và không gửi lệnh tới thiết bị. Các phần lịch nằm bên trong từng ô kênh; dữ liệu lịch thật sẽ được tải từ staging sau khi hoàn thiện xác thực native.',
      scan: 'Quét QR (chưa kích hoạt)',
      schedule: 'Lịch', scheduleSettings: 'Cài đặt lịch',
      notLoaded: 'Chưa tải',
      empty: 'Lịch của kênh này chưa được tải. Bản xem trước không chứa lịch thật.',
      configNote: 'Biểu mẫu xem trước; chưa thể lưu lịch.',
      timeOn: 'Giờ bật', timeOff: 'Giờ tắt',
      cycleOn: 'ON phút', cycleOff: 'OFF phút',
      days: 'Ngày áp dụng', save: 'Lưu lịch',
      dayNames: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    },
    en: {
      device: 'Sample tank — preview',
      note: 'Offline Capacitor UI preview. It does not connect to the backend or send commands to devices. Each channel has its own schedule panel; live schedules will load from staging when native authentication is ready.',
      scan: 'Scan QR (not enabled)',
      schedule: 'Schedule', scheduleSettings: 'Schedule settings',
      notLoaded: 'Not loaded',
      empty: 'Schedules for this channel have not been loaded. This preview contains no live schedule data.',
      configNote: 'Preview form; saving is not available.',
      timeOn: 'Start time', timeOff: 'End time',
      cycleOn: 'ON minutes', cycleOff: 'OFF minutes',
      days: 'Apply days', save: 'Save schedule',
      dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  };

  let language = 'vi';
  // All five panels start open in this preview so their positions are immediately visible.
  // The original Hawkhost UI may remember or start with another expansion state.
  const expandedScheduleChannels = new Set(channels.map(item => item.id));
  const expandedScheduleSettingsChannels = new Set();

  function show(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    element.classList.remove('hidden');
    element.style.removeProperty('display');
    return element;
  }

  function renderScheduleForm(item, dict) {
    const daysMarkup = dict.dayNames.map((name, day) => `
      <label class="day-chip">
        <input type="checkbox" id="preview_day_${item.id}_${day}" checked disabled />
        <span>${name}</span>
      </label>
    `).join('');

    return `
      <div class="schedule-form native-preview-schedule-form ${expandedScheduleSettingsChannels.has(item.id) ? '' : 'hidden'}"
           id="preview_schedule_form_${item.id}">
        <div class="hint">${dict.configNote}</div>
        <div class="schedule-row">
          <div class="schedule-field">
            <label for="preview_on_${item.id}">${dict.timeOn}</label>
            <input id="preview_on_${item.id}" type="time" disabled />
          </div>
          <div class="schedule-field">
            <label for="preview_off_${item.id}">${dict.timeOff}</label>
            <input id="preview_off_${item.id}" type="time" disabled />
          </div>
        </div>
        ${item.cycle ? `
          <div class="cycle-grid">
            <div class="cycle-field">
              <label for="preview_onmin_${item.id}">${dict.cycleOn}</label>
              <input id="preview_onmin_${item.id}" type="number" disabled />
            </div>
            <div class="cycle-field">
              <label for="preview_offmin_${item.id}">${dict.cycleOff}</label>
              <input id="preview_offmin_${item.id}" type="number" disabled />
            </div>
          </div>
        ` : ''}
        <div>
          <div class="hint native-preview-days-label">${dict.days}</div>
          <div class="days-wrap">${daysMarkup}</div>
        </div>
        <button class="btn primary" type="button" disabled>${dict.save}</button>
      </div>
    `;
  }

  function renderChannel(item, dict) {
    const name = item[language];
    const isOpen = expandedScheduleChannels.has(item.id);
    const isSettingsOpen = expandedScheduleSettingsChannels.has(item.id);
    const slider = item.pwm ? `
      <div class="pwm-wrap">
        <div class="pwm-row">
          <input class="slider" type="range" min="0" max="100" value="50"
                 disabled aria-label="${name} PWM preview" />
          <span class="pct">50%</span>
        </div>
      </div>
    ` : '';

    return `
      <article class="channel-card native-preview-channel" id="channel_card_${item.id}">
        <div class="channel-head">
          <div class="channel-title">${item.icon} <span>${name}</span></div>
          <span class="state-chip state-off">OFF</span>
        </div>
        <button class="btn relay-main off" type="button" disabled>OFF · Preview</button>
        ${slider}
        <button class="btn schedule-toggle-btn ${isOpen ? 'open' : ''}"
                type="button" data-preview-action="schedule" data-channel="${item.id}"
                aria-expanded="${isOpen}" aria-controls="channel_schedule_panel_${item.id}">
          🗓️ ${dict.schedule}
        </button>
        <div class="channel-schedule-panel ${isOpen ? '' : 'hidden'}" id="channel_schedule_panel_${item.id}">
          <div class="channel-schedule-summary">
            <div class="schedule-name">${item.icon} ${name}</div>
            <span class="schedule-count">${dict.notLoaded}</span>
          </div>
          <div class="schedule-list">
            <div class="schedule-empty native-preview-schedule-empty">${dict.empty}</div>
          </div>
          <button class="btn schedule-toggle-btn schedule-settings-toggle-btn ${isSettingsOpen ? 'open' : ''}"
                  type="button" data-preview-action="settings" data-channel="${item.id}"
                  aria-expanded="${isSettingsOpen}" aria-controls="preview_schedule_form_${item.id}">
            ⚙️ ${dict.scheduleSettings}
          </button>
          ${renderScheduleForm(item, dict)}
        </div>
      </article>
    `;
  }

  function render() {
    const dict = dictionary[language];
    document.documentElement.lang = language;
    document.title = 'Lúa Design — Preview';
    const online = document.getElementById('onlinePill');
    if (online) { online.textContent = 'Preview'; online.className = 'badge offline'; }

    const notice = show('entryCard');
    if (notice) {
      notice.style.setProperty('display', 'block', 'important');
      const entryNotice = document.getElementById('entryNotice');
      entryNotice.innerHTML = '<span class="native-preview-flag">OFFLINE PREVIEW</span><p class="native-preview-note"></p><button class="btn primary" type="button" disabled></button>';
      entryNotice.querySelector('p').textContent = dict.note;
      entryNotice.querySelector('button').textContent = dict.scan;
    }

    show('controlCard');
    const controlTitle = document.getElementById('controlTitle');
    if (controlTitle) controlTitle.textContent = dict.device;
    ['renameDeviceBtn', 'customerInfoBtn', 'scheduleAutoPresetBtn'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.classList.add('hidden');
    });

    const grid = document.getElementById('controlGrid');
    if (grid) grid.innerHTML = channels.map(item => renderChannel(item, dict)).join('');
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === (language === 'en' ? 'langBtnEn' : 'langBtnVi'));
    });
  }

  const grid = document.getElementById('controlGrid');
  if (grid) {
    grid.addEventListener('click', event => {
      const button = event.target.closest('button[data-preview-action]');
      if (!button || !grid.contains(button)) return;
      const channel = Number(button.dataset.channel);
      if (!channels.some(item => item.id === channel)) return;
      if (button.dataset.previewAction === 'schedule') {
        if (expandedScheduleChannels.has(channel)) {
          expandedScheduleChannels.delete(channel);
          expandedScheduleSettingsChannels.delete(channel);
        } else {
          expandedScheduleChannels.add(channel);
        }
      } else if (button.dataset.previewAction === 'settings') {
        if (!expandedScheduleChannels.has(channel)) return;
        if (expandedScheduleSettingsChannels.has(channel)) {
          expandedScheduleSettingsChannels.delete(channel);
        } else {
          expandedScheduleSettingsChannels.add(channel);
        }
      } else {
        return;
      }
      render();
    });
  }

  window.setLanguage = function (next) {
    language = next === 'en' ? 'en' : 'vi';
    render();
  };

  // No Hawkhost controller.js, fetch(), EventSource, relay or schedule mutations here.
  render();
})();
