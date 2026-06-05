// app.constants.ts
// Application-wide constants: version information, build configuration, and feature flags.

// ─── APP IDENTITY ─────────────────────────────────────────────────────────────
export const APP_NAME = 'NHAI Field Attendance';
export const APP_IDENTIFIER = 'com.nhai.fieldattendance';
export const APP_VERSION = '0.1.0';
export const APP_BUILD_NUMBER = 1;

// ─── FEATURE FLAGS ────────────────────────────────────────────────────────────
// Feature flags for progressive rollout of functionality.
// Set to true to enable the feature, false to disable.
export const FEATURE_FLAGS = {
  ENABLE_LIVENESS_DETECTION: true,
  ENABLE_DEVICE_TRUST: true,
  ENABLE_BEHAVIORAL_ANALYSIS: true,
  ENABLE_LOCATION_VERIFICATION: true,
  ENABLE_AUTO_SYNC: true,
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  PERFORMANCE_LOGGING: __DEV__, // Enable verbose logging in development builds
} as const;

// ─── PERFORMANCE BUDGETS ──────────────────────────────────────────────────────
// Maximum acceptable time (ms) for critical operations.
// Used by PerformanceMonitor to flag slow operations.
export const PERFORMANCE_BUDGETS = {
  FACE_DETECTION_MS: 200, // Face detection should complete within 200ms
  FACE_EMBEDDING_MS: 300, // Embedding generation within 300ms
  LIVENESS_FRAME_PROCESS_MS: 50, // Per-frame liveness processing within 50ms (20fps)
  TRUST_SCORE_COMPUTE_MS: 100, // Trust score computation within 100ms
  DB_QUERY_MS: 50, // Individual DB query within 50ms
  TOTAL_AUTH_FLOW_MS: 15000, // Complete authentication flow within 15 seconds
} as const;

// ─── SYNC CONFIGURATION ───────────────────────────────────────────────────────
// Settings for the AWS sync mechanism — batch size, retry limits, backoff timing.
export const SYNC_CONFIG = {
  SYNC_BATCH_SIZE: 50, // Maximum records per API call
  MAX_RETRY_ATTEMPTS: 3, // Attempts before marking record as ABANDONED
  RETRY_BASE_DELAY_MS: 1000, // Base delay for exponential backoff (1 second)
  RETRY_MAX_DELAY_MS: 30000, // Maximum backoff delay cap (30 seconds)
} as const;

// ─── UI CONSTANTS ─────────────────────────────────────────────────────────────
export const UI_CONSTANTS = {
  ANIMATION_DURATION_MS: 300, // Default animation duration
  TOAST_DURATION_MS: 3000, // Toast notification display time
  DEBOUNCE_MS: 300, // Default debounce delay for user input
} as const;
