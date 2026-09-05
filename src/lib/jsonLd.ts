/**
 * Structured data, and only the two types that earn anything.
 *
 * `BreadcrumbList` is the one type both engines read: Google draws it in a result, and it
 * is the only JSON-LD Yandex documents for its own snippets. `WebSite` names the site, so
 * a Cyrillic subdomain is not guessed at.
 *
 * Nothing else is here on purpose. `FAQPage` and `HowTo` are dead in Google and were never
 * documented by Yandex. `WebApplication` was removed: Google requires a rating sourced
 * from real users before it will show anything for one, and inventing that rating is a
 * violation, so the markup could only ever have been dead weight.
 */
import { HOME_PATH, STANDARDS_ROOT, standardsPath } from './routes';
import type { EventRoute } from './routes';
import { SITE_URL, canonicalUrl } from './seo';

/** A JSON-LD node, as far as anything here needs to know about it. */
export type JsonLd = Record<string, unknown>;

const AUTHOR = { '@type': 'Person', name: 'Nikita Borozdov', url: 'https://borozdov.ru' };

/** The trail of a reference page. The last item is the page itself and needs no url. */
export const breadcrumbJsonLd = (event: EventRoute, name: string): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Нормативы', item: canonicalUrl(HOME_PATH) },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Все дистанции',
      item: canonicalUrl(STANDARDS_ROOT),
    },
    { '@type': 'ListItem', position: 3, name, item: canonicalUrl(standardsPath(event)) },
  ],
});

/** The site itself, declared once on the home page. */
export const siteJsonLd = (): JsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Разряд',
  url: SITE_URL,
  inLanguage: 'ru',
  author: AUTHOR,
});
