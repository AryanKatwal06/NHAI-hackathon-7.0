// src/navigation/types.ts
// React Navigation type definitions.
// All navigation params must be typed here.

import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { ROUTES } from '@constants/navigation.constants';
import type { ExplainableAuthResult } from '@/types/trust.types';

// ─── AUTH STACK (unauthenticated, before supervisor login) ────────────────────
export type AuthStackParamList = {
  [ROUTES.SPLASH]: undefined;
  [ROUTES.LOGIN]: undefined;
};

// ─── APP STACK (authenticated supervisor or worker authentication flow) ────────
export type AppStackParamList = {
  [ROUTES.ENROLLMENT]: undefined;
  [ROUTES.AUTHENTICATION]: { workerEmployeeId?: string };
  [ROUTES.LIVENESS]: {
    workerId: string;
    faceMatchScore: number;
    pipelineStartTime: number;
    precomputedSignals: {
      locationScore: number;
      locationDetails: string;
      deviceScore: number;
      deviceDetails: string;
      deviceFingerprint: string;
      gpsLatitude?: number;
      gpsLongitude?: number;
      gpsAccuracy?: number;
    };
  };
  [ROUTES.RESULTS]: { explainableResult: ExplainableAuthResult; authAttemptId: string };
  [ROUTES.SUPERVISOR_DASHBOARD]: undefined;
  [ROUTES.PENDING_SYNC]: undefined;
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.AUDIT_LOGS]: undefined;
};

// ─── ROOT STACK ───────────────────────────────────────────────────────────────
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// ─── SCREEN PROPS (convenience types for individual screens) ──────────────────
export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.SPLASH>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.LOGIN>;
export type EnrollmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.ENROLLMENT
>;
export type AuthenticationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.AUTHENTICATION
>;
export type LivenessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.LIVENESS
>;
export type ResultsScreenProps = NativeStackScreenProps<RootStackParamList, typeof ROUTES.RESULTS>;
export type SupervisorDashboardProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.SUPERVISOR_DASHBOARD
>;
export type PendingSyncScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.PENDING_SYNC
>;
export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.SETTINGS
>;
export type AuditLogsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  typeof ROUTES.AUDIT_LOGS
>;

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;
