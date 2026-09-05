import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  applyTheme,
  readAppliedTheme,
  readStoredTheme,
  resolveInitialTheme,
  saveTheme,
  themeInitScript,
  toggleTheme,
} from './theme';

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
  };
}

const lightSystem = () => ({ matches: true });
const darkSystem = () => ({ matches: false });

describe('resolveInitialTheme', () => {
  it('takes the system theme when nothing is saved', () => {
    expect(resolveInitialTheme(memoryStorage(), lightSystem)).toBe('titan');
    expect(resolveInitialTheme(memoryStorage(), darkSystem)).toBe('obsidian');
  });

  it('falls back to obsidian when the system theme cannot be read', () => {
    expect(resolveInitialTheme(memoryStorage(), undefined)).toBe('obsidian');
  });

  it('prefers the saved choice over the system theme', () => {
    const savedDark = memoryStorage({ [THEME_STORAGE_KEY]: 'obsidian' });
    const savedLight = memoryStorage({ [THEME_STORAGE_KEY]: 'titan' });
    expect(resolveInitialTheme(savedDark, lightSystem)).toBe('obsidian');
    expect(resolveInitialTheme(savedLight, darkSystem)).toBe('titan');
  });

  it('reads the system theme only on the first visit', () => {
    const storage = memoryStorage();
    expect(resolveInitialTheme(storage, lightSystem)).toBe('titan');
    expect(resolveInitialTheme(storage, darkSystem)).toBe('titan');
  });

  it('treats an unknown saved value as no choice', () => {
    const storage = memoryStorage({ [THEME_STORAGE_KEY]: 'sepia' });
    expect(resolveInitialTheme(storage, lightSystem)).toBe('titan');
  });
});

describe('saveTheme and readStoredTheme', () => {
  it('round-trips the choice', () => {
    const storage = memoryStorage();
    saveTheme(storage, 'titan');
    expect(readStoredTheme(storage)).toBe('titan');
    saveTheme(storage, 'obsidian');
    expect(readStoredTheme(storage)).toBe('obsidian');
  });

  it('reads null when nothing is saved', () => {
    expect(readStoredTheme(memoryStorage())).toBeNull();
  });

  it('survives a storage that throws', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(readStoredTheme(blocked)).toBeNull();
    expect(() => saveTheme(blocked, 'titan')).not.toThrow();
  });
});

describe('toggleTheme', () => {
  it('flips between the two looks', () => {
    expect(toggleTheme('obsidian')).toBe('titan');
    expect(toggleTheme('titan')).toBe('obsidian');
  });
});

describe('applyTheme', () => {
  it('writes the look onto the root and leaves no switching class behind', () => {
    const root = document.documentElement;
    applyTheme(root, 'titan');
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('titan');
    expect(readAppliedTheme(root)).toBe('titan');
    expect(root.classList.contains('theme-switching')).toBe(false);
  });
});

describe('themeInitScript', () => {
  const runInlineScript = () => new Function(themeInitScript)();

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies the system theme and saves it on the first visit', () => {
    vi.stubGlobal('matchMedia', lightSystem);
    runInlineScript();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('titan');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('titan');
  });

  it('applies the saved choice regardless of the system theme', () => {
    vi.stubGlobal('matchMedia', lightSystem);
    localStorage.setItem(THEME_STORAGE_KEY, 'obsidian');
    runInlineScript();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('obsidian');
  });

  it('agrees with resolveInitialTheme', () => {
    vi.stubGlobal('matchMedia', darkSystem);
    runInlineScript();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe(
      resolveInitialTheme(localStorage, darkSystem),
    );
  });
});
