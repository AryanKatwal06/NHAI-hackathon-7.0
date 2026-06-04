// App.tsx
// Root application entry point.
// Wraps the app with ThemeProvider for dark/light mode support,
// SafeAreaProvider for device-safe insets, and GestureHandlerRootView
// for gesture-based interactions.

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '@theme/ThemeProvider';
import { AppAlertProvider } from '@components/common/AppAlertProvider';
import RootNavigator from './src/navigation/RootNavigator';

const NavigationWrapper: React.FC = () => {
  const { isDark, colors } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background.primary,
      card: colors.background.secondary,
      text: colors.text.primary,
      border: colors.border.default,
      primary: colors.brand.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

const App: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AppAlertProvider>
          <NavigationWrapper />
        </AppAlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
