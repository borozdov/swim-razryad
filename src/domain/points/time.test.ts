import { describe, expect, it } from 'vitest';
import { CURRENT_EDITION } from '@/domain/standards/registry';
import { formatTime, parseTime } from './time';

describe('parseTime accepts the notation of a swim result', () => {
  it.each([
    ['55.80', 55.8],
    ['59.99', 59.99],
    ['1:00.00', 60],
    ['01:00.00', 60],
    ['1:04.60', 64.6],
    ['15:06.19', 906.19],
    ['38:42.50', 2322.5],
  ])('reads %s as %s seconds', (input, seconds) => {
    expect(parseTime(input)).toBe(seconds);
  });

  it.each([
    ['1:04,60', 64.6],
    ['23,20', 23.2],
  ])('reads the comma of the order in %s', (input, seconds) => {
    expect(parseTime(input)).toBe(seconds);
  });

  it('ignores padding around the input', () => {
    expect(parseTime('  23.20  ')).toBe(23.2);
  });
});

describe('parseTime reads a time while it is still being typed', () => {
  it.each([
    ['58', 58],
    ['9', 9],
    ['58.3', 58.3],
    ['58,3', 58.3],
    ['1:02', 62],
    ['1:02.3', 62.3],
    ['1:2', 62],
    ['1:2.3', 62.3],
    ['102.34', 102.34],
    ['1.02.34', 62.34],
    ['1,02,34', 62.34],
  ])('reads %s as %s seconds', (input, seconds) => {
    expect(parseTime(input)).toBe(seconds);
  });

  it.each([
    ['1.02', 62],
    ['1.21', 81],
    ['1.2', 80],
    ['15.06', 906],
    ['19.59', 1199],
    ['19.99', 19.99],
    ['20.00', 20],
    ['21.18', 21.18],
  ])('reads %s under twenty as minutes and seconds, %s', (input, seconds) => {
    expect(parseTime(input)).toBe(seconds);
  });

  it.each([
    ['102', 1.02],
    ['1023', 10.23],
    ['10234', 62.34],
    ['150619', 906.19],
  ])('reads bare digits %s as the packed mmsshh %s', (input, seconds) => {
    expect(parseTime(input)).toBe(seconds);
  });

  it('agrees on one time whatever notation it arrives in', () => {
    const readings = ['1:02.34', '1.02.34', '1,02,34', '10234', '62.34'].map(parseTime);
    expect(new Set(readings).size).toBe(1);
  });
});

describe('parseTime rejects everything else', () => {
  it.each([
    ['', 'empty'],
    ['   ', 'blank'],
    ['abc', 'letters'],
    ['25.400', 'three hundredth digits'],
    ['1:60.00', 'seconds reaching a minute after the colon'],
    ['1:60', 'seconds reaching a minute, no fraction'],
    ['1:2:03.00', 'hours'],
    ['1234567', 'seven bare digits'],
    ['1000.00', 'four second digits'],
    ['-25.00', 'negative'],
    ['25.00s', 'trailing unit'],
    ['+25.00', 'leading sign'],
    ['25..00', 'doubled decimal mark'],
    ['00.00', 'zero, which is not a swim'],
    ['0:00.00', 'zero written with minutes'],
  ])('rejects %s (%s)', (input) => {
    expect(parseTime(input)).toBeNull();
  });
});

describe('formatTime prints the notation of the order', () => {
  it.each([
    [21.91, '21.91'],
    [0, '0.00'],
    [9.9, '9.90'],
    [59.99, '59.99'],
    [60, '1:00.00'],
    [64.6, '1:04.60'],
    [906.19, '15:06.19'],
    [2322.5, '38:42.50'],
  ])('prints %s seconds as %s', (seconds, printed) => {
    expect(formatTime(seconds)).toBe(printed);
  });

  it('carries a rounded hundredth over into the next minute', () => {
    expect(formatTime(59.999)).toBe('1:00.00');
  });

  it.each([[-1], [Number.NaN], [Number.POSITIVE_INFINITY]])('refuses %s', (seconds) => {
    expect(() => formatTime(seconds)).toThrow(RangeError);
  });
});

describe('the two directions agree', () => {
  it('round-trips every time in the edition', () => {
    const times = CURRENT_EDITION.rows.flatMap((row) => Object.values(row.times));

    expect(times.length).toBeGreaterThan(0);
    for (const seconds of times) {
      expect(parseTime(formatTime(seconds))).toBe(seconds);
    }
  });
});
