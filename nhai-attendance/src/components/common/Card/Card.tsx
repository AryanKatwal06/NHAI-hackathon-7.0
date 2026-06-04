// src/components/common/Card/Card.tsx
// Updated to use useTheme() for dark/light mode support.

import React from 'react';
import { View, TouchableOpacity, type ViewStyle } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style, testID }) => {
  const { colors, borderRadius, spacing } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border.default,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.75}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={[cardStyle, style]} testID={testID}>
      {children}
    </View>
  );
};
