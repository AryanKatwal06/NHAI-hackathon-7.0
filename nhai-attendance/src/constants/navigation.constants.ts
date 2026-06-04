// navigation.constants.ts
// Route name constants for React Navigation.
// All screen names are defined here as string constants to prevent typos
// and enable type-safe navigation throughout the app.

// ─── ROOT STACK ROUTES ────────────────────────────────────────────────────────
export const ROOT_ROUTES = {
  AUTH: 'Auth',
  APP: 'App',
} as const;

// ─── AUTH STACK ROUTES ────────────────────────────────────────────────────────
// Screens available before supervisor authentication.
export const AUTH_ROUTES = {
  SPLASH: 'Splash',
  LOGIN: 'Login',
} as const;

// ─── APP STACK ROUTES ─────────────────────────────────────────────────────────
// Screens available after supervisor authentication.
export const APP_ROUTES = {
  ENROLLMENT: 'Enrollment',
  AUTHENTICATION: 'Authentication',
  LIVENESS: 'Liveness',
  RESULTS: 'Results',
  SUPERVISOR_DASHBOARD: 'SupervisorDashboard',
  PENDING_SYNC: 'PendingSync',
  SETTINGS: 'Settings',
  AUDIT_LOGS: 'AuditLogs',
} as const;

// ─── UNIFIED ROUTES ───────────────────────────────────────────────────────────
// Combined routes for convenient access from screens and navigation.
export const ROUTES = {
  ...AUTH_ROUTES,
  ...APP_ROUTES,
} as const;
