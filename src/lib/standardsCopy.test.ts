/**
 * The prose of a reference page has to be true and it has to be its own. These check the
 * first by reading the numbers back out of the dataset, and the second by making sure no
 * two events end up with the same paragraph.
 */
import { describe, expect, it } from 'vitest';
import { formatTime } from '@/domain/points/time';
import { CURRENT_EDITION, findStandard, listEvents } from '@/domain/standards/registry';
import type { EventRoute } from './routes';
import { ladderSentence, leadSentence, poolSentence, stepSentence } from './standardsCopy';
import type { EventRows } from './standardsCopy';

const rowsOf = (event: EventRoute): EventRows => {
  const M = findStandard({ ...event, sex: 'M' });
  const F = findStandard({ ...event, sex: 'F' });
  if (M === undefined || F === undefined) throw new Error('event is not in the dataset');
  return { M, F };
};

/** 100 m breaststroke, short course: the one distance the long course does not carry. */
const SCM_BREAST_100: EventRoute = { pool: 'SCM', stroke: 'BREAST', distance: 100 };
const SCM_MEDLEY_100: EventRoute = { pool: 'SCM', stroke: 'MEDLEY', distance: 100 };

describe('what a reference page says about its event', () => {
  it('names the order and the edition the numbers come from', () => {
    const lead = leadSentence(SCM_BREAST_100, CURRENT_EDITION.effectiveFrom);

    expect(lead).toContain('брасс 100 м, бассейн 25 м');
    expect(lead).toContain('№ 1092');
    expect(lead).toContain('26.11.2024');
  });

  it('spans the ladder with the two times the order really sets', () => {
    const rows = rowsOf(SCM_BREAST_100);
    const sentence = ladderSentence(rows);

    for (const sex of ['M', 'F'] as const) {
      expect(sentence).toContain(formatTime(rows[sex].times.YOUTH_3 ?? 0));
      expect(sentence).toContain(formatTime(rows[sex].times.MSMK ?? 0));
    }
  });

  /* The gap between КМС and МС is the one number a table of times never prints. */
  it('subtracts the step between two rungs for both sexes', () => {
    const rows = rowsOf(SCM_BREAST_100);
    const sentence = stepSentence(rows, 'CMS', 'MS');

    for (const sex of ['M', 'F'] as const) {
      const gap = (rows[sex].times.CMS ?? 0) - (rows[sex].times.MS ?? 0);
      expect(sentence).toContain(formatTime(Math.round(gap * 100) / 100));
    }
  });

  it('compares the pools, and says so when the other pool has no such event', () => {
    const here = rowsOf(SCM_BREAST_100);
    const there = rowsOf({ ...SCM_BREAST_100, pool: 'LCM' });

    expect(poolSentence(SCM_BREAST_100, here, there, 'CMS')).toContain(
      formatTime(there.M.times.CMS ?? 0),
    );
    expect(poolSentence(SCM_MEDLEY_100, rowsOf(SCM_MEDLEY_100), null, 'CMS')).toBe(
      'В бассейне 50 м этой дистанции приказ не устанавливает.',
    );
  });

  /*
    Thirty-five pages that share a paragraph are thirty-four near-duplicates, which is the
    thin content both engines name. Every event has to get its own numbers.
  */
  it('writes a different paragraph for every event of the edition', () => {
    const paragraphs = listEvents().map((event) => {
      const rows = rowsOf(event);
      return [ladderSentence(rows), stepSentence(rows, 'CMS', 'MS')].join(' ');
    });

    expect(new Set(paragraphs).size).toBe(paragraphs.length);
  });
});
