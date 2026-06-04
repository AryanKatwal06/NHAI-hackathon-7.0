// typography.ts — Typography scale: font sizes, weights, line heights.
// Uses system fonts for maximum compatibility across Android/iOS.
// Named exports for ThemeProvider compatibility.

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 52,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Backward-compatible combined export
export const typography = {
  fontFamily: FontFamily,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
} as const;
