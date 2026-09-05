import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { ServiceWorkerBridge } from '@/features/pwa/ServiceWorkerBridge';
import { METRIKA_ID, metrikaScript } from '@/lib/analytics';
import { siteMetadata } from '@/lib/seo';
import { OBSIDIAN_CANVAS, TITAN_CANVAS, themeInitScript } from '@/lib/theme';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

/**
 * The five devices iOS asks about by name. It picks by exact pixel size, so a screen the
 * list misses simply launches without a splash.
 */
const SPLASH_SCREENS = [
  { width: 1290, height: 2796, ratio: 3 },
  { width: 1179, height: 2556, ratio: 3 },
  { width: 1125, height: 2436, ratio: 3 },
  { width: 828, height: 1792, ratio: 2 },
  { width: 750, height: 1334, ratio: 2 },
].map(({ width, height, ratio }) => ({
  url: `/splash/splash-${width}x${height}.png`,
  media: `(device-width: ${width / ratio}px) and (device-height: ${height / ratio}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
}));

export const metadata: Metadata = {
  ...siteMetadata,
  title: { default: 'Разряд', template: '%s · Разряд' },
  description: 'Разрядные нормативы ЕВСК по плаванию и очки разряда.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      /*
        Google reads no SVG, and a crawler or an unfurler asks for /favicon.ico blindly,
        so the .ico is the one that answers a search. The explicit sizes are what keeps
        Chrome from preferring it over the vector in a tab that can draw the vector.
      */
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    // iOS never reads the manifest icons for the home screen; it reads apple-touch-icon,
    // at 180 and opaque, because transparency there is composited onto black.
    apple: '/apple-touch-icon.png',
  },
  // Without `capable` iOS opens the installed app inside Safari chrome instead of standalone.
  appleWebApp: {
    capable: true,
    title: 'Разряд',
    statusBarStyle: 'black',
    // iOS matches a startup image by exact device pixels; an unmatched launch is a white flash.
    startupImage: SPLASH_SCREENS,
  },
};

/** The browser chrome paints the canvas of the look it is showing, so the app has no seam at its edge. */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: TITAN_CANVAS },
    { media: '(prefers-color-scheme: dark)', color: OBSIDIAN_CANVAS },
  ],
  // cover, so the shell may paint under the notch and pad itself with the safe-area insets.
  viewportFit: 'cover',
  // The keyboard resizes the layout instead of sliding it out of view.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The inline script sets data-theme before hydration; React must not treat it as a mismatch.
    <html
      lang="ru"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {METRIKA_ID === null ? null : (
          <script dangerouslySetInnerHTML={{ __html: metrikaScript(METRIKA_ID) }} />
        )}
      </head>
      {/* The chrome lives in the (shell) group; /qr/ is a screen of its own and skips it. */}
      <body>
        {METRIKA_ID === null ? null : (
          <noscript>
            {/*
              Every page is prerendered, so a reader with scripts off still gets the tables
              and is worth counting. The pixel is positioned by a class, not a style
              attribute: there are no inline styles in this project.
            */}
            {/* next/image is a React component and renders nothing inside a noscript;
                this is a 1x1 beacon, not an image the layout has to reserve room for. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="metrika-pixel"
              src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
              alt=""
            />
          </noscript>
        )}
        {children}
        <ServiceWorkerBridge />
      </body>
    </html>
  );
}
