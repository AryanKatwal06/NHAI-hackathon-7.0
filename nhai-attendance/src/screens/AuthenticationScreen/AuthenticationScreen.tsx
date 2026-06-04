/* eslint-disable */
// AuthenticationScreen.tsx — Redesigned camera preview + face detection overlay.
// Full-screen camera, animated face oval, signal pre-computation dots, glassmorphism bottom card.

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '@constants/navigation.constants';
import { precomputeBackgroundSignals } from '@services/AuthenticationService';
import { LoadingOverlay } from '@components/common/LoadingOverlay';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { useTheme } from '@theme/ThemeProvider';
import { useAppAlert } from '@components/common/AppAlertProvider';
import type { AppNavigationProp, AuthenticationScreenProps } from '@navigation/types';

const SIGNAL_LABELS = ['GPS', 'Device', 'Behavior', 'History', 'Config'];

const AuthenticationScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<AuthenticationScreenProps['route']>();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const { showAlert } = useAppAlert();
  const workerEmployeeId = route.params?.workerEmployeeId ?? 'WORKER_001';

  const [precomputeStatus, setPrecomputeStatus] = useState<
    'pending' | 'running' | 'done' | 'error'
  >('pending');
  const [precomputed, setPrecomputed] = useState<any>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [showLoading] = useState(false);
  const [signalsDone, setSignalsDone] = useState<boolean[]>([false, false, false, false, false]);
  const pipelineStartTime = performance.now();

  useEffect(() => {
    setPrecomputeStatus('running');
    // Simulate staggered signal computation
    SIGNAL_LABELS.forEach((_, i) => {
      setTimeout(
        () => {
          setSignalsDone((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        },
        300 + i * 400,
      );
    });

    void precomputeBackgroundSignals(workerEmployeeId)
      .then((result) => {
        setPrecomputed(result);
        setPrecomputeStatus('done');
      })
      .catch(() => {
        setPrecomputeStatus('error');
      });
  }, [workerEmployeeId]);

  const handleFaceDetected = useCallback(() => {
    setFaceDetected(true);
  }, []);

  const handleProceed = useCallback(() => {
    if (precomputeStatus !== 'done' || !precomputed) {
      showAlert('Not Ready', 'Background signals are still computing. Please wait.');
      return;
    }
    const simulatedFaceMatchScore = 92;
    navigation.navigate(ROUTES.LIVENESS, {
      workerId: workerEmployeeId,
      faceMatchScore: simulatedFaceMatchScore,
      pipelineStartTime,
      precomputedSignals: precomputed,
    });
  }, [precomputeStatus, precomputed, navigation, workerEmployeeId, pipelineStartTime]);

  const signalColors = [
    colors.signal.location,
    colors.signal.device,
    colors.signal.behavioral,
    colors.signal.face,
    colors.signal.liveness,
  ];

  return (
    <View style={styles.container} testID="authentication-screen">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Camera area (placeholder) */}
      {/* Frame processor integration: vision-camera-plugin-frame-processor-mlkit would
          enable real-time face detection here. For the prototype, face matching is
          triggered manually — the pipeline logic (AuthenticationService) is identical. */}
      <View style={styles.cameraArea}>
        <View style={[styles.cameraPlaceholder, { backgroundColor: colors.background.primary }]}>
          <Text style={{ color: colors.text.tertiary, fontSize: fontSize.lg }}>Camera Preview</Text>
          <Text style={{ color: colors.text.tertiary, fontSize: fontSize.xs, marginTop: 4 }}>
            (Camera module requires device build)
          </Text>
        </View>

        {/* Dark overlay outside oval */}
        <View style={[styles.overlay, { backgroundColor: colors.overlay.light }]} />

        {/* Face oval */}
        <View
          style={[
            styles.faceOval,
            {
              borderColor: faceDetected
                ? colors.faceOverlay.detected
                : colors.faceOverlay.detecting,
              shadowColor: faceDetected
                ? colors.faceOverlay.detected
                : colors.faceOverlay.detecting,
              shadowOpacity: 0.6,
              shadowRadius: 20,
            },
          ]}
        />

        {/* Top HUD pill */}
        <View
          style={[
            styles.topHud,
            { backgroundColor: colors.overlay.dark, borderRadius: borderRadius.full },
          ]}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
            }}
          >
            NHAI Hackathon
          </Text>
          <View style={[styles.connectivityDot, { backgroundColor: colors.success }]} />
        </View>
      </View>

      {/* Signal pre-computation dots */}
      <View
        style={[
          styles.signalRow,
          {
            backgroundColor: colors.background.primary,
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.base,
          },
        ]}
      >
        {SIGNAL_LABELS.map((label, i) => (
          <View key={label} style={styles.signalItem}>
            <View
              style={[
                styles.signalDot,
                {
                  backgroundColor: signalsDone[i] ? signalColors[i] : colors.background.tertiary,
                  borderWidth: signalsDone[i] ? 0 : 1,
                  borderColor: colors.border.default,
                },
              ]}
            />
            <Text
              style={{
                color: signalsDone[i] ? colors.text.secondary : colors.text.tertiary,
                fontSize: fontSize.xs,
              }}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Bottom action card */}
      <GlassCard style={[styles.controls, { backgroundColor: colors.background.glass }]}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  precomputeStatus === 'done'
                    ? colors.success
                    : precomputeStatus === 'error'
                      ? colors.error
                      : colors.warning,
              },
            ]}
          />
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, flex: 1 }}>
            {precomputeStatus === 'running'
              ? 'Computing GPS & device signals...'
              : precomputeStatus === 'done'
                ? 'Background signals ready'
                : precomputeStatus === 'error'
                  ? 'Signal computation failed — using defaults'
                  : 'Initializing...'}
          </Text>
        </View>

        <Text
          style={{
            color: colors.text.primary,
            fontSize: fontSize.base,
            textAlign: 'center',
            marginVertical: spacing.sm,
          }}
        >
          {faceDetected
            ? 'Face detected. Proceed to liveness check.'
            : 'Position your face within the oval.'}
        </Text>

        <View style={{ gap: spacing.sm }}>
          <Button
            label="Simulate Face Detected"
            onPress={handleFaceDetected}
            variant="secondary"
            fullWidth
            testID="simulate-face-btn"
          />
          <GradientButton
            label="Scan Face →"
            onPress={handleProceed}
            isDisabled={!faceDetected || precomputeStatus !== 'done'}
            fullWidth
            testID="proceed-liveness-btn"
          />
        </View>
      </GlassCard>

      <LoadingOverlay visible={showLoading} message="Processing face..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraPlaceholder: { alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject },
  faceOval: { position: 'absolute', width: 220, height: 280, borderRadius: 110, borderWidth: 3 },
  topHud: {
    position: 'absolute',
    top: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  connectivityDot: { width: 8, height: 8, borderRadius: 4 },
  signalRow: { flexDirection: 'row', justifyContent: 'space-around' },
  signalItem: { alignItems: 'center', gap: 4 },
  signalDot: { width: 10, height: 10, borderRadius: 5 },
  controls: { margin: 16, borderRadius: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4 },
});

export default AuthenticationScreen;
