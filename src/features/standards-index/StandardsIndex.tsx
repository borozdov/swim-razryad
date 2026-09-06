import type { ReactNode } from 'react';
import { RANK_ORDER } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import type { Rank, Sex, StandardRow } from '@/domain/standards/types';
import { MISSING_TIME, RANK_LABEL, eventHeading } from '@/lib/labels';
import type { EventRoute } from '@/lib/routes';
import { Table } from '@/ui';
import s from './StandardsIndex.module.css';

const COLUMNS = ['Ступень', 'Норматив'];

const paneKey = (row: Pick<StandardRow, 'pool' | 'sex' | 'stroke' | 'distance'>): string =>
  `${row.pool}|${row.sex}|${row.stroke}|${row.distance}`;

/** Youth, adult, title: the rank column shows which of the three runs a row belongs to. */
const rankTone = (rank: Rank): string => {
  if (rank === 'CMS' || rank === 'MS' || rank === 'MSMK') return s.title;
  if (rank === 'ADULT_3' || rank === 'ADULT_2' || rank === 'ADULT_1') return s.adult;
  return s.youth;
};

/** Slow rank first: the table reads as the climb the scale describes. */
const rankRows = (row: StandardRow): readonly (readonly ReactNode[])[] =>
  RANK_ORDER.map((rank) => {
    const time = row.times[rank];
    return [
      <span key={rank} className={rankTone(rank)}>
        {RANK_LABEL[rank]}
      </span>,
      // A rank the order leaves blank has no key at all, and prints as a dash.
      time === undefined ? MISSING_TIME : formatTime(time),
    ];
  });

export type StandardsIndexProps = {
  rows: readonly StandardRow[];
  event: EventRoute;
  sex: Sex;
};

/**
 * Every row of the dataset ships as its own hidden table, so the page is static and the
 * switches above only show and hide. The distance pages stay reachable through the sitemap.
 */
export function StandardsIndex({ rows, event, sex }: StandardsIndexProps) {
  const active = paneKey({ ...event, sex });

  return (
    <div className={s.root}>
      {/*
        The heading of the page: the event named once above its table. As a per-pane element
        it would have put seventy of the same line in the markup, sixty-nine of them hidden.
        It names the event and nothing else: the app carries no signposting that is there for
        a search engine rather than for the reader. The chips above say «Батт» and «50 м»,
        because five of them share the width of a phone; this says «баттерфляй» and
        «бассейн 50 м», because that is how it is searched for.
      */}
      <h1 className={s.event}>{eventHeading(event)}</h1>

      {rows.map((row) => {
        const key = paneKey(row);
        return (
          <div key={key} className={s.pane} hidden={key !== active}>
            <Table columns={COLUMNS} rows={rankRows(row)} numericColumns={[1]} compact />
          </div>
        );
      })}
    </div>
  );
}
