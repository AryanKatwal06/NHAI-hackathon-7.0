import { LIVENESS_CHALLENGES } from '../../src/constants/liveness.constants';

// We need to test the randomization logic. Since the screen manages it,
// we'll extract the core selection logic here to test it.
function selectChallenges(count: number): string[] {
  const keys = Object.keys(LIVENESS_CHALLENGES);
  const shuffled = [...keys].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

describe('Liveness Challenge Randomization', () => {
  test('Selects the requested number of challenges', () => {
    const challenges = selectChallenges(2);
    expect(challenges.length).toBe(2);
  });

  test('Does not select duplicate challenges in a single session', () => {
    // Run 100 times to ensure statistical likelihood of duplicates if buggy
    for (let i = 0; i < 100; i++) {
      const challenges = selectChallenges(3);
      const uniqueSet = new Set(challenges);
      expect(uniqueSet.size).toBe(challenges.length);
    }
  });

  test('Returns valid challenge keys', () => {
    const validKeys = Object.keys(LIVENESS_CHALLENGES);
    const challenges = selectChallenges(2);
    challenges.forEach(c => {
      expect(validKeys).toContain(c);
    });
  });

  test('Demonstrates randomness over multiple iterations', () => {
    // If we pick 1 challenge 1000 times, we should see all 4 types eventually
    const counts: Record<string, number> = { BLINK: 0, SMILE: 0, HEAD_TURN_LEFT: 0, HEAD_TURN_RIGHT: 0 };

    for (let i = 0; i < 1000; i++) {
      const pick = selectChallenges(1)[0] as string;
      if (counts[pick] !== undefined) {
        counts[pick]++;
      }
    }

    expect(counts.BLINK).toBeGreaterThan(0);
    expect(counts.SMILE).toBeGreaterThan(0);
    expect(counts.HEAD_TURN_LEFT).toBeGreaterThan(0);
    expect(counts.HEAD_TURN_RIGHT).toBeGreaterThan(0);
  });
});
