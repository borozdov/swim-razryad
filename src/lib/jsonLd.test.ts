import { describe, expect, it } from 'vitest';
import { breadcrumbJsonLd, siteJsonLd } from './jsonLd';
import { SITE_URL } from './seo';

const urls = (node: unknown): readonly string[] =>
  [...JSON.stringify(node).matchAll(/"(https?:\/\/[^"]+)"/g)].map((match) => match[1]);

const CRUMBS = breadcrumbJsonLd({ pool: 'SCM', stroke: 'BREAST', distance: 100 }, 'Брасс 100 м');

describe('structured data', () => {
  /*
    The only type both engines read. Google draws it in a result, Yandex documents it as
    one of three JSON-LD uses it has. Position must start at 1 and run without a gap, and
    every item but the last has to name its own address.
  */
  it('describes the trail of a reference page', () => {
    expect(CRUMBS['@type']).toBe('BreadcrumbList');

    const items = CRUMBS.itemListElement as { position: number; name: string; item: string }[];
    expect(items.map((item) => item.position)).toEqual([1, 2, 3]);
    expect(items.at(-1)?.item).toBe(`${SITE_URL}/normativy/scm/breast/100/`);
  });

  it('names the site, so a Cyrillic subdomain is not guessed at', () => {
    const node = siteJsonLd();

    expect(node['@type']).toBe('WebSite');
    expect(node.name).toBe('Разряд');
    expect(node.url).toBe(SITE_URL);
  });

  it('points every link at our own origin or at the author, never anywhere else', () => {
    const allowed = [SITE_URL, 'https://borozdov.ru', 'https://schema.org'];
    const links = [...urls(siteJsonLd()), ...urls(CRUMBS)];

    expect(links.length).toBeGreaterThan(0);
    expect(links.every((url) => allowed.some((origin) => url.startsWith(origin)))).toBe(true);
  });

  it('serialises to valid JSON, since it is written into a script tag', () => {
    expect(() => JSON.parse(JSON.stringify(CRUMBS))).not.toThrow();
  });
});
