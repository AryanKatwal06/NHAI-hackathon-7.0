import DeviceInfo from 'react-native-device-info';
import { generateHash } from '../utils/hash.utils';

// ... (skipping some logic if needed)
// Actually I will provide the whole modified file chunk.
import { DEVICE_TRUST_SCORES } from '@constants/trust.constants';
import type { DeviceTrustScore } from '@/types/device.types';

// We compute device fingerprint by hashing a combination of:
// - Device unique ID (hardware serial, IMEI hash on Android / identifierForVendor on iOS)
// - Device model name
// - OS version
// The combination makes the fingerprint stable across reboots but unique per device.
// Single-identifier fingerprints are easier to spoof (e.g., a rooted phone can spoof IMEI).
async function computeDeviceFingerprint(): Promise<string> {
  const uniqueId = await DeviceInfo.getUniqueId();
  const model = DeviceInfo.getModel();
  const systemVersion = DeviceInfo.getSystemVersion();
  const brand = DeviceInfo.getBrand();

  const combined = `${uniqueId}|${model}|${systemVersion}|${brand}`;

  // Use native lightweight hash
  const hash = generateHash(combined);
  return hash.substring(0, 32);
}

/**
 * Generates and returns the fingerprint for the current device.
 * Results are cached after first computation (fingerprint does not change
 * within a session — device hardware identifiers are stable).
 */
let cachedFingerprint: string | null = null;

export async function getCurrentDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint !== null) {
    return cachedFingerprint;
  }
  cachedFingerprint = await computeDeviceFingerprint();
  return cachedFingerprint;
}

/**
 * Computes the device trust score for an authentication attempt.
 *
 * @param currentDeviceFingerprint - Fingerprint of the device attempting authentication
 * @param registeredDeviceFingerprints - Array of fingerprints registered for this worker
 * @returns DeviceTrustScore with a 0–100 trust score and decision explanation
 */
export function computeDeviceTrustScore(
  currentDeviceFingerprint: string,
  registeredDeviceFingerprints: string[],
): DeviceTrustScore {
  if (registeredDeviceFingerprints.length === 0) {
    // Worker has no registered device — this happens for new enrollments
    // where the device registration step was skipped. Low trust.
    return {
      score: DEVICE_TRUST_SCORES.NEW_UNREGISTERED,
      isRegistered: false,
      isPrimaryDevice: false,
      deviceFingerprint: currentDeviceFingerprint,
      reason: 'No device registered for this worker. This is the first authentication.',
    };
  }

  const primaryDevice = registeredDeviceFingerprints[0];
  const isRegistered = registeredDeviceFingerprints.includes(currentDeviceFingerprint);
  const isPrimary = currentDeviceFingerprint === primaryDevice;

  if (isPrimary) {
    return {
      score: DEVICE_TRUST_SCORES.REGISTERED_CONSISTENT,
      isRegistered: true,
      isPrimaryDevice: true,
      deviceFingerprint: currentDeviceFingerprint,
      reason: 'Authentication from primary registered device.',
    };
  } else if (isRegistered) {
    // Registered but not the primary (e.g., worker has a work phone + personal phone)
    return {
      score: DEVICE_TRUST_SCORES.REGISTERED_OCCASIONAL,
      isRegistered: true,
      isPrimaryDevice: false,
      deviceFingerprint: currentDeviceFingerprint,
      reason: 'Authentication from a registered secondary device.',
    };
  } else {
    return {
      score: DEVICE_TRUST_SCORES.NEW_UNREGISTERED,
      isRegistered: false,
      isPrimaryDevice: false,
      deviceFingerprint: currentDeviceFingerprint,
      reason:
        'Authentication from an unrecognized device. This device is not registered for this worker.',
    };
  }
}
