import { CURRENT_EDITION, findStandard } from '@/domain/standards/registry';
import type { EventSelector } from '@/domain/standards/registry';
import type { PointsResult, Rank, StandardRow } from '@/domain/standards/types';
import { findBaseTime } from './baseTimes';
import { RANK_MIN_AGE, RANK_ORDER } from './scale';

export type CalculateInput = EventSelector & {
  /** Swim time in seconds. */
  seconds: number;
  /** Age in years. Undefined leaves every rank available. */
  age?: number;
};

/**
 * World Aquatics points, the FINA Points of old: 1000 for the base time and the cube of the
 * speed either side of it, so twice the base time scores 125. Floored, not rounded, the way
 * fina.borozdov.ru prints them, so one swim reads the same number in both apps.
 *
 * Null when the time is not a positive number.
 */
export const finaPoints = (baseTime: number, seconds: number): number | null =>
  Number.isFinite(seconds) && seconds > 0 ? Math.floor(1000 * (baseTime / seconds) ** 3) : null;

/**
 * What each rank of an event scores: its standard, taken as a swim. Slow rank first; a rank
 * the order leaves blank has no time and so no points.
 */
export const rankPoints = (row: StandardRow): readonly { rank: Rank; points: number }[] => {
  const baseTime = findBaseTime(row);
  if (baseTime === undefined) return [];
  return RANK_ORDER.flatMap((rank) => {
    const time = row.times[rank];
    const points = time === undefined ? null : finaPoints(baseTime, time);
    return points === null ? [] : [{ rank, points }];
  });
};

const allowedAt = (age: number | undefined, rank: Rank): boolean =>
  age === undefined || age >= RANK_MIN_AGE[rank];

const roundHundredths = (seconds: number): number => Math.round(seconds * 100) / 100;

/**
 * Points, rank and the gap to the next rank for one swim.
 *
 * Null when the dataset carries no such event or the time is not a positive number.
 * Age decides which ranks may be awarded and never touches a time: the points and
 * the gap read the same at any age.
 */
export const calculate = (input: CalculateInput): PointsResult | null => {
  const row = findStandard(input);
  const baseTime = findBaseTime(input);
  if (row === undefined || baseTime === undefined) return null;

  const points = finaPoints(baseTime, input.seconds);
  if (points === null) return null;

  // A rank is met by swimming its time or faster.
  const met = RANK_ORDER.filter((rank) => {
    const time = row.times[rank];
    return time !== undefined && input.seconds <= time;
  });
  const awardable = met.filter((rank) => allowedAt(input.age, rank));

  // The slowest rank still to beat. Times fall along RANK_ORDER, so it is the first.
  const nextRank = RANK_ORDER.find((rank) => {
    const time = row.times[rank];
    return time !== undefined && time < input.seconds;
  });
  const nextTime = nextRank === undefined ? undefined : row.times[nextRank];

  return {
    points,
    achievedRank: awardable.at(-1) ?? null,
    nextRank: nextRank ?? null,
    gapSeconds: nextTime === undefined ? null : roundHundredths(input.seconds - nextTime),
    blockedByAge: met.filter((rank) => !allowedAt(input.age, rank)),
    editionId: CURRENT_EDITION.id,
  };
};
