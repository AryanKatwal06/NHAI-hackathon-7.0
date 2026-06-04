// src/ml/faceRecognition/faceAlignment.ts
// Face alignment module for FaceNet preprocessing.
//
// FaceNet expects a 112x112 RGB image where:
// - Left eye center is approximately at pixel (30.29, 51.70) in the 112x112 space
// - Right eye center is approximately at pixel (65.53, 51.50) in the 112x112 space
// - Nose tip is approximately at pixel (48.02, 71.74)
//
// These reference landmark positions are derived from the MTCNN alignment procedure
// used in the original FaceNet paper and are standard for FaceNet.
//
// The alignment is implemented using React Native's Image manipulation capabilities
// combined with custom affine transform math.

import type { FaceDetectionResult, FaceQualityIssue, FaceFrameQuality } from './types';
import {
  FACE_INPUT_SIZE,
  FACE_MIN_SIZE_RATIO as FACE_MIN_SIZE_FRACTION,
  FACE_DETECTION_MIN_CONFIDENCE,
} from '@constants/face.constants';

// Reference landmark positions for 112x112 aligned face
// These are the pixel coordinates in the output 112x112 image where
// each facial landmark should land after alignment.
const REFERENCE_LANDMARKS = {
  leftEye: { x: 30.29, y: 51.7 },
  rightEye: { x: 65.53, y: 51.5 },
  noseTip: { x: 48.02, y: 71.74 },
} as const;

export interface AlignmentInput {
  imageWidth: number;
  imageHeight: number;
  detection: FaceDetectionResult;
}

export interface AlignmentTransform {
  // Affine transform matrix [a, b, c, d, tx, ty]
  // Applied as: x' = a*x + b*y + tx
  //             y' = c*x + d*y + ty
  matrix: [number, number, number, number, number, number];
  cropX: number; // Crop region top-left X in original image pixels
  cropY: number; // Crop region top-left Y in original image pixels
  cropWidth: number; // Crop region width in original image pixels
  cropHeight: number; // Crop region height in original image pixels
}

/**
 * Computes the affine transformation needed to align a detected face
 * to the reference landmark positions expected by FaceNet.
 *
 * The math:
 * 1. Convert normalized landmark coordinates to pixel coordinates
 * 2. Compute the rotation angle from the eye line
 * 3. Compute the scale from the inter-eye distance
 * 4. Build the affine matrix [rotation + scale + translation]
 * 5. Apply padding to include the forehead and chin areas
 *
 * @param input - Image dimensions and face detection result
 * @returns The affine transform matrix and crop parameters
 */
