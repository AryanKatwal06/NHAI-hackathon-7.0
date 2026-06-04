// src/components/common/GlassCard/GlassCard.tsx
// Glassmorphism card with frosted-glass effect.
// Uses a semi-transparent background with a subtle border and shadow.

import React from 'react';
import { View, type ViewStyle, type StyleProp, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
  testID?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, glowColor, testID }) => {
  const { colors, borderRadius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.background.glass,
          borderColor: colors.border.glass,
          borderRadius: borderRadius.xl,
          padding: spacing.base,
          shadowColor: glowColor ?? 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glowColor ? 0.4 : 0,
          shadowRadius: glowColor ? 16 : 0,
          elevation: glowColor ? 8 : 4,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
});
