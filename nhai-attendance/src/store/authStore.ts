import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AuthenticationSession, AuthStep } from '@/types/auth.types';
import type { TrustScoreResult, ExplainableAuthResult } from '@/types/trust.types';

interface AuthStore {
  // Current session
  session: AuthenticationSession | null;
  explainableResult: ExplainableAuthResult | null;

  // Actions
  startSession: () => void;
  setCurrentStep: (step: AuthStep) => void;
  setWorkerId: (workerId: string) => void;
  setFaceMatchScore: (score: number) => void;
  setLivenessScore: (score: number) => void;
  setDeviceTrustScore: (score: number) => void;
  setLocationScore: (score: number) => void;
  setBehavioralScore: (score: number) => void;
  completeSession: (result: TrustScoreResult, explainable: ExplainableAuthResult) => void;
  failSession: (reason: string) => void;
  resetSession: () => void;
}

export const useAuthStore = create<AuthStore>()(
  immer((set) => ({
    session: null,
    explainableResult: null,

    startSession: () =>
      set((state) => {
        const sessionId = `auth_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        state.session = {
          sessionId,
          startedAt: new Date().toISOString(),
          currentStep: 'IDLE',
          isComplete: false,
        };
        state.explainableResult = null;
      }),

    setCurrentStep: (step) =>
      set((state) => {
        if (state.session) {
          state.session.currentStep = step;
        }
      }),

    setWorkerId: (workerId) =>
      set((state) => {
        if (state.session) {
          state.session.workerId = workerId;
        }
      }),

    setFaceMatchScore: (score) =>
      set((state) => {
        if (state.session) {
          state.session.faceMatchScore = score;
        }
      }),

    setLivenessScore: (score) =>
      set((state) => {
        if (state.session) {
          state.session.livenessScore = score;
        }
      }),

    setDeviceTrustScore: (score) =>
      set((state) => {
        if (state.session) {
          state.session.deviceTrustScore = score;
        }
      }),

    setLocationScore: (score) =>
      set((state) => {
        if (state.session) {
          state.session.locationScore = score;
        }
      }),

    setBehavioralScore: (score) =>
      set((state) => {
        if (state.session) {
          state.session.behavioralScore = score;
        }
      }),

    completeSession: (result, explainable) =>
      set((state) => {
        if (state.session) {
          state.session.isComplete = true;
          state.session.completedAt = new Date().toISOString();
          state.session.currentStep = 'COMPLETE';
        }
        state.explainableResult = explainable;
      }),

    failSession: (reason) =>
      set((state) => {
        if (state.session) {
          state.session.isComplete = true;
          state.session.currentStep = 'FAILED';
          state.session.completedAt = new Date().toISOString();
        }
        console.warn('[AuthStore] Session failed:', reason);
      }),

    resetSession: () =>
      set((state) => {
        state.session = null;
        state.explainableResult = null;
      }),
  })),
);
