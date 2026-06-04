import {
  LIVENESS_CHALLENGES,
  LIVENESS_CHALLENGE_COUNT,
  LIVENESS_CHALLENGE_TIMEOUT_MS,
  LIVENESS_CHALLENGE_COOLDOWN_MS,
  LIVENESS_SCORE_MAPPING,
} from '@constants/liveness.constants';
import type { LivenessChallenge } from '@constants/liveness.constants';
import type { FaceMeshLandmarks, ChallengeState, LivenessSessionResult } from './types';
import { BlinkDetector } from './blinkDetector';
import { SmileDetector } from './smileDetector';
import { HeadTurnDetector } from './headPoseEstimator';
import { computeEAR } from './blinkDetector';
import { computeMAR, computeCheekRaiseScore } from './smileDetector';
import { estimateHeadYaw, estimateHeadPitch } from './headPoseEstimator';
import { EYE_LANDMARKS } from './types';
import { TemporalConsistencyChecker } from './temporalConsistency';

/**
 * Generates a randomized sequence of challenges for a liveness session.
 * Uses cryptographically-adequate randomness (Math.random is sufficient here —
 * we do not need cryptographic security for challenge ordering, just unpredictability
 * enough to defeat static video replay).
 *
 * Guarantees no consecutive duplicates (e.g., never "blink, blink").
 */
export function generateChallengeSequence(): LivenessChallenge[] {
  const available = Object.values(LIVENESS_CHALLENGES) as LivenessChallenge[];
  const selected: LivenessChallenge[] = [];

  while (selected.length < LIVENESS_CHALLENGE_COUNT) {
    // Shuffle remaining challenges
    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = available[i] as LivenessChallenge;
      available[i] = available[j] as LivenessChallenge;
      available[j] = temp;
    }

    // Pick the first one that isn't the same as the last selected
    const lastSelected = selected[selected.length - 1];
    const nextChallenge = available.find((c: LivenessChallenge) => c !== lastSelected);

    if (nextChallenge) {
      selected.push(nextChallenge);
    }
  }

  return selected;
}

/**
 * LivenessChallengeSession manages the complete lifecycle of a liveness verification session.
 *
 * Usage:
 * 1. Instantiate: const session = new LivenessChallengeSession()
 * 2. Start: session.start()
 * 3. Feed frames: const result = session.processFrame(landmarks)
 *    - result.isComplete === false: keep feeding frames, show current challenge UI
 *    - result.isComplete === true:  session done, check result.sessionResult for final score
 * 4. Access result: session.getResult()
 */
export class LivenessChallengeSession {
  private readonly sessionId: string;
  private readonly challenges: LivenessChallenge[];
  private readonly challengeStates: ChallengeState[];
  private currentChallengeIndex = 0;
  private sessionStartTime = 0;
  private isStarted = false;
  private isComplete = false;

  // Level 4: Temporal consistency checker
  private readonly temporalChecker = new TemporalConsistencyChecker();

  // Active detector for the current challenge
  private blinkDetector: BlinkDetector | null = null;
  private smileDetector: SmileDetector | null = null;
  private headTurnDetector: HeadTurnDetector | null = null;

