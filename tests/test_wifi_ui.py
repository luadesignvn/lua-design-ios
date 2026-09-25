#!/usr/bin/env python3
"""Optional desktop UI integration checks with a deterministic mocked iOS bridge.
Requires playwright and Chromium, never sends a network request to a D1.
"""
from pathlib import Path
import re
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
raw=(root/'www/index.html').read_text()
css='\n'.join((root/'www/assets'/p).read_text() for p in ('controller-20260716a.css','native-onboarding.css','capacitor-ios.css'))
markup=re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', raw)
markup=re.sub(r'<script[^>]*src="[^"]*"[^>]*></script>', '', markup)
markup=markup.replace('</head>', '<style>'+css+'</style></head>')
script=(root/'www/assets/native-preview.js').read_text()
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        page=browser.new_page(viewport={'width':390,'height':844})
        errors=[]
        page.on('pageerror',lambda e: errors.append(str(e)))
        page.set_content(markup)
        page.add_script_tag(content=script)
        assert page.locator('#nativeEmptyStateCard').is_visible()
        assert not page.locator('#controlCard').is_visible()
        page.locator('#nativeFirstDeviceBtn').click()
        page.locator('#nativeStartWifiSetupBtn').click()
        page.locator('#nativeD1SsidInput').fill('A1B2C3')
        assert page.locator('#nativeApResolved').inner_text() == 'AP: Lua Design Controller_A1B2C3'
        page.locator('#nativeConnectD1ApBtn').click()
        assert 'iPhone' in page.locator('#nativeWifiSetupStatus').inner_text()
        assert page.locator('#nativeSaveD1WifiBtn').is_disabled()
        assert not errors, errors
        print('Browser/no-native gate: PASS')

        mock="""
          window.__d1Calls = [];
          window.Capacitor = {
            getPlatform: () => 'ios', isNativePlatform: () => true,
            Plugins: { LuaD1Wifi: {
              joinAp: async (x) => { window.__d1Calls.push(['join',x]); return {ssid:x.ssid,device_id:'lua-A1B2C3',mac_short:'A1B2C3'}; },
              scan: async () => {window.__d1Calls.push(['scan']);return {networks:[{ssid:'MyWifi',rssi:-40,enc:'WPA2',open:false},{ssid:'OpenWifi',rssi:-65,enc:'OPEN',open:true}]};},
              saveWifi: async (x) => {window.__d1Calls.push(['save',{ssid:x.ssid,passwordLength:x.password.length}]);return {accepted:true,saved_ssid:x.ssid};},
              status: async () => ({connected:true,current_ssid:'MyWifi'}),
              leaveAp: async () => {window.__d1Calls.push(['leave']);}
            }}
          };
        """
        page2=browser.new_page(viewport={'width':390,'height':844})
        page2.set_content(markup)
        page2.evaluate(mock)
        page2.on('pageerror',lambda e: errors.append(str(e)))
        page2.add_script_tag(content=script)
        page2.locator('#nativeFirstDeviceBtn').click()
        page2.locator('#nativeStartWifiSetupBtn').click()
        page2.locator('#nativeD1SsidInput').fill('A1B2C3')
        page2.locator('#nativeConnectD1ApBtn').click()
        page2.locator('.native-network').filter(has_text='MyWifi').wait_for(timeout=4000)
        assert page2.locator('#nativeD1Identity').inner_text().startswith('lua-A1B2C3')
        page2.locator('.native-network').filter(has_text='MyWifi').click()
        page2.locator('#nativeHomeWifiPassword').fill('secret-password')
        assert page2.locator('#nativeSaveD1WifiBtn').is_disabled(), 'must require explicit legacy API disclosure'
        page2.locator('#nativeConfirmOpenApRisk').check()
        assert page2.locator('#nativeSaveD1WifiBtn').is_enabled()
        page2.locator('#nativeSaveD1WifiBtn').click()
        page2.wait_for_function("window.__d1Calls.some(x => x[0] === 'save')")
        page2.wait_for_function("document.querySelector('#nativeWifiSetupStatus').textContent.includes('kết nối Wi-Fi')")
        assert not page2.locator('#controlCard').is_visible(), 'WiFi alone MUST NOT authorize device controls'
        assert page2.locator('#nativeHomeWifiPassword').input_value() == ''
        page2.locator('#nativeCloseAddDeviceBtn').click()
        page2.wait_for_function("window.__d1Calls.some(x => x[0] === 'leave')")
        assert not errors, errors
        print('Mocked native JOIN/SCAN/SAVE/STATUS/LEAVE: PASS')
        print('QR remains disabled; no real relay or backend request: PASS')
        browser.close()
finally:
    pass
