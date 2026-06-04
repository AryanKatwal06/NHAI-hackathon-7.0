// SplashScreen.tsx — Cinematic animated splash screen shown on app startup.
// Features: gradient background, animated logo ring, signal dots, progress bar.
// Auto-navigates to Login after initialization.

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from '@constants/navigation.constants';
import { useTheme } from '@theme/ThemeProvider';
import type { AppNavigationProp } from '@navigation/types';

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false, // width cannot use native driver
      }),
    ]).start();

    // Sequential signal dot pulses
    const dotSequence = dotAnims.map((dot, i) =>
      Animated.sequence([
        Animated.delay(400 + i * 150),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.3, duration: 500, useNativeDriver: true }),
          ]),
        ),
      ]),
    );
    Animated.parallel(dotSequence).start();

    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: ROUTES.LOGIN }] });
    }, 2800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, slideAnim, pulseAnim, spinAnim, progressAnim, dotAnims, navigation]);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinReverse = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['360deg', '0deg'] });
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const signalColors = [
    colors.signal.face,
    colors.signal.liveness,
    colors.signal.device,
    colors.signal.behavioral,
    colors.signal.location,
  ];

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.tertiary, colors.background.primary]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Animated Background Glow */}
      <Animated.View style={[styles.backgroundGlow, { opacity: fadeAnim, transform: [{ scale: pulseAnim }], backgroundColor: colors.brand.primary }]} />

      {/* Animated Logo Container */}
      <Animated.View
        style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] }]}
      >
        {/* Outer Ring */}
        <Animated.View
          style={[
            styles.logoRingOuter,
            {
              borderColor: colors.trust.authenticated,
              borderTopColor: colors.brand.primary,
              borderBottomColor: colors.brand.secondary,
              transform: [{ rotate: spin }],
            },
          ]}
        />
        {/* Inner Ring (Reverse Spin) */}
        <Animated.View
          style={[
            styles.logoRingInner,
            {
              borderColor: colors.brand.teal,
              borderLeftColor: colors.transparent,
              borderRightColor: colors.transparent,
              transform: [{ rotate: spinReverse }],
            },
          ]}
        />
        
        {/* Center Badge */}
        <Animated.View style={[styles.logoBadge, { backgroundColor: colors.background.elevated, borderColor: colors.border.light, shadowColor: colors.brand.primary }]}>
          <LinearGradient
            colors={[colors.background.elevated, colors.background.tertiary]}
            style={styles.badgeGradient}
          >
            <Text
              style={[
                styles.logoText,
                { color: colors.text.primary, fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              NHAI
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Title & Subtitle */}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
        <Text
          style={[
            styles.title,
            { color: colors.text.primary, fontSize: fontSize.xxxl, fontWeight: fontWeight.bold },
          ]}
        >
          NHAI
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.accent, fontSize: fontSize.lg, fontWeight: fontWeight.medium }]}>
          Attendance System
        </Text>
      </Animated.View>

      {/* Signal Dots Row */}
      <Animated.View style={[styles.dotsContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {signalColors.map((color, i) => (
          <Animated.View
            key={i}
            style={[styles.signalDot, { backgroundColor: color, opacity: dotAnims[i], shadowColor: color }]}
          />
        ))}
      </Animated.View>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          { opacity: fadeAnim, color: colors.text.secondary, fontSize: fontSize.sm, fontWeight: fontWeight.medium },
        ]}
      >
        Multi-Signal Trust Authentication
      </Animated.Text>

      {/* Version badge */}
      <Animated.View
        style={[
          styles.versionBadge,
          { opacity: fadeAnim, backgroundColor: colors.overlay.medium, borderColor: colors.border.default },
        ]}
      >
        <Text style={[styles.versionText, { color: colors.text.tertiary, fontSize: fontSize.xs }]}>
          Hackathon 7.0 · Offline AI · v1.0.0
        </Text>
      </Animated.View>

      {/* Progress bar (Floating) */}
      <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
        <View style={[styles.progressTrack, { backgroundColor: colors.overlay.dark }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
            <LinearGradient
              colors={colors.gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.progressGradient}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backgroundGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.15,
  },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 40, width: 140, height: 140 },
  logoRingOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  logoRingInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
  },
  logoBadge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { letterSpacing: 2, textAlign: 'center' },
  title: { letterSpacing: 6, textAlign: 'center', textTransform: 'uppercase' },
  subtitle: { textAlign: 'center', marginTop: 8, letterSpacing: 1 },
  dotsContainer: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 36,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    backgroundColor: 'rgba(13, 15, 26, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  signalDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  tagline: { position: 'absolute', bottom: 120, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  versionBadge: {
    position: 'absolute',
    bottom: 80,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  versionText: { letterSpacing: 0.5 },
  progressContainer: {
    position: 'absolute',
    bottom: 40,
    width: '75%',
    height: 6,
    alignItems: 'center',
  },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressGradient: { flex: 1 },
});

export default SplashScreen;
