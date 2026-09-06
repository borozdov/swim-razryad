/*
  Service worker of «Разряд». Ported from fina.borozdov.ru, with one change forced by
  Next: chunk file names carry a content hash, so a literal precache list of assets
  cannot be written by hand. The shell routes are precached by name; everything under
  /_next/static/ is cached on first use and never revalidated, because a hashed name
  never points at different bytes.

  Bump CACHE_NAME to drop every old cache at once.
*/
const CACHE_NAME = 'razryad-v6';

/**
 * The app shell: the app itself, which is one page with both of its modes, the QR card,
 * and what a browser needs to install them. /kalkulyator/ is not here any more: it is the
 * old address of a mode and only forwards, and an unreachable forward falls back to the
 * shell below, which is the app anyway.
 */
const PRECACHE = [
  '/',
  '/qr/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/** Hashed build output. The name is the version, so the first copy is the only copy. */
const IMMUTABLE_PREFIX = '/_next/static/';

/**
 * The reference layer: thirty-five pages, one per event. They are kept once visited but
 * never precached, because putting all of them in the install would make the shell the
 * whole site and cost a first-time reader a download they did not ask for.
 */
const REFERENCE_PREFIX = '/normativy/';

/**
 * Static hosting answers an unknown address with index.html and status 200. Without a
 * list of what may be stored, every junk URL would settle in the cache as its own copy
 * of the page.
 */
function isCacheable(url) {
  if (url.pathname.startsWith(IMMUTABLE_PREFIX)) return true;
  if (url.pathname.startsWith(REFERENCE_PREFIX)) return true;
  if (PRECACHE.includes(url.pathname)) return true;
  return false;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // One by one, not cache.addAll: addAll is atomic, and a single missing file would
      // fail the whole install, leaving the app with no offline at all.
      Promise.allSettled(PRECACHE.map((url) => cache.add(url))),
    ),
    // skipWaiting is deliberately not called here: the new worker would take over and
    // reload the page by controllerchange, possibly in the middle of typing a time.
    // The choice is left to the reader through the update toast, which posts SKIP_WAITING.
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Speeds up the first navigation after activation: the browser starts the request
      // in parallel with the worker.
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => {});
      }
      const names = await caches.keys();
      await Promise.all(names.map((name) => (name === CACHE_NAME ? null : caches.delete(name))));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  // Another origin is nobody's business here; the fonts are served from our own build.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // ignoreSearch: arriving with an ad tag (?utm_*) or a shared result (?time=...)
      // must hit the same entry as the bare address, or offline breaks on such a link.
      const cached = await cache.match(request, { ignoreSearch: true });

      // A hashed asset never changes: once stored, the network is not asked again.
      if (cached && url.pathname.startsWith(IMMUTABLE_PREFIX)) return cached;

      // cache: 'no-cache' makes a conditional request past the browser's own HTTP cache.
      // Without it revalidation would return the same stale bytes and Cache Storage
      // would never move.
      const network = Promise.resolve(event.preloadResponse)
        .then(
          (preloaded) =>
            preloaded || fetch(request.url, { cache: 'no-cache', credentials: 'same-origin' }),
        )
        .then((response) => {
          // A navigation cannot be answered with a redirected response: the browser
          // throws and the page does not open. Hand the redirect over instead.
          if (request.mode === 'navigate' && response.redirected) {
            return Response.redirect(response.url, 301);
          }
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic' &&
            isCacheable(url)
          ) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async (error) => {
          if (cached) return cached;
          // Offline on an address never visited. The app is self-contained, so its shell
          // answers instead of the browser's error page; no separate offline.html.
          if (request.mode === 'navigate') {
            const shell = await cache.match('/');
            if (shell) return shell;
          }
          throw error;
        });

      // Stale-while-revalidate: the cache answers now, the network refreshes for next time.
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      return network;
    }),
  );
});
