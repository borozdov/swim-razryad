import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { METRIKA_ID, metrikaScript, trackGoal } from './analytics';

const SRC = resolve(process.cwd(), 'src');

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.tsx?$/.test(entry.name)) return [];
    // The declaration itself and the tests are not call sites.
    if (/\.test\.tsx?$/.test(entry.name) || path.endsWith('lib/analytics.ts')) return [];
    return [path];
  });

/** Everything in the app that reports a goal, as one blob of text. */
const reporters = sourceFiles(SRC)
  .map((path) => readFileSync(path, 'utf8'))
  .filter((text) => text.includes('trackGoal'))
  .join('\n');

/** The union in analytics.ts, read from the file so the two can never drift apart. */
const declaredGoals = (): string[] => {
  const source = readFileSync(join(SRC, 'lib/analytics.ts'), 'utf8');
  const union = source.slice(
    source.indexOf('export type Goal'),
    source.indexOf("| 'to_site';") + 12,
  );
  return [...union.matchAll(/'([a-z_]+)'/g)].map((match) => match[1]);
};

afterEach(() => {
  Reflect.deleteProperty(window, 'ym');
});

describe('analytics', () => {
  it('reports a goal to the counter the app is configured with', () => {
    const ym = vi.fn();
    Object.assign(window, { ym });

    trackGoal('share_result');

    expect(METRIKA_ID).not.toBeNull();
    expect(ym).toHaveBeenCalledWith(METRIKA_ID, 'reachGoal', 'share_result', undefined);
  });

  /* Analytics is never a reason for the app to fail, so every path here has to be silent. */
  it('survives a page where the counter never loaded', () => {
    expect(() => trackGoal('share_app', { where: 'header' })).not.toThrow();
  });

  it('survives a counter that throws', () => {
    Object.assign(window, {
      ym: () => {
        throw new Error('blocked');
      },
    });

    expect(() => trackGoal('to_site')).not.toThrow();
  });

  /*
    The one thing that makes the loader a script is that a browser can parse it, and no
    assertion about its text can see that. While the build was eating the eight characters
    between the two counter numbers, `id=12345` and `ym(12345,'init'` were both still in
    the string and the checks below stayed green over a counter that never started. This
    guards the source; the export is guarded by scripts/check-build.mjs, which is where the
    loader actually broke.
  */
  it('parses as JavaScript', () => {
    expect(() => new Function(metrikaScript(12345))).not.toThrow();
  });

  it('builds a loader that carries the counter it was given', () => {
    const script = metrikaScript(12345);

    expect(script).toContain('id=12345');
    expect(script).toContain("ym(12345,'init'");
  });

  /* Prerendered HTML: the first hit is not a render the counter has to wait for. */
  it('tells the counter the pages are rendered ahead of time', () => {
    expect(metrikaScript(1)).toContain('ssr:true');
  });
});

/*
  A goal that is declared but never fired is a row in Metrika that stays at zero forever,
  and it looks exactly like a goal that nobody reaches. This is what keeps the union honest.
*/
describe('every goal the app declares', () => {
  it('finds all sixteen of them', () => {
    expect(declaredGoals()).toHaveLength(16);
  });

  it('is reported from somewhere in the app', () => {
    const unfired = declaredGoals().filter((goal) => !reporters.includes(`'${goal}'`));

    expect(unfired).toEqual([]);
  });
});
