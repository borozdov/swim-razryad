/**
 * What installing the app to a home screen and finding it in a tab promise: a manifest
 * the browser accepts, icons that really are the sizes and the shapes they claim, and
 * canvas colours shared by globals.css, the manifest and the theme-color meta tags.
 *
 * layout.tsx cannot be imported here, `next/font/google` needs the SWC transform, so the
 * meta tags are pinned through the constants it renders, plus the check below that the
 * file states no colour of its own.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { OBSIDIAN_CANVAS, TITAN_CANVAS } from '@/lib/theme';

type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

type Manifest = {
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
  screenshots?: { src: string; sizes: string }[];
  shortcuts?: { url: string }[];
};

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8');

const manifest = JSON.parse(read('../../public/manifest.webmanifest')) as Manifest;

/** Width and height off the IHDR chunk, so the file itself answers, not its name. */
const pngSize = (path: string): { width: number; height: number } => {
  const bytes = readFileSync(new URL(path, import.meta.url));
  expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

/** Colour type of a PNG, off the same IHDR chunk: 4 and 6 are the two that carry alpha. */
const pngHasAlpha = (path: string): boolean => {
  const bytes = readFileSync(new URL(path, import.meta.url));
  const colourType = bytes.readUInt8(25);
  return colourType === 4 || colourType === 6;
};

/** The --canvas globals.css declares for one look, read out of the file itself. */
const declaredCanvas = (look: 'obsidian' | 'titan'): string => {
  const css = read('./globals.css');
  const block = css.slice(css.indexOf(`[data-theme='${look}']`));
  const declaration = /--canvas:\s*([^;]+);/.exec(block);
  expect(declaration).not.toBeNull();
  return declaration?.[1].trim() ?? '';
};

describe('web manifest', () => {
  it('carries what a browser needs to offer the install', () => {
    expect(manifest.name).toBe('Разряд');
    expect(manifest.short_name).toBe('Разряд');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
  });

  it('declares an icon at 192 and two at 512', () => {
    expect(manifest.icons.map((icon) => icon.sizes).sort()).toEqual([
      '192x192',
      '512x512',
      '512x512',
    ]);
    expect(manifest.icons.every((icon) => icon.type === 'image/png')).toBe(true);
  });

  it('ships icons that really are those sizes', () => {
    expect(pngSize('../../public/icons/icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(pngSize('../../public/icons/icon-512.png')).toEqual({ width: 512, height: 512 });
    expect(pngSize('../../public/icons/icon-mask-512.png')).toEqual({ width: 512, height: 512 });
  });

  /*
    Android crops a maskable icon to a shape of its choosing, so the mark inside one has to
    sit in the centre circle and cannot fill the frame. One file cannot be both: an icon
    drawn to survive the crop wastes a tenth of every frame that is never cropped.
  */
  it('keeps the maskable icon a file of its own', () => {
    const maskable = manifest.icons.filter((icon) => icon.purpose === 'maskable');
    const any = manifest.icons.filter((icon) => icon.purpose === 'any');

    expect(maskable.map((icon) => icon.src)).toEqual(['/icons/icon-mask-512.png']);
    expect(any.map((icon) => icon.src)).toEqual(['/icons/icon-192.png', '/icons/icon-512.png']);
  });
});

describe('what a tab and a home screen ask for by name', () => {
  /*
    Google reads no SVG, and crawlers and unfurlers request /favicon.ico without being
    told to, so this file is the one that answers a search.
  */
  it('answers /favicon.ico with a real 32-pixel icon', () => {
    // Not `new URL(..., import.meta.url)`: Vite rewrites that into a served asset URL
    // for an .ico, and readFileSync is handed something that is no longer a file.
    const bytes = readFileSync(resolve(process.cwd(), 'public/favicon.ico'));

    expect(bytes.readUInt16LE(0)).toBe(0);
    expect(bytes.readUInt16LE(2)).toBe(1);
    expect(bytes.readUInt16LE(4)).toBeGreaterThan(0);
    expect(bytes.readUInt8(6)).toBe(32);
    expect(bytes.readUInt8(7)).toBe(32);
  });

  /** iOS composites transparency onto black, and a dark mark on black is no mark at all. */
  it('ships the apple touch icon at 180 and opaque', () => {
    expect(pngSize('../../public/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    expect(pngHasAlpha('../../public/apple-touch-icon.png')).toBe(false);
  });

  /*
    The vector is the only icon that can follow the system scheme, because a favicon is
    cached far too aggressively to be redrawn when the look changes.
  */
  it('draws the vector mark in both schemes, in the colours of the raster icons', () => {
    const svg = read('../../public/icon.svg');

    expect(svg).toContain('viewBox="0 0 64 64"');
    expect(svg).toContain('@media (prefers-color-scheme: dark)');
    expect(new Set(svg.match(/#[0-9a-f]{6}/g))).toEqual(new Set(['#0b0b0c', '#f2f2f3']));
  });
});

describe('what a store front and a launch need', () => {
  it('shows the app itself in the install prompt, at the size the manifest claims', () => {
    const screenshots = (manifest.screenshots ?? []).map((shot) => shot.src);

    expect(screenshots).toEqual(['/screenshots/standards.png', '/screenshots/calculator.png']);
    for (const src of screenshots) {
      expect(pngSize(`../../public${src}`)).toEqual({ width: 480, height: 1040 });
    }
  });

  it('opens either section straight from the home screen', () => {
    expect((manifest.shortcuts ?? []).map((shortcut) => shortcut.url)).toEqual([
      '/',
      '/kalkulyator/',
    ]);
  });

  it('carries a card for a link and a launch screen for iOS, both real images', () => {
    expect(pngSize('../../public/og.png')).toEqual({ width: 1200, height: 630 });
    for (const size of ['1290x2796', '1179x2556', '1125x2436', '828x1792', '750x1334']) {
      const [width, height] = size.split('x').map(Number);
      expect(pngSize(`../../public/splash/splash-${size}.png`)).toEqual({ width, height });
    }
  });
});

describe('theme colour', () => {
  it('matches the canvas of the look it names', () => {
    expect(OBSIDIAN_CANVAS).toBe(declaredCanvas('obsidian'));
    expect(TITAN_CANVAS).toBe(declaredCanvas('titan'));
  });

  /** An installed app launches in the primary look, whatever the system is set to. */
  it('paints the installed app in the primary look', () => {
    expect(manifest.theme_color).toBe(declaredCanvas('obsidian'));
    expect(manifest.background_color).toBe(declaredCanvas('obsidian'));
  });

  it('leaves layout.tsx stating no colour of its own', () => {
    expect(read('./layout.tsx')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
