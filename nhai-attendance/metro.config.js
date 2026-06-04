// metro.config.js
// Metro bundler configuration for React Native CLI.
// Metro must know about any non-standard asset extensions our app uses.
// The TFLite model files (.tflite) are binary assets that must be served as-is,
// not processed as JavaScript modules.

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = {
  resolver: {
    // Add .tflite to the list of asset extensions so Metro treats MobileFaceNet
    // model files as static assets, not JS modules.
    // Add .bin for any binary model weight files if needed in later phases.
    assetExts: [
      ...getDefaultConfig(__dirname).resolver.assetExts,
      'tflite',
      'bin',
      'txt',
    ],
    // Ensure .ts and .tsx are in source extensions (default, but explicit for clarity)
    sourceExts: [
      ...getDefaultConfig(__dirname).resolver.sourceExts,
      'ts',
      'tsx',
    ],
  },
  transformer: {
    // Enable Hermes for better performance on Android mid-range devices.
    // Hermes is the default JS engine for RN 0.70+, this makes it explicit.
    hermesParser: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
