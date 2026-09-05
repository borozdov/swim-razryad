/**
 * How domain values are printed in Russian. Code speaks English, the interface
 * speaks Russian, and this file is the only crossing between the two.
 */
import type { Pool, Rank, Sex, Stroke } from '@/domain/standards/types';
import type { EventRoute } from './routes';

export const POOL_LABEL: Record<Pool, string> = {
  LCM: 'Бассейн 50 м',
  SCM: 'Бассейн 25 м',
};

/** For a segment the width of a thumb. */
export const POOL_SHORT_LABEL: Record<Pool, string> = {
  LCM: '50 м',
  SCM: '25 м',
};

export const STROKE_LABEL: Record<Stroke, string> = {
  FREE: 'Вольный стиль',
  BACK: 'На спине',
  BREAST: 'Брасс',
  FLY: 'Баттерфляй',
  MEDLEY: 'Комплексное плавание',
};

/** For a chip: five of them share one row of a phone screen. */
export const STROKE_SHORT_LABEL: Record<Stroke, string> = {
  FREE: 'Вольный',
  BACK: 'Спина',
  BREAST: 'Брасс',
  FLY: 'Батт',
  MEDLEY: 'Комплекс',
};

export const SEX_LABEL: Record<Sex, string> = {
  M: 'Мужчины',
  F: 'Женщины',
};

export const SEX_SHORT_LABEL: Record<Sex, string> = {
  M: 'М',
  F: 'Ж',
};

/** The headings of the order's own columns, so a row reads the way the order prints it. */
export const RANK_LABEL: Record<Rank, string> = {
  YOUTH_3: 'III юношеский',
  YOUTH_2: 'II юношеский',
  YOUTH_1: 'I юношеский',
  ADULT_3: 'III спортивный',
  ADULT_2: 'II спортивный',
  ADULT_1: 'I спортивный',
  CMS: 'КМС',
  MS: 'МС',
  MSMK: 'МСМК',
};

/** The bare numeral of a rank, for a scale whose captions already say which group it is in. */
export const RANK_NUMERAL: Record<Rank, string> = {
  YOUTH_3: 'III',
  YOUTH_2: 'II',
  YOUTH_1: 'I',
  ADULT_3: 'III',
  ADULT_2: 'II',
  ADULT_1: 'I',
  CMS: 'КМС',
  MS: 'МС',
  MSMK: 'МСМК',
};

/** The rank spelled out in full, the way a certificate prints it. */
export const RANK_FULL_LABEL: Record<Rank, string> = {
  YOUTH_3: 'III юношеский',
  YOUTH_2: 'II юношеский',
  YOUTH_1: 'I юношеский',
  ADULT_3: 'III спортивный',
  ADULT_2: 'II спортивный',
  ADULT_1: 'I спортивный',
  CMS: 'Кандидат в мастера спорта',
  MS: 'Мастер спорта',
  MSMK: 'Мастер спорта международного класса',
};

/** Shown where a rank the order leaves blank would otherwise print a number. */
export const MISSING_TIME = '—';

/** "Вольный стиль 50 м": the event without the pool. */
export const eventLabel = ({ stroke, distance }: EventRoute): string =>
  `${STROKE_LABEL[stroke]} ${distance} м`;

/**
 * The event as a heading names it: full words, and the pool spelled out. Chips say
 * «Батт» and «50 м» because five of them share a row of a phone; a heading has no such
 * excuse, and «баттерфляй» and «бассейн 50 м» are what a swimmer types into a search.
 */
export const eventHeading = (event: EventRoute): string =>
  `${eventLabel(event)}, ${POOL_LABEL[event.pool].toLowerCase()}`;

/** Russian sets no capital after a colon, and a heading is used on both sides of one. */
export const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

/**
 * Russian picks one of three forms by the last digits, and the teens are the exception:
 * 21 событие, 22 события, 25 событий, but 11 to 14 all take the last form.
 */
export const plural = (count: number, forms: readonly [string, string, string]): string => {
  const tens = count % 100;
  if (tens >= 11 && tens <= 14) return forms[2];
  const ones = count % 10;
  if (ones === 1) return forms[0];
  if (ones >= 2 && ones <= 4) return forms[1];
  return forms[2];
};

/** ISO date to the Russian numeric form, printed monospaced next to the times. */
export const formatIsoDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
};
