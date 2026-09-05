/**
 * Page metadata. Every title, description and canonical URL in the app is assembled
 * here, so the wording of a page and the shape of its URL stay in one place.
 */
import type { Metadata } from 'next';
import type { Edition } from '@/domain/standards/types';
import { eventHeading, formatIsoDate, lowerFirst } from './labels';
import {
  CALCULATOR_PATH,
  HOME_PATH,
  QR_PATH,
  RANKS_PATH,
  STANDARDS_ROOT,
  standardsPath,
} from './routes';
import type { EventRoute } from './routes';

/**
 * Origin of the deployed site. Static export writes absolute canonicals at build
 * time, so the origin is fixed here, and this is the only place in the app where
 * it appears. The sitemap and robots.txt read it through `canonicalUrl`.
 */
export const SITE_URL = 'https://razryad.borozdov.ru';

export const canonicalUrl = (path: string): string => `${SITE_URL}${path}`;

/** Drawn once and committed, because generating it would need a runtime the export has not. */
export const OG_IMAGE = { url: '/og.png', width: 1200, height: 630, alt: 'Разряд' };

const AUTHOR = { name: 'Nikita Borozdov', url: 'https://borozdov.ru' };

/**
 * What every page says about itself besides its own title: the card a messenger draws
 * when the link is pasted, and the small print search engines read.
 */
const social = (title: string, description: string, path: string): Metadata => ({
  openGraph: {
    type: 'website',
    siteName: 'Разряд',
    locale: 'ru_RU',
    title,
    description,
    url: canonicalUrl(path),
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
});

/** Root metadata: the parts that hold for every page of the site. */
export const siteMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Разряд',
  authors: [AUTHOR],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  /*
    No `keywords`: both engines dropped the tag long ago. No `robots` either, indexing is
    the default, and stating it here overrode the noindex Next writes for the 404, which
    then went out with two tags contradicting each other.
  */
  // The times are digits, and iOS reads long runs of them as telephone numbers.
  formatDetection: { telephone: false },
};

/*
  Titles lead with the noun a swimmer types, not with the name of the app: «Нормативы» on
  its own answers no query. The year stays out of them: приказ № 1092 carries no end date,
  and a year in a title is a promise to edit the file every January.
*/
export const standardsIndexMetadata = (edition: Edition): Metadata => {
  const title = 'Нормативы по плаванию — таблица разрядов ЕВСК';
  const description = [
    'Разрядные нормативы ЕВСК по плаванию: все дистанции обоих бассейнов,',
    'мужчины и женщины, от III юношеского разряда до МСМК.',
    `Редакция действует с ${formatIsoDate(edition.effectiveFrom)}.`,
  ].join(' ');
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(HOME_PATH) },
    ...social(title, description, HOME_PATH),
  };
};

const HUB_TITLE = 'Все дистанции: нормативы по плаванию в бассейнах 25 и 50 м';

const HUB_DESCRIPTION = [
  'Указатель разрядных нормативов ЕВСК по плаванию: каждый стиль и каждая дистанция обоих',
  'бассейнов отдельной страницей, с временами всех девяти ступеней для мужчин и женщин.',
].join(' ');

/** The directory of the reference layer, and the only page that links to all of it. */
export const standardsHubMetadata: Metadata = {
  title: HUB_TITLE,
  description: HUB_DESCRIPTION,
  alternates: { canonical: canonicalUrl(STANDARDS_ROOT) },
  ...social(HUB_TITLE, HUB_DESCRIPTION, STANDARDS_ROOT),
};

/**
 * One event of the reference layer. The heading words are the ones a swimmer types:
 * «вольный стиль», not the chip's «Вольный», and «бассейн 25 м», not «25 м».
 */
export const standardsMetadata = (event: EventRoute, edition: Edition): Metadata => {
  const heading = lowerFirst(eventHeading(event));
  const title = `Нормативы по плаванию: ${heading}`;
  const description = [
    `Разрядные нормативы ЕВСК: ${heading}.`,
    'Мужчины и женщины, от III юношеского разряда до МСМК,',
    `по приказу Минспорта № 1092, редакция от ${formatIsoDate(edition.effectiveFrom)}.`,
  ].join(' ');
  const path = standardsPath(event);
  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(path) },
    ...social(title, description, path),
  };
};

const CALCULATOR_TITLE = 'Калькулятор разряда по плаванию';

const CALCULATOR_DESCRIPTION = [
  'Калькулятор очков разряда ЕВСК по плаванию: бассейн, пол, стиль, дистанция и время,',
  'а в ответ выполненный разряд, остаток секунд до следующей ступени и очки по шкале 0-1000.',
].join(' ');

export const calculatorMetadata: Metadata = {
  title: CALCULATOR_TITLE,
  description: CALCULATOR_DESCRIPTION,
  alternates: { canonical: canonicalUrl(CALCULATOR_PATH) },
  ...social(CALCULATOR_TITLE, CALCULATOR_DESCRIPTION, CALCULATOR_PATH),
};

const RANKS_TITLE = 'Разряды по плаванию: девять ступеней и что меняет бассейн';

const RANKS_DESCRIPTION = [
  'Что такое разряд по плаванию и чем КМС отличается от МС: девять ступеней ЕВСК по порядку,',
  'с какого возраста присваивают каждую и насколько бассейн 25 м быстрее бассейна 50 м.',
].join(' ');

export const ranksMetadata: Metadata = {
  title: RANKS_TITLE,
  description: RANKS_DESCRIPTION,
  alternates: { canonical: canonicalUrl(RANKS_PATH) },
  ...social(RANKS_TITLE, RANKS_DESCRIPTION, RANKS_PATH),
};

const QR_TITLE = 'QR-код';

const QR_DESCRIPTION = 'QR-код приложения «Разряд». Наведите камеру, чтобы открыть сайт.';

/**
 * A card to point a camera at, not an answer to a search: it carries no social card and
 * asks to stay out of the index, the way the same page does on fina.borozdov.ru.
 */
export const qrMetadata: Metadata = {
  title: QR_TITLE,
  description: QR_DESCRIPTION,
  alternates: { canonical: canonicalUrl(QR_PATH) },
  robots: { index: false, follow: false },
};
