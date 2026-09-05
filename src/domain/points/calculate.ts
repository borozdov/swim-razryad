import { CURRENT_EDITION, findStandard } from '@/domain/standards/registry';
import type { EventSelector } from '@/domain/standards/registry';
import type { PointsResult, Rank } from '@/domain/standards/types';
import { RANK_MIN_AGE, RANK_ORDER, RANK_POINTS } from './scale';

export type CalculateInput = EventSelector & {
  /** Swim time in seconds. */
  seconds: number;
  /** Age in years. Undefined leaves every rank available. */
  age?: number;
};

/** One point of the curve. */
type ScaleNode = { x: number; points: number };

/**
 * The cubic term of the formula. Read on this axis the curve is a straight line
 * between two ranks, so interpolation, extrapolation and the nodes themselves all
 * take the same code path.
 */
const curveX = (seconds: number): number => 1 / seconds ** 3;

/**
 * Infinite time, zero points. The curve runs down to this node below the slowest
 * rank, which keeps an extrapolated result positive instead of letting it cross
 * into negative points.
 */
const ORIGIN: ScaleNode = { x: 0, points: 0 };

/**
 * Nodes of one event, slow rank first. A rank the order leaves blank is not a node
 * at all, so the segment around it simply spans to the next rank that exists.
 */
const curveFor = (times: Partial<Record<Rank, number>>): ScaleNode[] => [
  ORIGIN,
  ...RANK_ORDER.flatMap((rank) => {
    const time = times[rank];
    return time === undefined ? [] : [{ x: curveX(time), points: RANK_POINTS[rank] }];
  }),
];

/**
 * Points for a time on the curve of one event, rounded to an integer.
 *
 * Null when the time is not a positive number or the event carries no rank at all.
 * Times are expected to decrease strictly along RANK_ORDER, the contract that
 * dataset.test.ts holds.
 */
export const pointsForTime = (
  times: Partial<Record<Rank, number>>,
  seconds: number,
): number | null => {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;

  const curve = curveFor(times);
  if (curve.length < 2) return null;

  const x = curveX(seconds);
  // Faster than the fastest rank: the topmost segment carries on, without exception.
  const found = curve.findIndex((node, index) => index > 0 && x <= node.x);
  const index = found === -1 ? curve.length - 1 : found;
  const lower = curve[index - 1];
  const upper = curve[index];

  const share = (x - lower.x) / (upper.x - lower.x);
  return Math.round(lower.points + (upper.points - lower.points) * share);
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
  if (row === undefined) return null;

  const points = pointsForTime(row.times, input.seconds);
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
