import { TRUST_WEIGHTS, TRUST_THRESHOLDS } from '@constants/trust.constants';
import { analyzeSignalConsensus } from './ConsensusEngine';
import { PerformanceMonitor } from './PerformanceMonitor';
import type {
  TrustSignals,
  TrustScoreResult,
  AuthDecision,
  SignalContribution,
  ExplainableAuthResult,
} from '@/types/trust.types';

// Validate weight sum at module load time — fail fast if constants are misconfigured
const WEIGHT_SUM = Object.values(TRUST_WEIGHTS).reduce((a, b) => a + b, 0);
if (Math.abs(WEIGHT_SUM - 100) > 0.01) {
  throw new Error(
    `CRITICAL CONFIGURATION ERROR: TRUST_WEIGHTS sum to ${WEIGHT_SUM}, not 100. ` +
      'Edit src/constants/trust.constants.ts to ensure weights sum to exactly 100.',
  );
}

/**
 * Computes the final dynamic trust score from all five signal scores.
 * This is the main entry point for the trust evaluation pipeline.
 *
 * @param signals - The five independent trust signal scores (0–100 each)
 * @returns Complete TrustScoreResult with decision, score, and contradiction analysis
 */
export function computeTrustScore(signals: TrustSignals): TrustScoreResult {
  const start = performance.now();

  // Validate all signal scores are in [0, 100]
  const signalValues = Object.entries(signals);
  for (const [name, value] of signalValues) {
    if (value < 0 || value > 100) {
      throw new Error(
        `Invalid trust signal "${name}" = ${value}. All signals must be in range [0, 100].`,
      );
    }
  }

  // Compute weighted score
  const weightedScore =
    (signals.faceMatchScore * TRUST_WEIGHTS.FACE_MATCH) / 100 +
    (signals.livenessScore * TRUST_WEIGHTS.LIVENESS) / 100 +
    (signals.deviceTrustScore * TRUST_WEIGHTS.DEVICE_TRUST) / 100 +
    (signals.behavioralScore * TRUST_WEIGHTS.BEHAVIORAL) / 100 +
    (signals.locationScore * TRUST_WEIGHTS.LOCATION) / 100;

  const roundedScore = Math.round(weightedScore);

  // Determine initial decision from thresholds
  let initialDecision: AuthDecision;
  if (roundedScore >= TRUST_THRESHOLDS.AUTHENTICATED) {
    initialDecision = 'AUTHENTICATED';
  } else if (roundedScore >= TRUST_THRESHOLDS.FLAGGED) {
    initialDecision = 'FLAGGED';
  } else {
    initialDecision = 'REJECTED';
  }

  // Run consensus analysis — may downgrade AUTHENTICATED → FLAGGED
  const consensus = analyzeSignalConsensus(signals, roundedScore, initialDecision);

  const computationTimeMs = performance.now() - start;
  PerformanceMonitor.record('trust_score_computation', computationTimeMs);

  return {
    signals,
    weightedScore: roundedScore,
    decision: consensus.adjustedDecision,
    isContradiction: consensus.isContradiction,
    contradictionDetails: consensus.contradictionDetails ?? undefined,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Generates the explainable authentication result for display in the Results screen.
 * Breaks down each signal's contribution and provides human-readable reasoning.
 *
 * @param trustResult - The TrustScoreResult from computeTrustScore()
 * @returns ExplainableAuthResult ready for UI display
 */
export function generateExplainableResult(trustResult: TrustScoreResult): ExplainableAuthResult {
  const { signals, weightedScore, decision, isContradiction, contradictionDetails } = trustResult;

  const contributions: SignalContribution[] = [
    {
      signalName: 'faceMatchScore',
      rawScore: signals.faceMatchScore,
      weight: TRUST_WEIGHTS.FACE_MATCH,
      weightedContribution: Math.round((signals.faceMatchScore * TRUST_WEIGHTS.FACE_MATCH) / 100),
      label: 'Face Match',
    },
    {
      signalName: 'livenessScore',
      rawScore: signals.livenessScore,
      weight: TRUST_WEIGHTS.LIVENESS,
      weightedContribution: Math.round((signals.livenessScore * TRUST_WEIGHTS.LIVENESS) / 100),
      label: 'Liveness',
    },
    {
      signalName: 'deviceTrustScore',
      rawScore: signals.deviceTrustScore,
      weight: TRUST_WEIGHTS.DEVICE_TRUST,
      weightedContribution: Math.round(
        (signals.deviceTrustScore * TRUST_WEIGHTS.DEVICE_TRUST) / 100,
      ),
      label: 'Device Trust',
    },
    {
      signalName: 'behavioralScore',
      rawScore: signals.behavioralScore,
      weight: TRUST_WEIGHTS.BEHAVIORAL,
      weightedContribution: Math.round((signals.behavioralScore * TRUST_WEIGHTS.BEHAVIORAL) / 100),
      label: 'Behavioral',
    },
    {
      signalName: 'locationScore',
      rawScore: signals.locationScore,
      weight: TRUST_WEIGHTS.LOCATION,
      weightedContribution: Math.round((signals.locationScore * TRUST_WEIGHTS.LOCATION) / 100),
      label: 'Location',
    },
  ];

  // Sort contributions descending by weighted contribution for display
  contributions.sort((a, b) => b.weightedContribution - a.weightedContribution);

  // Identify the weakest signal (most likely reason for non-AUTHENTICATED outcomes)
  const weakestSignal = [...contributions].sort((a, b) => a.rawScore - b.rawScore)[0];

  let primaryReason: string;
  switch (decision) {
    case 'AUTHENTICATED':
      primaryReason = isContradiction
        ? 'Authentication flagged for review due to signal contradiction.'
        : 'All signals indicate a genuine authentication attempt.';
      break;
    case 'FLAGGED':
      if (isContradiction && contradictionDetails) {
        primaryReason = contradictionDetails;
      } else if (weakestSignal) {
        primaryReason = `Authentication flagged for supervisor review. ${weakestSignal.label} score is low (${weakestSignal.rawScore}/100).`;
      } else {
        primaryReason = 'Authentication flagged for supervisor review.';
      }
      break;
    case 'REJECTED':
      primaryReason = weakestSignal
        ? `Authentication rejected. ${weakestSignal.label} score too low (${weakestSignal.rawScore}/100) to proceed.`
        : 'Authentication rejected. Insufficient trust signals.';
      break;
    default:
      primaryReason = 'Authentication pending.';
  }

  return {
    decision,
    finalScore: weightedScore,
    contributions,
    primaryReason,
    isContradiction,
    contradictionExplanation: contradictionDetails ?? undefined,
  };
}
