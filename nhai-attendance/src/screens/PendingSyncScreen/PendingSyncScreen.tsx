/* eslint-disable */
// PendingSyncScreen.tsx — Redesigned with sync status indicator,
// progress animation, records list, and demo mode banner.

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getPending } from '@db/repositories/syncQueue.repository';
import { triggerSync, refreshPendingCount } from '@services/SyncService';
import { useSyncStore } from '@store/syncStore';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { useTheme } from '@theme/ThemeProvider';
import { useAppAlert } from '@components/common/AppAlertProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AppNavigationProp } from '@navigation/types';

interface QueueItem {
  id: string;
  status: string;
  payload: any;
  created_at: string;
  attempts: number;
}

const PendingSyncScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight, spacing, } = useTheme();
  const { showAlert } = useAppAlert();
  const { isOnline, isSyncing, pendingSyncCount } = useSyncStore();
  const [records, setRecords] = useState<QueueItem[]>([]);
  const [syncResult, setSyncResult] = useState<{ synced: number; purged: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      void loadRecords();
    }, []),
  );

  const loadRecords = async () => {
    try {
      const pending = await getPending(100);
      setRecords(pending as unknown as QueueItem[]);
      await refreshPendingCount();
    } catch (err) {
      console.error('[PendingSyncScreen] Error loading records', err);
    }
  };

  const handleSync = useCallback(async () => {
    try {
      const syncedCount = await triggerSync();
      setSyncResult({ synced: syncedCount, purged: syncedCount });
      await loadRecords();
    } catch (err) {
      showAlert('Sync Failed', 'An error occurred during sync.');
    }
  }, []);

  // Status config
  const getStatusConfig = () => {
    if (!isOnline) {
      return { dot: colors.warning, text: 'Offline — records queued', bg: `${colors.warning}15` };
    }
    return {
      dot: colors.signal.liveness,
      text: 'Ready to sync (Demo Mode)',
      bg: `${colors.signal.liveness}15`,
    };
  };
  const status = getStatusConfig();

  const statusColors: Record<string, string> = {
    PENDING: colors.warning,
    IN_PROGRESS: colors.info,
    SYNCED: colors.success,
    FAILED: colors.error,
    ABANDONED: colors.text.tertiary,
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      testID="pending-sync-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Button label="← Back" onPress={() => navigation.goBack()} variant="ghost" size="small" />
        <Text
          style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}
        >
          Sync Queue
        </Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Status indicator */}
      <GlassCard style={{ backgroundColor: status.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={[styles.pulseDot, { backgroundColor: status.dot }]} />
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.base,
              fontWeight: fontWeight.medium,
              flex: 1,
            }}
          >
            {status.text}
          </Text>
          <Text style={{ color: colors.text.secondary, fontSize: fontSize.sm }}>
            {pendingSyncCount} pending
          </Text>
        </View>
      </GlassCard>

      {/* Demo mode banner */}
      <GlassCard
        style={{ borderColor: colors.signal.liveness, borderWidth: 1, marginTop: spacing.sm }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm }}>
          <Icon name="bell-outline" size={16} color={colors.signal.liveness} />
          <Text style={{ color: colors.signal.liveness, fontSize: fontSize.sm, textAlign: 'center', flexShrink: 1 }}>
            Demo Mode: Using simulated sync. Configure AWS_API_GATEWAY_URL for live sync.
          </Text>
        </View>
      </GlassCard>

      {/* Sync success result */}
      {syncResult && (
        <GlassCard style={{ marginTop: spacing.sm }} glowColor={colors.trust.authenticatedGlow}>
          <View style={{ alignItems: 'center' }}>
            <Icon name="check-circle-outline" size={40} color={colors.trust.authenticated} style={{ marginBottom: spacing.sm }} />
            <Text
              style={{
                color: colors.trust.authenticated,
                fontSize: fontSize.lg,
                fontWeight: fontWeight.bold,
              }}
            >
              Sync Complete
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: fontSize.base,
                marginTop: spacing.xs,
              }}
            >
              {syncResult.synced} records synced · {syncResult.purged} queue entries purged
            </Text>
          </View>
        </GlassCard>
      )}

      {/* Sync button */}
      <View style={{ marginTop: spacing.md }}>
        <GradientButton
          label={isSyncing ? 'Syncing...' : 'Sync Now'}
          onPress={handleSync}
          isLoading={isSyncing}
          isDisabled={!isOnline || pendingSyncCount === 0}
          fullWidth
          size="large"
          testID="sync-now-btn"
        />
      </View>

      {/* Records list */}
      <Text
        style={{
          color: colors.text.primary,
          fontSize: fontSize.lg,
          fontWeight: fontWeight.bold,
          marginTop: spacing.lg,
          marginBottom: spacing.sm,
        }}
      >
        Queue Items
      </Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GlassCard style={{ marginBottom: spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: fontSize.sm,
                    fontWeight: fontWeight.medium,
                  }}
                >
                  Auth Record
                </Text>
                <Text style={{ color: colors.text.tertiary, fontSize: fontSize.xs }}>
                  Attempts: {item.attempts}
                </Text>
              </View>
              <View
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: `${statusColors[item.status] ?? colors.text.tertiary}20`,
                    borderColor: statusColors[item.status] ?? colors.text.tertiary,
                  },
                ]}
              >
                <Text
                  style={{
                    color: statusColors[item.status] ?? colors.text.tertiary,
                    fontSize: fontSize.xs,
                    fontWeight: fontWeight.semiBold,
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}
        ListEmptyComponent={
          <GlassCard style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Icon name="mailbox-open-outline" size={40} color={colors.text.tertiary} style={{ marginBottom: spacing.sm }} />
            <Text style={{ color: colors.text.tertiary, textAlign: 'center' }}>
              Sync queue is empty. All records have been synced and purged.
            </Text>
          </GlassCard>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseDot: { width: 10, height: 10, borderRadius: 5 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, borderWidth: 1 },
});

export default PendingSyncScreen;
