/* eslint-disable */
// LivenessScreen.tsx — Redesigned liveness challenge with emoji instructions,
// countdown progress bar, completed challenge checkmarks, and Hindi text.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from '@constants/navigation.constants';
import {
  CHALLENGE_COUNT,
  CHALLENGE_TIMEOUT_MS,
  LIVENESS_CHALLENGES,
  LIVENESS_SCORES,
} from '@constants/liveness.constants';
import { completePipeline } from '@services/AuthenticationService';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { CameraView } from '@components/camera/CameraView';
import { useTheme } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp, LivenessScreenProps } from '@navigation/types';
import { rs, rf, SCREEN_WIDTH } from '@utils/responsive.utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ChallengeKey = keyof typeof LIVENESS_CHALLENGES;
const CHALLENGE_KEYS = Object.keys(LIVENESS_CHALLENGES) as ChallengeKey[];

const CHALLENGE_CONFIG: Record<string, { icon: string; label: string; hindi: string }> = {
  BLINK: { icon: 'eye-outline', label: 'Blink your eyes', hindi: 'पलकें झपकाएं' },
  SMILE: { icon: 'emoticon-happy-outline', label: 'Smile', hindi: 'मुस्कुराएं' },
  HEAD_TURN_LEFT: { icon: 'arrow-left-bold-outline', label: 'Turn head left', hindi: 'सिर बाएं घुमाएं' },
  HEAD_TURN_RIGHT: { icon: 'arrow-right-bold-outline', label: 'Turn head right', hindi: 'सिर दाएं घुमाएं' },
};

const LivenessScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<LivenessScreenProps['route']>();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const insets = useSafeAreaInsets();
  const { workerId, faceMatchScore, pipelineStartTime, precomputedSignals } = route.params;

  const [challenges] = useState<ChallengeKey[]>(() => {
    const shuffled = [...CHALLENGE_KEYS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, CHALLENGE_COUNT);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_TIMEOUT_MS / 1000);
  const [isProcessing, setIsProcessing] = useState(false);
  const progressAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentIndex >= challenges.length || isProcessing) {
      return;
    }
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: CHALLENGE_TIMEOUT_MS,
      useNativeDriver: false,
    }).start();
    const interval = setInterval(() => setTimeRemaining((prev) => Math.max(0, prev - 1)), 1000);
    const timeout = setTimeout(() => handleResponse(false), CHALLENGE_TIMEOUT_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentIndex, isProcessing]);

  const handleResponse = useCallback(
    (passed: boolean) => {
      const newResults = [...results, passed];
      setResults(newResults);
      if (currentIndex + 1 < challenges.length) {
        setCurrentIndex(currentIndex + 1);
        setTimeRemaining(CHALLENGE_TIMEOUT_MS / 1000);
      } else {
        void finishLiveness(newResults);
      }
    },
    [currentIndex, challenges.length, results],
  );

  const finishLiveness = async (allResults: boolean[]) => {
    setIsProcessing(true);
    const passedCount = allResults.filter(Boolean).length;
    let livenessScore: number;
    if (passedCount === allResults.length) {
      livenessScore = LIVENESS_SCORES.ALL_PASSED;
    } else if (passedCount > 0) {
      livenessScore = LIVENESS_SCORES.PARTIAL_PASSED;
    } else {
      livenessScore = LIVENESS_SCORES.ALL_FAILED;
    }

    try {
      const { explainable } = await completePipeline(
        workerId,
        faceMatchScore,
        livenessScore,
        precomputedSignals,
        pipelineStartTime,
      );
      navigation.navigate(ROUTES.RESULTS, {
        explainableResult: explainable,
        authAttemptId: workerId,
      });
    } catch (err) {
      console.error('[LivenessScreen] Pipeline error:', err);
      navigation.goBack();
    }
  };

  if (isProcessing) {
    return (
      <LinearGradient
        colors={colors.gradients.header}
        style={styles.processingContainer}
        testID="liveness-processing"
      >
        <Text
          style={{
            color: colors.text.primary,
            fontSize: fontSize.xl,
            fontWeight: fontWeight.bold,
            textAlign: 'center',
          }}
        >
          Computing trust score...
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: fontSize.sm, marginTop: spacing.sm }}>
          Analyzing all signals
        </Text>
      </LinearGradient>
    );
  }

  const currentChallenge = challenges[currentIndex] as string;
  const config = currentChallenge
    ? (CHALLENGE_CONFIG[currentChallenge] ?? { icon: 'help-circle-outline', label: currentChallenge, hindi: '' })
    : { icon: 'help-circle-outline', label: '', hindi: '' };
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Progress bar color: blue -> amber -> red as time runs out
  const progressColor =
    timeRemaining > 5 ? colors.brand.primary : timeRemaining > 2 ? colors.warning : colors.error;

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      testID="liveness-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Camera area with face oval */}
      <View style={styles.cameraArea}>
        <CameraView isActive={!isProcessing} style={StyleSheet.absoluteFill} />
        <View style={[styles.faceOval, { borderColor: colors.faceOverlay.liveness }]} />

        {/* Completed checkmarks row */}
        <View style={[styles.checkmarksRow, { top: insets.top + rs(60) }]}>
          {challenges.map((_, i) => (
            <View
              key={i}
              style={[
                styles.checkmark,
                {
                  backgroundColor:
                    i < results.length
                      ? results[i]
                        ? colors.trust.authenticated
                        : colors.trust.rejected
                      : i === currentIndex
                        ? colors.trust.neutral
                        : colors.background.tertiary,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Icon
                name={i < results.length ? (results[i] ? 'check' : 'close') : i === currentIndex ? 'circle' : 'circle-outline'}
                size={14}
                color="#FFF"
              />
            </View>
          ))}
        </View>
      </View>

      {/* Challenge instruction card */}
      <GlassCard style={[styles.challengeCard, { width: SCREEN_WIDTH - rs(40), alignSelf: 'center' }]}>
        <Icon name={config.icon} size={Math.round(SCREEN_WIDTH * 0.14)} color={colors.text.primary} style={{ textAlign: 'center' }} />
        <Text
          style={{
            color: colors.text.primary,
            fontSize: rf(18),
            fontWeight: fontWeight.bold,
            textAlign: 'center',
            marginTop: spacing.sm,
          }}
        >
          {config.label}
        </Text>
        <Text
          style={{
            color: colors.text.tertiary,
            fontSize: fontSize.md,
            textAlign: 'center',
            marginTop: spacing.xxs,
          }}
        >
          {config.hindi}
        </Text>

        {/* Timer */}
        <Text
          style={{
            color: progressColor,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            textAlign: 'center',
            marginTop: spacing.md,
          }}
        >
          {timeRemaining}s
        </Text>

        {/* Progress bar */}
        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: colors.background.tertiary,
              borderRadius: borderRadius.sm,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressWidth,
                backgroundColor: progressColor,
                borderRadius: borderRadius.sm,
              },
            ]}
          />
        </View>


        <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
          <GradientButton
            label="Challenge Passed"
            onPress={() => handleResponse(true)}
            gradient={colors.gradients.authenticated}
            fullWidth
            testID="challenge-pass-btn"
          />
          <Button
            label="Challenge Failed"
            onPress={() => handleResponse(false)}
            variant="danger"
            fullWidth
            testID="challenge-fail-btn"
          />
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraArea: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  faceOval: { width: SCREEN_WIDTH * 0.72, height: (SCREEN_WIDTH * 0.72) * 1.35, borderRadius: SCREEN_WIDTH * 0.36, borderWidth: 3 },
  checkmarksRow: { position: 'absolute', flexDirection: 'row', gap: rs(12) },
  checkmark: { width: rs(28), height: rs(28), justifyContent: 'center', alignItems: 'center' },
  challengeCard: { margin: rs(16), borderRadius: rs(24) },
  progressTrack: { height: rs(6), overflow: 'hidden' },
  progressFill: { height: rs(6) },
  processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LivenessScreen;
