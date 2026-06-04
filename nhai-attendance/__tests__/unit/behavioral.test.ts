import { computeBehavioralScore } from '@services/BehavioralService';
import type { LoginHistoryEntry } from '@services/BehavioralService';

const makeHistory = (hours: number[]): LoginHistoryEntry[] =>
  hours.map(h => ({
    timestamp: new Date(2024, 0, 1, Math.floor(h), Math.round((h % 1) * 60)).toISOString(),
    wasSuccessful: true,
  }));

describe('computeBehavioralScore', () => {
  it('should give HIGH score for on-time login', () => {
    const history = makeHistory([8.0, 8.1, 8.2, 8.3, 8.4]);
    const attemptTime = new Date(2024, 0, 10, 8, 15).toISOString();
    const result = computeBehavioralScore(attemptTime, history, 8.0);
    expect(result.score).toBe(100);
    expect(result.usedPersonalHistory).toBe(true);
  });

  it('should give LOW score for significantly late login', () => {
    const history = makeHistory([8.0, 8.1, 8.0, 8.2, 8.1]);
    const attemptTime = new Date(2024, 0, 10, 14, 0).toISOString(); // 6 hours late
    const result = computeBehavioralScore(attemptTime, history, 8.0);
    expect(result.score).toBeLessThan(20);
  });

  it('should use population baseline when history is insufficient', () => {
    const shortHistory = makeHistory([8.0, 8.1]); // Only 2 entries, need 3
    const attemptTime = new Date(2024, 0, 10, 8, 0).toISOString();
    const result = computeBehavioralScore(attemptTime, shortHistory, 8.0);
    expect(result.usedPersonalHistory).toBe(false);
  });

  it('should handle midnight-spanning login times correctly', () => {
    // Worker who consistently works late shift: 11 PM
    const history = makeHistory([23.0, 23.1, 22.9, 23.0, 23.2]);
    // Login at 11:30 PM — should be on-time
    const attemptTime = new Date(2024, 0, 10, 23, 30).toISOString();
    const result = computeBehavioralScore(attemptTime, history, 23.0);
    expect(result.score).toBeGreaterThan(80);
  });
});
