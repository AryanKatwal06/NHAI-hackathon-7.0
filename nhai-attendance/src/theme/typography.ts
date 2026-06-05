// typography.ts — Typography scale: font sizes, weights, line heights.
// Uses system fonts for maximum compatibility across Android/iOS.
// Named exports for ThemeProvider compatibility.

import { rf } from '@utils/responsive.utils';
import { Platform } from 'react-native';

export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
  medium:  Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
  bold:    Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
  mono:    Platform.OS === 'ios' ? 'Menlo' : 'monospace',
} as const;

export const FontSize = {
  xs:      rf(10),
  sm:      rf(12),
  md:      rf(14),
  base:    rf(16),
  lg:      rf(18),
  xl:      rf(20),
  xxl:     rf(24),
  xxxl:    rf(32),
  display: rf(48),
} as const;

export const FontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semiBold:  '600' as const,
  bold:      '700' as const,
  extraBold: '800' as const,
  heavy: '800' as const,
} as const;

export const LineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;

// Backward-compatible combined export
export const typography = {
  fontFamily: FontFamily,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
} as const;
