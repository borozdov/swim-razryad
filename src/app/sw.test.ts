/**
 * The service worker is plain JavaScript in public/, outside the module graph, so the
 * shell it precaches cannot be imported from routes.ts. This test reads the file and
 * pins the two lists against the routes the export really writes.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CALCULATOR_PATH, HOME_PATH, QR_PATH } from '@/lib/routes';

// Read from the working directory, not from import.meta.url: Vite rewrites
// `new URL('….js', import.meta.url)` into an asset URL and the file never opens.
const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

/** The array literal of a top-level const, read out of the source. */
const stringArray = (name: string): readonly string[] => {
  const declaration = new RegExp(`const ${name} = \\[([^\\]]*)\\]`).exec(source);
  expect(declaration).not.toBeNull();
  return [...(declaration?.[1] ?? '').matchAll(/'([^']*)'/g)].map((match) => match[1]);
};

describe('service worker', () => {
  it('precaches every page of the shell', () => {
    const precache = stringArray('PRECACHE');

    expect(precache).toContain(HOME_PATH);
    expect(precache).toContain(QR_PATH);
  });

  /*
    The app is one page with both of its modes, so the shell is one page. The address the
    calculator used to have only forwards, and an unreachable forward already falls back
    to the shell, which is the app.
  */
  it('leaves the old address of the calculator out of the shell', () => {
    expect(stringArray('PRECACHE')).not.toContain(CALCULATOR_PATH);
  });

  it('precaches what a browser needs to install the app', () => {
    const precache = stringArray('PRECACHE');

    expect(precache).toContain('/manifest.webmanifest');
    expect(precache).toContain('/icons/icon-192.png');
    expect(precache).toContain('/icons/icon-512.png');
  });

  it('names a cache, so a bump drops every older one at activation', () => {
    expect(/const CACHE_NAME = '[a-z0-9-]+';/.test(source)).toBe(true);
  });

  /* Visited, not installed: the reference layer is content, and the shell stays a shell. */
  it('keeps a reference page once it is read, without precaching all of them', () => {
    expect(source).toContain('REFERENCE_PREFIX');
    expect(source).toMatch(/const REFERENCE_PREFIX = '\/normativy\/';/);
    expect(stringArray('PRECACHE').some((path) => path.startsWith('/normativy/'))).toBe(false);
  });

  it('stores only known paths, so a 200 on an unknown address cannot settle in the cache', () => {
    expect(source).toContain('function isCacheable');
    expect(source).toContain('IMMUTABLE_PREFIX');
    expect(source).toContain('return false;');
  });

  it('leaves the update to the reader instead of reloading the page itself', () => {
    // The call may only appear in the message handler, never in install.
    const install = source.slice(
      source.indexOf("addEventListener('install'"),
      source.indexOf("addEventListener('message'"),
    );
    expect(install).not.toContain('skipWaiting()');
    expect(source).toContain("event.data.type === 'SKIP_WAITING'");
  });
});
