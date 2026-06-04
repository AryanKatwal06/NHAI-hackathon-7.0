// src/theme/ThemeProvider.tsx
// Provides dark/light mode toggle throughout the app.
// Uses React Context so every component can access the current theme
// and toggle it without prop drilling.
// Mode preference is persisted in EncryptedStorage.

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { DarkColors, LightColors, type Colors } from './colors';
import { FontFamily, FontSize, FontWeight, LineHeight } from './typography';
import { Spacing, BorderRadius } from './spacing';

type ColorMode = 'dark' | 'light';

interface ThemeContextValue {
  colors: Colors;
  mode: ColorMode;
  toggleMode: () => void;
  isDark: boolean;
  fontFamily: typeof FontFamily;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  lineHeight: typeof LineHeight;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'nhai_color_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ColorMode>('dark'); // Dark is default

  // Load saved preference on mount
  useEffect(() => {
    void EncryptedStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      })
      .catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      void EncryptedStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    colors: mode === 'dark' ? DarkColors : LightColors,
    mode,
    toggleMode,
    isDark: mode === 'dark',
    fontFamily: FontFamily,
    fontSize: FontSize,
    fontWeight: FontWeight,
    lineHeight: LineHeight,
    spacing: Spacing,
    borderRadius: BorderRadius,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to access the current theme in any component.
 * Usage: const { colors, toggleMode, isDark } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
