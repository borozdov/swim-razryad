import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CURRENT_EDITION, eventKey, findStandard } from '@/domain/standards/registry';
import type { EventSelector } from '@/domain/standards/registry';
import type { PointsResult, Rank, StandardRow } from '@/domain/standards/types';
import { calculate, pointsForTime } from './calculate';
import { RANK_ORDER, RANK_POINTS } from './scale';

/** The check row of tech.md, «Источник чисел»: men, 50 m pool, freestyle 50 m. */
const CHECK: EventSelector = { pool: 'LCM', sex: 'M', stroke: 'FREE', distance: 50 };

/** Its nine standards, straight from приказ № 1092. */
const MSMK = 21.91;
const MS = 23.2;
const CMS = 23.95;
const ADULT_1 = 25.2;
const YOUTH_1 = 35.8;
const YOUTH_3 = 55.8;

/** The formula as tech.md prints it in «Ядро предметной логики». */
const scaleFormula = (t1: number, s1: number, t2: number, s2: number, t: number): number =>
  s1 + ((s2 - s1) * ((t1 / t) ** 3 - 1)) / ((t1 / t2) ** 3 - 1);

const selectorOf = ({ pool, sex, stroke, distance }: StandardRow): EventSelector => ({
  pool,
  sex,
  stroke,
  distance,
});

const resultFor = (event: EventSelector, seconds: number, age?: number): PointsResult => {
  const result = calculate({ ...event, seconds, age });
  if (result === null) throw new Error(`No result for ${seconds} s on ${eventKey(event)}`);
  return result;
};

const pointsAt = (times: StandardRow['times'], seconds: number): number => {
  const points = pointsForTime(times, seconds);
  if (points === null) throw new Error(`No points for ${seconds} s`);
  return points;
};

/** Any event the edition carries. */
const anyRow = fc.constantFrom(...CURRENT_EDITION.rows);

/** A swim time in whole hundredths, the resolution a result is measured in. */
const anyTime = fc.integer({ min: 1, max: 300_000 }).map((hundredths) => hundredths / 100);

describe('a time that sits on a node of the scale', () => {
  it('scores the points of that rank exactly, on every rank of every event', () => {
    for (const row of CURRENT_EDITION.rows) {
      for (const rank of RANK_ORDER) {
        const time = row.times[rank];
        if (time === undefined) continue;

        expect({ key: eventKey(row), rank, points: pointsAt(row.times, time) }).toEqual({
          key: eventKey(row),
          rank,
          points: RANK_POINTS[rank],
        });
      }
    }
  });

  it('names that rank as achieved and the next one as the target', () => {
    const result = resultFor(CHECK, MS);

    expect(result).toEqual({
      points: 900,
      achievedRank: 'MS',
      nextRank: 'MSMK',
      gapSeconds: 1.29,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
  });
});

describe('a time inside a segment', () => {
  it('follows the formula of tech.md between the two ranks around it', () => {
    expect(pointsAt(findStandard(CHECK)?.times ?? {}, 24)).toBe(
      Math.round(scaleFormula(ADULT_1, 600, CMS, 750, 24)),
    );
  });

  it('follows it on every segment of every event', () => {
    fc.assert(
      fc.property(anyRow, fc.integer({ min: 1, max: 99 }), (row, share) => {
        const present = RANK_ORDER.map((rank) => [rank, row.times[rank]] as const).filter(
          (entry): entry is readonly [Rank, number] => entry[1] !== undefined,
        );

        for (let index = 1; index < present.length; index += 1) {
          const [slowRank, slow] = present[index - 1];
          const [fastRank, fast] = present[index];
          const time = Math.round((slow + ((fast - slow) * share) / 100) * 100) / 100;
          if (time <= fast || time >= slow) continue;

          expect(pointsAt(row.times, time)).toBe(
            Math.round(
              scaleFormula(slow, RANK_POINTS[slowRank], fast, RANK_POINTS[fastRank], time),
            ),
          );
        }
      }),
    );
  });
});

describe('a time beyond the ends of the scale', () => {
  it('extrapolates the same curve above MSMK', () => {
    const result = resultFor(CHECK, 21);

    expect(result).toEqual({
      points: Math.round(scaleFormula(MS, 900, MSMK, 1000, 21)),
      achievedRank: 'MSMK',
      nextRank: null,
      gapSeconds: null,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
    expect(result.points).toBeGreaterThan(RANK_POINTS.MSMK);
  });

  it('extrapolates the same curve below III youth', () => {
    const result = resultFor(CHECK, 60);

    expect(result).toEqual({
      points: 80,
      achievedRank: null,
      nextRank: 'YOUTH_3',
      gapSeconds: 4.2,
      blockedByAge: [],
      editionId: '2024-11-26',
    });
    expect(result.points).toBeLessThan(RANK_POINTS.YOUTH_3);
  });

  it('keeps a beginner above zero however slow the swim is', () => {
    expect(resultFor(CHECK, 100).points).toBeGreaterThan(0);
    expect(resultFor(CHECK, 300).points).toBeGreaterThan(0);
  });
});

describe('a rank the order leaves blank', () => {
  const full = findStandard(CHECK)?.times ?? {};
  const gapped: StandardRow['times'] = { ...full };
  delete gapped.YOUTH_2;

  it('lets the segment span to the next rank that exists', () => {
    expect(pointsAt(gapped, 45.8)).toBe(Math.round(scaleFormula(YOUTH_3, 100, YOUTH_1, 300, 45.8)));
  });

  it('leaves the ranks around the blank untouched', () => {
    expect(pointsAt(gapped, YOUTH_3)).toBe(RANK_POINTS.YOUTH_3);
    expect(pointsAt(gapped, YOUTH_1)).toBe(RANK_POINTS.YOUTH_1);
  });

  it('opens no break in the curve where the rank is missing', () => {
    const across = [50, 47, 45.81, 45.8, 45.79, 44, 40];

    expect(across.map((time) => pointsAt(gapped, time))).toEqual(
      across.map((time) => Math.round(scaleFormula(YOUTH_3, 100, YOUTH_1, 300, time))),
    );
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
        points: 759,
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

describe('the invariants of the scale', () => {
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

  it('scores a node exactly', () => {
    fc.assert(
      fc.property(anyRow, fc.constantFrom(...RANK_ORDER), (row, rank) => {
        const time = row.times[rank];
        if (time === undefined) return;

        expect(resultFor(selectorOf(row), time).points).toBe(RANK_POINTS[rank]);
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
