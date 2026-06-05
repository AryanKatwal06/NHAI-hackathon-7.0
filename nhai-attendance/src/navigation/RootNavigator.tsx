// src/navigation/RootNavigator.tsx
// Updated to use useTheme() for dynamic dark/light mode colors.

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@constants/navigation.constants';
import { } from '@store/settingsStore';
import { startNetworkListener } from '@services/SyncService';
import { openDatabase } from '@db/connection';
import { loadMobileFaceNet } from '@ml/faceRecognition';
import { useTheme } from '@theme/ThemeProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RootStackParamList } from './types';

// Screens
import { SplashScreen } from '@screens/SplashScreen/SplashScreen';
import LoginScreen from '@screens/LoginScreen/LoginScreen';
import EnrollmentScreen from '@screens/EnrollmentScreen/EnrollmentScreen';
import AuthenticationScreen from '@screens/AuthenticationScreen/AuthenticationScreen';
import LivenessScreen from '@screens/LivenessScreen/LivenessScreen';
import ResultsScreen from '@screens/ResultsScreen/ResultsScreen';
import SupervisorDashboard from '@screens/SupervisorDashboard/SupervisorDashboard';
import PendingSyncScreen from '@screens/PendingSyncScreen/PendingSyncScreen';
import SettingsScreen from '@screens/SettingsScreen/SettingsScreen';
import AuditLogsScreen from '@screens/AuditLogsScreen/AuditLogsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { colors, fontSize, fontWeight } = useTheme();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initApp = async () => {
      try {
        await openDatabase();
        await loadMobileFaceNet();
        startNetworkListener();
      } catch (error) {
        console.error('[RootNavigator] App initialization failed:', error);
        if (isMounted) {
          setInitError(error instanceof Error ? error.message : 'Initialization failed');
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    void initApp();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isInitializing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm, marginTop: 12 }}>
          Initializing...
        </Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background.primary }]}>
        <Icon name="alert-circle" size={40} color={colors.error} style={{ marginBottom: 16 }} />
        <Text
          style={{
            color: colors.error,
            fontSize: fontSize.lg,
            fontWeight: fontWeight.bold,
            textAlign: 'center',
          }}
        >
          Initialization Failed
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: fontSize.sm,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          {initError}
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={ROUTES.SPLASH}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.primary },
        animation: 'fade',
      }}
    >
      <Stack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.ENROLLMENT} component={EnrollmentScreen} />
      <Stack.Screen name={ROUTES.AUTHENTICATION} component={AuthenticationScreen} />
      <Stack.Screen name={ROUTES.LIVENESS} component={LivenessScreen} />
      <Stack.Screen name={ROUTES.RESULTS} component={ResultsScreen} />
      <Stack.Screen name={ROUTES.SUPERVISOR_DASHBOARD} component={SupervisorDashboard} />
      <Stack.Screen name={ROUTES.PENDING_SYNC} component={PendingSyncScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.AUDIT_LOGS} component={AuditLogsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});

export default RootNavigator;
