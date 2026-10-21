import type { Rank } from '@/domain/standards/types';

/** Slow rank to fast rank. Source of truth for walking the scale. */
export const RANK_ORDER: readonly Rank[] = [
  'YOUTH_3',
  'YOUTH_2',
  'YOUTH_1',
  'ADULT_3',
  'ADULT_2',
  'ADULT_1',
  'CMS',
  'MS',
  'MSMK',
] as const;

/**
 * Minimum age for the rank to be awarded, in years.
 *
 * From пункт 3 of приложение № 19 to приказ Минспорта России № 999, as replaced by
 * приложение № 11 to приказ Минспорта России от 04.03.2024 № 253: "МСМК выполняется
 * с 14 лет, МС - с 12 лет, КМС - с 10 лет, I, II, III спортивные разряды - с 9 лет,
 * юношеские спортивные разряды - с 8 лет." Приказ № 1092 replaces the table heading
 * and rows 1-43 below that sentence and leaves the sentence itself standing.
 */
export const RANK_MIN_AGE: Record<Rank, number> = {
  YOUTH_3: 8,
  YOUTH_2: 8,
  YOUTH_1: 8,
  ADULT_3: 9,
  ADULT_2: 9,
  ADULT_1: 9,
  CMS: 10,
  MS: 12,
  MSMK: 14,
};
