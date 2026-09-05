/**
 * The crossing between the domain's English and the interface's Russian. The two helpers
 * here decide how a heading and a count read, and both are easy to get subtly wrong.
 */
import { describe, expect, it } from 'vitest';
import { eventHeading, lowerFirst, plural } from './labels';

const EVENTS = ['событие', 'события', 'событий'] as const;

describe('a heading of an event', () => {
  it('spells the stroke and the pool out: nobody searches for the shorthand on a chip', () => {
    expect(eventHeading({ pool: 'SCM', stroke: 'FLY', distance: 100 })).toBe(
      'Баттерфляй 100 м, бассейн 25 м',
    );
  });

  it('drops its capital where a sentence puts it after a colon', () => {
    expect(lowerFirst('Баттерфляй 100 м')).toBe('баттерфляй 100 м');
    expect(lowerFirst('')).toBe('');
  });
});

describe('a count in Russian', () => {
  it('takes the singular on one, and on every number ending in one', () => {
    for (const count of [1, 21, 101, 1001]) expect(plural(count, EVENTS)).toBe('событие');
  });

  it('takes the second form on two through four', () => {
    for (const count of [2, 3, 4, 22, 34]) expect(plural(count, EVENTS)).toBe('события');
  });

  /* The teens are the exception that catches every naive rule: 11 is not 1, 12 is not 2. */
  it('takes the third form on the teens and on five and up', () => {
    for (const count of [0, 5, 11, 12, 13, 14, 35, 111, 112]) {
      expect(plural(count, EVENTS)).toBe('событий');
    }
  });
});
