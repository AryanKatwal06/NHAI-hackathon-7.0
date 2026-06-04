// theme.ts — Assembled theme object combining colors, typography, spacing.
// Single import for all design tokens: import { theme } from '@theme/index';
// NOTE: For dark/light mode support, prefer useTheme() from ThemeProvider.

import { DarkColors } from './colors';
import { FontSize, FontWeight, LineHeight } from './typography';
import { Spacing, BorderRadius } from './spacing';

// Static theme object (uses dark colors by default — for backward compatibility)
export const theme = {
  colors: DarkColors,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
  spacing: Spacing,
  borderRadius: BorderRadius,
} as const;
