import type { Distance, Pool, Rank, Sex, StandardRow, Stroke } from '@/domain/standards/types';

/**
 * How one printed line of приказ № 1092 becomes a StandardRow. Both pools sit in the
 * same table of приложение № 1 and share its columns, so the column order is stated
 * once here rather than once per pool.
 */

/** Columns of the order's table, left to right. */
const ORDER_COLUMNS: readonly Rank[] = [
  'MSMK',
  'MS',
  'CMS',
  'ADULT_1',
  'ADULT_2',
  'ADULT_3',
  'YOUTH_1',
  'YOUTH_2',
  'YOUTH_3',
] as const;

/** One printed row. `null` is a dash in the order and drops the rank from `times`. */
export type PrintedRow = readonly (string | null)[];

const toSeconds = (printed: string): number => {
  const parts = /^(?:(\d{1,2}):)?(\d{1,2})[.,](\d{2})$/.exec(printed);
  if (parts === null) throw new Error(`Time is not in the order's notation: ${printed}`);
  const [, minutes = '0', seconds, hundredths] = parts;
  return (Number(minutes) * 6000 + Number(seconds) * 100 + Number(hundredths)) / 100;
};

export const transcribe = (
  pool: Pool,
  sex: Sex,
  stroke: Stroke,
  distance: Distance,
  printed: PrintedRow,
): StandardRow => {
  if (printed.length !== ORDER_COLUMNS.length) {
    throw new Error(`Expected ${ORDER_COLUMNS.length} columns for ${sex} ${stroke} ${distance}`);
  }
  const times: Partial<Record<Rank, number>> = {};
  ORDER_COLUMNS.forEach((rank, column) => {
    const cell = printed[column];
    if (cell !== null && cell !== undefined) times[rank] = toSeconds(cell);
  });
  return { pool, sex, stroke, distance, times };
};
