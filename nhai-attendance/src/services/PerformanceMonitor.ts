/* eslint-disable */
import { FEATURE_FLAGS } from '@constants/app.constants';

interface PerformanceRecord {
  operation: string;
  durationMs: number;
  timestamp: string;
  exceededTarget: boolean;
}

// Performance targets in milliseconds for each named operation
const PERFORMANCE_TARGETS: Record<string, number> = {
  face_detection: 200,
  face_recognition: 300,
  mobilefacenet_inference: 300,
  mobilefacenet_model_load: 2000,
  liveness_challenge_total: 300,
  trust_score_computation: 50,
  total_authentication: 1000,
  db_write: 50,
  db_read: 20,
  embedding_encryption: 10,
  embedding_decryption: 10,
};

class PerformanceMonitorClass {
  private records: PerformanceRecord[] = [];
  private readonly maxRecords = 1000; // Rolling window

  /**
   * Records the duration of a named operation.
   * Warns if the operation exceeds its target threshold.
   *
   * @param operation - Named operation identifier (must match a key in PERFORMANCE_TARGETS)
   * @param durationMs - Duration in milliseconds (use performance.now() for measurement)
   */
  record(operation: string, durationMs: number): void {
    const target = PERFORMANCE_TARGETS[operation];
    const exceededTarget = target !== undefined && durationMs > target;

    const record: PerformanceRecord = {
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
      exceededTarget,
    };

    this.records.push(record);


    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }


    if (FEATURE_FLAGS.ENABLE_PERFORMANCE_MONITORING || exceededTarget) {
      const status = exceededTarget ? '[EXCEEDED TARGET]' : '[OK]';
      const targetStr = target !== undefined ? ` (target: ${target}ms)` : '';
      console.info(`[Performance] ${status} ${operation}: ${durationMs.toFixed(1)}ms${targetStr}`);
    }
  }

  /**
   * Measures the duration of an async function and records it automatically.
   *
   * Usage:
   * const result = await PerformanceMonitor.measure('face_detection', () => detectFace(frame));
   */
  async measure<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      this.record(operation, performance.now() - start);
      return result;
    } catch (error) {
      this.record(operation, performance.now() - start);
      throw error;
    }
  }

  /**
   * Returns performance statistics for all recorded operations.
   * Used for the benchmarking report.
   */
  getReport(): Record<
    string,
    { avg: number; min: number; max: number; count: number; exceedanceRate: number }
  > {
    const grouped: Record<string, number[]> = {};
    const exceeded: Record<string, number> = {};

    for (const record of this.records) {
      if (!grouped[record.operation]) {
        grouped[record.operation] = [];
        exceeded[record.operation] = 0;
      }
      grouped[record.operation]!.push(record.durationMs);
      if (record.exceededTarget) {
        exceeded[record.operation] = (exceeded[record.operation] ?? 0) + 1;
      }
    }

    const report: Record<
      string,
      { avg: number; min: number; max: number; count: number; exceedanceRate: number }
    > = {};

    for (const [operation, durations] of Object.entries(grouped)) {
      const sum = durations.reduce((a, b) => a + b, 0);
      const count = durations.length;
      report[operation] = {
        avg: sum / count,
        min: Math.min(...durations),
        max: Math.max(...durations),
        count,
        exceedanceRate: ((exceeded[operation] ?? 0) / count) * 100,
      };
    }

    return report;
  }

  clearRecords(): void {
    this.records = [];
  }
}


export const PerformanceMonitor = new PerformanceMonitorClass();
