// spacing.ts — Spacing scale based on 4px base unit.
// All spacing values are multiples of 4 for consistent visual rhythm.
// Named exports for ThemeProvider compatibility.

import { rs } from '@utils/responsive.utils';

export const Spacing = {
  xxs:   rs(2),
  xs:    rs(4),
  sm:    rs(8),
  md:    rs(12),
  base:  rs(16),
  lg:    rs(20),
  xl:    rs(24),
  xxl:   rs(32),
  xxxl:  rs(48),
  huge:  rs(64),
} as const;

export const BorderRadius = {
  sm:   rs(4),
  md:   rs(8),
  lg:   rs(12),
  xl:   rs(16),
  xxl:  rs(24),
  full: 9999,
} as const;

// Backward-compatible aliases
export const spacing = Spacing;
export const borderRadius = BorderRadius;
