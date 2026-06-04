// src/components/common/Typography/Typography.tsx
// Reusable text component with theme-based typography styles.

import React from 'react';
import { Text, type TextStyle, type TextProps } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'display';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...rest
}) => {
  const { colors, fontSize, fontWeight, lineHeight } = useTheme();

  const variantStyles: Record<TypographyVariant, TextStyle> = {
    display: {
      fontSize: fontSize.display,
      fontWeight: fontWeight.heavy,
      lineHeight: fontSize.display * lineHeight.tight,
      color: colors.text.primary,
    },
    h1: {
      fontSize: fontSize.xxxl,
      fontWeight: fontWeight.bold,
      lineHeight: fontSize.xxxl * lineHeight.tight,
      color: colors.text.primary,
    },
    h2: {
      fontSize: fontSize.xxl,
      fontWeight: fontWeight.bold,
      lineHeight: fontSize.xxl * lineHeight.tight,
      color: colors.text.primary,
    },
    h3: {
      fontSize: fontSize.xl,
      fontWeight: fontWeight.semiBold,
      lineHeight: fontSize.xl * lineHeight.tight,
      color: colors.text.primary,
    },
    body: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.regular,
      lineHeight: fontSize.base * lineHeight.normal,
      color: colors.text.secondary,
    },
    caption: {
      fontSize: fontSize.xs,
      fontWeight: fontWeight.regular,
      lineHeight: fontSize.xs * lineHeight.normal,
      color: colors.text.tertiary,
    },
    label: {
      fontSize: fontSize.sm,
      fontWeight: fontWeight.medium,
      lineHeight: fontSize.sm * lineHeight.normal,
      color: colors.text.secondary,
    },
  };

  return (
    <Text
      style={[variantStyles[variant], color ? { color } : {}, { textAlign: align }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default Typography;
