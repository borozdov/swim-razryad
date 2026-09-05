'use client';

import { useState, type ReactNode } from 'react';
import { RANK_ORDER } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import type { Distance, Pool, Rank, Sex, StandardRow, Stroke } from '@/domain/standards/types';
import {
  MISSING_TIME,
  POOL_SHORT_LABEL,
  RANK_LABEL,
  SEX_SHORT_LABEL,
  STROKE_SHORT_LABEL,
  eventHeading,
} from '@/lib/labels';
import { Chips, Segmented, Table } from '@/ui';
import s from './StandardsIndex.module.css';

const POOLS: readonly Pool[] = ['SCM', 'LCM'];
const SEXES: readonly Sex[] = ['M', 'F'];
const STROKES: readonly Stroke[] = ['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY'];

const POOL_OPTIONS = POOLS.map((pool) => ({ value: pool, label: POOL_SHORT_LABEL[pool] }));
const SEX_OPTIONS = SEXES.map((sex) => ({ value: sex, label: SEX_SHORT_LABEL[sex] }));
const STROKE_OPTIONS = STROKES.map((stroke) => ({
  value: stroke,
  label: STROKE_SHORT_LABEL[stroke],
}));

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

/** Distances the dataset carries for one pool and stroke, shortest first. */
const distancesOf = (rows: readonly StandardRow[], pool: Pool, stroke: Stroke): Distance[] =>
  [
    ...new Set(rows.filter((r) => r.pool === pool && r.stroke === stroke).map((r) => r.distance)),
  ].sort((a, b) => a - b);

export type StandardsIndexProps = {
  rows: readonly StandardRow[];
};

/**
 * Every row of the dataset ships as its own hidden table, so the page is static and the
 * switches only show and hide. The distance pages stay reachable through the sitemap.
 */
export function StandardsIndex({ rows }: StandardsIndexProps) {
  const [pool, setPool] = useState<Pool>('LCM');
  const [sex, setSex] = useState<Sex>('M');
  const [stroke, setStroke] = useState<Stroke>('FREE');
  const [wanted, setWanted] = useState<Distance>(50);

  const distances = distancesOf(rows, pool, stroke);
  // A change of stroke can strand the distance: snap to the shortest one the stroke has.
  const distance = distances.includes(wanted) ? wanted : distances[0];
  const active = paneKey({ pool, sex, stroke, distance });

  return (
    <div className={s.root}>
      <div className={s.controls}>
        <div className={s.row} data-tour="event">
          <Segmented value={pool} options={POOL_OPTIONS} onChange={setPool} label="Бассейн" />
          <Segmented value={sex} options={SEX_OPTIONS} onChange={setSex} label="Пол" />
        </div>
        <div className={s.row} data-tour="stroke">
          <Chips value={stroke} options={STROKE_OPTIONS} onChange={setStroke} label="Стиль" />
          <Chips
            value={distance}
            options={distances.map((d) => ({ value: d, label: `${d}м` }))}
            onChange={setWanted}
            label="Дистанция"
          />
        </div>
      </div>

      {/*
        The caption of the visible pane, hoisted out of the panes and written once: as a
        per-pane element it would have put seventy of the same line in the markup, sixty-nine
        of them hidden. It names the event and nothing else: the app carries no signposting
        that is there for a search engine rather than for the reader.
      */}
      <h1 className={s.event}>{eventHeading({ pool, stroke, distance })}</h1>

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
