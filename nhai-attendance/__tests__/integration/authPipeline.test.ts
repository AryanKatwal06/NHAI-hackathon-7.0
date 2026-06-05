import { completePipeline, precomputeBackgroundSignals } from '../../src/services/AuthenticationService';
import { useSettingsStore } from '../../src/store/settingsStore';
import * as LocationService from '../../src/services/LocationService';
import * as DeviceTrustService from '../../src/services/DeviceTrustService';
import { getLoginHistory } from '../../src/db/repositories/behaviorHistory.repository';
import { createAuthRecord } from '../../src/db/repositories/authRecords.repository';
import { enqueue } from '../../src/db/repositories/syncQueue.repository';
import { logEvent } from '../../src/db/repositories/auditLogs.repository';
import { TRUST_THRESHOLDS } from '../../src/constants/trust.constants';

// Mock dependencies
jest.mock('../../src/services/LocationService', () => ({
  ...jest.requireActual('../../src/services/LocationService'),
  acquireCurrentPosition: jest.fn(),
}));
jest.mock('../../src/services/DeviceTrustService', () => ({
  ...jest.requireActual('../../src/services/DeviceTrustService'),
  getCurrentDeviceFingerprint: jest.fn(),
}));
jest.mock('../../src/db/repositories/behaviorHistory.repository');
jest.mock('../../src/db/repositories/authRecords.repository');
jest.mock('../../src/db/repositories/syncQueue.repository');
jest.mock('../../src/db/repositories/auditLogs.repository');
jest.mock('../../src/db/repositories/workers.repository', () => ({
  findWorkerByEmployeeId: jest.fn().mockResolvedValue({ id: 'db_worker_id' }),
  createWorker: jest.fn().mockResolvedValue({ id: 'db_worker_id' })
}));
jest.mock('../../src/db/repositories/devices.repository', () => ({
  getDeviceFingerprintsForWorker: jest.fn().mockResolvedValue(['mock_device_1']),
}));
jest.mock('../../src/services/BehavioralService', () => ({
  ...jest.requireActual('../../src/services/BehavioralService'),
  computeBehavioralScore: jest.fn().mockReturnValue({
    score: 100,
    typicalLoginHour: 8,
    currentLoginHour: 8,
    hoursFromTypical: 0,
    usedPersonalHistory: false,
    reason: 'Mocked for test',
  }),
}));

describe('Authentication Pipeline Attack Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useSettingsStore.setState({
      worksite: { id: 'ws1', name: 'Site 1', latitude: 12.9716, longitude: 77.5946, radiusMeters: 100, shiftStartHour: 8 },
      supervisorPin: 'hash',
    });

    // Default happy path mocks
    (LocationService.acquireCurrentPosition as jest.Mock).mockResolvedValue({ latitude: 12.9716, longitude: 77.5946, accuracy: 10 });
    (DeviceTrustService.getCurrentDeviceFingerprint as jest.Mock).mockResolvedValue('mock_device_1');
    (getLoginHistory as jest.Mock).mockResolvedValue([]);
  });

  const runPipeline = async (faceScore: number, livenessScore: number) => {
    const precomputed = await precomputeBackgroundSignals('worker1');
    return completePipeline('worker1', faceScore, livenessScore, precomputed, 1000);
  };

  test('1. Normal Happy Path - All signals strong', async () => {
    const { trustResult, explainable } = await runPipeline(95, 100);

    expect(trustResult.decision).toBe('AUTHENTICATED');
    expect(trustResult.isContradiction).toBe(false);
    expect(explainable.finalScore).toBeGreaterThanOrEqual(TRUST_THRESHOLDS.AUTHENTICATED);

    // Verify DB writes
    expect(createAuthRecord).toHaveBeenCalled();
    expect(enqueue).toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalled();
  });

  test('2. Photo Spoof Attack - High face match, Low liveness', async () => {
    const { trustResult, explainable } = await runPipeline(98, 0); // 0 liveness = failed challenge

    expect(trustResult.decision).toBe('FLAGGED');
    expect(explainable.primaryReason).toContain('Liveness');
    // Photo spoof is a hard reject, not a contradiction flag
  });

  test('3. Proxy Attack - Low face match, High liveness', async () => {
    const { trustResult } = await runPipeline(30, 100); // 30 face = someone else

    expect(trustResult.decision).toBe('FLAGGED');
  });

  test('4. GPS Spoofing / Remote Login - High face/liveness, Wrong location', async () => {
    // Override GPS to be far away
    (LocationService.acquireCurrentPosition as jest.Mock).mockResolvedValue({ latitude: 28.7041, longitude: 77.1025, accuracy: 10 }); // Delhi vs Bangalore

    const { trustResult, explainable } = await runPipeline(95, 100);

    // Should be flagged due to contradiction (perfect biometrics, wrong location)
    expect(trustResult.decision).toBe('FLAGGED');
    expect(trustResult.isContradiction).toBe(true);
    expect(explainable.contradictionExplanation).toContain('Location');
  });

  test('5. Device Theft - High face/liveness, Wrong device', async () => {
    // Override device fingerprint
    (DeviceTrustService.getCurrentDeviceFingerprint as jest.Mock).mockResolvedValue('unregistered_thief_device');

    const { trustResult, explainable } = await runPipeline(95, 100);

    // Similar to GPS, should be flagged
    expect(trustResult.decision).toBe('FLAGGED');
    expect(trustResult.isContradiction).toBe(true);
    expect(explainable.contradictionExplanation).toContain('Device');
  });
});
