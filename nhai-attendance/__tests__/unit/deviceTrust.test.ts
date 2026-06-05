import { computeDeviceTrustScore } from '../../src/services/DeviceTrustService';
import { DEVICE_TRUST_SCORES } from '../../src/constants/trust.constants';

describe('Device Trust Verification', () => {
  const currentFingerprint = 'device_ABC123';

  test('Returns REGISTERED_CONSISTENT (100) for exactly matching primary device', () => {
    const registeredHistory = ['device_ABC123', 'device_ABC123', 'device_ABC123'];
    const result = computeDeviceTrustScore(currentFingerprint, registeredHistory);

    expect(result.score).toBe(DEVICE_TRUST_SCORES.REGISTERED_CONSISTENT);
    expect(result.reason).toContain('primary registered device');
  });

  test('Returns REGISTERED_OCCASIONAL (70) for recognized but not primary device', () => {
    // Another device is primary, but this one is in history
    const registeredHistory = ['device_DEF456', 'device_DEF456', 'device_DEF456', 'device_ABC123'];
    const result = computeDeviceTrustScore(currentFingerprint, registeredHistory);

    expect(result.score).toBe(DEVICE_TRUST_SCORES.REGISTERED_OCCASIONAL);
    expect(result.reason).toContain('registered secondary device');
  });

  test('Returns NEW_UNREGISTERED (20) for completely unknown device', () => {
    const registeredHistory = ['device_DEF456', 'device_GHI789'];
    const result = computeDeviceTrustScore(currentFingerprint, registeredHistory);

    expect(result.score).toBe(DEVICE_TRUST_SCORES.NEW_UNREGISTERED);
    expect(result.reason).toContain('unrecognized device');
  });

  test('Returns REGISTERED_CONSISTENT (100) when worker has no history (auto-enroll)', () => {
    const registeredHistory: string[] = [];
    const result = computeDeviceTrustScore(currentFingerprint, registeredHistory);

    // Automatically trust the first device used
    expect(result.score).toBe(DEVICE_TRUST_SCORES.REGISTERED_CONSISTENT);
    expect(result.reason).toContain('First device used. Automatically trusted');
  });
});
