import { afterEach, describe, expect, it, vi } from 'vitest';
import { METRIKA_ID, metrikaScript, trackGoal } from './analytics';

afterEach(() => {
  Reflect.deleteProperty(window, 'ym');
});

describe('analytics', () => {
  it('reports nothing while no counter is configured', () => {
    const ym = vi.fn();
    Object.assign(window, { ym });

    trackGoal('share_result');

    // The constant is the switch: with it null, the app must stay quiet.
    expect(METRIKA_ID).toBeNull();
    expect(ym).not.toHaveBeenCalled();
  });

  it('survives a page where the counter never loaded', () => {
    expect(() => trackGoal('share_app', { where: 'header' })).not.toThrow();
  });

  it('builds a loader that carries the counter it was given', () => {
    const script = metrikaScript(12345);

    expect(script).toContain('id=12345');
    expect(script).toContain("ym(12345,'init'");
  });
});
