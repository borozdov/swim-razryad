import { afterEach, describe, expect, it, vi } from 'vitest';
import { METRIKA_ID, metrikaScript, trackGoal } from './analytics';

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
