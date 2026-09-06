/**
 * The URL vocabulary of the site, and the vocabulary the app writes its query in.
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

/** The app, and its only address: the standards and the calculator are two modes of it. */
export const HOME_PATH = '/';

/**
 * The address the calculator had while it was a page of its own. It is no longer a screen:
 * the page at it forwards into the app, because links to it are out in the world.
 */
export const CALCULATOR_PATH = '/kalkulyator/';

/** The QR card of the app. A page to point a camera at, not a section of the site. */
export const QR_PATH = '/qr/';

/** The reference layer: a page per event, and the explainer they all point back to. */
export const STANDARDS_ROOT = '/normativy/';

export const RANKS_PATH = '/razryady/';

/**
 * Which of the two the app stands in. One address means the query has to say, the same way
 * it says the event: the slug is the value itself, so there is no second table to keep.
 */
export type Mode = 'standards' | 'calculator';

const MODES: readonly Mode[] = ['standards', 'calculator'];

/** What the bare address shows, and therefore the only mode a query never has to name. */
export const DEFAULT_MODE: Mode = 'standards';

/** Null for anything outside the vocabulary, so a hand-written link falls back to the default. */
export const parseMode = (slug: string | null): Mode | null =>
  MODES.find((mode) => mode === slug) ?? null;

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
 * The app opened in one mode, and on one event when the caller knows which. The default
 * mode is the bare address, so only the other one is ever named. Sex and time are left out
 * on purpose: the form falls back to its defaults for whatever the query does not name,
 * and a reference page knows the event but not who is reading it.
 */
export const appPath = (mode: Mode, event?: EventRoute): string => {
  const named = event === undefined ? {} : standardsParams(event);
  const query = new URLSearchParams(mode === DEFAULT_MODE ? named : { mode, ...named }).toString();
  return query === '' ? HOME_PATH : `${HOME_PATH}?${query}`;
};

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
