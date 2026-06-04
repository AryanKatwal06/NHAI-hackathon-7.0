// __tests__/e2e/scenario3_wrongDevice.e2e.ts
// E2E Scenario 3: Wrong Device — Expects FLAGGED or REJECTED.
//
// Conditions:
// - Worker attempts authentication on a device NOT registered to them
// - Face match may score high (correct person)
// - Liveness challenges pass (real person)
// - Device trust will be LOW (unrecognized fingerprint)
// - GPS may be correct
//
// Expected: FLAGGED (device trust penalty drags overall score down)
// The system should flag this because the device fingerprint doesn't match
// the one recorded during enrollment.

describe('Scenario 3: Wrong Device Authentication', () => {
  beforeAll(async () => {
    // Setup: Enroll a worker on Device A, then attempt auth on Device B
    // Device B has a different fingerprint than Device A
  });

  it('should start authentication flow on the wrong device', async () => {
    // Tap "Start Authentication" (testID: "start-auth-btn")
    // Background signals should compute — device trust will be low
    // because the current device fingerprint doesn't match enrollment
  });

  it('should detect face and proceed to liveness', async () => {
    // Tap "Simulate Face Detected" (testID: "simulate-face-btn")
    // Tap "Scan Face →" (testID: "proceed-liveness-btn")
  });

  it('should pass liveness (real person on wrong device)', async () => {
    // Pass all challenges — the person is real, just on wrong device
    // For each challenge: Tap "✓ Challenge Passed" (testID: "challenge-pass-btn")
  });

  it('should show FLAGGED result with device trust penalty', async () => {
    // On ResultsScreen (testID: "results-screen"):
    // Verify StatusBadge shows "Flagged"
    // Verify ScoreBreakdown: device signal bar is low
    // Verify face match and liveness bars are high
    // Verify primary reason mentions device mismatch
  });

  it('should record in sync queue for supervisor review', async () => {
    // Navigate to PendingSyncScreen
    // Verify the flagged record is queued for sync
    // Supervisor should investigate why worker used a different device
  });
});
