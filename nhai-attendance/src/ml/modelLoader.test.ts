/* eslint-disable */
// modelLoader.test.ts
// Verifies that the TFLite model file can be required as a static asset.
// This test catches Metro configuration issues before they cause runtime failures.

import { Image } from 'react-native';

describe('Model asset loading', () => {
  it('should resolve facenet.tflite as a static asset', () => {
    // In React Native, require() on a static asset returns a number (resource ID).
    // If it throws, it means Metro cannot resolve the .tflite extension.
    expect(() => {
      const model = require('../assets/models/facenet.tflite');
      expect(typeof model).toBe('number');
    }).not.toThrow();
  });
});
