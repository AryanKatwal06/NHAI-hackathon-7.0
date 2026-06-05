/* eslint-disable */
// SettingsScreen.tsx — Redesigned with grouped sections, theme toggle,
// worksite config, and diagnostics info.

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, StatusBar, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSettingsStore } from '@store/settingsStore';
import { GlassCard } from '@components/common/GlassCard/GlassCard';
import { GradientButton } from '@components/common/GradientButton/GradientButton';
import { Button } from '@components/common/Button';
import { ThemeToggle } from '@components/common/ThemeToggle/ThemeToggle';
import { useTheme } from '@theme/ThemeProvider';
import { useAppAlert } from '@components/common/AppAlertProvider';
import { formatCoordinates } from '@utils/geometry.utils';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  runFullBenchmark,
  formatBenchmarkAsMarkdown,
  type BenchmarkReport,
} from '@services/BenchmarkService';

import type { AppNavigationProp } from '@navigation/types';
import { rs } from '@utils/responsive.utils';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { colors, fontSize, fontWeight, spacing, borderRadius } = useTheme();
  const { showAlert } = useAppAlert();
  const { worksite, setWorksite } = useSettingsStore();

  const [name, setName] = useState(worksite?.name ?? '');
  const [lat, setLat] = useState(worksite?.latitude?.toString() ?? '');
  const [lng, setLng] = useState(worksite?.longitude?.toString() ?? '');
  const [radius, setRadius] = useState(worksite?.radiusMeters?.toString() ?? '100');

  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkReport, setBenchmarkReport] = useState<BenchmarkReport | null>(null);

  const handleSaveWorksite = () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radiusNum = parseInt(radius, 10);

    if (!name || isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      showAlert('Invalid Input', 'Please enter valid numbers for coordinates and radius.');
      return;
    }

    setWorksite({
      id: worksite?.id ?? `ws_${Date.now()}`,
      name,
      latitude: latNum,
      longitude: lngNum,
      radiusMeters: radiusNum,
      shiftStartHour: 8,
    });
    showAlert('Success', 'Worksite configuration saved.');
  };

  const handleRunBenchmark = () => {
    void (async () => {
      setIsBenchmarking(true);
      setBenchmarkReport(null);
      try {
        // Small delay to allow UI to update
        await new Promise((resolve) => setTimeout(resolve, 100));
        const report = await runFullBenchmark();
        setBenchmarkReport(report);
      } catch (err) {
        console.error('Benchmark failed:', err);
        showAlert('Error', 'Performance benchmark failed to complete.');
      } finally {
        setIsBenchmarking(false);
      }
    })();
  };

  const handleCopyBenchmark = () => {
    if (!benchmarkReport) {
      return;
    }
    const markdown = formatBenchmarkAsMarkdown(benchmarkReport);
    Share.share({ message: markdown });
  };

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text
      style={{
        color: colors.text.accent,
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
        paddingTop: rs(24),
        paddingHorizontal: rs(16),
      }}
    >
      {title}
    </Text>
  );

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs }}
    >
      <Text style={{ color: colors.text.secondary, fontSize: fontSize.base }}>{label}</Text>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: fontSize.base,
          fontWeight: fontWeight.medium,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
      contentContainerStyle={styles.content}
      testID="settings-screen"
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Button label="← Back" onPress={() => navigation.goBack()} variant="ghost" size="small" />
        <Text
          style={{ color: colors.text.primary, fontSize: fontSize.xl, fontWeight: fontWeight.bold }}
        >
          Settings
        </Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <GlassCard>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: rs(52) }}
        >
          <View>
            <Text
              style={{
                color: colors.text.primary,
                fontSize: fontSize.base,
                fontWeight: fontWeight.medium,
              }}
            >
              Theme Mode
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: fontSize.sm }}>
              Toggle dark / light mode
            </Text>
          </View>
          <ThemeToggle />
        </View>
      </GlassCard>

      {/* Worksite */}
      <SectionHeader title="Worksite" />
      <GlassCard>
        {worksite && (
          <View
            style={{
              marginBottom: spacing.md,
              padding: spacing.sm,
              backgroundColor: colors.background.tertiary,
              borderRadius: borderRadius.lg,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: fontSize.md,
                fontWeight: fontWeight.bold,
              }}
            >
              <Icon name="map-marker" size={fontSize.md} color={colors.text.primary} /> {worksite.name}
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: fontSize.sm, marginTop: 2 }}>
              {formatCoordinates(worksite.latitude, worksite.longitude)} · {worksite.radiusMeters}m
              radius
            </Text>
          </View>
        )}
        <View style={{ gap: spacing.md }}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.default,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
              },
            ]}
            placeholder="Worksite Name"
            placeholderTextColor={colors.text.tertiary}
            value={name}
            onChangeText={setName}
          />
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.default,
                  borderRadius: borderRadius.lg,
                  color: colors.text.primary,
                },
              ]}
              placeholder="Latitude"
              placeholderTextColor={colors.text.tertiary}
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
            />
            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  backgroundColor: colors.background.tertiary,
                  borderColor: colors.border.default,
                  borderRadius: borderRadius.lg,
                  color: colors.text.primary,
                },
              ]}
              placeholder="Longitude"
              placeholderTextColor={colors.text.tertiary}
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background.tertiary,
                borderColor: colors.border.default,
                borderRadius: borderRadius.lg,
                color: colors.text.primary,
              },
            ]}
            placeholder="Radius (meters)"
            placeholderTextColor={colors.text.tertiary}
            value={radius}
            onChangeText={setRadius}
            keyboardType="numeric"
          />
          <GradientButton label="Save Worksite" onPress={handleSaveWorksite} fullWidth />
        </View>
      </GlassCard>

      {/* Diagnostics */}
      <SectionHeader title="Diagnostics" />
      <GlassCard>
        <InfoRow label="App Version" value="1.0.0" />
        <InfoRow label="Local Storage" value="SQLCipher (Encrypted)" />
        <InfoRow label="ML Model" value="MobileFaceNet (Local)" />
        <InfoRow label="Liveness" value="MediaPipe Face Mesh" />
        <InfoRow label="Trust Signals" value="5 signals, 7 factors" />
        <InfoRow label="Database Tables" value="8 tables" />

        <View
          style={{
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border.default,
          }}
        >
          <Text
            style={{
              color: colors.text.primary,
              fontSize: fontSize.md,
              fontWeight: fontWeight.bold,
              marginBottom: spacing.sm,
            }}
          >
            Performance Benchmark
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: fontSize.sm,
              marginBottom: spacing.md,
            }}
          >
            Run the performance suite to verify target latencies. This takes about 5
            seconds.
          </Text>

          <GradientButton
            label={isBenchmarking ? 'Running 10 iterations...' : 'Run Performance Benchmark'}
            onPress={handleRunBenchmark}
            isDisabled={isBenchmarking}
            fullWidth
          />

          {benchmarkReport && (
            <View
              style={{
                marginTop: spacing.md,
                backgroundColor: colors.background.elevated,
                padding: spacing.sm,
                borderRadius: borderRadius.md,
              }}
            >
              <Text
                style={{
                  color:
                    benchmarkReport.overallStatus === 'PASS'
                      ? colors.success
                      : benchmarkReport.overallStatus === 'WARN'
                        ? colors.warning
                        : colors.error,
                  fontWeight: fontWeight.bold,
                  marginBottom: spacing.xs,
                }}
              >
                {benchmarkReport.overallStatus === 'PASS'
                  ? 'All criteria met'
                  : `Status: ${benchmarkReport.overallStatus}`}
              </Text>

              {benchmarkReport.results.map((r, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border.default,
                  }}
                >
                  <Text style={{ color: colors.text.secondary, fontSize: fontSize.xs, flex: 1 }}>
                    {r.operationName}
                  </Text>
                  <Text style={{ color: colors.text.primary, fontSize: fontSize.xs }}>
                    {r.avgMs}ms
                  </Text>
                  <View style={{ width: 40, alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        color:
                          r.status === 'PASS'
                            ? colors.success
                            : r.status === 'WARN'
                              ? colors.warning
                              : colors.error,
                        fontSize: fontSize.xs,
                        fontWeight: 'bold',
                      }}
                    >
                      {r.status}
                    </Text>
                  </View>
                </View>
              ))}

              <Button
                label="Copy Results (Markdown)"
                onPress={handleCopyBenchmark}
                variant="secondary"
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: rs(16), paddingBottom: rs(40) },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rs(8),
  },
  input: { paddingHorizontal: rs(12), borderWidth: 1, height: rs(48) },
});

export default SettingsScreen;
