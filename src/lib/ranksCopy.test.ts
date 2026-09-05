/**
 * The explainer page states one thing the order does not: how the two pools are set
 * against each other. It has to be measured, not asserted, so this reads the measurement
 * back out of the dataset.
 */
import { describe, expect, it } from 'vitest';
import { RANK_ORDER } from '@/domain/points/scale';
import { CURRENT_EDITION, findStandard, listEvents } from '@/domain/standards/registry';
import { poolSpread, poolSpreadSentence, spreadGrowsSentence } from './ranksCopy';

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
    Короткая вода поставлена быстрее на каждой ступени без исключений. Это утверждение
    страницы, и держать его должен тест: первая же редакция, где какое-то событие выпадет
    в минус, обязана уронить сборку, а не тихо сделать текст неправдой.
  */
  it('never sets the short course slower, on any rung', () => {
    for (const rank of RANK_ORDER) {
      expect(poolSpread(CURRENT_EDITION, rank).min).toBeGreaterThan(0);
    }
  });

  /*
    Второе утверждение страницы: фора растёт со ступенью. Проверяется по медиане, а не по
    краям — один выброс на длинной дистанции края и так растягивает.
  */
  it('grows with the rung, which is the claim the page makes', () => {
    const medians = RANK_ORDER.map((rank) => poolSpread(CURRENT_EDITION, rank).median);

    expect(medians.at(-1)).toBeGreaterThan(medians[0] * 2);
    expect(
      spreadGrowsSentence(
        poolSpread(CURRENT_EDITION, 'YOUTH_3'),
        poolSpread(CURRENT_EDITION, 'MSMK'),
        'YOUTH_3',
        'MSMK',
      ),
    ).toContain('МСМК');
    expect(poolSpreadSentence(poolSpread(CURRENT_EDITION, 'CMS'), 'CMS')).toContain('КМС');
  });
});
