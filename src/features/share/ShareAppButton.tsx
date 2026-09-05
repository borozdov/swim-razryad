'use client';

import { useState } from 'react';
import { trackGoal } from '@/lib/analytics';
import { SITE_URL } from '@/lib/seo';
import { Toast } from '@/ui';
import s from './ShareAppButton.module.css';

const TITLE = 'Разряд';

const TEXT = 'Разрядные нормативы ЕВСК по плаванию и очки разряда. Работает без интернета.';

const TOAST_MS = 2200;

export type ShareAppButtonProps = {
  /** Given, the button wears its label and reads as a plate instead of an icon. */
  label?: string;
};

/** Shares the app itself, not a result: the link a swimmer sends a training partner. */
export function ShareAppButton({ label }: ShareAppButtonProps) {
  const [toast, setToast] = useState<string | null>(null);

  const announce = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), TOAST_MS);
  };

  const share = async () => {
    trackGoal('share_app');
    try {
      if (navigator.share !== undefined) {
        await navigator.share({ title: TITLE, text: TEXT, url: SITE_URL });
        return;
      }
      // No share sheet: the address goes to the clipboard instead, and the toast says so.
      await navigator.clipboard.writeText(`${TEXT}\n\n${SITE_URL}`);
      announce('Ссылка скопирована');
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') return;
      announce('Не получилось поделиться');
    }
  };

  const titled = label !== undefined;
  return (
    <>
      <button
        type="button"
        className={titled ? s.labelled : s.root}
        onClick={share}
        aria-label={titled ? undefined : 'Поделиться приложением'}
        title={titled ? undefined : 'Поделиться приложением'}
      >
        <svg
          className={s.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {titled ? label : null}
      </button>
      <Toast open={toast !== null}>{toast}</Toast>
    </>
  );
}
