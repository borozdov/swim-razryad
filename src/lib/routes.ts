/**
 * The URL vocabulary of the site, and the vocabulary the calculator writes its query in.
 * A slug is the domain value in lower case, so the two never drift apart and no second
 * table has to be kept in sync.
 */
import type { Distance, Pool, Stroke } from '@/domain/standards/types';

/** One event of the calculator form. Both sexes share it. */
export type EventRoute = {
  pool: Pool;
  stroke: Stroke;
  distance: Distance;
};

/** The event as the query carries it: strings, always lower case. */
export type StandardsParams = {
  pool: string;
  stroke: string;
  distance: string;
};

/** The standards index, the home page: what a swimmer looks up most. */
export const HOME_PATH = '/';

/** The calculator, a secondary page. Trailing slash: static hosting serves directories. */
export const CALCULATOR_PATH = '/kalkulyator/';

/** The QR card of the app. A page to point a camera at, not a section of the site. */
export const QR_PATH = '/qr/';

/** The reference layer: a page per event, and the explainer they all point back to. */
export const STANDARDS_ROOT = '/normativy/';

export const RANKS_PATH = '/razryady/';

const POOLS: readonly Pool[] = ['LCM', 'SCM'];
const STROKES: readonly Stroke[] = ['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY'];
const DISTANCES: readonly Distance[] = [50, 100, 200, 400, 800, 1500];

export const standardsParams = ({ pool, stroke, distance }: EventRoute): StandardsParams => ({
  pool: pool.toLowerCase(),
  stroke: stroke.toLowerCase(),
  distance: String(distance),
});

/** The address of one event's reference page. Trailing slash: the host serves directories. */
export const standardsPath = (event: EventRoute): string => {
  const { pool, stroke, distance } = standardsParams(event);
  return `${STANDARDS_ROOT}${pool}/${stroke}/${distance}/`;
};

/**
 * The calculator already opened on one event. Sex and time are left out on purpose: the
 * form falls back to its defaults for whatever the query does not name, and a reference
 * page knows the event but not who is reading it.
 */
export const calculatorPathFor = (event: EventRoute): string =>
  `${CALCULATOR_PATH}?${new URLSearchParams(standardsParams(event)).toString()}`;

const parsePool = (slug: string): Pool | null =>
  POOLS.find((pool) => pool.toLowerCase() === slug) ?? null;

const parseStroke = (slug: string): Stroke | null =>
  STROKES.find((stroke) => stroke.toLowerCase() === slug) ?? null;

const parseDistance = (slug: string): Distance | null =>
  DISTANCES.find((distance) => String(distance) === slug) ?? null;

/** Null for any triple the vocabulary does not cover, so a link falls back to the defaults. */
export const parseStandardsParams = (params: StandardsParams): EventRoute | null => {
  const pool = parsePool(params.pool);
  const stroke = parseStroke(params.stroke);
  const distance = parseDistance(params.distance);
  if (pool === null || stroke === null || distance === null) return null;
  return { pool, stroke, distance };
};
