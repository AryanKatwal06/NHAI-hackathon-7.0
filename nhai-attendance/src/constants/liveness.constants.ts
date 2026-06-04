// liveness.constants.ts
// Constants for the liveness detection pipeline.
// Defines challenge types, timing, and biometric thresholds for anti-spoofing.

import Config from 'react-native-config';

// ─── CHALLENGE TYPES ──────────────────────────────────────────────────────────
// The liveness system randomly selects challenges from this pool.
// Each challenge verifies the subject is a live person, not a photo/video.
export const LIVENESS_CHALLENGES = {
  BLINK: 'BLINK', // User must blink both eyes
  SMILE: 'SMILE', // User must smile
  HEAD_TURN_LEFT: 'HEAD_TURN_LEFT', // User must turn head left
  HEAD_TURN_RIGHT: 'HEAD_TURN_RIGHT', // User must turn head right
} as const;

export type LivenessChallengeType = (typeof LIVENESS_CHALLENGES)[keyof typeof LIVENESS_CHALLENGES];

// ─── CHALLENGE CONFIGURATION ──────────────────────────────────────────────────
// Number of challenges to present per authentication session.
// More challenges = higher security, longer user experience.
export const CHALLENGE_COUNT = Number(Config.LIVENESS_CHALLENGE_COUNT ?? 2);

// Time limit (ms) for the user to complete each challenge.
// If the timer expires, the challenge is marked as failed.
export const CHALLENGE_TIMEOUT_MS = Number(Config.LIVENESS_CHALLENGE_TIMEOUT_MS ?? 8000);

// Delay (ms) before showing the next challenge to give visual feedback.
export const CHALLENGE_TRANSITION_DELAY_MS = 500;

// ─── BLINK DETECTION (EAR — Eye Aspect Ratio) ────────────────────────────────
// EAR is computed from 6 eye landmarks: 2 horizontal, 4 vertical.
// EAR formula: (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)
// Open eye ≈ 0.25–0.30, Closed eye ≈ 0.05–0.15
export const BLINK_THRESHOLDS = {
  EAR_OPEN: 0.25, // EAR above this = eyes are open
  EAR_CLOSED: 0.18, // EAR below this = eyes are closed (blink detected)
  MIN_BLINK_DURATION_MS: 50, // Minimum duration for a valid blink
  MAX_BLINK_DURATION_MS: 400, // Maximum duration (longer = suspicious, possible fatigue)
  CONSECUTIVE_FRAMES: 2, // Number of consecutive frames below threshold to confirm blink
} as const;

// ─── SMILE DETECTION (MAR — Mouth Aspect Ratio) ──────────────────────────────
// MAR is computed from mouth landmarks: vertical opening / horizontal width.
// Neutral face ≈ 0.05–0.10, Smile ≈ 0.15–0.30
export const SMILE_THRESHOLDS = {
  MAR_NEUTRAL: 0.1, // MAR below this = neutral/closed mouth
  MAR_SMILE: 0.2, // MAR above this = smile detected
  CONSECUTIVE_FRAMES: 3, // Number of consecutive frames above threshold to confirm smile
  MIN_SMILE_DURATION_MS: 300, // Minimum duration for a valid smile
} as const;

// ─── HEAD POSE DETECTION ──────────────────────────────────────────────────────
// Head turn detection uses yaw angle estimation from facial landmarks.
// Yaw angle: 0° = facing camera, negative = turned left, positive = turned right
export const HEAD_POSE_THRESHOLDS = {
  TURN_ANGLE_MIN_DEGREES: 20, // Minimum yaw angle to register as a head turn
  TURN_ANGLE_MAX_DEGREES: 45, // Maximum yaw angle (beyond = face too far for recognition)
  CONSECUTIVE_FRAMES: 3, // Frames at target angle to confirm the turn
  RETURN_TOLERANCE_DEGREES: 10, // Must return to within ±10° of center after turn
} as const;

// ─── LIVENESS SCORING ─────────────────────────────────────────────────────────
// How liveness challenge results map to the liveness trust signal score.
export const LIVENESS_SCORES = {
  ALL_PASSED: 100, // All challenges passed = full score
  PARTIAL_PASSED: 50, // Some challenges passed = half score
  ALL_FAILED: 0, // All challenges failed = zero score
  TIMEOUT_PENALTY: 20, // Points deducted per timed-out challenge
} as const;

export const LivenessChallenge = LIVENESS_CHALLENGES;
export type LivenessChallenge = LivenessChallengeType;
export const BLINK_CONSTANTS = BLINK_THRESHOLDS;
export const SMILE_CONSTANTS = SMILE_THRESHOLDS;
export const HEAD_TURN_CONSTANTS = HEAD_POSE_THRESHOLDS;
export const LIVENESS_CHALLENGE_COUNT = CHALLENGE_COUNT;
export const LIVENESS_CHALLENGE_TIMEOUT_MS = CHALLENGE_TIMEOUT_MS;
export const LIVENESS_CHALLENGE_COOLDOWN_MS = CHALLENGE_TRANSITION_DELAY_MS;
export const LIVENESS_SCORE_MAPPING = LIVENESS_SCORES;
