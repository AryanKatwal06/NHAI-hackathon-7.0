import { BLINK_CONSTANTS } from '@constants/liveness.constants';
import { EYE_LANDMARKS } from './types';
import type { FaceMeshLandmarks } from './types';

/**
 * Computes the Euclidean distance between two Face Mesh landmarks.
 * Operates in the normalized coordinate space (0–1 range for x and y).
 * Z coordinate is intentionally excluded — we work in 2D for stability.
 */
function landmarkDistance(landmarks: FaceMeshLandmarks, indexA: number, indexB: number): number {
  const a = landmarks[indexA];
  const b = landmarks[indexB];
  if (!a || !b) {
    return 0;
  }
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes Eye Aspect Ratio for one eye using its six landmark indices.
 *
 * @param landmarks - Full 468-point Face Mesh landmark array
 * @param eyeIndices - The six landmark indices for the target eye
 * @returns EAR value: ~0.3 when open, <0.2 when closed
 */
export function computeEAR(
  landmarks: FaceMeshLandmarks,
  eyeIndices: typeof EYE_LANDMARKS.LEFT_EYE | typeof EYE_LANDMARKS.RIGHT_EYE,
): number {
  // Vertical distances (two measurements for stability)
  const vertical1 = landmarkDistance(landmarks, eyeIndices.P2, eyeIndices.P6);
  const vertical2 = landmarkDistance(landmarks, eyeIndices.P3, eyeIndices.P5);
  // Horizontal distance
  const horizontal = landmarkDistance(landmarks, eyeIndices.P1, eyeIndices.P4);

  if (horizontal < 1e-6) {
    return 0;
  } // Guard against division by zero

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

/**
 * State machine for blink detection across frames.
 * Tracks whether the eye is transitioning from open → closed → open.
 */
export class BlinkDetector {
  private blinkCount = 0;
  private isCurrentlyClosed = false;
  private consecutiveClosedFrames = 0;
  private readonly requiredBlinks: number;

  constructor(requiredBlinks: number = 1) {
    this.requiredBlinks = requiredBlinks;
  }

  /**
   * Processes one frame's EAR values and updates blink detection state.
   *
   * @param leftEAR - Left eye aspect ratio for this frame
   * @param rightEAR - Right eye aspect ratio for this frame
   * @returns true if the required number of blinks has been completed
   */
  processFrame(leftEAR: number, rightEAR: number): boolean {
    const isClosed = Math.min(leftEAR, rightEAR) < BLINK_CONSTANTS.EAR_CLOSED;
    const isOpen = Math.min(leftEAR, rightEAR) > BLINK_CONSTANTS.EAR_OPEN;

    if (isClosed) {
      this.consecutiveClosedFrames++;
    } else {
      if (this.consecutiveClosedFrames >= BLINK_CONSTANTS.CONSECUTIVE_FRAMES && isOpen) {
        this.blinkCount++;
      }
      this.consecutiveClosedFrames = 0;
    }

    return this.blinkCount >= this.requiredBlinks;
  }

  getBlinkCount(): number {
    return this.blinkCount;
  }
  reset(): void {
    this.blinkCount = 0;
    this.isCurrentlyClosed = false;
    this.consecutiveClosedFrames = 0;
  }
}
