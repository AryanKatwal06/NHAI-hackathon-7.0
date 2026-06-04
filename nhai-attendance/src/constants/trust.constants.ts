// trust.constants.ts
// All constants governing the Trust Score Engine.
// These values are the single source of truth for scoring weights and decision thresholds.
// They mirror the environment variables but are typed constants for use in application logic.
// The environment variables allow per-deployment override; these are the locked defaults.

import Config from 'react-native-config';

// ─── SIGNAL WEIGHTS ───────────────────────────────────────────────────────────
// The five independent trust signals and their contribution to the final score.
// CONSTRAINT: these MUST sum to 100. Enforced by the TrustScoreService at runtime.
export const TRUST_WEIGHTS = {
  FACE_MATCH: Number(Config.WEIGHT_FACE_MATCH ?? 40),
  LIVENESS: Number(Config.WEIGHT_LIVENESS ?? 25),
  DEVICE_TRUST: Number(Config.WEIGHT_DEVICE_TRUST ?? 15),
  BEHAVIORAL: Number(Config.WEIGHT_BEHAVIORAL ?? 10),
  LOCATION: Number(Config.WEIGHT_LOCATION ?? 10),
} as const;

// ─── DECISION THRESHOLDS ──────────────────────────────────────────────────────
// Final trust score maps to one of three decisions:
//   AUTHENTICATED: score >= 80 (proceed, record as present)
//   FLAGGED:       score >= 60 and < 80 (proceed, flag for supervisor review)
//   REJECTED:      score < 60 (deny, do not record as present)
export const TRUST_THRESHOLDS = {
  AUTHENTICATED: Number(Config.TRUST_THRESHOLD_AUTHENTICATED ?? 80),
  FLAGGED: Number(Config.TRUST_THRESHOLD_FLAGGED ?? 60),
} as const;

// ─── SIGNAL CONSENSUS THRESHOLDS ──────────────────────────────────────────────
// The Signal Consensus Engine flags attempts where high-confidence signals conflict.
// Example: face match = 95%, but device trust = 10% and location trust = 5%.
// These constants define what constitutes a "contradiction":
//   A contradiction is when FACE_MATCH is above HIGH_CONFIDENCE
//   AND at least CONTRADICTION_MINIMUM_LOW_SIGNALS signals are below LOW_TRUST_THRESHOLD
export const CONSENSUS_THRESHOLDS = {
  HIGH_CONFIDENCE_FACE: 85, // Face match above this is "high confidence"
  LOW_TRUST_SIGNAL: 30, // Any signal below this is "low trust"
  CONTRADICTION_SIGNAL_COUNT: 1, // How many low-trust signals trigger contradiction flag
} as const;

// ─── DEVICE TRUST SCORES ──────────────────────────────────────────────────────
// Fixed score values for device trust situations.
// A registered device used consistently = 100.
// An unregistered device = 0. Scores in between for partially trusted situations.
export const DEVICE_TRUST_SCORES = {
  REGISTERED_CONSISTENT: 100,
  REGISTERED_OCCASIONAL: 70,
  NEW_UNREGISTERED: 20,
  FLAGGED_DEVICE: 0,
} as const;

// ─── BEHAVIORAL SCORE BOUNDARIES ─────────────────────────────────────────────
// Time window (in minutes) within which a login is considered "on-time"
export const BEHAVIORAL_CONSTANTS = {
  ON_TIME_WINDOW_MINUTES: 30, // ±30 min from typical login time = HIGH score
  LATE_WINDOW_MINUTES: 90, // ±90 min from typical login time = MEDIUM score
  // Beyond LATE_WINDOW_MINUTES = LOW score
  MINIMUM_HISTORY_DAYS: 3, // Minimum days of history before personal baseline is used
  // Below MINIMUM_HISTORY_DAYS = population baseline fallback is used
  POPULATION_BASELINE_TIME_HOURS: 8, // Population baseline: typical login at 8:00 AM
} as const;

// ─── LOCATION SCORE BOUNDARIES ───────────────────────────────────────────────
export const LOCATION_CONSTANTS = {
  HIGH_SCORE_RADIUS_METERS: Number(Config.WORKSITE_RADIUS_HIGH_METERS ?? 100),
  MEDIUM_SCORE_RADIUS_METERS: Number(Config.WORKSITE_RADIUS_MEDIUM_METERS ?? 500),
  HIGH_SCORE: 100,
  MEDIUM_SCORE: 50,
  LOW_SCORE: 10,
  GPS_TIMEOUT_MS: 10000, // 10 seconds to acquire GPS fix
  GPS_MAX_AGE_MS: 30000, // Accept GPS readings up to 30 seconds old
} as const;
