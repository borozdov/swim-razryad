import { describe, expect, it } from 'vitest';
import { findStandard } from '@/domain/standards/registry';
import { calculate } from './calculate';
import { nearbyStandards } from './nearby';

/** The check row of приказ № 1092: men, 50 m pool, freestyle 50 m. */
const EVENT = { pool: 'LCM', stroke: 'FREE', distance: 50, sex: 'M' } as const;

const nearby = (seconds: number) => {
  const result = calculate({ ...EVENT, seconds });
  const row = findStandard(EVENT);
  expect(result).not.toBeNull();
  expect(row).toBeDefined();
  return nearbyStandards(result!, row!.times);
};

describe('the standards around a result', () => {
  it('names the rung made and the rung ahead, with the times the order sets', () => {
    // 25.20 is I разряд exactly; КМС is 23.95.
    expect(nearby(25.2)).toEqual([
      { rank: 'ADULT_1', seconds: 25.2, achieved: true },
      { rank: 'CMS', seconds: 23.95, achieved: false },
    ]);
  });

  it('shows only what lies ahead when no rung is made yet', () => {
    expect(nearby(90)).toEqual([{ rank: 'YOUTH_3', seconds: 55.8, achieved: false }]);
  });

  it('shows only the rung made at the top of the ladder', () => {
    expect(nearby(20)).toEqual([{ rank: 'MSMK', seconds: 21.91, achieved: true }]);
  });

  it('keeps the slow rank first, whatever order the result reports', () => {
    const [slow, fast] = nearby(24.5);

    expect(slow.achieved).toBe(true);
    expect(fast.achieved).toBe(false);
    expect(slow.seconds).toBeGreaterThan(fast.seconds);
  });
});
