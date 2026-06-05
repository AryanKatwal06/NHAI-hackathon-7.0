import { CONSENSUS_THRESHOLDS } from '@constants/trust.constants';
import type { TrustSignals, AuthDecision } from '@/types/trust.types';

export interface ConsensusResult {
  isContradiction: boolean;
  contradictionDetails: string | null;
  adjustedDecision: AuthDecision;
  originalDecision: AuthDecision;
}

/**
 * Analyzes trust signals for contradictions and adjusts the decision if needed.
 *
 * A contradiction is defined as:
 * The face match score is HIGH (≥ CONSENSUS_THRESHOLDS.HIGH_CONFIDENCE_FACE)
 * AND at least CONSENSUS_THRESHOLDS.CONTRADICTION_SIGNAL_COUNT other signals
 * are LOW (< CONSENSUS_THRESHOLDS.LOW_TRUST_SIGNAL).
 *
 * When a contradiction is detected:
 * - AUTHENTICATED decisions are downgraded to FLAGGED
 * - FLAGGED decisions remain FLAGGED
 * - REJECTED decisions remain REJECTED (already the most restrictive outcome)
 *
 * @param signals - The five trust signal scores
 * @param weightedScore - The final weighted score (0–100)
 * @param originalDecision - The decision from the weighted score alone
 * @returns ConsensusResult with contradiction analysis and possibly adjusted decision
 */
export function analyzeSignalConsensus(
  signals: TrustSignals,
  weightedScore: number,
  originalDecision: AuthDecision,
): ConsensusResult {
  const { HIGH_CONFIDENCE_FACE, LOW_TRUST_SIGNAL, CONTRADICTION_SIGNAL_COUNT } =
    CONSENSUS_THRESHOLDS;

  // Only run contradiction analysis when face score is high
  // Low face scores already result in REJECTED — no need for consensus analysis
  if (signals.faceMatchScore < HIGH_CONFIDENCE_FACE) {
    return {
      isContradiction: false,
      contradictionDetails: null,
      adjustedDecision: originalDecision,
      originalDecision,
    };
  }

  const nonFaceSignals: Array<{ name: string; score: number }> = [
    { name: 'Liveness', score: signals.livenessScore },
    { name: 'Device', score: signals.deviceTrustScore },
    { name: 'Behavioral', score: signals.behavioralScore },
    { name: 'Location', score: signals.locationScore },
  ];

  const lowTrustSignals = nonFaceSignals.filter((s) => s.score < LOW_TRUST_SIGNAL);

  if (lowTrustSignals.length >= CONTRADICTION_SIGNAL_COUNT) {
    const lowSignalNames = lowTrustSignals.map((s) => `${s.name} (${s.score})`).join(', ');
    const contradictionDetails =
      `High face confidence (${signals.faceMatchScore}) contradicted by ` +
      `${lowTrustSignals.length} low-trust signals: ${lowSignalNames}. ` +
      'Automatic supervisor review triggered.';

    const adjustedDecision: AuthDecision =
      originalDecision === 'AUTHENTICATED' ? 'FLAGGED' : originalDecision;

    return {
      isContradiction: true,
      contradictionDetails,
      adjustedDecision,
      originalDecision,
    };
  }

  return {
    isContradiction: false,
    contradictionDetails: null,
    adjustedDecision: originalDecision,
    originalDecision,
  };
}
