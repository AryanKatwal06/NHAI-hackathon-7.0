import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from '@constants/navigation.constants';
import type { AppNavigationProp } from '@navigation/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Badge dimensions scale relative to screen width
// On a 360px wide phone: badge = 96px
// On a 414px wide phone: badge = 110px
// This ensures the badge never feels too small or too dominant
const BADGE_SIZE = Math.round(SCREEN_WIDTH * 0.267);
const BADGE_RING_SIZE = BADGE_SIZE + 20;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();

  // Animation shared values
  const badgeOpacity    = useSharedValue(0);
  const badgeScale      = useSharedValue(0.88);
  const textOpacity     = useSharedValue(0);
  const textTranslateY  = useSharedValue(8);
  const taglineOpacity  = useSharedValue(0);
  const exitOpacity     = useSharedValue(1);

  const navigateToLogin = (): void => {
    (navigation as any).replace(ROUTES.LOGIN);
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#070B14');
    }

    // Badge entrance
    badgeOpacity.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });
    badgeScale.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.cubic),
    });

    // Text entrance — slightly delayed
    textOpacity.value = withDelay(300, withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }));
    textTranslateY.value = withDelay(300, withTiming(0, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }));

    // Tagline fades in last
    taglineOpacity.value = withDelay(900, withTiming(1, {
      duration: 400,
      easing: Easing.out(Easing.quad),
    }));

    // Exit sequence — wait then fade out and navigate
    const exitTimer = setTimeout(() => {
      exitOpacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.quad),
      }, (finished) => {
        if (finished) {
          runOnJS(navigateToLogin)();
        }
      });
    }, 2200);

    return () => clearTimeout(exitTimer);
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const screenStyle = useAnimatedStyle(() => ({
    opacity: exitOpacity.value,
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <LinearGradient
        colors={['#0E1420', '#070B14']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        {/* Badge */}
        <Animated.View style={[styles.badgeWrapper, badgeStyle]}>
          {/* Main badge circle for the logo */}
          <View style={[styles.badge, {
            width: BADGE_SIZE * 1.5,
            height: BADGE_SIZE * 1.5,
            borderRadius: (BADGE_SIZE * 1.5) / 2,
            backgroundColor: '#FFFFFF',
          }]}>
            <Image
              source={require('../../../National_Highways_Authority_of_India_(NHAI).png')}
              style={{ width: BADGE_SIZE * 1.2, height: BADGE_SIZE * 1.2, resizeMode: 'contain' }}
            />
          </View>
        </Animated.View>

        {/* App name and subtitle */}
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={styles.nhaiText}>NHAI</Text>
          <Text style={styles.appName}>Field Attendance System</Text>
          <Text style={styles.orgName}>National Highways Authority of India</Text>
        </Animated.View>
      </View>

      {/* Bottom tagline */}
      <Animated.View style={[styles.bottomBlock, taglineStyle]}>
        <View style={styles.bottomDivider} />
        <Text style={styles.tagline}>
          Powered by Offline AI  ·  Secure  ·  Encrypted
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.06,
  },
  badgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SCREEN_HEIGHT * 0.04,
  },
  badgeRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'transparent',
  },
  badge: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(65, 88, 208, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    // Subtle inner glow via shadow
    shadowColor: '#4158D0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  nhaiText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.08),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  textBlock: {
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: Math.round(SCREEN_WIDTH * 0.046),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  orgName: {
    fontSize: Math.round(SCREEN_WIDTH * 0.028),
    fontWeight: '400',
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 0.3,
    textAlign: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.08,
  },
  bottomBlock: {
    alignItems: 'center',
    paddingBottom: SCREEN_HEIGHT * 0.055,
    gap: 12,
  },
  bottomDivider: {
    width: SCREEN_WIDTH * 0.3,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tagline: {
    fontSize: Math.round(SCREEN_WIDTH * 0.025),
    color: 'rgba(255,255,255,0.22)',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});