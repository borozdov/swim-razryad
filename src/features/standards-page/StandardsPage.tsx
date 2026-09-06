import Link from 'next/link';
import { RANK_ORDER } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import type { Distance, Edition, Pool, StandardRow } from '@/domain/standards/types';
import {
  MISSING_TIME,
  POOL_LABEL,
  RANK_LABEL,
  eventHeading,
  eventLabel,
  lowerFirst,
} from '@/lib/labels';
import { HOME_PATH, STANDARDS_ROOT, appPath, standardsPath } from '@/lib/routes';
import type { EventRoute } from '@/lib/routes';
import {
  CAVEATS,
  ladderSentence,
  leadSentence,
  poolSentence,
  stepSentence,
  type EventRows,
} from '@/lib/standardsCopy';
import { Breadcrumbs, Table } from '@/ui';
import s from './StandardsPage.module.css';

const COLUMNS = ['Ступень', 'Мужчины', 'Женщины'];

const time = (row: StandardRow, rank: (typeof RANK_ORDER)[number]): string => {
  const seconds = row.times[rank];
  return seconds === undefined ? MISSING_TIME : formatTime(seconds);
};

/** Slow rank first, the way every ladder in the app reads. */
const rankRows = (rows: EventRows): readonly (readonly string[])[] =>
  RANK_ORDER.map((rank) => [RANK_LABEL[rank], time(rows.M, rank), time(rows.F, rank)]);

export type StandardsPageProps = {
  event: EventRoute;
  rows: EventRows;
  edition: Edition;
  /** The same stroke and pool at every distance the order sets, shortest first. */
  siblings: readonly Distance[];
  /** The same distance in the other pool, when the order sets one. */
  otherPool: { pool: Pool; rows: EventRows } | null;
};

/**
 * One event of the order, read from top to bottom. This is the reference layer, not the
 * app: it scrolls, it names its numbers in the words a search carries, and it links on to
 * the neighbouring distances so a swimmer who wants the next one need not go back to the
 * results page to find it.
 */
export function StandardsPage({ event, rows, edition, siblings, otherPool }: StandardsPageProps) {
  const heading = eventHeading(event);
  const others = siblings.filter((distance) => distance !== event.distance);

  return (
    <article className={s.root}>
      <Breadcrumbs
        items={[
          { label: 'Нормативы', href: HOME_PATH },
          { label: 'Все дистанции', href: STANDARDS_ROOT },
          { label: heading },
        ]}
      />

      <h1 className={s.title}>Нормативы по плаванию: {lowerFirst(heading)}</h1>
      <p className={s.lead}>{leadSentence(event, edition.effectiveFrom)}</p>

      <Table columns={COLUMNS} rows={rankRows(rows)} numericColumns={[1, 2]} />

      <section className={s.prose}>
        <h2 className={s.subhead}>Что говорят эти числа</h2>
        <p>{ladderSentence(rows)}</p>
        <p>{stepSentence(rows, 'CMS', 'MS')}</p>
        <p>{poolSentence(event, rows, otherPool?.rows ?? null, 'CMS')}</p>
        {CAVEATS.map((caveat) => (
          <p key={caveat}>{caveat}</p>
        ))}
      </section>

      <section className={s.links}>
        <h2 className={s.subhead}>Рядом</h2>
        <ul className={s.list}>
          {others.map((distance) => (
            <li key={distance}>
              <Link href={standardsPath({ ...event, distance })} className={s.link}>
                {eventLabel({ ...event, distance })}
              </Link>
            </li>
          ))}
          {otherPool === null ? null : (
            <li>
              <Link href={standardsPath({ ...event, pool: otherPool.pool })} className={s.link}>
                {eventLabel(event)}, {POOL_LABEL[otherPool.pool].toLowerCase()}
              </Link>
            </li>
          )}
          <li>
            <Link href={STANDARDS_ROOT} className={s.link}>
              Все дистанции обоих бассейнов
            </Link>
          </li>
        </ul>
      </section>

      <section className={s.links}>
        <h2 className={s.subhead}>Посчитать своё время</h2>
        <ul className={s.list}>
          <li>
            <Link href={appPath('calculator', event)} className={s.link}>
              Открыть калькулятор на этой дистанции
            </Link>
          </li>
          <li>
            <Link href={appPath('calculator')} className={s.link}>
              Калькулятор разряда по плаванию
            </Link>
          </li>
        </ul>
      </section>

      <p className={s.source}>
        Источник:{' '}
        <a href={edition.order} className={s.link} rel="nofollow noopener">
          приказ Минспорта России № 1092
        </a>
        , приложение № 1.
      </p>
    </article>
  );
}
