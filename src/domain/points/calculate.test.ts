import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CURRENT_EDITION, eventKey, findStandard } from '@/domain/standards/registry';
import type { EventSelector } from '@/domain/standards/registry';
import type { PointsResult, StandardRow } from '@/domain/standards/types';
import { BASE_TIMES } from './baseTimes';
import { calculate, rankPoints } from './calculate';
import { RANK_ORDER } from './scale';

/** The check row of tech.md, «Источник чисел»: men, 50 m pool, freestyle 50 m. */
const CHECK: EventSelector = { pool: 'LCM', sex: 'M', stroke: 'FREE', distance: 50 };

/** Its base time in the World Aquatics table of 2026, the men's 50 m freestyle world record. */
const CHECK_BASE = 20.91;

/** The formula as World Aquatics publishes it and fina.borozdov.ru prints it, floored. */
const finaFormula = (base: number, time: number): number => Math.floor(1000 * (base / time) ** 3);

const selectorOf = ({ pool, sex, stroke, distance }: StandardRow): EventSelector => ({
  pool,
  sex,
  stroke,
  distance,
});

const baseOf = (row: StandardRow): number => {
  const base = BASE_TIMES[eventKey(row)];
  if (base === undefined) throw new Error(`No base time for ${eventKey(row)}`);
  return base;
};

const resultFor = (event: EventSelector, seconds: number, age?: number): PointsResult => {
  const result = calculate({ ...event, seconds, age });
  if (result === null) throw new Error(`No result for ${seconds} s on ${eventKey(event)}`);
  return result;
};

/** Any event the edition carries. */
const anyRow = fc.constantFrom(...CURRENT_EDITION.rows);

/** A swim time in whole hundredths, the resolution a result is measured in. */
const anyTime = fc.integer({ min: 1, max: 300_000 }).map((hundredths) => hundredths / 100);

