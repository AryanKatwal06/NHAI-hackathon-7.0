// src/components/common/GradientButton/GradientButton.tsx
// Button component that supports gradient fills using react-native-linear-gradient.
// Primary CTA button style throughout the redesigned app.

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  gradient?: string[];
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GradientButton: React.FC<GradientButtonProps> = ({
  label,
  onPress,
  gradient,
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  size = 'medium',
  style,
  testID,
}) => {
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const scale = useSharedValue(1);
  const activeGradient = gradient ?? colors.gradients.primary;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = (): void => {
    scale.value = withSpring(0.95);
  };
  const onPressOut = (): void => {
    scale.value = withSpring(1);
  };

  const heights: Record<string, number> = { small: 40, medium: 52, large: 60 };
  const fontSizes: Record<string, number> = {
    small: fontSize.sm,
    medium: fontSize.base,
    large: fontSize.lg,
  };

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled || isLoading}
      activeOpacity={1}
      style={[animStyle, fullWidth && { width: '100%' }, style]}
      testID={testID}
    >
      <LinearGradient
        colors={isDisabled ? ['#3A3A3A', '#2A2A2A'] : activeGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.base,
          { height: heights[size], borderRadius: borderRadius.full, paddingHorizontal: spacing.xl },
          fullWidth && { width: '100%' },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text
            style={{ color: '#FFFFFF', fontSize: fontSizes[size], fontWeight: fontWeight.bold }}
          >
            {label}
          </Text>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
});