export function computeAlignmentTransform(input: AlignmentInput): AlignmentTransform {
  const { imageWidth, imageHeight, detection } = input;
  const { landmarks } = detection;

  // Convert normalized coordinates (0–1) to pixel coordinates
  const leftEyePx = {
    x: landmarks.leftEye.x * imageWidth,
    y: landmarks.leftEye.y * imageHeight,
  };
  const rightEyePx = {
    x: landmarks.rightEye.x * imageWidth,
    y: landmarks.rightEye.y * imageHeight,
  };

  // Compute the angle of the eye line relative to horizontal
  const dx = rightEyePx.x - leftEyePx.x;
  const dy = rightEyePx.y - leftEyePx.y;
  const angle = Math.atan2(dy, dx);

  // Compute the actual inter-eye distance in the original image
  const interEyeDistActual = Math.sqrt(dx * dx + dy * dy);

  // Compute the reference inter-eye distance in the 112x112 target space
  const refDx = REFERENCE_LANDMARKS.rightEye.x - REFERENCE_LANDMARKS.leftEye.x;
  const refDy = REFERENCE_LANDMARKS.rightEye.y - REFERENCE_LANDMARKS.leftEye.y;
  const interEyeDistRef = Math.sqrt(refDx * refDx + refDy * refDy);

  // Scale factor: how much to scale the original image to match the reference
  const scale = interEyeDistRef / interEyeDistActual;

  // Rotation matrix components (2D rotation by -angle to make eyes horizontal)
  const cosA = Math.cos(-angle);
  const sinA = Math.sin(-angle);

  // Combined scale + rotation matrix
  const a = scale * cosA;
  const b = scale * -sinA;
  const c = scale * sinA;
  const d = scale * cosA;

  // Translation: after rotation+scale, map left eye to its reference position
  const cx = (leftEyePx.x + rightEyePx.x) / 2; // Eye midpoint X
  const cy = (leftEyePx.y + rightEyePx.y) / 2; // Eye midpoint Y
  const refCx = (REFERENCE_LANDMARKS.leftEye.x + REFERENCE_LANDMARKS.rightEye.x) / 2;
  const refCy = (REFERENCE_LANDMARKS.leftEye.y + REFERENCE_LANDMARKS.rightEye.y) / 2;

  const tx = refCx - (a * cx + b * cy);
  const ty = refCy - (c * cx + d * cy);

  // For the crop region, add padding around the face bounding box
  // to include forehead and chin (FaceNet needs the full face, not just eyes)
  const bbox = detection.boundingBox;
  const paddingFactor = 0.3; // 30% padding on each side
  const paddedWidth = bbox.width * (1 + 2 * paddingFactor);
  const paddedHeight = bbox.height * (1 + 2 * paddingFactor);
  const cropX = Math.max(0, bbox.left - bbox.width * paddingFactor);
  const cropY = Math.max(0, bbox.top - bbox.height * paddingFactor);

  return {
    matrix: [a, b, c, d, tx, ty],
    cropX: Math.round(cropX),
    cropY: Math.round(cropY),
    cropWidth: Math.round(Math.min(paddedWidth, imageWidth - cropX)),
    cropHeight: Math.round(Math.min(paddedHeight, imageHeight - cropY)),
  };
}

/**
 * Evaluates the quality of a detected face frame for suitability for recognition.
 * Poor quality frames should be rejected before attempting embedding generation
 * to avoid producing low-quality embeddings that cause false rejections.
 *
 * Quality is affected by: face size, head pose, lighting, motion blur, occlusion.
 *
 * @param detection - The face detection result to evaluate
 * @param imageWidth - Width of the source image in pixels
 * @param imageHeight - Height of the source image in pixels
 * @returns Quality score (0–100) and list of any detected issues
 */
export function evaluateFaceQuality(
  detection: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number,
): FaceFrameQuality {
  const issues: FaceQualityIssue[] = [];
  let score = 100;

  // Check: detection confidence
  if (detection.detectionConfidence < FACE_DETECTION_MIN_CONFIDENCE) {
    issues.push('FACE_PARTIALLY_OCCLUDED');
    score -= 30;
  }

  // Check: face size (too small means too far from camera)
  const faceFraction = detection.boundingBox.width / imageWidth;
  if (faceFraction < FACE_MIN_SIZE_FRACTION) {
    issues.push('FACE_TOO_SMALL');
    score -= 40;
  }

  // Check: face too large (too close, forehead/chin likely cropped)
  if (faceFraction > 0.85) {
    issues.push('FACE_TOO_LARGE');
    score -= 20;
  }

  // Check: face centering (face should be roughly in the middle third of the frame)
  const faceCenterX = (detection.boundingBox.left + detection.boundingBox.width / 2) / imageWidth;
  const faceCenterY = (detection.boundingBox.top + detection.boundingBox.height / 2) / imageHeight;
  if (faceCenterX < 0.2 || faceCenterX > 0.8 || faceCenterY < 0.15 || faceCenterY > 0.85) {
    issues.push('FACE_NOT_CENTERED');
    score -= 20;
  }

  // Check: head yaw angle (turning too far left or right degrades embedding quality)
  if (Math.abs(detection.headEulerAngleY) > 30) {
    issues.push('HEAD_ANGLE_TOO_STEEP');
    score -= 25;
  }

  // Check: head pitch angle (looking too far up or down)
  if (Math.abs(detection.headEulerAngleX) > 20) {
    issues.push('HEAD_ANGLE_TOO_STEEP');
    score -= 15;
  }

  return {
    score: Math.max(0, score),
    issues,
  };
}
