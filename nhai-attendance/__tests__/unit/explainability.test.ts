import { computeTrustScore, generateExplainableResult } from '../../src/services/TrustScoreService';
import { TRUST_WEIGHTS } from '../../src/constants/trust.constants';
import type { TrustSignals } from '../../src/types/trust.types';

describe('Explainability Mathematical Verification', () => {
  const mockSignals: TrustSignals = {
    faceMatchScore: 90,
    livenessScore: 100,
    deviceTrustScore: 100,
    behavioralScore: 80,
    locationScore: 100,
  };

  test('Weighted contributions sum to exactly the final score', () => {
    const trustResult = computeTrustScore(mockSignals);
    const explainable = generateExplainableResult(trustResult);

    // Calculate expected contributions based on defined constants
    const expectedFace = Math.round(90 * TRUST_WEIGHTS.FACE_MATCH / 100);
    const expectedLiveness = Math.round(100 * TRUST_WEIGHTS.LIVENESS / 100);
    const expectedDevice = Math.round(100 * TRUST_WEIGHTS.DEVICE_TRUST / 100);
    const expectedBehavioral = Math.round(80 * TRUST_WEIGHTS.BEHAVIORAL / 100);
    const expectedLocation = Math.round(100 * TRUST_WEIGHTS.LOCATION / 100);

    const sumOfContributions = explainable.contributions.reduce(
      (sum, item) => sum + item.weightedContribution, 0
    );

    // The sum of rounded individual contributions should be very close to the
    // mathematically computed final score. (Allow ±1 for rounding differences
    // depending on order of operations).
    expect(Math.abs(sumOfContributions - explainable.finalScore)).toBeLessThanOrEqual(1);

    // Verify specific array contents map correctly
    const faceContrib = explainable.contributions.find(c => c.signalName === 'faceMatchScore');
    expect(faceContrib?.weightedContribution).toBe(expectedFace);
  });

  test('Identifies the weakest signal correctly for rejection reason', () => {
    const rejectedSignals: TrustSignals = {
      faceMatchScore: 90,     // Strong
      livenessScore: 10,      // VERY WEAK -> Should be the primary reason
      deviceTrustScore: 20,   // Low, but > 10
      behavioralScore: 80,    // Strong
      locationScore: 20,      // Low, but > 10
    };

    const trustResult = computeTrustScore(rejectedSignals);
    const explainable = generateExplainableResult(trustResult);

    expect(trustResult.decision).toBe('REJECTED');
    expect(explainable.primaryReason).toContain('Liveness');
    expect(explainable.primaryReason).toContain('10/100'); // Mentions the raw score
  });

  test('Highlights contradiction correctly', () => {
    const contradictionSignals: TrustSignals = {
      faceMatchScore: 95,     // Very high face match
      livenessScore: 100,
      deviceTrustScore: 0,    // Low
      behavioralScore: 0,     // Low
      locationScore: 0,       // Low - this combination triggers contradiction
    };

    const trustResult = computeTrustScore(contradictionSignals);
    const explainable = generateExplainableResult(trustResult);

    expect(trustResult.isContradiction).toBe(true);
    expect(explainable.isContradiction).toBe(true);
    // Since it's a contradiction, the decision should be flagged even if math score is high
    expect(trustResult.decision).toBe('FLAGGED');
    expect(explainable.decision).toBe('FLAGGED');
  });
});
