/* eslint-disable */
// AuditLogsScreen.tsx — Redesigned with filter tabs, timeline view,
// color-coded event types, and integrity verification.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuditLog, verifyAllIntegrity } from '@db/repositories/auditLogs.repository';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { useTheme } from '@theme/ThemeProvider';
import { useAppAlert } from '@components/common/AppAlertProvider';
import { formatRelativeTime } from '@utils/formatting.utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { AuditLogEntry } from '@/types/audit.types';

const FILTER_TABS = ['All', 'Auth', 'Sync', 'Security', 'Enrollment'];

const EVENT_TYPE_CONFIG: Record<string, { icon: string; category: string }> = {
  AUTH_STARTED: { icon: 'lock-open-outline', category: 'Auth' },
  AUTH_COMPLETED: { icon: 'check-circle-outline', category: 'Auth' },
  AUTH_FAILED: { icon: 'close-circle-outline', category: 'Auth' },
  SYNC_STARTED: { icon: 'cloud-upload-outline', category: 'Sync' },
  SYNC_COMPLETED: { icon: 'cloud-check-outline', category: 'Sync' },
  SYNC_FAILED: { icon: 'cloud-alert-outline', category: 'Sync' },
  PURGE_COMPLETED: { icon: 'trash-can-outline', category: 'Sync' },
  ENROLLMENT: { icon: 'account-plus-outline', category: 'Enrollment' },
  SECURITY_EVENT: { icon: 'shield-alert-outline', category: 'Security' },
  PIN_CHANGE: { icon: 'key-outline', category: 'Security' },
  DEVICE_REGISTERED: { icon: 'cellphone-check', category: 'Security' },
};

const AuditLogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const { showAlert } = useAppAlert();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadLogs = useCallback(async () => {
    try {
      const data = await getAuditLog({ limit: 100 });
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { tampered } = await verifyAllIntegrity();
      const isIntact = tampered === 0;
      showAlert(
        isIntact ? 'Integrity Verified' : 'Integrity Check Failed',
        isIntact
          ? 'All cryptographic hashes match. The audit log has not been tampered with.'
          : 'WARNING: Some records failed hash verification. The log may have been tampered with.',
      );
    } catch (err) {
      showAlert('Error', 'Failed to verify integrity.');
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs =
    activeFilter === 'All'
      ? logs
      : logs.filter((log) => {
          const config = EVENT_TYPE_CONFIG[log.eventType];
          return config?.category === activeFilter;
        });

  const getCategoryColor = (eventType: string): string => {
    const config = EVENT_TYPE_CONFIG[eventType];
    switch (config?.category) {
      case 'Auth':
        return colors.info;
      case 'Sync':
        return colors.signal.liveness;
      case 'Security':
        return colors.warning;
      case 'Enrollment':
        return colors.signal.location;
      default:
        return colors.text.secondary;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      testID="audit-logs-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Button label="← Back" onPress={() => navigation.goBack()} variant="ghost" size="small" />
        <Text
          style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}
        >
          Audit Logs
        </Text>
        <Button
          label={verifying ? '...' : 'Verify All'}
          onPress={handleVerify}
          variant="secondary"
          size="small"
          isDisabled={verifying}
        />
      </View>

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                backgroundColor:
                  activeFilter === tab ? colors.brand.primary : colors.background.elevated,
                borderRadius: borderRadius.full,
              },
            ]}
            onPress={() => setActiveFilter(tab)}
          >
            <Text
              style={{
                color: activeFilter === tab ? '#FFF' : colors.text.secondary,
                fontSize: fontSize.sm,
                fontWeight: fontWeight.medium,
              }}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Timeline list */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const config = EVENT_TYPE_CONFIG[item.eventType] ?? { icon: 'text-box-outline', category: 'Other' };
          const categoryColor = getCategoryColor(item.eventType);

          return (
            <View style={styles.timelineItem}>
              {/* Timeline line */}
              <View style={styles.timelineLine}>
                <View
                  style={[
                    styles.timelineNode,
                    { backgroundColor: categoryColor, borderColor: colors.background.primary },
                  ]}
                />
                {index < filteredLogs.length - 1 && (
                  <View
                    style={[styles.timelineConnector, { backgroundColor: colors.border.default }]}
                  />
                )}
              </View>

              {/* Event card */}
              <GlassCard style={{ flex: 1, marginLeft: spacing.md, marginBottom: spacing.sm }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}
                  >
                    <Icon name={config.icon} size={16} color={colors.text.primary} />
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontSize: fontSize.sm,
                        fontWeight: fontWeight.bold,
                      }}
                    >
                      {item.eventType}
                    </Text>
                  </View>
                  <Icon
                    name={item.integrityHash ? 'lock' : 'lock-open'}
                    size={14}
                    color={item.integrityHash ? colors.success : colors.error}
                  />
                </View>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: fontSize.sm,
                    marginTop: spacing.xxs,
                  }}
                >
                  {typeof item.details === 'object'
                    ? JSON.stringify(item.details)
                    : String(item.details)}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: spacing.xs,
                  }}
                >
                  <Text style={{ color: colors.text.tertiary, fontSize: fontSize.xs }}>
                    {item.timestamp ? formatRelativeTime(item.timestamp) : ''}
                  </Text>
                  <Text
                    style={{ color: colors.trust.neutral, fontSize: 9, fontFamily: 'monospace' }}
                  >
                    {item.integrityHash?.substring(0, 12)}...
                  </Text>
                </View>
              </GlassCard>
            </View>
          );
        }}
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
            <Icon name="text-box-outline" size={40} color={colors.text.tertiary} style={{ marginBottom: spacing.sm }} />
            <Text style={{ color: colors.text.tertiary, textAlign: 'center' }}>
              No audit logs found.
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
    marginBottom: 12,
  },
  tabsContainer: { maxHeight: 40, marginBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, marginRight: 8 },
  timelineItem: { flexDirection: 'row' },
  timelineLine: { width: 24, alignItems: 'center' },
  timelineNode: { width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  timelineConnector: { width: 2, flex: 1 },
});

export default AuditLogsScreen;
