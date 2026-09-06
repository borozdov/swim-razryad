import { describe, expect, it } from 'vitest';
import { APP_DEFAULTS, distancesFor, fromQuery, toQuery } from './useAppState';
import type { AppState } from './useAppState';

/** A shared result: the state a link has to carry there and back, mode included. */
const SHARED: AppState = {
  mode: 'calculator',
  pool: 'SCM',
  stroke: 'BREAST',
  distance: 200,
  sex: 'F',
  time: '2:37.45',
};

describe('the query a screen travels as', () => {
  it('restores every field of the state', () => {
    expect(fromQuery(toQuery(SHARED))).toEqual(SHARED);
  });

  it('restores a state that names no time', () => {
    expect(fromQuery(toQuery(APP_DEFAULTS))).toEqual(APP_DEFAULTS);
  });

  it('spells the state in the vocabulary of the standards URLs', () => {
    expect(toQuery(SHARED)).toBe(
      'pool=scm&stroke=breast&distance=200&sex=f&mode=calculator&time=2%3A37.45',
    );
  });

  /* The bare address already stands in the default mode, so naming it would say nothing. */
  it('writes no mode while the app stands in the one the address shows', () => {
    const standards: AppState = { ...SHARED, mode: 'standards' };

    expect(toQuery(standards)).toBe('pool=scm&stroke=breast&distance=200&sex=f&time=2%3A37.45');
    expect(fromQuery(toQuery(standards)).mode).toBe('standards');
  });

  it('reads a query written by hand', () => {
    expect(fromQuery('?mode=calculator&pool=lcm&stroke=free&distance=50&sex=m&time=25.20')).toEqual(
      {
        mode: 'calculator',
        pool: 'LCM',
        stroke: 'FREE',
        distance: 50,
        sex: 'M',
        time: '25.20',
      },
    );
  });

  it('falls back to the defaults on an empty query', () => {
    expect(fromQuery('')).toEqual(APP_DEFAULTS);
  });

  it('falls back to the defaults on values outside the vocabulary', () => {
    expect(fromQuery('?mode=table&pool=olympic&stroke=butterfly&distance=75&sex=x&age=99')).toEqual(
      APP_DEFAULTS,
    );
  });

  it('snaps a distance the event does not have to one the dataset carries', () => {
    // The order sets no 50 m medley, so the link lands on the shortest one it does set.
    const restored = fromQuery('?pool=lcm&stroke=medley&distance=50&sex=m');

    expect(restored.stroke).toBe('MEDLEY');
    expect(distancesFor('LCM', 'MEDLEY')).not.toContain(50);
    expect(restored.distance).toBe(distancesFor('LCM', 'MEDLEY')[0]);
  });
});

describe('distancesFor', () => {
  it('offers only distances the dataset carries, shortest first', () => {
    expect(distancesFor('LCM', 'FREE')).toEqual([50, 100, 200, 400, 800, 1500]);
    expect(distancesFor('SCM', 'MEDLEY')).toEqual([100, 200, 400]);
  });

  it('offers the 100 m medley in the 25 m pool only', () => {
    expect(distancesFor('LCM', 'MEDLEY')).toEqual([200, 400]);
  });
});
