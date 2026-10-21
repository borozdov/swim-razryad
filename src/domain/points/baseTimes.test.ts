import { describe, expect, it } from 'vitest';
import { CURRENT_EDITION, eventKey } from '@/domain/standards/registry';
import { BASE_TIME_EDITIONS, BASE_TIMES } from './baseTimes';

describe('the base times', () => {
  it('cover exactly the events of the dataset, both sexes, nothing more', () => {
    expect(Object.keys(BASE_TIMES).sort()).toEqual(CURRENT_EDITION.rows.map(eventKey).sort());
  });

  it('are the world record, so faster than the МСМК standard of every event', () => {
    // A base time that slid onto the wrong sex or stroke would land slower than МСМК somewhere.
    for (const row of CURRENT_EDITION.rows) {
      const base = BASE_TIMES[eventKey(row)] ?? Number.POSITIVE_INFINITY;
      expect({ key: eventKey(row), faster: base < (row.times.MSMK ?? 0) }).toEqual({
        key: eventKey(row),
        faster: true,
      });
    }
  });

  it('come from tables still in force today', () => {
    // The 25 m table changes on 1 September and the 50 m one on 1 January. When this goes red,
    // take the new table from worldaquatics.com/swimming/points and update baseTimes.ts.
    const today = new Date().toISOString().slice(0, 10);

    for (const [pool, { from, to }] of Object.entries(BASE_TIME_EDITIONS)) {
      expect({ pool, inForce: from <= today && today <= to }).toEqual({ pool, inForce: true });
    }
  });
});
