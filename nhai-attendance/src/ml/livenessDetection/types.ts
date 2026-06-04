import type { LivenessChallenge } from '@constants/liveness.constants';

// Eye landmark indices in MediaPipe Face Mesh 468-point model
// These are the standard indices for computing Eye Aspect Ratio (EAR)
export const EYE_LANDMARKS = {
  LEFT_EYE: {
    P1: 33, // Outer corner
    P2: 160, // Upper outer
    P3: 158, // Upper inner
    P4: 133, // Inner corner
    P5: 153, // Lower inner
    P6: 144, // Lower outer
  },
  RIGHT_EYE: {
    P1: 362, // Outer corner
    P2: 385, // Upper outer
    P3: 387, // Upper inner
    P4: 263, // Inner corner
    P5: 373, // Lower inner
    P6: 380, // Lower outer
  },
} as const;

// Mouth landmark indices for computing Mouth Aspect Ratio (MAR)
export const MOUTH_LANDMARKS = {
  LEFT_CORNER: 61, // Left mouth corner
  RIGHT_CORNER: 291, // Right mouth corner
  UPPER_LIP: 13, // Upper lip center
  LOWER_LIP: 14, // Lower lip center
} as const;

// Cheek landmarks for smile detection (rise when smiling)
export const CHEEK_LANDMARKS = {
  LEFT_CHEEK: 116,
  RIGHT_CHEEK: 345,
} as const;

// Head pose reference points for yaw calculation
export const HEAD_POSE_LANDMARKS = {
  NOSE_TIP: 1,
  LEFT_EYE_LEFT: 33,
  RIGHT_EYE_RIGHT: 263,
  LEFT_MOUTH: 61,
  RIGHT_MOUTH: 291,
  CHIN: 199,
} as const;

export interface FaceMeshLandmark {
  x: number; // Normalized 0–1 relative to image width
  y: number; // Normalized 0–1 relative to image height
  z: number; // Depth (relative to nose tip in MediaPipe's coordinate system)
}

export type FaceMeshLandmarks = FaceMeshLandmark[]; // Array of 468 landmarks

export interface LivenessFrameAnalysis {
  timestamp: number; // performance.now() timestamp
  leftEAR: number; // Left eye aspect ratio
  rightEAR: number; // Right eye aspect ratio
  averageEAR: number; // Average of left + right EAR
  mouthMAR: number; // Mouth aspect ratio
  cheekRaise: number; // Cheek elevation score (0–1)
  headYawDegrees: number; // Head yaw (left/right) in degrees
  headPitchDegrees: number; // Head pitch (up/down) in degrees
  headRollDegrees: number; // Head roll (tilt) in degrees
}

export interface ChallengeState {
  challenge: LivenessChallenge;
  status: ChallengeStatus;
  startedAt: number; // performance.now() timestamp
  completedAt?: number;
  timedOut: boolean;
  consecutivePositiveFrames: number; // How many consecutive frames show the action
  frameHistory: LivenessFrameAnalysis[]; // Last N frames for stability checking
}

export type ChallengeStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'TIMEOUT';

export interface LivenessSessionResult {
  sessionId: string;
  challenges: ChallengeState[];
  overallScore: number; // 0–100 liveness confidence score
  isPassed: boolean; // Whether the session is considered passed
  totalDurationMs: number;
  failureReason?: string | undefined;
}
