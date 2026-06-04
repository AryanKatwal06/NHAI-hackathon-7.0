import { computeTrustScore } from '@services/TrustScoreService';
import { analyzeSignalConsensus } from '@services/ConsensusEngine';
import { TRUST_THRESHOLDS, TRUST_WEIGHTS } from '@constants/trust.constants';
import type { TrustSignals } from '@/types/trust.types';

const PERFECT_SIGNALS: TrustSignals = {
  faceMatchScore: 95, livenessScore: 100, deviceTrustScore: 100, behavioralScore: 100, locationScore: 100,
};

const FAILING_SIGNALS: TrustSignals = {
  faceMatchScore: 0, livenessScore: 0, deviceTrustScore: 0, behavioralScore: 0, locationScore: 0,
};

describe('computeTrustScore — decision thresholds', () => {
  it('should return AUTHENTICATED for perfect signals', () => {
    const result = computeTrustScore(PERFECT_SIGNALS);
    expect(result.decision).toBe('AUTHENTICATED');
    expect(result.weightedScore).toBeGreaterThanOrEqual(TRUST_THRESHOLDS.AUTHENTICATED);
  });

  it('should return REJECTED for zero signals', () => {
    const result = computeTrustScore(FAILING_SIGNALS);
    expect(result.decision).toBe('REJECTED');
    expect(result.weightedScore).toBe(0);
  });

  it('should return FLAGGED for score in FLAGGED range', () => {
    // Construct signals that produce ~70 weighted score
    const flaggedSignals: TrustSignals = {
      faceMatchScore: 75, livenessScore: 75, deviceTrustScore: 75, behavioralScore: 75, locationScore: 75,
    };
    const result = computeTrustScore(flaggedSignals);
    expect(result.decision).toBe('FLAGGED');
    expect(result.weightedScore).toBeGreaterThanOrEqual(TRUST_THRESHOLDS.FLAGGED);
    expect(result.weightedScore).toBeLessThan(TRUST_THRESHOLDS.AUTHENTICATED);
  });

  it('should include computedAt timestamp', () => {
    const result = computeTrustScore(PERFECT_SIGNALS);
    expect(result.computedAt).toBeTruthy();
    expect(new Date(result.computedAt).getTime()).toBeLessThanOrEqual(Date.now());
  });

  it('should throw for invalid signal scores', () => {
    expect(() => computeTrustScore({ ...PERFECT_SIGNALS, faceMatchScore: 150 })).toThrow();
    expect(() => computeTrustScore({ ...PERFECT_SIGNALS, livenessScore: -5 })).toThrow();
  });
});

describe('analyzeSignalConsensus — contradiction detection', () => {
  it('should flag contradiction when face is high but other signals are all low', () => {
    const contradictorySignals: TrustSignals = {
      faceMatchScore: 98,
      livenessScore:  20,   // LOW
      deviceTrustScore: 10, // LOW
      behavioralScore: 15,  // LOW
      locationScore:   8,   // LOW
    };
    const result = analyzeSignalConsensus(contradictorySignals, 65, 'FLAGGED');
    expect(result.isContradiction).toBe(true);
    expect(result.adjustedDecision).toBe('FLAGGED');
  });

  it('should downgrade AUTHENTICATED to FLAGGED when contradiction detected', () => {
    const contradictorySignals: TrustSignals = {
      faceMatchScore: 98,
      livenessScore:  90, // Fine
      deviceTrustScore: 5, // LOW
      behavioralScore: 5,  // LOW
      locationScore:   5,  // LOW
    };
    const result = analyzeSignalConsensus(contradictorySignals, 82, 'AUTHENTICATED');
    expect(result.isContradiction).toBe(true);
    expect(result.adjustedDecision).toBe('FLAGGED');
    expect(result.originalDecision).toBe('AUTHENTICATED');
  });

  it('should NOT flag contradiction for consistently high signals', () => {
    const result = analyzeSignalConsensus(PERFECT_SIGNALS, 97, 'AUTHENTICATED');
    expect(result.isContradiction).toBe(false);
    expect(result.adjustedDecision).toBe('AUTHENTICATED');
  });
});

describe('TRUST_WEIGHTS validation', () => {
  it('trust weights must sum to exactly 100', () => {
    const sum = Object.values(TRUST_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });
});
