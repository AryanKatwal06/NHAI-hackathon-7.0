/* eslint-disable */
// LoginScreen.tsx — Redesigned supervisor PIN entry with glassmorphism,
// custom visual PIN display, and dark/light mode toggle.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from '@constants/navigation.constants';
import { useSettingsStore } from '@store/settingsStore';
import { hashSupervisorPin, verifySupervisorPin } from '@utils/crypto.utils';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { ThemeToggle } from '@components/common/ThemeToggle/ThemeToggle';
import { useAppAlert } from '@components/common/AppAlertProvider';
import { useTheme } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp } from '@navigation/types';
import { rs, rf, rp, IS_SMALL_DEVICE } from '@utils/responsive.utils';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;
const MAX_PIN_LENGTH = 4;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight, } = useTheme();
  const { showAlert } = useAppAlert();
  const { supervisorPin, setSupervisorPin } = useSettingsStore();
  const isFirstTime = !supervisorPin;

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const activePin = isFirstTime && isConfirming ? confirmPin : pin;
  const setActivePin = isFirstTime && isConfirming ? setConfirmPin : setPin;

  useEffect(() => {
    if (lockoutEnd && Date.now() < lockoutEnd) {
      setIsLocked(true);
      const timer = setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        setLockoutEnd(null);
      }, lockoutEnd - Date.now());
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [lockoutEnd]);

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (activePin.length < MAX_PIN_LENGTH) {
        setActivePin((prev) => prev + digit);
      }
    },
    [activePin, setActivePin],
  );

  const handleBackspace = useCallback(() => {
    setActivePin((prev) => prev.slice(0, -1));
  }, [setActivePin]);

  const handleSubmit = useCallback(() => {
    if (isLocked) {
      showAlert('Account Locked', 'Too many failed attempts. Please wait 5 minutes.');
      return;
    }

    if (isFirstTime) {
      if (!isConfirming) {
        if (pin.length < 4) {
          showAlert('Invalid PIN', 'PIN must be at least 4 digits.');
          return;
        }
        setIsConfirming(true);
        return;
      }
      if (pin !== confirmPin) {
        showAlert('PIN Mismatch', 'PINs do not match. Please try again.');
        setConfirmPin('');
        return;
      }
      const pinHash = hashSupervisorPin(pin);
      setSupervisorPin(pinHash);
      navigation.reset({ index: 0, routes: [{ name: ROUTES.SUPERVISOR_DASHBOARD }] });
    } else {
      if (verifySupervisorPin(pin, supervisorPin)) {
        setFailedAttempts(0);
        navigation.reset({ index: 0, routes: [{ name: ROUTES.SUPERVISOR_DASHBOARD }] });
      } else {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        setPin('');
        if (attempts >= MAX_ATTEMPTS) {
          setLockoutEnd(Date.now() + LOCKOUT_DURATION_MS);
          showAlert('Account Locked', `${MAX_ATTEMPTS} failed attempts. Locked for 5 minutes.`);
        } else {
          showAlert('Invalid PIN', `${MAX_ATTEMPTS - attempts} attempts remaining.`);
        }
      }
    }
  }, [
    pin,
    confirmPin,
    supervisorPin,
    isFirstTime,
    isConfirming,
    failedAttempts,
    isLocked,
    setSupervisorPin,
    navigation,
  ]);

  const keypadDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />

      {/* Theme toggle */}
      <View style={styles.themeToggleContainer}>
        <ThemeToggle />
      </View>

      {/* Shield icon area */}
      <GlassCard style={styles.shieldCard}>
        <View style={[styles.shieldIcon, { borderColor: colors.brand.primary }]}>
          <Icon name="shield-check-outline" size={32} color={colors.brand.primary} />
        </View>
      </GlassCard>

      {/* Title */}
      <Text
        style={[
          styles.title,
          { color: colors.text.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
        ]}
      >
        {isFirstTime ? (isConfirming ? 'Confirm PIN' : 'Set Supervisor PIN') : 'Supervisor Login'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.text.secondary, fontSize: fontSize.base }]}>
        {isFirstTime
          ? isConfirming
            ? 'Re-enter your PIN to confirm.'
            : 'Create a PIN to secure the application.'
          : 'Enter your supervisor PIN to continue.'}
      </Text>

      {/* PIN display circles */}
      <View style={styles.pinDisplay}>
        {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
          <View key={i} style={[styles.pinCircle, { borderColor: colors.border.light }]}>
            {i < activePin.length && (
              <LinearGradient colors={colors.gradients.primary} style={styles.pinCircleFilled} />
            )}
          </View>
        ))}
      </View>

      {/* Error text */}
      {failedAttempts > 0 && !isLocked && (
        <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.sm }]}>
          {MAX_ATTEMPTS - failedAttempts} attempts remaining
        </Text>
      )}
      {isLocked && (
        <Text style={[styles.errorText, { color: colors.error, fontSize: fontSize.sm }]}>
          Locked. Try again in 5 minutes.
        </Text>
      )}

      {/* Custom numeric keypad */}
      <View style={styles.keypad}>
        {keypadDigits.map((digit, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.keypadButton,
              { backgroundColor: digit ? colors.background.elevated : 'transparent' },
            ]}
            onPress={() => {
              if (digit === '⌫') {
                handleBackspace();
              } else if (digit) {
                handleKeyPress(digit);
              }
            }}
            activeOpacity={0.7}
            disabled={!digit}
          >
            <Text
              style={[
                styles.keypadText,
                {
                  color: digit === '⌫' ? colors.text.accent : colors.text.primary,
                  fontSize: IS_SMALL_DEVICE ? rf(18) : rf(22),
                  fontWeight: fontWeight.medium,
                },
              ]}
            >
              {digit === '⌫' ? <Icon name="backspace-outline" size={24} color={colors.text.accent} /> : digit}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Submit button */}
      <View style={styles.submitContainer}>
        <GradientButton
          label={isFirstTime ? (isConfirming ? 'Confirm PIN' : 'Next') : 'Login'}
          onPress={handleSubmit}
          isDisabled={activePin.length < 4 || isLocked}
          fullWidth
          testID="login-submit"
        />
      </View>

      {/* Worker auth link */}
      <TouchableOpacity
        style={[styles.workerLink, { borderColor: colors.brand.primary }]}
        onPress={() => navigation.navigate(ROUTES.AUTHENTICATION, {})}
        testID="worker-auth-link"
      >
        <Text
          style={[styles.workerLinkText, { color: colors.brand.primary, fontSize: fontSize.sm }]}
        >
          Worker Authentication →
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: rs(24) },
  themeToggleContainer: { position: 'absolute', top: rs(50), right: rs(20), zIndex: 10 },
  shieldCard: { marginBottom: rs(24), padding: rs(20), alignItems: 'center' },
  shieldIcon: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { marginBottom: rs(4), textAlign: 'center' },
  subtitle: { marginBottom: rs(24), textAlign: 'center' },
  pinDisplay: { flexDirection: 'row', gap: rs(8), marginBottom: rs(16) },
  pinCircle: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(26),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinCircleFilled: { width: rs(16), height: rs(16), borderRadius: rs(8) },
  errorText: { marginBottom: rs(8), textAlign: 'center' },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'center',
    gap: rs(12),
    marginBottom: rs(20),
  },
  keypadButton: {
    width: IS_SMALL_DEVICE ? rp(26) : rp(22),
    height: IS_SMALL_DEVICE ? rp(12) : rp(22),
    borderRadius: rs(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadText: {},
  submitContainer: { width: '100%', marginBottom: rs(16) },
  workerLink: { paddingVertical: rs(8), paddingHorizontal: rs(20), borderRadius: rs(100), borderWidth: 1 },
  workerLinkText: {},
});

export default LoginScreen;
