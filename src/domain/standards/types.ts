export type Pool = 'LCM' | 'SCM'; // 50 m | 25 m
export type Sex = 'M' | 'F';
export type Stroke = 'FREE' | 'BACK' | 'BREAST' | 'FLY' | 'MEDLEY';
export type Distance = 50 | 100 | 200 | 400 | 800 | 1500;

export type Rank =
  'YOUTH_3' | 'YOUTH_2' | 'YOUTH_1' | 'ADULT_3' | 'ADULT_2' | 'ADULT_1' | 'CMS' | 'MS' | 'MSMK';

/** One standard: one rank on one event. Time in seconds. */
export type StandardRow = {
  pool: Pool;
  sex: Sex;
  stroke: Stroke;
  distance: Distance;
  /** A rank absent from the order has no key here. A dash is not encoded as zero. */
  times: Partial<Record<Rank, number>>;
};

export type Edition = {
  /** Effective date in ISO, also the identifier. */
  id: string;
  /** Exact link to the order, shown in the interface. */
  order: string;
  effectiveFrom: string;
  /** null means the edition is in force. */
  effectiveTo: string | null;
  rows: StandardRow[];
};

export type PointsResult = {
  /** Integer, normally 0..1000, values outside the scale are possible. */
  points: number;
  /** Achieved rank, null when the result is slower than III youth. */
  achievedRank: Rank | null;
  /** Next rank by time, null when the result is faster than MSMK. Age does not filter it. */
  nextRank: Rank | null;
  /** Seconds to cut to reach nextRank, null when nextRank is absent. */
  gapSeconds: number | null;
  /** Ranks met on time that age will not let award, in RANK_ORDER. Never achievedRank. */
  blockedByAge: Rank[];
  editionId: string;
};
