export { LivenessChallengeSession, generateChallengeSequence } from './challengeEngine';
export { BlinkDetector, computeEAR } from './blinkDetector';
export { SmileDetector, computeMAR, computeCheekRaiseScore } from './smileDetector';
export { HeadTurnDetector, estimateHeadYaw, estimateHeadPitch } from './headPoseEstimator';
export type {
  FaceMeshLandmark,
  FaceMeshLandmarks,
  LivenessFrameAnalysis,
  ChallengeState,
  ChallengeStatus,
  LivenessSessionResult,
} from './types';
