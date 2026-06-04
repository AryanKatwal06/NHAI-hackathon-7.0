import type { FaceMeshLandmarks } from './types';

// The maximum allowed translation of the face center (normalized coords [0,1])
// between two consecutive frames. If the face jumps more than this, it's likely
// a spoof attempt (e.g., swapping a mask or photo).
const MAX_ALLOWED_JUMP = 0.15;

export class TemporalConsistencyChecker {
  private lastCenter: { x: number; y: number } | null = null;
  private violationCount = 0;
  private readonly MAX_VIOLATIONS = 2; // Allow 1 minor glitch

  /**
   * Evaluates the temporal consistency of the face mesh between frames.
   * Returns false if the face jumps erratically (possible spoof or video injection).
   */
  processFrame(landmarks: FaceMeshLandmarks): boolean {
    if (landmarks.length === 0) {return false;}

    // Use nose tip as a reliable center point
    const noseTip = landmarks[1];
    if (!noseTip) {return true;} // Can't check, assume ok

    const currentCenter = { x: noseTip.x, y: noseTip.y };

    if (this.lastCenter) {
      const dx = currentCenter.x - this.lastCenter.x;
      const dy = currentCenter.y - this.lastCenter.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > MAX_ALLOWED_JUMP) {
        this.violationCount++;
      } else {
        // Slowly heal violations if the face remains stable
        this.violationCount = Math.max(0, this.violationCount - 0.1);
      }
    }

    this.lastCenter = currentCenter;

    return this.violationCount <= this.MAX_VIOLATIONS;
  }
}
