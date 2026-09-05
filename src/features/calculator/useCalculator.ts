'use client';

import { useEffect, useState } from 'react';
import { calculate } from '@/domain/points/calculate';
import { parseTime } from '@/domain/points/time';
import type {
  Distance,
  PointsResult,
  Pool,
  Sex,
  StandardRow,
  Stroke,
} from '@/domain/standards/types';
import { findStandard, listEvents } from '@/domain/standards/registry';
import { parseStandardsParams, standardsParams } from '@/lib/routes';
import type { EventRoute } from '@/lib/routes';

/** Everything the form holds. The event triple is the same one the URLs of the standards pages name. */
export type CalculatorState = EventRoute & {
  sex: Sex;
  /** Raw text as typed. Parsing into seconds lives in domain/points/time.ts. */
  time: string;
};

/** The check row of the order: men, 50 m pool, freestyle 50 m. */
export const CALCULATOR_DEFAULTS: CalculatorState = {
  pool: 'LCM',
  stroke: 'FREE',
  distance: 50,
  sex: 'M',
  time: '',
};

const EVENTS = listEvents();

/** Distances the dataset carries for one pool and stroke, shortest first. */
export const distancesFor = (pool: Pool, stroke: Stroke): readonly Distance[] =>
  EVENTS.filter((event) => event.pool === pool && event.stroke === stroke)
    .map((event) => event.distance)
    .sort((a, b) => a - b);

/** Snap to a distance the dataset carries: a change of stroke can strand the current one. */
const withEvent = (state: CalculatorState): CalculatorState => {
  const distances = distancesFor(state.pool, state.stroke);
  if (distances.length === 0 || distances.includes(state.distance)) return state;
  return { ...state, distance: distances[0] };
};

const SEX_SLUG: Record<Sex, string> = { M: 'm', F: 'f' };

const parseSex = (slug: string | null): Sex | null => {
  if (slug === SEX_SLUG.M) return 'M';
  if (slug === SEX_SLUG.F) return 'F';
  return null;
};

/** The form state as a query string, so a result travels as a link. */
export const toQuery = (state: CalculatorState): string => {
  const { pool, stroke, distance } = standardsParams(state);
  const params = new URLSearchParams({ pool, stroke, distance, sex: SEX_SLUG[state.sex] });
  if (state.time !== '') params.set('time', state.time);
  return params.toString();
};

/** Total by construction: anything the vocabulary does not cover falls back to the default. */
export const fromQuery = (search: string): CalculatorState => {
  const params = new URLSearchParams(search);
  const route =
    parseStandardsParams({
      pool: params.get('pool') ?? '',
      stroke: params.get('stroke') ?? '',
      distance: params.get('distance') ?? '',
    }) ?? CALCULATOR_DEFAULTS;

  return withEvent({
    pool: route.pool,
    stroke: route.stroke,
    distance: route.distance,
    sex: parseSex(params.get('sex')) ?? CALCULATOR_DEFAULTS.sex,
    time: params.get('time') ?? CALCULATOR_DEFAULTS.time,
  });
};

export type Calculator = {
  state: CalculatorState;
  update: (patch: Partial<CalculatorState>) => void;
  /** Distances offered for the current pool and stroke. */
  distances: readonly Distance[];
  /** Null while the text is not a swim time the notation accepts. */
  seconds: number | null;
  /** Null when the time is unreadable or the dataset carries no such event. */
  result: PointsResult | null;
  /** The row of the order behind the result, so the plate can print the standards themselves. */
  standard: StandardRow | undefined;
};

export function useCalculator(): Calculator {
  const [state, setState] = useState<CalculatorState>(CALCULATOR_DEFAULTS);

  // The URL is read once, after hydration. The prerendered markup always carries the
  // defaults, so reading window.location while rendering would not match it.
  useEffect(() => {
    setState(fromQuery(window.location.search));
  }, []);

  const apply = (next: CalculatorState): void => {
    setState(next);
    // replaceState, not the router: the query is form state, not a navigation.
    window.history.replaceState(null, '', `?${toQuery(next)}`);
  };

  const seconds = parseTime(state.time);
  // No age: the form asks for none, so every rank the time earns counts as achieved.
  const result =
    seconds === null
      ? null
      : calculate({
          pool: state.pool,
          sex: state.sex,
          stroke: state.stroke,
          distance: state.distance,
          seconds,
        });

  return {
    state,
    update: (patch) => apply(withEvent({ ...state, ...patch })),
    distances: distancesFor(state.pool, state.stroke),
    seconds,
    result,
    standard: findStandard({
      pool: state.pool,
      sex: state.sex,
      stroke: state.stroke,
      distance: state.distance,
    }),
  };
}
