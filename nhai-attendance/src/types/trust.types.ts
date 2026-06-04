export type AuthDecision = 'AUTHENTICATED' | 'FLAGGED' | 'REJECTED' | 'PENDING';

export interface TrustSignals {
  faceMatchScore: number;
  livenessScore: number;
  deviceTrustScore: number;
  behavioralScore: number;
  locationScore: number;
}

export interface TrustScoreResult {
  signals: TrustSignals;
  weightedScore: number;
  decision: AuthDecision;
  isContradiction: boolean;
  contradictionDetails?: string;
  computedAt: string;
}

export interface SignalContribution {
  signalName: keyof TrustSignals;
  rawScore: number;
  weight: number;
  weightedContribution: number;
  label: string;
}

export interface ExplainableAuthResult {
  decision: AuthDecision;
  finalScore: number;
  contributions: SignalContribution[];
  primaryReason: string;
  isContradiction: boolean;
  contradictionExplanation?: string;
}
