import { describe, expect, it } from 'vitest';
import { INSTALL_NEVER_KEY, shouldOffer } from './install';

const storage = (value: string | null): Pick<Storage, 'getItem'> => ({ getItem: () => value });

const throwing: Pick<Storage, 'getItem'> = {
  getItem: () => {
    throw new Error('denied');
  },
};

describe('the install banner', () => {
  it('is offered to a reader who has not turned it down', () => {
    expect(shouldOffer(storage(null), { standalone: false, ios: false })).toBe(true);
  });

  it('stays away once the reader said never', () => {
    expect(shouldOffer(storage('1'), { standalone: false, ios: false })).toBe(false);
  });

  it('never appears inside the installed app', () => {
    expect(shouldOffer(storage(null), { standalone: true, ios: false })).toBe(false);
  });

  it('survives a storage that refuses to answer', () => {
    expect(shouldOffer(throwing, { standalone: false, ios: true })).toBe(true);
  });

  it('remembers the refusal under one key', () => {
    expect(INSTALL_NEVER_KEY).toBe('razryad.install.never');
  });
});
