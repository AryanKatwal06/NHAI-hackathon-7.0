/* eslint-disable */
// SupervisorDashboard.tsx — Redesigned with glassmorphism stat cards,
// sync status banner, expandable flagged records, and theme toggle.

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ROUTES } from '@constants/navigation.constants';
import { useSettingsStore } from '@store/settingsStore';
import { useSyncStore } from '@store/syncStore';
import { getPending } from '@db/repositories/syncQueue.repository';
import { getAuthRecordsForWorksite } from '@db/repositories/authRecords.repository';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { StatusBadge } from '@components/common/StatusBadge';
import { ThemeToggle } from '@components/common/ThemeToggle/ThemeToggle';
import { useTheme } from '@theme/ThemeProvider';
import { formatRelativeTime } from '@utils/formatting.utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp } from '@navigation/types';
import type { AuthenticationAttempt } from '@/types/auth.types';
import { rs } from '@utils/responsive.utils';

const SupervisorDashboard: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const { worksite } = useSettingsStore();
  const { isOnline, pendingSyncCount } = useSyncStore();
  const [recentRecords, setRecentRecords] = useState<AuthenticationAttempt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [counts, setCounts] = useState({ authenticated: 0, flagged: 0, rejected: 0 });

  const loadData = useCallback(async () => {
    if (!worksite) {
      return;
    }
    try {
      const records = await getAuthRecordsForWorksite(worksite.id, 50);
      setRecentRecords(records);
      let auth = 0,
        flag = 0,
        rej = 0;
      records.forEach((r) => {
        if (r.trustResult.decision === 'AUTHENTICATED') {
          auth++;
        } else if (r.trustResult.decision === 'FLAGGED') {
          flag++;
        } else if (r.trustResult.decision === 'REJECTED') {
          rej++;
        }
      });
      setCounts({ authenticated: auth, flagged: flag, rejected: rej });
      const pending = await getPending(1000);
      useSyncStore.getState().setPendingCount(pending.length);
    } catch (err) {
      console.error('[SupervisorDashboard] Error loading data', err);
    }
  }, [worksite]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  const renderItem = ({ item }: { item: AuthenticationAttempt }) => (
    <GlassCard style={{ marginBottom: spacing.sm, minHeight: rs(72) }}>
      <View style={styles.recordHeader}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
            }}
          >
            {item.workerId}
          </Text>
          <Text style={{ color: colors.text.tertiary, fontSize: fontSize.xs }}>
            {item.attemptedAt ? formatRelativeTime(item.attemptedAt) : 'Unknown time'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: rs(4) }}>
          <StatusBadge decision={item.trustResult.decision} size="small" />
          <View
            style={[
              styles.scoreBadge,
              {
                backgroundColor: `${colors.trust[item.trustResult.decision === 'AUTHENTICATED' ? 'authenticated' : item.trustResult.decision === 'FLAGGED' ? 'flagged' : 'rejected']}20`,
              },
            ]}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.bold,
              }}
            >
              {item.trustResult.weightedScore}
            </Text>
          </View>
        </View>
        {item.trustResult.isContradiction && (
          <Icon name="lightning-bolt" size={14} color={colors.warning} />
        )}
      </View>
    </GlassCard>
  );

  // Sync status banner
  const getSyncBanner = () => {
    if (!isOnline) {
      return {
        text: `Offline — ${pendingSyncCount} records queued`,
        color: colors.warning,
        bg: `${colors.warning}15`,
      };
    }
    if (pendingSyncCount === 0) {
      return { text: 'All synced', color: colors.success, bg: `${colors.success}15` };
    }
    return {
      text: `Offline mode — ${pendingSyncCount} pending`,
      color: colors.signal.liveness,
      bg: `${colors.signal.liveness}15`,
    };
  };
  const syncBanner = getSyncBanner();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      testID="supervisor-dashboard"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.xxl,
              fontWeight: fontWeight.bold,
            }}
          >
            Dashboard
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.md }}>
            {worksite?.name ?? 'No Worksite Configured'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <ThemeToggle />
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
            style={[styles.iconBtn, { backgroundColor: colors.background.elevated }]}
          >
            <Icon name="cog-outline" size={18} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary stat cards */}
      <View style={styles.statsRow}>
        {[
          {
            label: 'Present',
            count: counts.authenticated,
            color: colors.trust.authenticated,
            glow: colors.trust.authenticatedGlow,
          },
          {
            label: 'Flagged',
            count: counts.flagged,
            color: colors.trust.flagged,
            glow: colors.trust.flaggedGlow,
          },
          {
            label: 'Rejected',
            count: counts.rejected,
            color: colors.trust.rejected,
            glow: colors.trust.rejectedGlow,
          },
        ].map((stat) => (
          <GlassCard
            key={stat.label}
            style={{ flex: 1, alignItems: 'center' }}
            glowColor={stat.count > 0 ? stat.glow : undefined}
          >
            <Text
              style={{ color: stat.color, fontSize: fontSize.xxl, fontWeight: fontWeight.bold }}
            >
              {stat.count}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, marginTop: 2 }}>
              {stat.label}
            </Text>
          </GlassCard>
        ))}
      </View>

      {/* Action buttons */}
      <View style={{ gap: spacing.sm }}>
        <GradientButton
          label="Start Authentication"
          onPress={() => navigation.navigate(ROUTES.AUTHENTICATION, {})}
          fullWidth
          testID="start-auth-btn"
        />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            label="Enroll Worker +"
            onPress={() => navigation.navigate(ROUTES.ENROLLMENT)}
            variant="secondary"
            style={{ flex: 1 }}
            testID="enroll-btn"
          />
          <Button
            label="Audit Logs"
            onPress={() => navigation.navigate(ROUTES.AUDIT_LOGS)}
            variant="ghost"
            style={{ flex: 1 }}
            testID="audit-logs-btn"
          />
        </View>
      </View>

      {/* Sync status banner */}
      <TouchableOpacity
        style={[
          styles.syncBanner,
          { backgroundColor: syncBanner.bg, borderRadius: borderRadius.lg },
        ]}
        onPress={() => navigation.navigate(ROUTES.PENDING_SYNC)}
        testID="manage-sync-btn"
      >
        <Text
          style={{ color: syncBanner.color, fontSize: fontSize.sm, fontWeight: fontWeight.medium }}
        >
          {syncBanner.text}
        </Text>
      </TouchableOpacity>

      {/* Records list */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold,
          marginTop: spacing.md,
        }}
      >
        Recent Activity
      </Text>
      <FlatList
        data={recentRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.text.primary}
          />
        }
        ListEmptyComponent={
          <GlassCard style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Icon name="clipboard-text-outline" size={40} color={colors.text.tertiary} style={{ marginBottom: spacing.sm }} />
            <Text style={{ color: colors.text.tertiary, textAlign: 'center' }}>
              No records yet. Start an authentication to see results here.
            </Text>
          </GlassCard>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: rs(16) },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: rs(16) },
  iconBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: { flexDirection: 'row', gap: rs(8), marginBottom: rs(16) },
  syncBanner: { padding: rs(12), alignItems: 'center', marginTop: rs(12) },
  recordHeader: { flexDirection: 'row', alignItems: 'center', gap: rs(12) },
  scoreBadge: { paddingHorizontal: rs(8), paddingVertical: rs(2), borderRadius: rs(100) },
});

export default SupervisorDashboard;
