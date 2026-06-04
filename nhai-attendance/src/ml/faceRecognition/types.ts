// src/ml/faceRecognition/types.ts
// Type definitions specific to the face recognition pipeline.
// These are implementation types — more specific than the shared types in src/types/.

export interface FaceBoundingBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FaceLandmark {
  x: number; // Normalized 0.0–1.0 relative to image width
  y: number; // Normalized 0.0–1.0 relative to image height
}

export interface FaceDetectionResult {
  boundingBox: FaceBoundingBox;
  landmarks: {
    leftEye: FaceLandmark;
    rightEye: FaceLandmark;
    noseTip: FaceLandmark;
    leftMouth: FaceLandmark;
    rightMouth: FaceLandmark;
  };
  headEulerAngleX: number; // Pitch (nodding up/down) in degrees
  headEulerAngleY: number; // Yaw (turning left/right) in degrees
  headEulerAngleZ: number; // Roll (tilting side to side) in degrees
  detectionConfidence: number; // 0.0–1.0
}

export interface FaceEmbedding {
  data: Float32Array; // 128-dimensional feature vector
  generatedAt: string; // ISO 8601 timestamp
  modelVersion: string; // Which model version generated this
  processingTimeMs: number; // How long inference took
}

export interface FaceMatchResult {
  similarity: number; // Cosine similarity 0.0–1.0
  trustScore: number; // Mapped to 0–100 trust scale
  isMatch: boolean; // true if similarity >= FACE_SIMILARITY_THRESHOLD
  processingTimeMs: number; // Total pipeline time
}

export interface EnrollmentFrame {
  embedding: FaceEmbedding;
  quality: FaceFrameQuality;
  capturedAt: string;
}

export interface FaceFrameQuality {
  score: number; // 0–100 quality score for this frame
  issues: FaceQualityIssue[]; // List of detected quality issues
}

export type FaceQualityIssue =
  | 'FACE_TOO_SMALL'
  | 'FACE_TOO_LARGE'
  | 'FACE_NOT_CENTERED'
  | 'FACE_PARTIALLY_OCCLUDED'
  | 'POOR_LIGHTING'
  | 'MOTION_BLUR'
  | 'HEAD_ANGLE_TOO_STEEP'
  | 'MULTIPLE_FACES_DETECTED'
  | 'NO_FACE_DETECTED';

export type FaceRecognitionError =
  | 'MODEL_NOT_LOADED'
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES_DETECTED'
  | 'FACE_TOO_SMALL'
  | 'HEAD_ANGLE_TOO_STEEP'
  | 'INFERENCE_FAILED'
  | 'ALIGNMENT_FAILED';

export interface AlignmentInput {
  imageWidth: number;
  imageHeight: number;
  leftEye: FaceLandmark;
  rightEye: FaceLandmark;
}

export interface AlignmentTransform {
  angle: number;
  scale: number;
  dx: number;
  dy: number;
}
