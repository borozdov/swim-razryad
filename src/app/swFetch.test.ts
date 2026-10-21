// @vitest-environment node
/**
 * The worker itself, run against a host that keeps only its current build, the way Timeweb
 * does: a hashed file of the build before answers 404. sw.test.ts reads the source; this
 * file runs it, because the failure it guards against is one of behaviour over deploys.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const ORIGIN = 'https://razryad.borozdov.ru';
const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8');

/** What the worker reads off a request. A real one cannot be built with mode 'navigate'. */
type WorkerRequest = { url: string; method: string; mode: string };
type Lifetime = { waitUntil: (promise: Promise<unknown>) => void };
type FetchEvent = Lifetime & {
  request: WorkerRequest;
  respondWith: (response: Promise<Response>) => void;
  preloadResponse: Promise<undefined>;
};
type Listener = (event: Lifetime | FetchEvent) => void;

const withoutSearch = (url: string): string => url.split('?')[0];

/** A same-origin answer, which a browser types 'basic'; a Response built in Node says 'default'. */
const basic = (response: Response): Response =>
  Object.defineProperty(response, 'type', { value: 'basic' });

/** The host: one build at a time, its page names its stylesheet, nothing else is kept. */
let build = '';
let online = true;
let asked: { path: string; cache: string }[] = [];

const host = async (input: Request | string, init?: RequestInit): Promise<Response> => {
  const url = new URL(typeof input === 'string' ? input : input.url, ORIGIN);
  const cache = init?.cache ?? (typeof input === 'string' ? 'default' : input.cache);
  asked.push({ path: url.pathname, cache });
  if (!online) throw new TypeError('Failed to fetch');
  if (url.pathname === `/_next/static/css/${build}.css`) {
    return basic(new Response('body{}', { headers: { 'content-type': 'text/css' } }));
  }
  if (url.pathname.startsWith('/_next/static/')) {
    return basic(new Response('Not found', { status: 404 }));
  }
  return basic(
    new Response(`<link rel="stylesheet" href="/_next/static/css/${build}.css">`, {
      headers: { 'content-type': 'text/html' },
    }),
  );
};

/** Cache Storage in memory, as much of it as the worker calls. */
class MemoryCache {
  private readonly entries = new Map<string, Response>();

  async match(request: WorkerRequest | string, options?: { ignoreSearch?: boolean }) {
    const url = new URL(typeof request === 'string' ? request : request.url, ORIGIN).href;
    for (const [key, response] of this.entries) {
      const same = options?.ignoreSearch ? withoutSearch(key) === withoutSearch(url) : key === url;
      if (same) return response.clone();
    }
    return undefined;
  }

  async put(request: WorkerRequest | Request, response: Response) {
    this.entries.set(new URL(request.url, ORIGIN).href, response);
  }

  async add(request: Request) {
    await this.put(request, await host(request));
  }
}

let stores: Map<string, MemoryCache>;
let listeners: Map<string, Listener>;
let preload: { enabled: boolean | null };

const caches = {
  open: async (name: string) => {
    const store = stores.get(name) ?? new MemoryCache();
    stores.set(name, store);
    return store;
  },
  keys: async () => [...stores.keys()],
  delete: async (name: string) => stores.delete(name),
};

/** Relative URLs resolve against the worker's origin, as they do inside a real worker. */
class OriginRequest extends Request {
  constructor(input: string, init?: RequestInit) {
    super(new URL(input, ORIGIN), init);
  }
}

const lifecycle = async (type: 'install' | 'activate') => {
  const pending: Promise<unknown>[] = [];
  listeners.get(type)?.({ waitUntil: (promise) => pending.push(promise) });
  await Promise.all(pending);
};

/** One request through the worker, with everything it keeps doing after it answered. */
const through = async (path: string, mode = 'navigate'): Promise<Response> => {
  const pending: Promise<unknown>[] = [];
  let answer: Promise<Response> | undefined;
  listeners.get('fetch')?.({
    request: { url: new URL(path, ORIGIN).href, method: 'GET', mode },
    respondWith: (response) => {
      answer = response;
    },
    waitUntil: (promise) => pending.push(promise),
    preloadResponse: Promise.resolve(undefined),
  });
  if (answer === undefined) throw new Error(`The worker left ${path} to the browser`);
  const response = await answer;
  await Promise.all(pending);
  return response;
};

/** Open a page the way a browser does: the document, then the stylesheet it names. */
const visit = async (path = '/') => {
  const page = await (await through(path)).text();
  const stylesheet = /href="([^"]+\.css)"/.exec(page)?.[1] ?? '';
  return { page, stylesheet: await through(stylesheet, 'no-cors') };
};

const deploy = (next: string) => {
  build = next;
};

beforeEach(async () => {
  stores = new Map();
  listeners = new Map();
  preload = { enabled: true };
  asked = [];
  online = true;
  deploy('a');
  const self = {
    location: { origin: ORIGIN },
    registration: {
      navigationPreload: {
        enable: async () => {
          preload.enabled = true;
        },
        disable: async () => {
          preload.enabled = false;
        },
      },
    },
    clients: { claim: async () => {} },
    skipWaiting: () => {},
    addEventListener: (type: string, listener: Listener) => listeners.set(type, listener),
  };
  new Function('self', 'caches', 'fetch', 'Request', source)(self, caches, host, OriginRequest);
  await lifecycle('install');
  await lifecycle('activate');
});

describe('a page after a deploy', () => {
  it('opens with the stylesheet of the build the host serves now', async () => {
    await visit();
    deploy('b');

    const { page, stylesheet } = await visit();

    expect(page).toContain('/_next/static/css/b.css');
    expect(stylesheet.status).toBe(200);
  });

  it('keeps its styles across two deploys between visits', async () => {
    // The case that broke on the live site: a visit between two deploys used to leave
    // the page of the middle build in the cache, and its stylesheet was gone by the next.
    await visit();
    deploy('b');
    await visit();
    deploy('c');

    const { page, stylesheet } = await visit();

    expect(page).toContain('/_next/static/css/c.css');
    expect(stylesheet.status).toBe(200);
  });
});

describe('the cache', () => {
  it('answers a hashed asset itself, without asking the host again', async () => {
    await visit();
    asked = [];

    const { stylesheet } = await visit();

    expect(stylesheet.status).toBe(200);
    expect(asked.map(({ path }) => path)).toEqual(['/']);
  });

  it('opens the last page and its styles when there is no network', async () => {
    await visit();
    online = false;

    const { page, stylesheet } = await visit();

    expect(page).toContain('/_next/static/css/a.css');
    expect(stylesheet.status).toBe(200);
  });

  it('answers with the app when offline on a page never visited', async () => {
    await visit();
    online = false;

    expect(await (await through('/razryady/')).text()).toContain('/_next/static/css/a.css');
  });
});

describe('the worker going live', () => {
  it('installs the shell past the HTTP cache, which may still hold the build before', () => {
    const install = asked.filter(({ cache }) => cache !== 'reload');

    expect(asked.length).toBeGreaterThan(0);
    expect(install).toEqual([]);
  });

  it('turns navigation preload off, since a preload reads the HTTP cache', () => {
    expect(preload.enabled).toBe(false);
  });
});
