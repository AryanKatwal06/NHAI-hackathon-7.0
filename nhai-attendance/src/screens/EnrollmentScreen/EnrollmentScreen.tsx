/* eslint-disable */
// EnrollmentScreen.tsx — Redesigned multi-step worker enrollment.
// Step indicator, glassmorphism cards, gradient buttons, capture progress.

import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '@constants/navigation.constants';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { CameraView } from '@components/camera/CameraView';
import { useTheme } from '@theme/ThemeProvider';
import { useAppAlert } from '@components/common/AppAlertProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp } from '@navigation/types';
import { rs, rf, rp, SCREEN_WIDTH } from '@utils/responsive.utils';
import { KeyboardAvoidingView, Platform as RNPlatform } from 'react-native';

type EnrollStep = 'DETAILS' | 'PHOTO_CAPTURE' | 'PROCESSING' | 'COMPLETE';
const STEPS: EnrollStep[] = ['DETAILS', 'PHOTO_CAPTURE', 'PROCESSING', 'COMPLETE'];
const STEP_LABELS = ['Profile', 'Face Capture', 'Processing', 'Complete'];

const EnrollmentScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const { showAlert } = useAppAlert();
  const [step, setStep] = useState<EnrollStep>('DETAILS');
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');
  const [capturedFrames, setCapturedFrames] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const currentStepIndex = STEPS.indexOf(step);

  const handleDetailsSubmit = useCallback(() => {
    if (!employeeId.trim() || !fullName.trim()) {
      showAlert('Required', 'Please fill in Employee ID and Full Name.');
      return;
    }
    setStep('PHOTO_CAPTURE');
  }, [employeeId, fullName]);

  const handleCapture = useCallback(async () => {
    // Simulate 5 frame captures
    for (let i = 1; i <= 5; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setCapturedFrames(i);
    }
    setStep('PROCESSING');

    // Simulate processing steps
    const steps = [
      'Analyzing face...',
      'Generating embedding...',
      'Encrypting data...',
      'Saving to database...',
    ];
    for (const s of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProcessingSteps((prev) => [...prev, s]);
    }
    setStep('COMPLETE');
  }, []);

  const handleFinish = useCallback(() => {
    navigation.navigate(ROUTES.SUPERVISOR_DASHBOARD);
  }, [navigation]);

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.content}
      testID="enrollment-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Step indicator */}
      <View style={styles.stepsContainer}>
        {STEP_LABELS.map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    i < currentStepIndex
                      ? colors.trust.authenticated
                      : i === currentStepIndex
                        ? colors.brand.primary
                        : colors.background.tertiary,
                  borderWidth: i === currentStepIndex ? 2 : 0,
                  borderColor: colors.brand.secondary,
                },
              ]}
            >
              {i < currentStepIndex ? (
                <Icon name="check" size={14} color="#FFF" />
              ) : (
                <Text style={{ color: '#FFF', fontSize: fontSize.sm, fontWeight: fontWeight.bold }}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text
              style={{
                color: i <= currentStepIndex ? colors.text.primary : colors.text.tertiary,
                fontSize: fontSize.xs,
                marginTop: 4,
              }}
            >
              {label}
            </Text>
            {i < STEP_LABELS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      i < currentStepIndex
                        ? colors.trust.authenticated
                        : colors.background.tertiary,
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step 1: Details */}
      {step === 'DETAILS' && (
        <KeyboardAvoidingView 
          behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
          style={{ width: '100%' }}
        >
          <GlassCard>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold,
              marginBottom: spacing.md,
            }}
          >
            Worker Profile
          </Text>
          <View style={{ gap: spacing.md }}>
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: fontSize.sm,
                  marginBottom: spacing.xxs,
                }}
              >
                Employee ID
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.tertiary,
                    borderRadius: borderRadius.lg,
                    color: colors.text.primary,
                    fontSize: fontSize.base,
                    borderColor:
                      focusedInput === 'eid' ? colors.brand.primary : colors.border.default,
                  },
                ]}
                value={employeeId}
                onChangeText={setEmployeeId}
                onFocus={() => setFocusedInput('eid')}
                onBlur={() => setFocusedInput(null)}
                placeholderTextColor={colors.text.tertiary}
                placeholder="e.g. NHAI-001"
                testID="enrollment-employee-id"
              />
            </View>
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: fontSize.sm,
                  marginBottom: spacing.xxs,
                }}
              >
                Full Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.tertiary,
                    borderRadius: borderRadius.lg,
                    color: colors.text.primary,
                    fontSize: fontSize.base,
                    borderColor:
                      focusedInput === 'name' ? colors.brand.primary : colors.border.default,
                  },
                ]}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                placeholderTextColor={colors.text.tertiary}
                placeholder="Full name"
                testID="enrollment-full-name"
              />
            </View>
            <View>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: fontSize.sm,
                  marginBottom: spacing.xxs,
                }}
              >
                Designation
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background.tertiary,
                    borderRadius: borderRadius.lg,
                    color: colors.text.primary,
                    fontSize: fontSize.base,
                    borderColor:
                      focusedInput === 'desg' ? colors.brand.primary : colors.border.default,
                  },
                ]}
                value={designation}
                onChangeText={setDesignation}
                onFocus={() => setFocusedInput('desg')}
                onBlur={() => setFocusedInput(null)}
                placeholderTextColor={colors.text.tertiary}
                placeholder="e.g. Site Engineer"
              />
            </View>
            <GradientButton
              label="Continue to Face Capture →"
              onPress={handleDetailsSubmit}
              fullWidth
              testID="enrollment-next-btn"
            />
          </View>
        </GlassCard>
        </KeyboardAvoidingView>
      )}

      {/* Step 2: Photo capture */}
      {step === 'PHOTO_CAPTURE' && (
        <GlassCard>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold,
              marginBottom: spacing.md,
            }}
          >
            Face Enrollment
          </Text>
          <View
            style={[
              styles.cameraPlaceholder,
              { backgroundColor: colors.background.tertiary, borderRadius: borderRadius.lg, overflow: 'hidden' },
            ]}
          >
            <CameraView isActive={step === 'PHOTO_CAPTURE'} style={StyleSheet.absoluteFill} />
            {/* Capture progress ring */}
            <View style={[styles.captureProgress, { position: 'absolute', bottom: rs(16), backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: rs(12), paddingVertical: rs(4), borderRadius: rs(16) }]}>
              <Text
                style={{
                  color: colors.text.accent,
                  fontSize: fontSize.lg,
                  fontWeight: fontWeight.bold,
                }}
              >
                {capturedFrames}/5
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: capturedFrames >= 3 ? colors.success : colors.text.secondary,
              fontSize: fontSize.sm,
              textAlign: 'center',
              marginVertical: spacing.sm,
            }}
          >
            Quality:{' '}
            {capturedFrames >= 4 ? 'EXCELLENT' : capturedFrames >= 2 ? 'GOOD' : 'Capturing...'}
          </Text>
          <GradientButton
            label="Capture & Process"
            onPress={handleCapture}
            fullWidth
            testID="enrollment-capture-btn"
          />
        </GlassCard>
      )}

      {/* Step 3: Processing */}
      {step === 'PROCESSING' && (
        <GlassCard>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.xl,
              fontWeight: fontWeight.bold,
              marginBottom: spacing.md,
            }}
          >
            Processing...
          </Text>
          {processingSteps.map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                marginBottom: spacing.sm,
              }}
            >
              <Icon name="check" size={16} color={colors.trust.authenticated} />
              <Text style={{ color: colors.text.secondary, fontSize: fontSize.base }}>{s}</Text>
            </View>
          ))}
        </GlassCard>
      )}

      {/* Step 4: Complete */}
      {step === 'COMPLETE' && (
        <GlassCard glowColor={colors.trust.authenticatedGlow}>
          <View style={styles.completeContainer}>
            <View style={[styles.successCircle, { backgroundColor: colors.trust.authenticated }]}>
              <Icon name="check" size={40} color="#FFF" />
            </View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: fontSize.xl,
                fontWeight: fontWeight.bold,
                marginTop: spacing.lg,
              }}
            >
              Enrollment Complete
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: fontSize.base,
                marginTop: spacing.sm,
                textAlign: 'center',
              }}
            >
              {fullName} ({employeeId}) has been enrolled successfully.
            </Text>
          </View>
          <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
            <GradientButton
              label="Enroll Another Worker"
              onPress={() => {
                setStep('DETAILS');
                setEmployeeId('');
                setFullName('');
                setDesignation('');
                setCapturedFrames(0);
                setProcessingSteps([]);
              }}
              fullWidth
            />
            <Button
              label="Go to Dashboard"
              onPress={handleFinish}
              variant="secondary"
              fullWidth
              testID="enrollment-done-btn"
            />
          </View>
        </GlassCard>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: rs(20), gap: rs(20) },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: rs(4),
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: { position: 'absolute', top: rs(14), left: '65%', width: '70%', height: rs(2) },
  input: { padding: rs(16), borderWidth: 1, width: '100%' },
  cameraPlaceholder: {
    width: SCREEN_WIDTH * 0.72,
    aspectRatio: 1 / 1.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rs(8),
    alignSelf: 'center',
  },
  captureProgress: { marginTop: rs(16) },
  completeContainer: { alignItems: 'center', paddingVertical: rs(20) },
  successCircle: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnrollmentScreen;
