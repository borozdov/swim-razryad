import { describe, expect, it } from 'vitest';
import { RANK_MIN_AGE, RANK_ORDER } from '@/domain/points/scale';
import { CURRENT_EDITION, eventKey, findStandard } from './registry';
import { editionSchema } from './schema';
import type { Distance, Pool, Rank, Sex, Stroke } from './types';

/**
 * Events both pools carry: the Olympic programme plus the 50 m sprints of the three
 * other strokes, for both sexes.
 */
const SHARED_EVENTS: readonly (readonly [Stroke, Distance])[] = [
  ['FREE', 50],
  ['FREE', 100],
  ['FREE', 200],
  ['FREE', 400],
  ['FREE', 800],
  ['FREE', 1500],
  ['BACK', 50],
  ['BACK', 100],
  ['BACK', 200],
  ['BREAST', 50],
  ['BREAST', 100],
  ['BREAST', 200],
  ['FLY', 50],
  ['FLY', 100],
  ['FLY', 200],
  ['MEDLEY', 200],
  ['MEDLEY', 400],
];

/** The 100 m medley is swum in the 25 m pool only, so it is the one event the pools differ by. */
const SCM_ONLY_EVENTS: readonly (readonly [Stroke, Distance])[] = [['MEDLEY', 100]];

const eventsOf = (pool: Pool): readonly (readonly [Stroke, Distance])[] =>
  pool === 'SCM' ? [...SHARED_EVENTS, ...SCM_ONLY_EVENTS] : SHARED_EVENTS;

const SEXES: readonly Sex[] = ['M', 'F'];

/** Pools the edition claims to cover. */
const COVERED_POOLS: readonly Pool[] = ['LCM', 'SCM'];

const poolsInDataset = [...new Set(CURRENT_EDITION.rows.map((row) => row.pool))].sort();

describe('edition 2024-11-26', () => {
  it('satisfies editionSchema', () => {
    const parsed = editionSchema.safeParse(CURRENT_EDITION);
    expect(parsed.error?.issues ?? []).toEqual([]);
    expect(parsed.success).toBe(true);
  });

  it('records the order it was transcribed from', () => {
    expect(CURRENT_EDITION.id).toBe(CURRENT_EDITION.effectiveFrom);
    expect(CURRENT_EDITION.effectiveTo).toBeNull();
    expect(CURRENT_EDITION.order).toContain('publication.pravo.gov.ru');
  });

  it('keys every row uniquely by pool, sex, stroke and distance', () => {
    const keys = CURRENT_EDITION.rows.map(eventKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers exactly the listed events for every pool and both sexes', () => {
    expect(poolsInDataset).toEqual([...COVERED_POOLS].sort());

    const expected = poolsInDataset.flatMap((pool) =>
      SEXES.flatMap((sex) =>
        eventsOf(pool).map(([stroke, distance]) => eventKey({ pool, sex, stroke, distance })),
      ),
    );
    expect(CURRENT_EDITION.rows.map(eventKey).sort()).toEqual([...expected].sort());
  });

  it('lists times that strictly decrease from the slow rank to the fast one', () => {
    for (const row of CURRENT_EDITION.rows) {
      const present = RANK_ORDER.map((rank) => [rank, row.times[rank]] as const).filter(
        (entry): entry is readonly [Rank, number] => entry[1] !== undefined,
      );

      const times = present.map(([, time]) => time);
      const strictlyDecreasing = times.every(
        (time, index) => index === 0 || time < times[index - 1],
      );

      expect({ key: eventKey(row), strictlyDecreasing }).toEqual({
        key: eventKey(row),
        strictlyDecreasing: true,
      });
    }
  });

  it('encodes an absent rank as a missing key, never as zero or null', () => {
    const ranks = new Set<string>(RANK_ORDER);
    for (const row of CURRENT_EDITION.rows) {
      for (const [rank, time] of Object.entries(row.times)) {
        expect(ranks.has(rank)).toBe(true);
        expect(typeof time).toBe('number');
        expect(Number.isFinite(time) && time > 0).toBe(true);
      }
    }
  });
});

describe('rank minimum age', () => {
  it('covers every rank and never drops as the rank gets harder', () => {
    const ages = RANK_ORDER.map((rank) => RANK_MIN_AGE[rank]);
    expect(ages).toHaveLength(RANK_ORDER.length);
    expect(ages.every((age) => Number.isInteger(age) && age > 0)).toBe(true);
    expect(ages.every((age, index) => index === 0 || age >= ages[index - 1])).toBe(true);
  });
});

describe('registry', () => {
  it('returns the stored row for every key it holds', () => {
    for (const row of CURRENT_EDITION.rows) {
      expect(findStandard(row)).toBe(row);
    }
  });

  it('returns undefined for an event outside the dataset', () => {
    expect(findStandard({ pool: 'LCM', sex: 'M', stroke: 'FLY', distance: 800 })).toBeUndefined();
  });
});

/**
 * Anchors a reviewer can hold against the printed order without running anything:
 * row 24 of the table for the 50 m pool, row 1 for the 25 m pool.
 */
const CHECK_ROWS: readonly { pool: Pool; times: Partial<Record<Rank, number>> }[] = [
  {
    pool: 'LCM',
    times: {
      MSMK: 21.91,
      MS: 23.2,
      CMS: 23.95,
      ADULT_1: 25.2,
      ADULT_2: 27.6,
      ADULT_3: 29.8,
      YOUTH_1: 35.8,
      YOUTH_2: 45.8,
      YOUTH_3: 55.8,
    },
  },
  {
    pool: 'SCM',
    times: {
      MSMK: 21.18,
      MS: 22.45,
      CMS: 23.2,
      ADULT_1: 24.45,
      ADULT_2: 26.85,
      ADULT_3: 29.05,
      YOUTH_1: 35.05,
      YOUTH_2: 45.05,
      YOUTH_3: 55.05,
    },
  },
];

describe('check row, men, freestyle 50 m', () => {
  it.each(CHECK_ROWS)('matches the order line for line in $pool', ({ pool, times }) => {
    expect(findStandard({ pool, sex: 'M', stroke: 'FREE', distance: 50 })?.times).toEqual(times);
  });
});
