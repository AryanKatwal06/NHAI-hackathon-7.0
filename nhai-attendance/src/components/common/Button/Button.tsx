// src/components/common/Button/Button.tsx
// Updated to use useTheme() for dark/light mode support.

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  style,
  testID,
}) => {
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.trust.authenticated },
    secondary: {
      backgroundColor: colors.background.tertiary,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    danger: { backgroundColor: colors.trust.rejected },
    ghost: {
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    small: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minHeight: 36 },
    medium: { paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, minHeight: 48 },
    large: { paddingVertical: spacing.md, paddingHorizontal: spacing.xxl, minHeight: 56 },
  };

  const labelVariantStyles: Record<ButtonVariant, TextStyle> = {
    primary: { color: '#000000' },
    secondary: { color: colors.text.primary },
    danger: { color: '#FFFFFF' },
    ghost: { color: colors.text.primary },
  };

  const labelSizeStyles: Record<ButtonSize, TextStyle> = {
    small: { fontSize: fontSize.sm },
    medium: { fontSize: fontSize.base },
    large: { fontSize: fontSize.lg },
  };

  const containerStyle: ViewStyle[] = [
    {
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? { width: '100%' } : {},
    isDisabled || isLoading ? { opacity: 0.4 } : {},
    style ?? {},
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isDisabled || isLoading}
      activeOpacity={0.85}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#000' : colors.text.primary}
        />
      ) : (
        <Text
          style={[
            { fontWeight: fontWeight.semiBold },
            labelVariantStyles[variant],
            labelSizeStyles[size],
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};
