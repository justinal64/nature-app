const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Bundle the on-device species classifier as a binary asset (require()'d in
// lib/local-identify.ts) instead of downloading it at runtime.
config.resolver.assetExts.push('tflite');

module.exports = withNativeWind(config, { input: './global.css' });