describe('the points of a swim', () => {
  it('are the FINA points fina.borozdov.ru prints for the same swim', () => {
    // Every standard of the check row, scored in fina-point with the same base time.
    const standards = [21.91, 23.2, 23.95, 25.2, 27.6, 29.8, 35.8, 45.8, 55.8];

    expect(standards.map((time) => resultFor(CHECK, time).points)).toEqual([
      869, 732, 665, 571, 434, 345, 199, 95, 52,
    ]);
  });

  it('follow the World Aquatics formula on every event at any time', () => {
    fc.assert(
      fc.property(anyRow, anyTime, (row, seconds) => {
        expect(resultFor(selectorOf(row), seconds).points).toBe(finaFormula(baseOf(row), seconds));
      }),
    );
  });

  it('are 1000 exactly at the base time of every event', () => {
    for (const row of CURRENT_EDITION.rows) {
      expect({
        key: eventKey(row),
        points: resultFor(selectorOf(row), baseOf(row)).points,
      }).toEqual({ key: eventKey(row), points: 1000 });
    }
  });

  it('name the rank met and the next one as the target', () => {
    expect(resultFor(CHECK, 23.2)).toEqual({
      points: 732,
      achievedRank: 'MS',
      nextRank: 'MSMK',
      gapSeconds: 1.29,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
  });
});

describe('a time beyond the ends of the ladder', () => {
  it('scores above 1000 when faster than the base time, with no rank ahead', () => {
    const result = resultFor(CHECK, 20);

    expect(result).toEqual({
      points: finaFormula(CHECK_BASE, 20),
      achievedRank: 'MSMK',
      nextRank: null,
      gapSeconds: null,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
    expect(result.points).toBeGreaterThan(1000);
  });

  it('still scores below III youth and names III youth as the target', () => {
    expect(resultFor(CHECK, 60)).toEqual({
      points: 42,
      achievedRank: null,
      nextRank: 'YOUTH_3',
      gapSeconds: 4.2,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
  });
});

describe('the points of the ranks', () => {
  const row = findStandard(CHECK);
  if (row === undefined) throw new Error('The check row is missing');

  it('score each standard of the event like any swim, slow rank first', () => {
    expect(rankPoints(row)).toEqual(
      RANK_ORDER.map((rank) => ({ rank, points: resultFor(CHECK, row.times[rank] ?? 0).points })),
    );
  });

  it('skip a rank the order leaves blank and leave the others where they were', () => {
    const gapped: StandardRow = { ...row, times: { ...row.times } };
    delete gapped.times.YOUTH_2;

    expect(rankPoints(gapped)).toEqual(rankPoints(row).filter(({ rank }) => rank !== 'YOUTH_2'));
  });
});

describe('age', () => {
  // приказ № 999, приложение № 19, пункт 3: КМС from 10, I-III from 9, youth from 8.
  const swim = 23.9; // faster than КМС, slower than МС

  it.each([
    [undefined, 'CMS', []],
    [15, 'CMS', []],
    [10, 'CMS', []],
    [9, 'ADULT_1', ['CMS']],
    [8, 'YOUTH_1', ['ADULT_3', 'ADULT_2', 'ADULT_1', 'CMS']],
    [7, null, ['YOUTH_3', 'YOUTH_2', 'YOUTH_1', 'ADULT_3', 'ADULT_2', 'ADULT_1', 'CMS']],
  ])('at %s awards %s and blocks %s', (age, achievedRank, blockedByAge) => {
    const result = resultFor(CHECK, swim, age);

    expect({ achievedRank: result.achievedRank, blockedByAge: result.blockedByAge }).toEqual({
      achievedRank,
      blockedByAge,
    });
  });

  it('never moves the points or the gap', () => {
    const ages = [undefined, 7, 8, 9, 10, 12, 14, 40];
    const results = ages.map((age) => resultFor(CHECK, swim, age));

    for (const result of results) {
      expect({ points: result.points, nextRank: result.nextRank, gap: result.gapSeconds }).toEqual({
        points: 669,
        nextRank: 'MS',
        gap: 0.7,
      });
    }
  });
});

describe('an event outside the dataset', () => {
  it('has no result', () => {
    expect(
      calculate({ pool: 'LCM', sex: 'M', stroke: 'FLY', distance: 800, seconds: 500 }),
    ).toBeNull();
  });

  it('has no result for a time that is not a positive number', () => {
    expect(calculate({ ...CHECK, seconds: 0 })).toBeNull();
    expect(calculate({ ...CHECK, seconds: -1 })).toBeNull();
    expect(calculate({ ...CHECK, seconds: Number.NaN })).toBeNull();
  });
});

describe('calculate is a pure function', () => {
  it('returns the same result for the same input and mutates nothing', () => {
    const input = Object.freeze({ ...CHECK, seconds: 24, age: 12 });
    const before = JSON.stringify(findStandard(CHECK));

    const first = calculate(input);
    const second = calculate(input);

    expect(second).toEqual(first);
    expect(JSON.stringify(findStandard(CHECK))).toBe(before);
    expect(input).toEqual({ ...CHECK, seconds: 24, age: 12 });
  });

  it('repeats itself on any event and any time', () => {
    fc.assert(
      fc.property(anyRow, anyTime, (row, seconds) => {
        const event = selectorOf(row);
        expect(calculate({ ...event, seconds })).toEqual(calculate({ ...event, seconds }));
      }),
    );
  });
});

describe('the invariants of the points', () => {
  it('never falls as the time falls', () => {
    fc.assert(
      fc.property(anyRow, anyTime, anyTime, (row, one, other) => {
        const event = selectorOf(row);
        const faster = resultFor(event, Math.min(one, other));
        const slower = resultFor(event, Math.max(one, other));

        expect(faster.points).toBeGreaterThanOrEqual(slower.points);
      }),
    );
  });

  it('never scores below zero, however slow or fast the swim', () => {
    fc.assert(
      fc.property(anyRow, fc.double({ min: 0.01, max: 1e6, noNaN: true }), (row, seconds) => {
        const result = resultFor(selectorOf(row), seconds);

        expect(Number.isInteger(result.points)).toBe(true);
        expect(result.points).toBeGreaterThanOrEqual(0);
      }),
    );
  });

  it('leaves a non-negative gap whenever a next rank exists', () => {
    fc.assert(
      fc.property(anyRow, anyTime, (row, seconds) => {
        const result = resultFor(selectorOf(row), seconds);
        if (result.nextRank === null) {
          expect(result.gapSeconds).toBeNull();
          return;
        }

        expect(result.gapSeconds).not.toBeNull();
        expect(result.gapSeconds ?? -1).toBeGreaterThanOrEqual(0);
      }),
    );
  });
});
