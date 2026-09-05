import Link from 'next/link';
import type { Event } from '@/domain/standards/registry';
import type { Edition, Pool, Stroke } from '@/domain/standards/types';
import { POOL_LABEL, STROKE_LABEL, formatIsoDate, plural } from '@/lib/labels';
import { CALCULATOR_PATH, HOME_PATH, RANKS_PATH, standardsPath } from '@/lib/routes';
import { Breadcrumbs } from '@/ui';
import s from './StandardsHub.module.css';

const POOLS: readonly Pool[] = ['SCM', 'LCM'];
const STROKES: readonly Stroke[] = ['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY'];

export type StandardsHubProps = {
  events: readonly Event[];
  edition: Edition;
};

/**
 * The directory of the reference layer. Without it every event page is an orphan reachable
 * only through the sitemap, and a crawler treats a page nothing links to as a page nothing
 * needs. It is also the shortest answer to «нормативы по плаванию 25 метров»: the whole
 * pool on one screen of links.
 */
export function StandardsHub({ events, edition }: StandardsHubProps) {
  return (
    <article className={s.root}>
      <Breadcrumbs items={[{ label: 'Нормативы', href: HOME_PATH }, { label: 'Все дистанции' }]} />

      <h1 className={s.title}>Все дистанции: нормативы по плаванию</h1>
      <p className={s.lead}>
        {events.length} {plural(events.length, ['событие', 'события', 'событий'])} приказа Минспорта
        России № 1092, по странице на каждое: девять ступеней, мужчины и женщины. Редакция действует
        с {formatIsoDate(edition.effectiveFrom)}.
      </p>

      {POOLS.map((pool) => (
        <section key={pool} className={s.pool}>
          <h2 className={s.subhead}>{POOL_LABEL[pool]}</h2>
          {STROKES.map((stroke) => {
            const distances = events
              .filter((event) => event.pool === pool && event.stroke === stroke)
              .map((event) => event.distance)
              .sort((a, b) => a - b);
            if (distances.length === 0) return null;
            return (
              <div key={stroke} className={s.stroke}>
                <h3 className={s.strokeName}>{STROKE_LABEL[stroke]}</h3>
                <ul className={s.distances}>
                  {distances.map((distance) => (
                    <li key={distance}>
                      <Link href={standardsPath({ pool, stroke, distance })} className={s.chip}>
                        {distance} м
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      ))}

      <section className={s.links}>
        <h2 className={s.subhead}>Дальше</h2>
        <ul className={s.list}>
          <li>
            <Link href={RANKS_PATH} className={s.link}>
              Что такое разряд, и чем КМС отличается от МС
            </Link>
          </li>
          <li>
            <Link href={CALCULATOR_PATH} className={s.link}>
              Калькулятор разряда по плаванию
            </Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
