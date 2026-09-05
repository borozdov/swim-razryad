/**
 * The one thing a table of two pools cannot show: how the two are set against each other.
 *
 * The order prints the short course and the long course as separate blocks and never says
 * what the difference between them is. It is computed here, over every event both pools
 * carry, so the explainer page can state it instead of asserting it.
 */
import type { Edition, Rank, StandardRow } from '@/domain/standards/types';
import { RANK_LABEL } from './labels';

export type PoolSpread = {
  /** Event and sex pairs the two pools share at this rank. */
  pairs: number;
  /** Percent the short course is set faster by. Negative means the order set it slower. */
  min: number;
  max: number;
  median: number;
};

const key = ({ sex, stroke, distance }: StandardRow): string => `${sex}|${stroke}|${distance}`;

const round = (value: number): number => Math.round(value * 10) / 10;

/**
 * How much faster the 25 m pool is set at one rank, as a share of the 50 m time. Twice the
 * turns is worth something, and this is the order's own opinion of how much.
 */
export const poolSpread = (edition: Edition, rank: Rank): PoolSpread => {
  const short = new Map(
    edition.rows.filter((row) => row.pool === 'SCM').map((row) => [key(row), row]),
  );

  const ratios: number[] = [];
  for (const long of edition.rows) {
    if (long.pool !== 'LCM') continue;
    const scm = short.get(key(long));
    const slow = long.times[rank];
    const fast = scm?.times[rank];
    if (scm === undefined || slow === undefined || fast === undefined) continue;
    ratios.push(((slow - fast) / slow) * 100);
  }
  ratios.sort((a, b) => a - b);

  return {
    pairs: ratios.length,
    min: round(ratios[0] ?? 0),
    max: round(ratios.at(-1) ?? 0),
    median: round(ratios[Math.floor(ratios.length / 2)] ?? 0),
  };
};

/** One decimal and a comma, as Russian writes a fraction. No unit: the range carries it. */
const number = (value: number): string => value.toFixed(1).replace('.', ',');

/** A real minus and a real plus, because half of these numbers change the sentence's meaning. */
const signed = (value: number): string => (value < 0 ? `−${number(-value)}` : `+${number(value)}`);

export const poolSpreadSentence = (spread: PoolSpread, rank: Rank): string =>
  `На ступени ${RANK_LABEL[rank]} приказ ставит бассейн 25 м быстрее ` +
  `на ${number(spread.min)}–${number(spread.max)} %, медиана ${number(spread.median)} %, ` +
  `и так на всех ${spread.pairs} парах событий, которые есть в обоих бассейнах.`;

/**
 * The same measurement on the bottom rung, where it falls apart. Worth saying out loud:
 * a reader who assumes one ratio holds down the whole ladder will be wrong by seconds.
 */
export const youthSpreadSentence = (spread: PoolSpread, rank: Rank): string =>
  `На ступени ${RANK_LABEL[rank]} такой закономерности нет: разброс от ${signed(spread.min)} % ` +
  `до ${signed(spread.max)} %, то есть на части дистанций короткая вода поставлена медленнее ` +
  'длинной. Пересчитать один бассейн в другой одним коэффициентом нельзя.';
