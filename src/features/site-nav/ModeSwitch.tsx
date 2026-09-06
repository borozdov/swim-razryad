'use client';

import type { KeyboardEvent } from 'react';
import { NAV_ITEMS } from '@/lib/nav';
import type { Mode } from '@/lib/routes';
import s from './SiteNav.module.css';

/** The two ids the row and the panes below it are wired together by. */
export const modeTabId = (mode: Mode): string => `mode-tab-${mode}`;

export const modePaneId = (mode: Mode): string => `mode-pane-${mode}`;

export type ModeSwitchProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

/**
 * The same row as ever, and nothing behind it navigates any more: both modes stand at one
 * address, so this shows one pane and hides the other while everything above it — the
 * bassin, the sex, the stroke, the distance, the time — stays exactly as it was.
 *
 * Tabs and not links: what changes is a panel of this page and not the page.
 */
export function ModeSwitch({ mode, onChange }: ModeSwitchProps) {
  /* Arrow keys walk the row, the way they walk the radio groups of the form below it. */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = NAV_ITEMS.findIndex((item) => item.mode === mode);
    const next = (index + step + NAV_ITEMS.length) % NAV_ITEMS.length;
    onChange(NAV_ITEMS[next].mode);
    event.currentTarget.querySelectorAll('button')[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Разделы"
      className={s.root}
      data-chrome="nav"
      data-tour="sections"
      onKeyDown={handleKeyDown}
    >
      {NAV_ITEMS.map((item) => {
        const active = item.mode === mode;
        return (
          <button
            key={item.mode}
            type="button"
            role="tab"
            id={modeTabId(item.mode)}
            aria-selected={active}
            aria-controls={modePaneId(item.mode)}
            tabIndex={active ? 0 : -1}
            className={active ? `${s.item} ${s.active}` : s.item}
            onClick={() => onChange(item.mode)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
