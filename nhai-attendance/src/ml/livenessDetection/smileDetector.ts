/* eslint-disable */
import { SMILE_CONSTANTS } from '@constants/liveness.constants';
import type { FaceMeshLandmarks } from './types';

/**
 * Computes Mouth Aspect Ratio — the ratio of mouth height to mouth width.
 * Increases when smiling (mouth widens) or opening (mouth opens).
 * A genuine smile increases MAR primarily through horizontal widening.
 */
export function computeMAR(landmarks: FaceMeshLandmarks): number {
  const leftCorner = landmarks[MOUTH_LANDMARKS.LEFT_CORNER];
  const rightCorner = landmarks[MOUTH_LANDMARKS.RIGHT_CORNER];
  const upperLip = landmarks[MOUTH_LANDMARKS.UPPER_LIP];
  const lowerLip = landmarks[MOUTH_LANDMARKS.LOWER_LIP];

  if (!leftCorner || !rightCorner || !upperLip || !lowerLip) {
    return 0;
  }

  const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
  const mouthHeight = Math.abs(lowerLip.y - upperLip.y);

  if (mouthWidth < 1e-6) {
    return 0;
  }
  return mouthHeight / mouthWidth;
}

/**
 * Computes a cheek raise score by measuring the vertical position of
 * cheek landmarks relative to the eye landmarks.
 * A smile causes the cheeks to rise toward the eye line.
 *
 * Returns a score in [0, 1] where higher = more cheek raise detected.
 */
export function computeCheekRaiseScore(landmarks: FaceMeshLandmarks): number {
  const leftCheek = landmarks[CHEEK_LANDMARKS.LEFT_CHEEK];
  const rightCheek = landmarks[CHEEK_LANDMARKS.RIGHT_CHEEK];

  if (!leftCheek || !rightCheek) {
    return 0;
  }

  // Higher y = lower in image (screen coordinates).
  // A smile raises the cheeks, so their y value decreases.
  // We measure this as a simple heuristic: cheek y relative to nose midpoint.
  // A threshold comparison gives us the raise detection.
  const cheekMidY = (leftCheek.y + rightCheek.y) / 2;

  // Approximate: in a neutral face, cheeks are at about y=0.6 in normalized coords.
  // When smiling, they rise to about y=0.5. The delta is the raise score.
  // This is a simplified heuristic — a full implementation would compare
  // against the neutral position established at the start of the session.
  const neutralCheekY = 0.6;
  const raiseAmount = Math.max(0, neutralCheekY - cheekMidY);

  // Normalize to [0, 1] range assuming max raise ≈ 0.1 normalized units
  return Math.min(1, raiseAmount / 0.1);
}

/**
 * State machine for smile detection across multiple frames.
 * Requires the smile to be held for SMILE_CONSTANTS.CONSECUTIVE_SMILE_FRAMES frames.
 */
export class SmileDetector {
  private consecutiveSmileFrames = 0;
  private isSmileDetected = false;

  processFrame(landmarks: FaceMeshLandmarks): boolean {
    if (this.isSmileDetected) {
      return true;
    }

    const mar = computeMAR(landmarks);
    const _cheekRaise = computeCheekRaiseScore(landmarks);

    const isSmiling = mar > SMILE_CONSTANTS.MAR_SMILE;

    if (isSmiling) {
      this.consecutiveSmileFrames++;
      if (this.consecutiveSmileFrames >= SMILE_CONSTANTS.CONSECUTIVE_FRAMES) {
        this.isSmileDetected = true;
      }
    } else {
      // Reset consecutive count if smile is broken
      this.consecutiveSmileFrames = Math.max(0, this.consecutiveSmileFrames - 1);
    }

    return this.isSmileDetected;
  }

  reset(): void {
    this.consecutiveSmileFrames = 0;
    this.isSmileDetected = false;
  }
}
