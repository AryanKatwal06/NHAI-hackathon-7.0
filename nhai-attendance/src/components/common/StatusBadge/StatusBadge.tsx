// src/components/common/StatusBadge/StatusBadge.tsx
// Updated to use useTheme() for dark/light mode support.

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import type { AuthDecision } from '@/types/trust.types';

interface StatusBadgeProps {
  decision: AuthDecision;
  size?: 'small' | 'medium' | 'large';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ decision, size = 'medium' }) => {
  const { colors, fontSize, fontWeight } = useTheme();

  const decisionConfig: Record<AuthDecision, { label: string; color: string }> = {
    AUTHENTICATED: { label: 'Authenticated', color: colors.trust.authenticated },
    FLAGGED: { label: 'Flagged', color: colors.trust.flagged },
    REJECTED: { label: 'Rejected', color: colors.trust.rejected },
    PENDING: { label: 'Pending', color: colors.trust.neutral },
  };

  const config = decisionConfig[decision];

  const sizeStyles = {
    small: { paddingVertical: 2, paddingHorizontal: 8 },
    medium: { paddingVertical: 4, paddingHorizontal: 10 },
    large: { paddingVertical: 6, paddingHorizontal: 14 },
  };

  const labelSizeStyles = {
    small: { fontSize: fontSize.xs },
    medium: { fontSize: fontSize.sm },
    large: { fontSize: fontSize.base },
  };

  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', borderRadius: 100, borderWidth: 1 },
        sizeStyles[size],
        { backgroundColor: `${config.color}20`, borderColor: config.color },
      ]}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          marginRight: 4,
          backgroundColor: config.color,
        }}
      />
      <Text
        style={[
          { fontWeight: fontWeight.semiBold },
          labelSizeStyles[size],
          { color: config.color },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};
