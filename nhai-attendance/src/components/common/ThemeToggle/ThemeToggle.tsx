// src/components/common/ThemeToggle/ThemeToggle.tsx
// Animated dark/light mode toggle switch.
// Used in SettingsScreen and LoginScreen.

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '@theme/ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { isDark, toggleMode, colors } = useTheme();
  const translateX = useSharedValue(isDark ? 0 : 26);

  const handleToggle = (): void => {
    toggleMode();
    translateX.value = withSpring(isDark ? 26 : 0, { stiffness: 200, damping: 20 });
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[styles.track, { backgroundColor: isDark ? colors.brand.primary : colors.brand.teal }]}
      activeOpacity={0.8}
      testID="theme-toggle"
    >
      <Animated.View style={[styles.thumb, thumbStyle]}>
        {isDark ? (
          <Icon name="moon-waning-crescent" size={16} color="#0F172A" />
        ) : (
          <Icon name="weather-sunny" size={16} color="#F59E0B" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 58,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 14 },
});
