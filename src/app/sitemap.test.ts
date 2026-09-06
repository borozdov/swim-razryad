import { describe, expect, it } from 'vitest';
import { listEvents } from '@/domain/standards/registry';
import {
  CALCULATOR_PATH,
  HOME_PATH,
  QR_PATH,
  RANKS_PATH,
  STANDARDS_ROOT,
  standardsPath,
} from '@/lib/routes';

import { SITE_URL } from '@/lib/seo';
import robots from './robots';
import sitemap from './sitemap';

/**
 * The pages the static export writes that a search engine is meant to see: the app, the
 * указатель and the explainer, and one reference page per event of the edition.
 * /kitchen-sink answers no search and /qr/ answers a camera, so neither is here.
 */
const exportedUrls = (): ReadonlySet<string> =>
  new Set(
    [HOME_PATH, STANDARDS_ROOT, RANKS_PATH, ...listEvents().map(standardsPath)].map(
      (path) => `${SITE_URL}${path}`,
    ),
  );

const sitemapUrls = (): readonly string[] => sitemap().map((entry) => entry.url);

describe('sitemap', () => {
  it('lists exactly the pages the export writes', () => {
    expect(new Set(sitemapUrls())).toEqual(exportedUrls());
  });

  /* One page per event, so a query naming a distance has an address to land on. */
  it('carries a page for every event of the edition', () => {
    const urls = new Set(sitemapUrls());

    for (const event of listEvents()) {
      expect(urls.has(`${SITE_URL}${standardsPath(event)}`)).toBe(true);
    }
  });

  it('dates every entry from the edition, so freshness is not a year in a title', () => {
    expect(sitemap().every((entry) => entry.lastModified !== undefined)).toBe(true);
  });

  it('lists every page once', () => {
    const urls = sitemapUrls();

    expect(urls.length).toBe(new Set(urls).size);
    expect(urls.length).toBe(exportedUrls().size);
  });

  it('writes absolute URLs on the deployed origin, each ending in a slash', () => {
    expect(sitemapUrls().every((url) => url.startsWith(`${SITE_URL}/`))).toBe(true);
    expect(sitemapUrls().every((url) => url.endsWith('/'))).toBe(true);
  });

  it('leaves out the page that renders the primitives', () => {
    expect(sitemapUrls().some((url) => url.includes('kitchen-sink'))).toBe(false);
  });

  it('leaves out the QR card, which answers a camera and not a search', () => {
    expect(sitemapUrls().some((url) => url.endsWith(QR_PATH))).toBe(false);
  });

  /* The calculator is a mode of the app and no longer an address: the old one forwards. */
  it('leaves out the address the calculator used to have', () => {
    expect(sitemapUrls().some((url) => url.endsWith(CALCULATOR_PATH))).toBe(false);
  });
});

describe('robots', () => {
  it('points crawlers at the sitemap the export writes', () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it('keeps crawlers off the pages the sitemap leaves out', () => {
    expect(robots().rules).toEqual({
      userAgent: '*',
      allow: '/',
      disallow: ['/kitchen-sink/', QR_PATH],
    });
  });
});
