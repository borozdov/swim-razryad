/**
 * The two rungs a swimmer stands between: the one just made and the one just ahead,
 * each with the time the order sets for it. The gap alone says how far, this says where.
 */
import type { PointsResult, Rank } from '@/domain/standards/types';
import { RANK_ORDER } from './scale';

export type NearbyStandard = {
  rank: Rank;
  /** The standard itself, in seconds. */
  seconds: number;
  /** True for the rung already made, false for the one ahead. */
  achieved: boolean;
};

/**
 * A rank the order leaves blank has no time, so it cannot be shown and is skipped;
 * `calculate` skips it for the same reason. Slow rank first, the way every ladder in
 * the app reads.
 */
export const nearbyStandards = (
  result: PointsResult,
  times: Partial<Record<Rank, number>>,
): readonly NearbyStandard[] => {
  const entry = (rank: Rank | null, achieved: boolean): readonly NearbyStandard[] => {
    if (rank === null) return [];
    const seconds = times[rank];
    return seconds === undefined ? [] : [{ rank, seconds, achieved }];
  };

  return [...entry(result.achievedRank, true), ...entry(result.nextRank, false)].sort(
    (a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank),
  );
};
