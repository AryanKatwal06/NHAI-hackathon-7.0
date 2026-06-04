// colors.ts — Color palette definitions for dark and light mode.
// The app targets outdoor use (construction worksites in bright sunlight and dark conditions).
// Dark mode is the default — it preserves night vision and reduces battery on OLED screens.
//
// Colors are chosen for:
//   1. WCAG AA contrast compliance (4.5:1 minimum for body text)
//   2. Outdoor readability (high luminance contrast for harsh sunlight)
//   3. Emotional resonance (green = safe, amber = caution, red = danger)
//   4. Indian cultural context (vibrant saffron/teal palette)

export const DarkColors = {
  // ─── BACKGROUND LAYERS ───────────────────────────────────────────────────
  background: {
    primary: '#0D0F1A',
    secondary: '#141728',
    tertiary: '#1C2035',
    elevated: '#242842',
    glass: 'rgba(20, 23, 40, 0.85)',
  },

  // ─── TEXT ──────────────────────────────────────────────────────────────────
  text: {
    primary: '#F0F2FF',
    secondary: '#9CA3C8',
    tertiary: '#5C6490',
    accent: '#7C9EFF',
    inverse: '#0D0F1A',
  },

  // ─── TRUST DECISION COLORS ────────────────────────────────────────────────
  trust: {
    authenticated: '#00E676',
    flagged: '#FFB300',
    rejected: '#FF1744',
    neutral: '#448AFF',
    authenticatedGlow: 'rgba(0, 230, 118, 0.25)',
    flaggedGlow: 'rgba(255, 179, 0, 0.25)',
    rejectedGlow: 'rgba(255, 23, 68, 0.25)',
    neutralGlow: 'rgba(68, 138, 255, 0.25)',
  },

  // ─── SIGNAL COLORS ────────────────────────────────────────────────────────
  signal: {
    face: '#7C9EFF',
    liveness: '#BF5AF2',
    device: '#FF9F0A',
    behavioral: '#FFD60A',
    location: '#30D158',
  },

  // ─── GRADIENT DEFINITIONS ─────────────────────────────────────────────────
  gradients: {
    primary: ['#4158D0', '#C850C0'],
    authenticated: ['#00B09B', '#96C93D'],
    flagged: ['#F7971E', '#FFD200'],
    rejected: ['#CB2D3E', '#EF473A'],
    neutral: ['#2193B0', '#6DD5ED'],
    surface: ['#1C2035', '#242842'],
    header: ['#0D0F1A', '#1C2035'],
  },

  // ─── BRAND ─────────────────────────────────────────────────────────────────
  brand: {
    primary: '#4158D0',
    secondary: '#C850C0',
    accent: '#FF6B6B',
    saffron: '#FF9933',
    teal: '#00B4D8',
  },

  // ─── SEMANTIC ──────────────────────────────────────────────────────────────
  success: '#00E676',
  warning: '#FFB300',
  error: '#FF1744',
  info: '#448AFF',

  // ─── BORDERS ───────────────────────────────────────────────────────────────
  border: {
    default: 'rgba(124, 158, 255, 0.12)',
    light: 'rgba(124, 158, 255, 0.20)',
    focus: '#4158D0',
    glass: 'rgba(255, 255, 255, 0.08)',
  },

  // ─── OVERLAYS ──────────────────────────────────────────────────────────────
  overlay: {
    dark: 'rgba(13, 15, 26, 0.85)',
    medium: 'rgba(13, 15, 26, 0.60)',
    light: 'rgba(13, 15, 26, 0.30)',
  },

  // ─── CAMERA OVERLAY ────────────────────────────────────────────────────────
  faceOverlay: {
    detecting: '#448AFF',
    detected: '#00E676',
    warning: '#FFB300',
    liveness: '#BF5AF2',
    scanning: '#00B4D8',
  },

  transparent: 'transparent',
};

export const LightColors = {
  background: {
    primary: '#F5F7FF',
    secondary: '#FFFFFF',
    tertiary: '#EDF0FF',
    elevated: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.85)',
  },
  text: {
    primary: '#0D0F1A',
    secondary: '#4A5080',
    tertiary: '#8890B8',
    accent: '#4158D0',
    inverse: '#F0F2FF',
  },
  trust: {
    authenticated: '#00A550',
    flagged: '#E07B00',
    rejected: '#CC0022',
    neutral: '#2962FF',
    authenticatedGlow: 'rgba(0, 165, 80, 0.15)',
    flaggedGlow: 'rgba(224, 123, 0, 0.15)',
    rejectedGlow: 'rgba(204, 0, 34, 0.15)',
    neutralGlow: 'rgba(41, 98, 255, 0.15)',
  },
  signal: {
    face: '#4158D0',
    liveness: '#9C27B0',
    device: '#E65100',
    behavioral: '#F57F17',
    location: '#2E7D32',
  },
  gradients: {
    primary: ['#4158D0', '#C850C0'],
    authenticated: ['#00897B', '#43A047'],
    flagged: ['#FB8C00', '#FDD835'],
    rejected: ['#C62828', '#E53935'],
    neutral: ['#1976D2', '#039BE5'],
    surface: ['#EDF0FF', '#F5F7FF'],
    header: ['#4158D0', '#6B71E8'],
  },
  brand: {
    primary: '#4158D0',
    secondary: '#C850C0',
    accent: '#FF6B6B',
    saffron: '#FF9933',
    teal: '#0097A7',
  },
  success: '#00A550',
  warning: '#E07B00',
  error: '#CC0022',
  info: '#2962FF',
  border: {
    default: 'rgba(65, 88, 208, 0.12)',
    light: 'rgba(65, 88, 208, 0.20)',
    focus: '#4158D0',
    glass: 'rgba(0, 0, 0, 0.08)',
  },
  overlay: {
    dark: 'rgba(13, 15, 26, 0.75)',
    medium: 'rgba(13, 15, 26, 0.50)',
    light: 'rgba(13, 15, 26, 0.20)',
  },
  faceOverlay: {
    detecting: '#2962FF',
    detected: '#00A550',
    warning: '#E07B00',
    liveness: '#9C27B0',
    scanning: '#0097A7',
  },
  transparent: 'transparent',
};

export type Colors = typeof DarkColors;

// Backward-compatible export: static dark colors as `colors`
export const colors = DarkColors;
