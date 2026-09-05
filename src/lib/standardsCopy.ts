/**
 * The prose of a reference page, computed from the dataset rather than written per page.
 *
 * Every sentence here states a number the order itself sets, or a difference between two
 * of them. Nothing is padded to a length: Yandex names an artificially inflated text a
 * violation of its own, and a paragraph that says nothing new about this event would be
 * the same paragraph on the other thirty-four pages.
 */
import { formatTime } from '@/domain/points/time';
import type { Pool, Rank, StandardRow } from '@/domain/standards/types';
import { RANK_LABEL, eventHeading, formatIsoDate, lowerFirst } from './labels';
import type { EventRoute } from './routes';

/** Both sexes of one event, as the order prints them side by side. */
export type EventRows = {
  M: StandardRow;
  F: StandardRow;
};

const SLOWEST: Rank = 'YOUTH_3';
const FASTEST: Rank = 'MSMK';

const OTHER_POOL: Record<Pool, Pool> = { LCM: 'SCM', SCM: 'LCM' };

/** The length of the pool as a sentence spells it, so no case has to be declined. */
const metres = (pool: Pool): string => (pool === 'LCM' ? '50' : '25');

/** Both sexes, in the order the table shows them and in the case a sentence needs. */
const SEXES = [
  { sex: 'M', of: 'мужчин' },
  { sex: 'F', of: 'женщин' },
] as const;

/** A difference between two times, printed the way a time is. Never negative. */
const difference = (a: number, b: number): string =>
  formatTime(Math.round(Math.abs(a - b) * 100) / 100);

/**
 * What the page holds, in the words the event is searched with. The edition date stands
 * here instead of a year in the title: приказ № 1092 sets no end date, and a year would
 * have to be edited every January to stay true.
 */
export const leadSentence = (event: EventRoute, effectiveFrom: string): string =>
  [
    `Разрядные нормативы ЕВСК по плаванию: ${lowerFirst(eventHeading(event))}.`,
    'Мужчины и женщины, девять ступеней от III юношеского разряда до МСМК.',
    'Числа взяты из приложения № 1 к приказу Минспорта России № 1092,',
    `редакция действует с ${formatIsoDate(effectiveFrom)}.`,
  ].join(' ');

/** The span of the ladder here: what the first rung asks and what the last one does. */
export const ladderSentence = (rows: EventRows): string => {
  const parts = SEXES.flatMap(({ sex, of }) => {
    const slowest = rows[sex].times[SLOWEST];
    const fastest = rows[sex].times[FASTEST];
    if (slowest === undefined || fastest === undefined) return [];
    return [
      `у ${of} она идёт от ${formatTime(slowest)} на ${RANK_LABEL[SLOWEST]} разряд ` +
        `до ${formatTime(fastest)} на ${RANK_LABEL[FASTEST]}, это ${difference(slowest, fastest)} разницы`,
    ];
  });
  return parts.length === 0 ? '' : `Лестница разрядов: ${parts.join('; ')}.`;
};

/**
 * The step a swimmer stands on once the rank starts to matter. It is the shortest gap on
 * the ladder and the one no table of times prints, because it has to be subtracted.
 */
export const stepSentence = (rows: EventRows, from: Rank, to: Rank): string => {
  const parts = SEXES.flatMap(({ sex, of }) => {
    const start = rows[sex].times[from];
    const end = rows[sex].times[to];
    if (start === undefined || end === undefined) return [];
    return [`${difference(start, end)} у ${of}`];
  });
  return parts.length === 0
    ? ''
    : `Между ${RANK_LABEL[from]} и ${RANK_LABEL[to]} на этой дистанции ${parts.join(' и ')}.`;
};

/**
 * The same event in the other pool. Twenty-five metres gives twice the turns, so the order
 * sets it faster, and by how much is the one thing a table of a single pool cannot answer.
 */
export const poolSentence = (
  event: EventRoute,
  here: EventRows,
  there: EventRows | null,
  rank: Rank,
): string => {
  const other = OTHER_POOL[event.pool];
  if (there === null) {
    return `В бассейне ${metres(other)} м этой дистанции приказ не устанавливает.`;
  }
  const parts = SEXES.flatMap(({ sex, of }) => {
    const mine = here[sex].times[rank];
    const theirs = there[sex].times[rank];
    if (mine === undefined || theirs === undefined) return [];
    const slower = theirs > mine ? 'медленнее' : 'быстрее';
    return [`у ${of} ${formatTime(theirs)}, на ${difference(mine, theirs)} ${slower}`];
  });
  return parts.length === 0
    ? ''
    : `В бассейне ${metres(other)} м тот же норматив ${RANK_LABEL[rank]}: ${parts.join('; ')}.`;
};

/**
 * What the numbers on this page are not. A time equal to a standard is not a rank, and the
 * points the calculator prints are this app's own scale, not an official status.
 */
export const CAVEATS: readonly string[] = [
  'Норматив, это время. Разряд присваивают по протоколу соревнования, и таблица его не выдаёт.',
  'Очки калькулятора, это внутренняя шкала приложения, а не официальный статус и не таблица World Aquatics.',
];
