import { syncBatch } from '../../src/api/awsSync';
import type { SyncPayload } from '../../src/types/sync.types';

// Mock fetch globally
globalThis.fetch = jest.fn();

jest.mock('../../src/constants/app.constants', () => {
  const original = jest.requireActual('../../src/constants/app.constants');
  return {
    ...original,
    FEATURE_FLAGS: {
      ...original.FEATURE_FLAGS,
      USE_MOCK_SYNC: false,
    },
  };
});

jest.mock('react-native-config', () => ({
  AWS_API_GATEWAY_URL: 'https://valid-api-url.com/prod',
}));

describe('Sync Payload Security Verification', () => {
  beforeEach(() => {
    (globalThis.fetch as jest.Mock).mockClear();
    // Default mock response
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, syncedIds: [], failedIds: [], syncedCount: 0, failedCount: 0 }),
    });
  });

  const basePayload: SyncPayload = {
    authAttemptId: 'test_123',
    workerId: 'worker_001',
    worksiteId: 'ws_001',
    deviceId: 'dev_001',
    trustScore: 85,
    decision: 'AUTHENTICATED',
    attemptedAt: new Date().toISOString(),
    faceMatchScore: 90,
    livenessScore: 100,
    deviceTrustScore: 100,
    behavioralScore: 80,
    locationScore: 100,
    isContradiction: false,
  };

  test('Valid payload without biometric data is accepted', async () => {
    await expect(syncBatch([basePayload])).resolves.not.toThrow();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    // Verify payload sent in body
    const fetchCall = (globalThis.fetch as jest.Mock).mock.calls[0];
    const bodyStr = fetchCall[1].body;
    expect(bodyStr).not.toContain('faceEmbedding');
    expect(bodyStr).toContain('trustScore');
  });

  test('Payload with "faceEmbedding" is rejected client-side before network request', async () => {
    const maliciousPayload = { ...basePayload, faceEmbedding: [0.1, 0.2, 0.3] } as any;

    await expect(syncBatch([maliciousPayload])).rejects.toThrow(/biometric field "faceEmbedding" found/i);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('Payload with "faceImage" is rejected client-side', async () => {
    const maliciousPayload = { ...basePayload, faceImage: 'base64string' } as any;

    await expect(syncBatch([maliciousPayload])).rejects.toThrow(/biometric field "faceImage" found/i);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test('Payload with "rawBiometric" is rejected client-side', async () => {
    const maliciousPayload = { ...basePayload, rawBiometric: 'data' } as any;

    await expect(syncBatch([maliciousPayload])).rejects.toThrow(/biometric field "rawBiometric" found/i);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
