// src/components/trust/ScoreBreakdown/ScoreBreakdown.tsx
// Animated horizontal bar breakdown of the 5 trust signals.
// Each bar grows from left to right with staggered animation.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme/ThemeProvider';

interface SignalScore {
  label: string;
  score: number;
  weight: number;
  signalKey: 'face' | 'liveness' | 'device' | 'behavioral' | 'location';
}

interface ScoreBreakdownProps {
  signals: SignalScore[];
}

const SignalBar: React.FC<{ signal: SignalScore; index: number; color: string }> = ({
  signal,
  index,
  color,
}) => {
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      index * 120,
      withTiming(signal.score, { duration: 800, easing: Easing.out(Easing.cubic) }),
    );
  }, [signal.score, index, width]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={[styles.signalRow, { marginBottom: spacing.sm }]}>
      <View style={[styles.labelRow, { marginBottom: spacing.xxs }]}>
        <View style={[styles.signalDot, { backgroundColor: color }]} />
        <Text style={[styles.signalLabel, { color: colors.text.secondary, fontSize: fontSize.sm }]}>
          {signal.label}
        </Text>
        <Text style={[styles.signalWeight, { color: colors.text.tertiary, fontSize: fontSize.xs }]}>
          ×{signal.weight}%
        </Text>
        <Text
          style={[
            styles.signalScore,
            { color: colors.text.primary, fontSize: fontSize.sm, fontWeight: fontWeight.bold },
          ]}
        >
          {signal.score}
        </Text>
      </View>
      <View
        style={[
          styles.barTrack,
          { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.sm },
        ]}
      >
        <Animated.View
          style={[
            styles.barFill,
            { backgroundColor: color, borderRadius: borderRadius.sm },
            barStyle,
          ]}
        />
      </View>
    </View>
  );
};

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ signals }) => {
  const { colors } = useTheme();

  const signalColors: Record<string, string> = {
    face: colors.signal.face,
    liveness: colors.signal.liveness,
    device: colors.signal.device,
    behavioral: colors.signal.behavioral,
    location: colors.signal.location,
  };

  return (
    <View style={styles.container}>
      {signals.map((signal, index) => (
        <SignalBar
          key={signal.signalKey}
          signal={signal}
          index={index}
          color={signalColors[signal.signalKey] ?? colors.text.secondary}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  signalRow: {},
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  signalDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  signalLabel: { flex: 1 },
  signalWeight: { marginRight: 8 },
  signalScore: { width: 30, textAlign: 'right' },
  barTrack: { height: 6, width: '100%' },
  barFill: { height: 6 },
});
