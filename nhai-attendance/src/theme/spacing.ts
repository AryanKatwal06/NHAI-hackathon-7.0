// spacing.ts — Spacing scale based on 4px base unit.
// All spacing values are multiples of 4 for consistent visual rhythm.
// Named exports for ThemeProvider compatibility.

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// Backward-compatible aliases
export const spacing = Spacing;
export const borderRadius = BorderRadius;
