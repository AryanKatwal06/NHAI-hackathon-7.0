// src/components/common/LoadingOverlay/LoadingOverlay.tsx
// Updated to use useTheme() for dark/light mode support.

import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Processing...',
}) => {
  const { colors, borderRadius, spacing, fontSize } = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay.dark,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.background.secondary,
            borderRadius: borderRadius.xl,
            padding: spacing.xxl,
            alignItems: 'center',
            gap: spacing.base,
            minWidth: 200,
          }}
        >
          <ActivityIndicator size="large" color={colors.trust.neutral} />
          <Text
            style={{ color: colors.text.secondary, fontSize: fontSize.base, textAlign: 'center' }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
