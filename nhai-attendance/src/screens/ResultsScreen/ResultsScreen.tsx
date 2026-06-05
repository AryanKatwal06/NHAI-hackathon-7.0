/* eslint-disable */
// ResultsScreen.tsx — Redesigned trust score display with animated ring,
// signal breakdown, decision verdict, and contradiction warning.

import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '@constants/navigation.constants';
import { StatusBadge } from '@components/common/StatusBadge';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { TrustScoreRing } from '@components/trust/TrustScoreRing/TrustScoreRing';
import { ScoreBreakdown } from '@components/trust/ScoreBreakdown/ScoreBreakdown';
import { useTheme } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp, ResultsScreenProps } from '@navigation/types';
import type { } from '@/types/trust.types';
import { rs, SCREEN_WIDTH } from '@utils/responsive.utils';

const DECISION_ICONS: Record<string, string> = {
  AUTHENTICATED: 'check-circle-outline',
  FLAGGED: 'flag-outline',
  REJECTED: 'close-circle-outline',
  PENDING: 'dots-horizontal',
};

const ResultsScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<ResultsScreenProps['route']>();
  const { colors, fontSize, fontWeight, spacing, } = useTheme();
  const { explainableResult } = route.params;

  const decisionColors: Record<string, string> = {
    AUTHENTICATED: colors.trust.authenticated,
    FLAGGED: colors.trust.flagged,
    REJECTED: colors.trust.rejected,
    PENDING: colors.trust.neutral,
  };

  const glowColors: Record<string, string> = {
    AUTHENTICATED: colors.trust.authenticatedGlow,
    FLAGGED: colors.trust.flaggedGlow,
    REJECTED: colors.trust.rejectedGlow,
    PENDING: colors.trust.neutralGlow,
  };

  const decisionColor = decisionColors[explainableResult.decision] ?? colors.text.primary;
  const glowColor = glowColors[explainableResult.decision];

  // Build signal breakdown data from contributions
  const getScore = (name: string) =>
    explainableResult.contributions?.find((c) => c.signalName === name)?.rawScore ?? 0;
  const signalData = [
    {
      label: 'Face Match',
      score: getScore('faceMatchScore'),
      weight: 40,
      signalKey: 'face' as const,
    },
    {
      label: 'Liveness',
      score: getScore('livenessScore'),
      weight: 25,
      signalKey: 'liveness' as const,
    },
    {
      label: 'Device Trust',
      score: getScore('deviceTrustScore'),
      weight: 15,
      signalKey: 'device' as const,
    },
    {
      label: 'Behavioral',
      score: getScore('behavioralScore'),
      weight: 10,
      signalKey: 'behavioral' as const,
    },
    {
      label: 'Location',
      score: getScore('locationScore'),
      weight: 10,
      signalKey: 'location' as const,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.content}
      testID="results-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Score ring */}
      <View style={styles.ringContainer}>
        <TrustScoreRing
          score={explainableResult.finalScore}
          decision={explainableResult.decision}
        />
      </View>

      {/* Decision verdict */}
      <GlassCard style={styles.verdictCard} glowColor={glowColor}>
        <View style={styles.verdictRow}>
          <Icon
            name={DECISION_ICONS[explainableResult.decision] ?? 'help-circle-outline'}
            size={40}
            color={decisionColor}
          />
          <View style={{ flex: 1 }}>
            <StatusBadge decision={explainableResult.decision} size="large" />
            <Text
              style={[styles.reason, { color: colors.text.secondary, fontSize: fontSize.base }]}
            >
              {explainableResult.primaryReason}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* Contradiction warning */}
      {explainableResult.isContradiction && (
        <GlassCard
          style={{ borderColor: colors.warning, borderWidth: 1 }}
          glowColor={colors.trust.flaggedGlow}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="alert-outline" size={24} color={colors.warning} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.warning,
                  fontSize: fontSize.base,
                  fontWeight: fontWeight.bold,
                }}
              >
                Signal Contradiction
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: fontSize.sm,
                  marginTop: spacing.xxs,
                }}
              >
                {explainableResult.contradictionExplanation ??
                  'High face match score with low supporting signals.'}
              </Text>
            </View>
          </View>
        </GlassCard>
      )}

      {/* Signal breakdown */}
      <GlassCard>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            marginBottom: spacing.md,
          }}
        >
          Signal Breakdown
        </Text>
        <ScoreBreakdown signals={signalData} />
      </GlassCard>

      {/* Action buttons */}
      <View style={styles.actions}>
        <GradientButton
          label="New Scan"
          onPress={() => navigation.navigate(ROUTES.AUTHENTICATION, {})}
          fullWidth
          testID="new-auth-btn"
        />
        <Button
          label="Dashboard"
          onPress={() => navigation.navigate(ROUTES.SUPERVISOR_DASHBOARD)}
          variant="secondary"
          fullWidth
          testID="back-to-dashboard-btn"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: rs(16), paddingVertical: rs(20), gap: rs(20) },
  ringContainer: { alignItems: 'center', paddingVertical: rs(20) },
  verdictCard: { borderRadius: rs(20), marginHorizontal: 0 },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: rs(16) },
  reason: { marginTop: rs(4) },
  actions: { gap: rs(10), marginTop: rs(8) },
});

export default ResultsScreen;
