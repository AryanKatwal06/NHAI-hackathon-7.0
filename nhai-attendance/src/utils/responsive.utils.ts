import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// The design was built at 390px width (iPhone 14 base)
const BASE_WIDTH  = 390;
const BASE_HEIGHT = 844;

// Scale factor: how much to multiply base measurements by
const SCALE_W = SCREEN_W / BASE_WIDTH;
const SCALE_H = SCREEN_H / BASE_HEIGHT;

// Clamp helpers: prevent values from scaling too aggressively on large tablets
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Scales a size value proportionally to the screen width.
 * Use for spacing, margins, padding, icon sizes, and widths.
 *
 * @param size - The size in dp at the 390px base width
 * @returns Scaled size clamped to prevent extreme values on tablets
 */
export function rs(size: number): number {
  return Math.round(clamp(size * SCALE_W, size * 0.75, size * 1.35));
}

/**
 * Scales a font size proportionally but with tighter bounds.
 * Fonts should not scale as aggressively as spacing — text readability
 * degrades when fonts are too large on tablets.
 *
 * @param size - The font size in sp at the 390px base width
 * @returns Scaled font size
 */
export function rf(size: number): number {
  const scaled = size * SCALE_W;
  return Math.round(clamp(scaled, size * 0.85, size * 1.2));
}

/**
 * Returns a percentage of the screen width.
 * @param percent - Percentage value (0–100)
 */
export function rp(percent: number): number {
  return (SCREEN_W * percent) / 100;
}

/**
 * Returns a percentage of the screen height.
 * @param percent - Percentage value (0–100)
 */
export function rhp(percent: number): number {
  return (SCREEN_H * percent) / 100;
}

// Convenience exports
export const SCREEN_WIDTH  = SCREEN_W;
export const SCREEN_HEIGHT = SCREEN_H;
export const IS_SMALL_DEVICE = SCREEN_W < 375;
export const IS_LARGE_DEVICE = SCREEN_W >= 414;
export const IS_TABLET = SCREEN_W >= 600;

// Safe area estimates for devices without notch/dynamic island detection
// These are conservative — SafeAreaInsets from react-native-safe-area-context
// should be used in layout, but these are useful for calculations
export const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : 24;
export const BOTTOM_SAFE_AREA  = Platform.OS === 'ios' ? 34 : 0;
