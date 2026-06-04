import { BlinkDetector } from '@ml/livenessDetection/blinkDetector';
import { BLINK_CONSTANTS } from '@constants/liveness.constants';

describe('BlinkDetector', () => {
  let detector: BlinkDetector;

  beforeEach(() => {
    detector = new BlinkDetector(1); // Require 1 blink
  });

  it('should not detect a blink from consistently open eyes', () => {
    for (let i = 0; i < 30; i++) {
      const done = detector.processFrame(0.35, 0.35); // EAR > open threshold
      expect(done).toBe(false);
    }
    expect(detector.getBlinkCount()).toBe(0);
  });

  it('should detect one blink from open → closed → open sequence', () => {
    // Open eyes
    detector.processFrame(0.35, 0.35);
    detector.processFrame(0.35, 0.35);
    // Close eyes (below closed threshold for 3 consecutive frames)
    detector.processFrame(0.15, 0.15);
    detector.processFrame(0.15, 0.15);
    detector.processFrame(0.15, 0.15);
    // Open eyes again
    const done = detector.processFrame(0.35, 0.35);
    expect(done).toBe(true);
    expect(detector.getBlinkCount()).toBe(1);
  });

  it('should reset correctly', () => {
    detector.processFrame(0.15, 0.15);
    detector.processFrame(0.15, 0.15);
    detector.processFrame(0.35, 0.35);
    detector.reset();
    expect(detector.getBlinkCount()).toBe(0);
  });
});
