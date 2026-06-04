import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorkerEnrollmentInput } from '@/types/worker.types';

type EnrollmentStep = 'PROFILE_FORM' | 'FACE_CAPTURE' | 'PROCESSING' | 'COMPLETE' | 'FAILED';

interface CapturedFrame {
  index: number;
  quality: number; // 0–100 quality score for this frame
  capturedAt: string; // ISO timestamp
  // Note: actual pixel data is NOT stored in Zustand — too large.
  // It lives in a module-level variable in the EnrollmentService.
}

interface EnrollmentStore {
  currentStep: EnrollmentStep;
  workerInput: Partial<WorkerEnrollmentInput>;
  capturedFrames: CapturedFrame[];
  enrolledWorkerId: string | null;
  error: string | null;

  // Actions
  setWorkerInput: (input: Partial<WorkerEnrollmentInput>) => void;
  setStep: (step: EnrollmentStep) => void;
  addCapturedFrame: (frame: CapturedFrame) => void;
  clearFrames: () => void;
  completeEnrollment: (workerId: string) => void;
  failEnrollment: (reason: string) => void;
  resetEnrollment: () => void;
}

export const useEnrollmentStore = create<EnrollmentStore>()(
  immer((set) => ({
    currentStep: 'PROFILE_FORM',
    workerInput: {},
    capturedFrames: [],
    enrolledWorkerId: null,
    error: null,

    setWorkerInput: (input) =>
      set((state) => {
        state.workerInput = { ...state.workerInput, ...input };
      }),

    setStep: (step) =>
      set((state) => {
        state.currentStep = step;
      }),

    addCapturedFrame: (frame) =>
      set((state) => {
        state.capturedFrames.push(frame);
      }),

    clearFrames: () =>
      set((state) => {
        state.capturedFrames = [];
      }),

    completeEnrollment: (workerId) =>
      set((state) => {
        state.currentStep = 'COMPLETE';
        state.enrolledWorkerId = workerId;
        state.error = null;
      }),

    failEnrollment: (reason) =>
      set((state) => {
        state.currentStep = 'FAILED';
        state.error = reason;
      }),

    resetEnrollment: () =>
      set((state) => {
        state.currentStep = 'PROFILE_FORM';
        state.workerInput = {};
        state.capturedFrames = [];
        state.enrolledWorkerId = null;
        state.error = null;
      }),
  })),
);
