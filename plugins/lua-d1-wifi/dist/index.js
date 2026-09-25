'use strict';
// For projects with a JS bundler. The bundled static UI uses the injected
// window.Capacitor.Plugins.LuaD1Wifi bridge instead.
const { registerPlugin } = require('@capacitor/core');
module.exports.LuaD1Wifi = registerPlugin('LuaD1Wifi');
