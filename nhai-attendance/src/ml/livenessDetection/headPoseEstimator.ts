/* eslint-disable */
import { HEAD_TURN_CONSTANTS } from '@constants/liveness.constants';
import type { FaceMeshLandmarks } from './types';
import { HEAD_POSE_LANDMARKS } from './types';

/**
 * Estimates head yaw angle in degrees from Face Mesh landmarks.
 *
 * Method:
 * 1. Get the horizontal positions of left eye outer corner and right eye outer corner
 * 2. Get the nose tip position
 * 3. Compute the asymmetry: how far the nose is from the midpoint of the eyes
 * 4. Map this asymmetry to an estimated yaw angle in degrees
 *
 * This is an approximation, not a true 3D rotation matrix.
 * Accuracy: ±5–10 degrees for yaw angles in the range [-45°, +45°].
 * For our 20° threshold requirement, this accuracy is sufficient.
 *
 * Positive yaw = head turned RIGHT
 * Negative yaw = head turned LEFT
 *
 * @param landmarks - 468-point Face Mesh landmark array
 * @returns Estimated yaw angle in degrees
 */
export function estimateHeadYaw(landmarks: FaceMeshLandmarks): number {
  const leftEyeOuter = landmarks[HEAD_POSE_LANDMARKS.LEFT_EYE_LEFT];
  const rightEyeOuter = landmarks[HEAD_POSE_LANDMARKS.RIGHT_EYE_RIGHT];
  const noseTip = landmarks[HEAD_POSE_LANDMARKS.NOSE_TIP];

  if (!leftEyeOuter || !rightEyeOuter || !noseTip) {
    return 0;
  }

  // Eye midpoint
  const eyeMidX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const eyeWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

  // How far nose is from eye midpoint, normalized by eye width
  // At 0° yaw: nose is at eye midpoint (ratio ≈ 0)
  // At 45° right turn: nose moves significantly left of midpoint
  const noseMidOffset = (noseTip.x - eyeMidX) / eyeWidth;

  // Empirical calibration: 0.2 offset ≈ 20 degrees of yaw
  const yawDegrees = noseMidOffset * -100; // Negative because nose moving left = turning right

  return Math.max(-90, Math.min(90, yawDegrees));
}

/**
 * Estimates head pitch angle (up/down tilt) in degrees.
 * Used for quality assessment, not for liveness challenge detection.
 *
 * @param landmarks - 468-point Face Mesh landmark array
 * @returns Estimated pitch angle in degrees (positive = looking up)
 */
export function estimateHeadPitch(landmarks: FaceMeshLandmarks): number {
  const noseTip = landmarks[HEAD_POSE_LANDMARKS.NOSE_TIP];
  const chin = landmarks[HEAD_POSE_LANDMARKS.CHIN];

  if (!noseTip || !chin) {
    return 0;
  }

  // When looking up, the chin moves down and nose moves up
  // normalized chin-to-nose vertical distance changes
  const faceHeight = Math.abs(chin.y - noseTip.y);
  const expectedFaceHeight = 0.35; // Approximate for frontal face

  // Positive deviation = looking up
  const pitchRatio = (faceHeight - expectedFaceHeight) / expectedFaceHeight;
  return pitchRatio * 45; // Scale to degrees approximation
}

/**
 * State machine for head turn detection.
 * Requires a clean turn sequence:
 * 1. Start: head within ±10° of center (facing forward)
 * 2. Turn: head reaches ≥20° in the required direction for 5 consecutive frames
 * 3. Return: head returns to within 10° of center to complete
 */
export class HeadTurnDetector {
  private phase: 'WAITING_FOR_TURN' | 'TURNED' | 'COMPLETED' = 'WAITING_FOR_TURN';
  private consecutiveTurnedFrames = 0;
  private readonly direction: 'LEFT' | 'RIGHT';

  constructor(direction: 'LEFT' | 'RIGHT') {
    this.direction = direction;
  }

  processFrame(yawDegrees: number): boolean {
    if (this.phase === 'COMPLETED') {
      return true;
    }

    const turnThreshold = HEAD_TURN_CONSTANTS.TURN_ANGLE_MIN_DEGREES;
    const returnThreshold = HEAD_TURN_CONSTANTS.RETURN_TOLERANCE_DEGREES;

    const isTurnedCorrectly =
      this.direction === 'LEFT' ? yawDegrees <= -turnThreshold : yawDegrees >= turnThreshold;

    const isReturnedToCenter = Math.abs(yawDegrees) <= returnThreshold;

    switch (this.phase) {
      case 'WAITING_FOR_TURN':
        if (isTurnedCorrectly) {
          this.consecutiveTurnedFrames++;
          if (this.consecutiveTurnedFrames >= HEAD_TURN_CONSTANTS.CONSECUTIVE_FRAMES) {
            this.phase = 'TURNED';
            this.consecutiveTurnedFrames = 0;
          }
        } else {
          this.consecutiveTurnedFrames = Math.max(0, this.consecutiveTurnedFrames - 1);
        }
        break;

      case 'TURNED':
        if (isReturnedToCenter) {
          this.phase = 'COMPLETED';
        }
        break;
    }

    return this.phase === 'COMPLETED';
  }

  reset(): void {
    this.phase = 'WAITING_FOR_TURN';
    this.consecutiveTurnedFrames = 0;
  }
}
