/**
 * The explainer page states one thing the order does not: how the two pools are set
 * against each other. It has to be measured, not asserted, so this reads the measurement
 * back out of the dataset.
 */
import { describe, expect, it } from 'vitest';
import { CURRENT_EDITION, findStandard, listEvents } from '@/domain/standards/registry';
import { poolSpread, poolSpreadSentence, youthSpreadSentence } from './ranksCopy';

const bothPools = listEvents().filter(
  (event) =>
    event.pool === 'LCM' &&
    listEvents().some(
      (other) =>
        other.pool === 'SCM' && other.stroke === event.stroke && other.distance === event.distance,
    ),
);

describe('how the two pools are set against each other', () => {
  it('measures every event and sex the two pools share', () => {
    expect(poolSpread(CURRENT_EDITION, 'CMS').pairs).toBe(bothPools.length * 2);
  });

  it('agrees with the two times it is derived from', () => {
    const spread = poolSpread(CURRENT_EDITION, 'CMS');
    const ratios = bothPools.flatMap((event) =>
      (['M', 'F'] as const).flatMap((sex) => {
        const long = findStandard({ ...event, sex })?.times.CMS;
        const short = findStandard({ ...event, pool: 'SCM', sex })?.times.CMS;
        return long === undefined || short === undefined ? [] : [((long - short) / long) * 100];
      }),
    );

    expect(spread.min).toBeCloseTo(Math.min(...ratios), 1);
    expect(spread.max).toBeCloseTo(Math.max(...ratios), 1);
    expect(spread.min).toBeLessThanOrEqual(spread.median);
    expect(spread.median).toBeLessThanOrEqual(spread.max);
  });

  /*
    The claim the page makes is that the ratio holds at КМС and does not at the bottom
    rung. If an edition ever made the bottom rung consistent too, the sentence would be
    wrong and this fails rather than lying on thirty-five pages.
  */
  it('holds at КМС and comes apart at the bottom rung, which is what the page says', () => {
    expect(poolSpread(CURRENT_EDITION, 'CMS').min).toBeGreaterThan(0);
    expect(poolSpread(CURRENT_EDITION, 'YOUTH_3').min).toBeLessThan(0);
  });

  it('prints a real minus, since the sign is the whole point of the second sentence', () => {
    const youth = poolSpread(CURRENT_EDITION, 'YOUTH_3');

    expect(youthSpreadSentence(youth, 'YOUTH_3')).toContain('−');
    expect(poolSpreadSentence(poolSpread(CURRENT_EDITION, 'CMS'), 'CMS')).toContain('КМС');
  });
});
