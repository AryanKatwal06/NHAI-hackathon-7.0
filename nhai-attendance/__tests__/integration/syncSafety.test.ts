import { completePipeline, precomputeBackgroundSignals } from '../../src/services/AuthenticationService';
import { enqueue } from '../../src/db/repositories/syncQueue.repository';
import { useSettingsStore } from '../../src/store/settingsStore';

// Mock dependencies
jest.mock('../../src/services/LocationService', () => ({
  acquireCurrentPosition: jest.fn().mockResolvedValue({ latitude: 12.0, longitude: 77.0, accuracy: 10 }),
  computeLocationTrustScore: jest.fn().mockReturnValue({ score: 100, reason: 'Valid' }),
}));
jest.mock('../../src/services/DeviceTrustService', () => ({
  getCurrentDeviceFingerprint: jest.fn().mockResolvedValue('dev1'),
  computeDeviceTrustScore: jest.fn().mockReturnValue({ score: 100, reason: 'Valid' }),
}));
jest.mock('../../src/db/repositories/behaviorHistory.repository', () => ({
  getLoginHistory: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../src/db/repositories/authRecords.repository', () => ({
  createAuthRecord: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../src/db/repositories/syncQueue.repository', () => ({
  enqueue: jest.fn().mockResolvedValue('queue_id'),
}));
jest.mock('../../src/db/repositories/workers.repository', () => ({
  findWorkerByEmployeeId: jest.fn().mockResolvedValue({ id: 'db_worker_id' }),
  createWorker: jest.fn().mockResolvedValue({ id: 'db_worker_id' })
}));
jest.mock('../../src/db/repositories/auditLogs.repository', () => ({
  logEvent: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../src/db/repositories/devices.repository', () => ({
  getDeviceFingerprintsForWorker: jest.fn().mockResolvedValue(['dev1']),
}));

describe('Sync Payload Safety Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsStore.setState({
      worksite: { id: 'ws1', name: 'Site 1', latitude: 12.0, longitude: 77.0, radiusMeters: 100, shiftStartHour: 8 },
      supervisorPin: 'hash',
    });
  });

  test('Authentication pipeline produces biometric-free sync payload', async () => {
    const precomputed = await precomputeBackgroundSignals('worker1');
    await completePipeline('worker1', 95, 100, precomputed, performance.now());

    // Verify enqueue was called with a safe payload
    expect(enqueue).toHaveBeenCalledTimes(1);

    const enqueueCall = (enqueue as jest.Mock).mock.calls[0];
    const payload = enqueueCall[1];

    // 1. Verify prohibited fields are absent
    const prohibitedFields = ['faceEmbedding', 'embeddingData', 'faceImage', 'rawBiometric'];
    prohibitedFields.forEach(field => {
      expect(payload).not.toHaveProperty(field);
    });

    // 2. Verify required aggregate/metadata fields are present
    const expectedFields = [
      'authAttemptId', 'workerId', 'worksiteId', 'deviceId',
      'trustScore', 'decision', 'attemptedAt', 'faceMatchScore',
      'livenessScore', 'deviceTrustScore', 'behavioralScore', 'locationScore',
    ];

    expectedFields.forEach(field => {
      expect(payload).toHaveProperty(field);
      expect(payload[field]).toBeDefined();
    });
  });
});
