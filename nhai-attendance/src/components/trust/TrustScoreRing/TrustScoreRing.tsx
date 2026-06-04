// src/components/trust/TrustScoreRing/TrustScoreRing.tsx
// Simplified trust score indicator using standard Views.
// Replaces heavy react-native-svg dependency.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@theme/ThemeProvider';
import type { AuthDecision } from '@/types/trust.types';

const RING_SIZE = 180;

interface TrustScoreRingProps {
  score: number;
  decision: AuthDecision;
}

export const TrustScoreRing: React.FC<TrustScoreRingProps> = ({ score, decision }) => {
  const { colors } = useTheme();

  const decisionColors: Record<AuthDecision, string> = {
    AUTHENTICATED: colors.trust.authenticated,
    FLAGGED: colors.trust.flagged,
    REJECTED: colors.trust.rejected,
    PENDING: colors.trust.neutral,
  };

  const ringColor = decisionColors[decision];

  // We map the score (0-100) to border width or opacity for a visual effect
  // Alternatively, just a colored circle border works fine for standard UI without SVG.
  return (
    <View style={[styles.container, { width: RING_SIZE, height: RING_SIZE, borderColor: ringColor }]}>
      <View style={styles.scoreContainer}>
        <Text style={[styles.scoreNumber, { color: ringColor }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/100</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 10,
    borderRadius: RING_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  scoreContainer: { alignItems: 'center' },
  scoreNumber: { fontSize: 52, fontWeight: '800', lineHeight: 56 },
  scoreLabel: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
});
