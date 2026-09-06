/**
 * What installing the app to a home screen and finding it in a tab promise: a manifest
 * the browser accepts, icons that really are the sizes and the shapes they claim, and
 * canvas colours shared by globals.css, the manifest and the theme-color meta tags.
 *
 * layout.tsx cannot be imported here, `next/font/google` needs the SWC transform, so the
 * meta tags are pinned through the constants it renders, plus the check below that the
 * file states no colour of its own.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
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

/**
 * One pixel of a PNG, as a #rrggbb string. Written out rather than pulled from a library
 * because it is the only thing that can tell a titan plate from an obsidian one, and the
 * polarity of these files is exactly what goes wrong unnoticed.
 */
const pngPixel = (path: string, x: number, y: number): string => {
  const bytes = readFileSync(new URL(path, import.meta.url));
  const width = bytes.readUInt32BE(16);
  const colourType = bytes.readUInt8(25);
  const channels = colourType === 6 ? 4 : 3;

  // Every IDAT chunk of the file, in order, is one zlib stream.
  const parts: Buffer[] = [];
  for (let at = 8; at + 8 <= bytes.length;) {
    const length = bytes.readUInt32BE(at);
    const type = bytes.subarray(at + 4, at + 8).toString('ascii');
    if (type === 'IDAT') parts.push(bytes.subarray(at + 8, at + 8 + length));
    at += length + 12;
  }
  const raw = inflateSync(Buffer.concat(parts));

  // Undo the per-row filter. Only the rows up to y are needed, but each depends on the one
  // above it, so they are walked from the top.
  const stride = width * channels;
  const out = Buffer.alloc((y + 1) * stride);
  for (let row = 0; row <= y; row += 1) {
    const filter = raw[row * (stride + 1)];
    const line = raw.subarray(row * (stride + 1) + 1, (row + 1) * (stride + 1));
    for (let i = 0; i < stride; i += 1) {
      const left = i >= channels ? out[row * stride + i - channels] : 0;
      const up = row > 0 ? out[(row - 1) * stride + i] : 0;
      const upLeft = row > 0 && i >= channels ? out[(row - 1) * stride + i - channels] : 0;
      let value = line[i];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const dl = Math.abs(p - left);
        const du = Math.abs(p - up);
        const dul = Math.abs(p - upLeft);
        value += dl <= du && dl <= dul ? left : du <= dul ? up : upLeft;
      }
      out[row * stride + i] = value & 0xff;
    }
  }

  const at = y * stride + x * channels;
  return `#${[out[at], out[at + 1], out[at + 2]].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
};

/** Colour type of a PNG, off the same IHDR chunk: 4 and 6 are the two that carry alpha. */
const pngHasAlpha = (path: string): boolean => {
  const bytes = readFileSync(new URL(path, import.meta.url));
  const colourType = bytes.readUInt8(25);
  return colourType === 4 || colourType === 6;
};

/** A colour role globals.css declares for one look, read out of the file itself. */
const declaredRole = (look: 'obsidian' | 'titan', role: 'canvas' | 'surface'): string => {
  const css = read('./globals.css');
  const block = css.slice(css.indexOf(`[data-theme='${look}']`));
  const declaration = new RegExp(`--${role}:\\s*([^;]+);`).exec(block);
  expect(declaration).not.toBeNull();
  return declaration?.[1].trim() ?? '';
};

const declaredCanvas = (look: 'obsidian' | 'titan'): string => declaredRole(look, 'canvas');

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
    Crawlers and unfurlers request /favicon.ico without being told to, so this file is the
    one that answers a search. Three sizes inside it, so a browser picks one instead of
    scaling the only one there is.
  */
  it('answers /favicon.ico with three real sizes', () => {
    // Not `new URL(..., import.meta.url)`: Vite rewrites that into a served asset URL
    // for an .ico, and readFileSync is handed something that is no longer a file.
    const bytes = readFileSync(resolve(process.cwd(), 'public/favicon.ico'));

    expect(bytes.readUInt16LE(0)).toBe(0);
    expect(bytes.readUInt16LE(2)).toBe(1);
    const count = bytes.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => bytes.readUInt8(6 + i * 16));

    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48]);
  });

  /** Yandex asks for a 120 by name for the favicon it draws in a search result. */
  it('ships the 120 a search result asks for', () => {
    expect(pngSize('../../public/favicon-120.png')).toEqual({ width: 120, height: 120 });
  });

  /*
    A favicon is a constant of the brand and must not mirror: a vector that follows
    prefers-color-scheme becomes a dark square on a dark tab strip and vanishes. The plate
    is white and the letter obsidian, always, which reads on either strip.
  */
  it('keeps the favicon a constant, and off the colour scheme', () => {
    // theme-color legitimately splits by scheme; the icon set must not.
    expect(existsSync(resolve(process.cwd(), 'public/icon.svg'))).toBe(false);
    expect(read('./layout.tsx')).not.toContain('image/svg+xml');

    // Two samples: the plate above the letter, and the body of the left stem of Д.
    const plate = pngPixel('../../public/favicon-120.png', 60, 8);
    const ink = pngPixel('../../public/favicon-120.png', 47, 27);
    expect(plate).toBe(declaredRole('titan', 'surface'));
    expect(ink).toBe(declaredRole('obsidian', 'canvas'));
  });

  /*
    Every icon of the brand is one drawing: black letter on white. Application icons used
    to invert the favicon, and the set read as two different brands depending on where you
    looked at it — a tab strip or a home screen.
  */
  it('draws the application icons the same way round as the favicon', () => {
    expect(pngPixel('../../public/icons/icon-512.png', 4, 4)).toBe(
      declaredRole('titan', 'surface'),
    );
    expect(pngPixel('../../public/apple-touch-icon.png', 4, 4)).toBe(
      declaredRole('titan', 'surface'),
    );
  });

  /** iOS composites transparency onto black, and a dark mark on black is no mark at all. */
  it('ships the apple touch icon at 180 and opaque', () => {
    expect(pngSize('../../public/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
    expect(pngHasAlpha('../../public/apple-touch-icon.png')).toBe(false);
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

  /* Both shortcuts open the one page of the app; the second one names the mode it wants. */
  it('opens either mode straight from the home screen', () => {
    expect((manifest.shortcuts ?? []).map((shortcut) => shortcut.url)).toEqual([
      '/',
      '/?mode=calculator',
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

  /*
    theme_color paints the system bars and stays obsidian, the primary look. background_color
    is the ground Android paints behind the icon while the app starts, so it follows the icon
    to white — a dark ground would flash around a white icon.
  */
  it('paints the system bars in the primary look and the splash behind the icon', () => {
    expect(manifest.theme_color).toBe(declaredCanvas('obsidian'));
    expect(manifest.background_color).toBe(declaredRole('titan', 'surface'));
  });

  it('leaves layout.tsx stating no colour of its own', () => {
    expect(read('./layout.tsx')).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
