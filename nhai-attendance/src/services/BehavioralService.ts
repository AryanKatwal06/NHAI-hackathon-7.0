import { BEHAVIORAL_CONSTANTS } from '@constants/trust.constants';
import type { BehavioralScore } from '@/types/behavior.types';

// One day of login history = one timestamp of a successful authentication
export interface LoginHistoryEntry {
  timestamp: string; // ISO 8601
  wasSuccessful: boolean;
}

/**
 * Converts a time string (HH:MM) or Date to the hour as a decimal (e.g., 8.5 = 8:30 AM).
 */
function timeToDecimalHours(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

/**
 * Computes the circular mean of a set of time-of-day values (in decimal hours, 0–24).
 * Uses trigonometric circular statistics to correctly handle midnight wraparound.
 *
 * @param hourValues - Array of decimal hour values (e.g., [8.5, 8.75, 9.0])
 * @returns Circular mean as decimal hours (0–24)
 */
function circularMeanHours(hourValues: number[]): number {
  if (hourValues.length === 0) {
    return BEHAVIORAL_CONSTANTS.POPULATION_BASELINE_TIME_HOURS;
  }

  // Convert to radians (0–24 hours → 0–2π radians)
  const toRadians = (h: number) => (h / 24) * 2 * Math.PI;
  const toHours = (r: number) => (r / (2 * Math.PI)) * 24;

  const sinSum = hourValues.reduce((sum, h) => sum + Math.sin(toRadians(h)), 0);
  const cosSum = hourValues.reduce((sum, h) => sum + Math.cos(toRadians(h)), 0);

  const meanAngle = Math.atan2(sinSum / hourValues.length, cosSum / hourValues.length);
  // atan2 returns [-π, +π] — convert to [0, 2π] then to hours
  const normalizedAngle = meanAngle < 0 ? meanAngle + 2 * Math.PI : meanAngle;
  return toHours(normalizedAngle);
}

/**
 * Computes the circular distance between two time-of-day values.
 * Returns the absolute difference in hours, taking the shorter arc around the clock.
 * Maximum possible distance = 12 hours (e.g., 8 AM vs 8 PM).
 */
function circularDistanceHours(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 24 - diff); // Take the shorter arc
}

/**
 * Computes the behavioral trust score for an authentication attempt.
 *
 * @param currentAttemptTime - ISO 8601 timestamp of the current attempt
 * @param loginHistory - Historical successful logins for this worker
 * @param populationBaselineHour - Shift start time from worksite config (fallback)
 * @returns BehavioralScore with a 0–100 trust score
 */
export function computeBehavioralScore(
  currentAttemptTime: string,
  loginHistory: LoginHistoryEntry[],
  populationBaselineHour: number = BEHAVIORAL_CONSTANTS.POPULATION_BASELINE_TIME_HOURS,
): BehavioralScore {
  const currentTime = new Date(currentAttemptTime);
  const currentHour = timeToDecimalHours(currentTime);

  const successfulLogins = loginHistory.filter((h) => h.wasSuccessful);
  const usePersonalHistory = successfulLogins.length >= BEHAVIORAL_CONSTANTS.MINIMUM_HISTORY_DAYS;

  let typicalHour: number;
  let historyDescription: string;

  if (usePersonalHistory) {
    const historicalHours = successfulLogins.map((entry) => {
      return timeToDecimalHours(new Date(entry.timestamp));
    });
    typicalHour = circularMeanHours(historicalHours);
    historyDescription = `personal history (${successfulLogins.length} logins, typical: ${typicalHour.toFixed(1)}h)`;
  } else {
    typicalHour = populationBaselineHour;
    historyDescription = `population baseline (insufficient personal history, using ${populationBaselineHour}:00)`;
  }

  const hoursFromTypical = circularDistanceHours(currentHour, typicalHour);

  // Map distance to trust score:
  // Within ON_TIME_WINDOW (±30 min = 0.5 hours): score = 100
  // Within LATE_WINDOW (±90 min = 1.5 hours): linear decay from 100 to 40
  // Beyond LATE_WINDOW: score = 10 (not zero — there may be legitimate reasons)
  const onTimeWindowHours = BEHAVIORAL_CONSTANTS.ON_TIME_WINDOW_MINUTES / 60;
  const lateWindowHours = BEHAVIORAL_CONSTANTS.LATE_WINDOW_MINUTES / 60;

  let score: number;
  let reason: string;

  if (hoursFromTypical <= onTimeWindowHours) {
    score = 100;
    reason = `Login within expected time window (±${BEHAVIORAL_CONSTANTS.ON_TIME_WINDOW_MINUTES} min of typical ${typicalHour.toFixed(1)}h). ${historyDescription}.`;
  } else if (hoursFromTypical <= lateWindowHours) {
    // Linear decay from 100 to 40 across the late window
    const positionInLateWindow =
      (hoursFromTypical - onTimeWindowHours) / (lateWindowHours - onTimeWindowHours);
    score = Math.round(100 - positionInLateWindow * 60);
    reason = `Login ${hoursFromTypical.toFixed(1)}h outside typical time. ${historyDescription}.`;
  } else {
    score = 10;
    reason = `Login ${hoursFromTypical.toFixed(1)}h from typical time — significantly outside normal pattern. ${historyDescription}.`;
  }

  return {
    score,
    typicalLoginHour: typicalHour,
    currentLoginHour: currentHour,
    hoursFromTypical,
    usedPersonalHistory: usePersonalHistory,
    reason,
  };
}
