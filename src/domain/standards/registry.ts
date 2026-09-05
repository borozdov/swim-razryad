import { EDITION_2024_11_26 } from './editions/2024-11-26';
import type { Distance, Edition, Pool, Sex, StandardRow, Stroke } from './types';

export const CURRENT_EDITION: Edition = EDITION_2024_11_26;

export type EventSelector = {
  pool: Pool;
  sex: Sex;
  stroke: Stroke;
  distance: Distance;
};

export type EventKey = `${Pool}|${Sex}|${Stroke}|${Distance}`;

export const eventKey = ({ pool, sex, stroke, distance }: EventSelector): EventKey =>
  `${pool}|${sex}|${stroke}|${distance}`;

// Built once per module. This is the whole index, there is no database.
const rowsByEvent: ReadonlyMap<EventKey, StandardRow> = new Map(
  CURRENT_EDITION.rows.map((row) => [eventKey(row), row]),
);

export const findStandard = (event: EventSelector): StandardRow | undefined =>
  rowsByEvent.get(eventKey(event));

/** One event of the dataset: sex does not open a separate one. */
export type Event = Pick<StandardRow, 'pool' | 'stroke' | 'distance'>;

/**
 * Every event the edition carries, once. The calculator offers exactly these, so a stroke
 * the order does not set at some distance can never be chosen.
 */
export const listEvents = (): readonly Event[] => {
  const seen = new Set<string>();
  const events: Event[] = [];
  for (const { pool, stroke, distance } of CURRENT_EDITION.rows) {
    const key = `${pool}|${stroke}|${distance}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({ pool, stroke, distance });
  }
  return events;
};
