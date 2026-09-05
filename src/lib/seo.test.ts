/**
 * The two tags that are invisible on the page and easy to lose in a refactor: the token
 * that proves the site is ours to Яндекс.Вебмастер, and the counter that measures it.
 * Losing either is silent — the site un-verifies, or the numbers just stop.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { METRIKA_ID } from './analytics';
import { SITE_URL, YANDEX_VERIFICATION, siteMetadata } from './seo';

const layout = readFileSync(resolve(process.cwd(), 'src/app/layout.tsx'), 'utf8');

describe('proof that the site is ours', () => {
  it('carries the token Вебмастер issued for this host', () => {
    expect(siteMetadata.verification?.yandex).toBe(YANDEX_VERIFICATION);
    expect(YANDEX_VERIFICATION).toMatch(/^[0-9a-f]{16}$/);
  });

  /* A subdomain is a separate site to Yandex, so the token belongs to this origin alone. */
  it('is written for the deployed origin', () => {
    expect(SITE_URL).toBe('https://razryad.borozdov.ru');
    expect(String(siteMetadata.metadataBase)).toBe(`${SITE_URL}/`);
  });
});

describe('the counter', () => {
  it('is configured, so the app actually measures itself', () => {
    expect(METRIKA_ID).toBe(112301819);
  });

  /*
    layout.tsx cannot be imported here, next/font/google needs the SWC transform, so the
    two render sites are pinned as text. Both are guarded by METRIKA_ID being non-null.
  */
  it('is rendered in the head and again for readers with scripts off', () => {
    expect(layout).toContain('metrikaScript(METRIKA_ID)');
    expect(layout).toContain('<noscript>');
    expect(layout).toContain('mc.yandex.ru/watch/');
  });

  it('positions the noscript pixel by class, since the project has no inline styles', () => {
    expect(layout).not.toMatch(/style=/);
    expect(layout).toContain('metrika-pixel');
    expect(readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')).toContain(
      '.metrika-pixel',
    );
  });
});