  constructor() {
    this.sessionId = `liveness_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.challenges = generateChallengeSequence();
    this.challengeStates = this.challenges.map((challenge) => ({
      challenge,
      status: 'WAITING' as const,
      startedAt: 0,
      timedOut: false,
      consecutivePositiveFrames: 0,
      frameHistory: [],
    }));
  }

  /**
   * Returns the current challenge the user should be performing.
   */
  getCurrentChallenge(): LivenessChallenge | null {
    if (this.isComplete) {
      return null;
    }
    return this.challenges[this.currentChallengeIndex] ?? null;
  }

  /**
   * Starts the liveness session. Must be called before processFrame().
   */
  start(): void {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;
    this.sessionStartTime = performance.now();
    this.activateCurrentChallenge();
  }

  private activateCurrentChallenge(): void {
    const state = this.challengeStates[this.currentChallengeIndex];
    if (!state) {
      return;
    }

    state.status = 'IN_PROGRESS';
    state.startedAt = performance.now();

    // Instantiate the appropriate detector for this challenge
    const challenge = this.challenges[this.currentChallengeIndex];
    switch (challenge) {
      case 'BLINK':
        this.blinkDetector = new BlinkDetector();
        this.smileDetector = null;
        this.headTurnDetector = null;
        break;
      case 'SMILE':
        this.smileDetector = new SmileDetector();
        this.blinkDetector = null;
        this.headTurnDetector = null;
        break;
      case 'HEAD_TURN_LEFT':
        this.headTurnDetector = new HeadTurnDetector('LEFT');
        this.blinkDetector = null;
        this.smileDetector = null;
        break;
      case 'HEAD_TURN_RIGHT':
        this.headTurnDetector = new HeadTurnDetector('RIGHT');
        this.blinkDetector = null;
        this.smileDetector = null;
        break;
    }
  }

  /**
   * Processes one camera frame of Face Mesh landmarks.
   * Should be called for every frame while the session is active.
   *
   * @param landmarks - 468-point MediaPipe Face Mesh landmark array
   * @returns Object indicating whether the session is complete
   */
  processFrame(landmarks: FaceMeshLandmarks): {
    isComplete: boolean;
    currentChallenge: LivenessChallenge | null;
  } {
    if (!this.isStarted || this.isComplete) {
      return { isComplete: this.isComplete, currentChallenge: null };
    }

    const state = this.challengeStates[this.currentChallengeIndex];
    if (!state) {
      return { isComplete: true, currentChallenge: null };
    }

    // LEVEL 4: Temporal Consistency Check
    // If the face jumps erratically, fail the session immediately.
    if (!this.temporalChecker.processFrame(landmarks)) {
      console.warn('[Liveness] Temporal consistency violation detected (possible spoof).');
      this.isComplete = true; // Force fail the session
      // Make all remaining challenges fail
      this.challengeStates.forEach(s => {
        if (s.status === 'WAITING' || s.status === 'IN_PROGRESS') {
           s.status = 'TIMEOUT';
           s.timedOut = true;
        }
      });
      return { isComplete: this.isComplete, currentChallenge: null };
    }

    // Check for timeout
    const elapsed = performance.now() - state.startedAt;
    if (elapsed > LIVENESS_CHALLENGE_TIMEOUT_MS) {
      state.status = 'TIMEOUT';
      state.timedOut = true;
      this.advanceToNextChallenge();
      return { isComplete: this.isComplete, currentChallenge: this.getCurrentChallenge() };
    }

    // Compute frame analysis values
    const leftEAR = computeEAR(landmarks, EYE_LANDMARKS.LEFT_EYE);
    const rightEAR = computeEAR(landmarks, EYE_LANDMARKS.RIGHT_EYE);
    const mar = computeMAR(landmarks);
    const cheekRaise = computeCheekRaiseScore(landmarks);
    const yaw = estimateHeadYaw(landmarks);
    const pitch = estimateHeadPitch(landmarks);

    state.frameHistory.push({
      timestamp: performance.now(),
      leftEAR,
      rightEAR,
      averageEAR: (leftEAR + rightEAR) / 2,
      mouthMAR: mar,
      cheekRaise,
      headYawDegrees: yaw,
      headPitchDegrees: pitch,
      headRollDegrees: 0,
    });

    // Keep only last 30 frames to avoid memory growth
    if (state.frameHistory.length > 30) {
      state.frameHistory.shift();
    }

    // Route to the appropriate challenge detector
    let challengeCompleted = false;
    const challenge = this.challenges[this.currentChallengeIndex];

    switch (challenge) {
      case 'BLINK':
        challengeCompleted = this.blinkDetector?.processFrame(leftEAR, rightEAR) ?? false;
        break;
      case 'SMILE':
        challengeCompleted = this.smileDetector?.processFrame(landmarks) ?? false;
        break;
      case 'HEAD_TURN_LEFT':
      case 'HEAD_TURN_RIGHT':
        challengeCompleted = this.headTurnDetector?.processFrame(yaw) ?? false;
        break;
    }

    if (challengeCompleted) {
      state.status = 'COMPLETED';
      state.completedAt = performance.now();
      this.advanceToNextChallenge();
    }

    return { isComplete: this.isComplete, currentChallenge: this.getCurrentChallenge() };
  }

  private advanceToNextChallenge(): void {
    this.currentChallengeIndex++;
    if (this.currentChallengeIndex >= this.challenges.length) {
      this.isComplete = true;
    } else {
      // Small cooldown before activating next challenge
      setTimeout(() => {
        this.activateCurrentChallenge();
      }, LIVENESS_CHALLENGE_COOLDOWN_MS);
    }
  }

  /**
   * Returns the final session result. Only valid after isComplete === true.
   */
  getResult(): LivenessSessionResult {
    const completedChallenges = this.challengeStates.filter((s) => s.status === 'COMPLETED').length;
    const timedOutChallenges = this.challengeStates.filter((s) => s.timedOut).length;
    const totalChallenges = this.challenges.length;

    let score: number;
    if (completedChallenges === totalChallenges) {
      score = LIVENESS_SCORE_MAPPING.ALL_PASSED;
    } else if (completedChallenges === 1 && totalChallenges === 2) {
      score = LIVENESS_SCORE_MAPPING.PARTIAL_PASSED;
    } else {
      score = LIVENESS_SCORE_MAPPING.ALL_FAILED;
    }

    // Apply timeout penalty
    score = Math.max(0, score - timedOutChallenges * LIVENESS_SCORE_MAPPING.TIMEOUT_PENALTY);

    return {
      sessionId: this.sessionId,
      challenges: this.challengeStates,
      overallScore: score,
      isPassed: score >= 50,
      totalDurationMs: performance.now() - this.sessionStartTime,
      failureReason:
        score < 50
          ? `Only ${completedChallenges}/${totalChallenges} challenges completed`
          : undefined,
    };
  }
}
