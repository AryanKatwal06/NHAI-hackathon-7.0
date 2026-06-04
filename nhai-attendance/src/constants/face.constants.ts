// face.constants.ts
// Constants for facial recognition pipeline.
// These are technical constants derived from the FaceNet model specification
// and MediaPipe face detection requirements.

import Config from 'react-native-config';

// ─── MOBILEFACENET MODEL ─────────────────────────────────────────────────────────
// MobileFaceNet produces 192-dimensional face embeddings.
export const FACE_EMBEDDING_DIMENSION = 192;

// ─── FACE PREPROCESSING ───────────────────────────────────────────────────────
// MobileFaceNet expects 112x112 RGB images as input.
export const FACE_INPUT_SIZE = {
  WIDTH: 112,
  HEIGHT: 112,
  CHANNELS: 3, // RGB
} as const;

// ─── SIMILARITY THRESHOLDS ────────────────────────────────────────────────────
// Cosine similarity threshold for declaring a face match.
// This value was tuned on the LFW (Labeled Faces in the Wild) benchmark.
// 0.65 provides a good balance between false acceptance and false rejection rates.
// Higher values = fewer false acceptances but more false rejections.
// Lower values = more false acceptances but fewer false rejections.
export const FACE_MATCH_THRESHOLD = Number(Config.FACE_MATCH_THRESHOLD ?? 0.65);

// Tiered confidence levels for face match scoring
export const FACE_MATCH_TIERS = {
  HIGH_CONFIDENCE: 0.8, // Very strong match — score contribution = 100%
  MEDIUM_CONFIDENCE: 0.7, // Good match — score contribution = 80%
  LOW_CONFIDENCE: 0.65, // Marginal match — score contribution = 60%
  NO_MATCH: 0.65, // Below this = not the same person — score contribution = 0%
} as const;

// ─── FACE DETECTION ───────────────────────────────────────────────────────────
// Minimum face detection confidence (0.0–1.0) to proceed with recognition.
// Faces below this confidence are likely false positives from the detector.
export const FACE_DETECTION_MIN_CONFIDENCE = 0.7;

// Minimum face size as a proportion of frame dimensions.
// Prevents recognition attempts on tiny faces at the edge of the frame.
export const FACE_MIN_SIZE_RATIO = 0.15; // Face must be at least 15% of frame width

// Maximum number of faces to process per frame.
// For attendance, we expect 1 face at a time. Allow 1 only to prevent spoofing.
export const FACE_MAX_COUNT = 1;

// ─── ENROLLMENT ───────────────────────────────────────────────────────────────
// Number of face embeddings captured during enrollment.
// Multiple embeddings from different angles improve recognition accuracy.
export const ENROLLMENT_CAPTURE_COUNT = 3;

// Minimum time between enrollment captures (ms) to ensure pose variation.
export const ENROLLMENT_CAPTURE_INTERVAL_MS = 1500;

// Minimum cosine similarity between enrollment captures to ensure they're the same person.
export const ENROLLMENT_SELF_SIMILARITY_THRESHOLD = 0.75;
