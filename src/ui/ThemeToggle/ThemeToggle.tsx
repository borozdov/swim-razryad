'use client';

import { useEffect, useState } from 'react';
import {
  applyTheme,
  readAppliedTheme,
  resolveInitialTheme,
  saveTheme,
  toggleTheme,
  type Theme,
} from '@/lib/theme';
import s from './ThemeToggle.module.css';

/* The label names the look a click leads to, like the icon does. */
const LABELS: Record<Theme, string> = {
  obsidian: 'Включить светлую тему',
  titan: 'Включить тёмную тему',
};

function systemMatchMedia() {
  return typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    // The inline script in <head> has normally applied the look already.
    const applied = readAppliedTheme(root);
    if (applied) {
      setTheme(applied);
      return;
    }
    const resolved = resolveInitialTheme(localStorage, systemMatchMedia());
    applyTheme(root, resolved);
    setTheme(resolved);
  }, []);

  const handleClick = () => {
    const root = document.documentElement;
    const next = toggleTheme(theme ?? readAppliedTheme(root) ?? 'obsidian');
    saveTheme(localStorage, next);
    applyTheme(root, next);
    setTheme(next);
  };

  const label = theme ? LABELS[theme] : 'Переключить тему';
  return (
    <button type="button" className={s.root} onClick={handleClick} aria-label={label} title={label}>
      <svg
        className={`${s.icon} ${s.sun}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className={`${s.icon} ${s.moon}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
