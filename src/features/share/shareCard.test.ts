import { describe, expect, it } from 'vitest';
import { calculate } from '@/domain/points/calculate';
import type { EventRoute } from '@/lib/routes';
import { NO_RANK, buildShareCard, shareFileName } from './shareCard';

/** The check row of приказ № 1092: men, 50 m pool, freestyle 50 m. I разряд is 25.20. */
const EVENT: EventRoute = { pool: 'LCM', stroke: 'FREE', distance: 50 };

const cardFor = (seconds: number) => {
  const result = calculate({ ...EVENT, sex: 'M', seconds });
  expect(result).not.toBeNull();
  return buildShareCard(EVENT, result!, seconds);
};

describe('the card a result is shared as', () => {
  it('names the event, the pool, the rank, the time and the points', () => {
    expect(cardFor(25.2)).toEqual({
      event: 'Вольный стиль 50 м',
      pool: 'Бассейн 50 м',
      rank: 'I спортивный',
      time: '25.20',
      points: '600',
      gap: 'до КМС 1.25 с',
    });
  });

  it('says there is no rank yet instead of leaving the line empty', () => {
    expect(cardFor(90).rank).toBe(NO_RANK);
  });

  it('leaves out the gap above МСМК, where there is nothing left to reach', () => {
    expect(cardFor(21).gap).toBeNull();
  });

  it('names the saved file after the swim, with no character a file system refuses', () => {
    expect(shareFileName(cardFor(64.6))).toBe('razryad-1-04-60.png');
  });
});
