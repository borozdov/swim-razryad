import Link from 'next/link';
import { RANK_MIN_AGE, RANK_ORDER } from '@/domain/points/scale';
import type { Edition } from '@/domain/standards/types';
import { authorUrl } from '@/features/site-footer/SiteFooter';
import { RANK_FULL_LABEL, RANK_LABEL, formatIsoDate } from '@/lib/labels';
import { poolSpread, poolSpreadSentence, youthSpreadSentence } from '@/lib/ranksCopy';
import { CALCULATOR_PATH, HOME_PATH } from '@/lib/routes';
import { CAVEATS } from '@/lib/standardsCopy';
import { Breadcrumbs, Table } from '@/ui';
import s from './RanksPage.module.css';

const COLUMNS = ['Ступень', 'С какого возраста'];

/** Only the three top rungs are abbreviated, so only they need both forms printed. */
const rankName = (rank: (typeof RANK_ORDER)[number]): string =>
  RANK_FULL_LABEL[rank] === RANK_LABEL[rank]
    ? RANK_FULL_LABEL[rank]
    : `${RANK_FULL_LABEL[rank]} (${RANK_LABEL[rank]})`;

const ladderRows = (): readonly (readonly string[])[] =>
  RANK_ORDER.map((rank) => [rankName(rank), `${RANK_MIN_AGE[rank]} лет`]);

export type RanksPageProps = {
  edition: Edition;
};

/**
 * The words around the numbers: what a rank is, what ЕВСК is, and what changes when the
 * pool does. It exists because those are questions a table of times answers for nobody,
 * and because the one thing this site has that no other has is an author who swam them.
 */
export function RanksPage({ edition }: RanksPageProps) {
  const cms = poolSpread(edition, 'CMS');
  const youth = poolSpread(edition, 'YOUTH_3');

  return (
    <article className={s.root}>
      <Breadcrumbs items={[{ label: 'Нормативы', href: HOME_PATH }, { label: 'Разряды' }]} />

      <h1 className={s.title}>Разряды по плаванию: девять ступеней и что меняет бассейн</h1>
      <p className={s.lead}>
        Разряд, это ступень Единой всероссийской спортивной классификации. По плаванию их девять, и
        на каждой дистанции у каждой ступени своё время. Времена стоят в приложении № 1 к приказу
        Минспорта России № 1092, редакция действует с {formatIsoDate(edition.effectiveFrom)}.
      </p>

      <Table columns={COLUMNS} rows={ladderRows()} numericColumns={[1]} />

      <section className={s.prose}>
        <h2 className={s.subhead}>Разряд и звание, это не одно и то же</h2>
        <p>
          Шесть нижних ступеней и КМС, это спортивные разряды. МС и МСМК, это спортивные звания, и
          присваивают их не там же, где разряды, и по своему порядку. Поэтому «выполнить МС» и
          «получить МС», это два разных события, между которыми лежит подача документов.
        </p>
        <p>
          Нумерация внутри каждой тройки идёт вниз, и это сбивает чаще всего: III юношеский, это
          самая первая ступень и самое медленное время, I юношеский, это последняя юношеская. Следом
          идёт III спортивный, и счёт снова начинается с III. Выше спортивных, КМС, МС и МСМК.
        </p>
      </section>

      <section className={s.prose}>
        <h2 className={s.subhead}>Короткая вода и длинная</h2>
        <p>
          Бассейн 25 м даёт вдвое больше поворотов, и приказ ставит для него отдельные числа.
          Насколько отдельные, сам приказ не говорит, но это можно посчитать по его же таблице.
        </p>
        <p>{poolSpreadSentence(cms, 'CMS')}</p>
        <p>{youthSpreadSentence(youth, 'YOUTH_3')}</p>
      </section>

      <section className={s.prose}>
        <h2 className={s.subhead}>Что норматив не решает</h2>
        {CAVEATS.map((caveat) => (
          <p key={caveat}>{caveat}</p>
        ))}
      </section>

      <section className={s.prose}>
        <h2 className={s.subhead}>Кто это считал</h2>
        <p>
          Сайт сделал Никита Бороздов, мастер спорта по плаванию. Числа переписаны со скана приказа
          вручную и сверены построчно; сторонние таблицы в датасет не попадают, потому что проверить
          их не по чему.{' '}
          <a href={authorUrl('author_bio')} className={s.link} rel="noopener">
            borozdov.ru
          </a>
        </p>
      </section>

      <section className={s.links}>
        <h2 className={s.subhead}>Дальше</h2>
        <ul className={s.list}>
          <li>
            <Link href={HOME_PATH} className={s.link}>
              Таблица нормативов по всем дистанциям
            </Link>
          </li>
          <li>
            <Link href={CALCULATOR_PATH} className={s.link}>
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
        , приложение № 1; минимальный возраст, пункт 3 приложения № 19 к приказу № 999.
      </p>
    </article>
  );
}
