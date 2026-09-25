Pod::Spec.new do |s|
  s.name = 'LuaD1Wifi'
  s.version = '0.1.0'
  s.summary = 'Lua Design D1 provisioning via iOS NEHotspotConfiguration'
  s.license = { :type => 'Proprietary' }
  s.homepage = 'https://github.com/luadesignvn/lua-design-ios'
  s.author = { 'Lua Design' => 'luadesign.vn@gmail.com' }
  s.source = { :git => 'https://github.com/luadesignvn/lua-design-ios.git', :tag => s.version.to_s }
  s.source_files = 'ios/Sources/LuaD1WifiPlugin/**/*.swift'
  s.ios.deployment_target = '15.0'
  s.swift_version = '5.9'
  s.dependency 'Capacitor'
  s.frameworks = 'NetworkExtension'
end
