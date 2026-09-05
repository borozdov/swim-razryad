/**
 * Look selection. Two looks: obsidian (dark, primary) and titan (light).
 *
 * The saved choice wins. The system preference is read only when nothing is
 * saved yet and the result is saved right away, so the system is consulted
 * exactly once per browser: on the first visit. Live changes of the OS theme
 * never move the look; only the toggle does.
 */
export type Theme = 'obsidian' | 'titan';

export const THEME_STORAGE_KEY = 'razryad.theme';
export const THEME_ATTRIBUTE = 'data-theme';
export const DEFAULT_THEME: Theme = 'obsidian';

/**
 * The canvas of each look. globals.css owns every colour value in the project, but the
 * browser chrome and the installed app are painted from meta tags and a JSON manifest,
 * and none of them can read a CSS variable. These restate the two values they need;
 * theme.test.ts holds them, globals.css and the manifest to the same colours.
 *
 * Both are needed because theme-color is split by scheme: a single obsidian tag paints
 * the Safari toolbar near black even when the page is showing titan.
 */
export const OBSIDIAN_CANVAS = '#0d0d0d';
export const TITAN_CANVAS = '#fafafa';

const LIGHT_QUERY = '(prefers-color-scheme: light)';
const SWITCHING_CLASS = 'theme-switching';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;
type MatchMedia = (query: string) => { matches: boolean };
type ThemeRoot = Pick<HTMLElement, 'getAttribute' | 'setAttribute' | 'classList' | 'offsetHeight'>;

export function isTheme(value: unknown): value is Theme {
  return value === 'obsidian' || value === 'titan';
}

export function readStoredTheme(storage: ThemeStorage): Theme | null {
  try {
    const stored = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function saveTheme(storage: ThemeStorage, theme: Theme): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is blocked or full: the choice lives until the next page load.
  }
}

export function readSystemTheme(matchMedia: MatchMedia | undefined): Theme {
  if (!matchMedia) return DEFAULT_THEME;
  return matchMedia(LIGHT_QUERY).matches ? 'titan' : 'obsidian';
}

/** Saved choice first. Without one the system theme is read and saved, so it is read only once. */
export function resolveInitialTheme(
  storage: ThemeStorage,
  matchMedia: MatchMedia | undefined,
): Theme {
  const stored = readStoredTheme(storage);
  if (stored) return stored;
  const system = readSystemTheme(matchMedia);
  saveTheme(storage, system);
  return system;
}

export function toggleTheme(theme: Theme): Theme {
  return theme === 'obsidian' ? 'titan' : 'obsidian';
}

export function readAppliedTheme(root: ThemeRoot): Theme | null {
  const applied = root.getAttribute(THEME_ATTRIBUTE);
  return isTheme(applied) ? applied : null;
}

/** Switches the look instantly: hover transitions must not cascade over the page. */
export function applyTheme(root: ThemeRoot, theme: Theme): void {
  root.classList.add(SWITCHING_CLASS);
  root.setAttribute(THEME_ATTRIBUTE, theme);
  // Reading a layout property forces a reflow while transitions are off.
  void root.offsetHeight;
  root.classList.remove(SWITCHING_CLASS);
}

/**
 * Runs inline in <head> before the first paint, so the page never flashes the
 * wrong look. Mirrors resolveInitialTheme; theme.test.ts checks they agree.
 */
export const themeInitScript = [
  '(function(){try{',
  `var k=${JSON.stringify(THEME_STORAGE_KEY)},t=localStorage.getItem(k);`,
  "if(t!=='obsidian'&&t!=='titan'){",
  `t=window.matchMedia&&window.matchMedia(${JSON.stringify(LIGHT_QUERY)}).matches?'titan':'obsidian';`,
  'localStorage.setItem(k,t)}',
  `document.documentElement.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},t)`,
  '}catch(e){}})()',
].join('');
