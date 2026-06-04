// src/ml/faceRecognition/index.ts
// Public API for the face recognition module.
// External code (hooks, services) should import from this file, not directly
// from the individual implementation files. This allows internal refactoring
// without changing the public contract.

export {
  loadMobileFaceNet,
  isMobileFaceNetLoaded,
  disposeMobileFaceNet,
  runFaceEmbeddingInference,
  preprocessImageForInference,
} from './MobileFaceNet';
export { detectFace, loadBlazeFace } from './blazeFace';
export { computeAlignmentTransform, evaluateFaceQuality } from './faceAlignment';
export {
  l2Normalize,
  cosineSimilarity,
  averageEmbeddings,
  similarityToTrustScore,
  compareFaceEmbeddings,
  embeddingToBase64,
  base64ToEmbedding,
} from './embeddingUtils';
export type {
  FaceBoundingBox,
  FaceLandmark,
  FaceDetectionResult,
  FaceEmbedding,
  FaceMatchResult,
  EnrollmentFrame,
  FaceFrameQuality,
  FaceQualityIssue,
  FaceRecognitionError,
  AlignmentTransform,
  AlignmentInput,
} from './types';
