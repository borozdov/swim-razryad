'use client';

import { useState } from 'react';
import type { PointsResult } from '@/domain/standards/types';
import { trackGoal } from '@/lib/analytics';
import { CALCULATOR_PATH, type EventRoute } from '@/lib/routes';
import { SITE_URL } from '@/lib/seo';
import { Toast } from '@/ui';
import { drawShareCard } from './drawShareCard';
import { buildShareCard, shareFileName } from './shareCard';
import s from './ShareResultButton.module.css';

export type ShareResultButtonProps = {
  event: EventRoute;
  result: PointsResult;
  seconds: number;
  /** The query the form already writes into the address bar, so the link reopens this result. */
  query: string;
};

const TOAST_MS = 2200;

/** Saving the picture is what happens where no share sheet exists, as on a desktop browser. */
const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function ShareResultButton({ event, result, seconds, query }: ShareResultButtonProps) {
  const [toast, setToast] = useState<string | null>(null);

  const share = async () => {
    trackGoal('share_result');
    const card = buildShareCard(event, result, seconds);
    const link = `${SITE_URL}${CALCULATOR_PATH}?${query}`;
    const text = `${card.rank}: ${card.event}, ${card.time}. Рассчитано в «Разряде».\n\n${link}`;

    try {
      const blob = await drawShareCard(card, document.documentElement);
      const file = new File([blob], shareFileName(card), { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Мой разряд', text });
        return;
      }
      if (navigator.share !== undefined) {
        await navigator.share({ title: 'Мой разряд', text, url: link });
        return;
      }
      download(blob, shareFileName(card));
      setToast('Картинка скачана');
      window.setTimeout(() => setToast(null), TOAST_MS);
    } catch (error) {
      // Dismissing the share sheet is not a failure worth a message.
      const name = error instanceof Error ? error.name : '';
      if (name === 'AbortError') return;
      setToast('Не получилось поделиться');
      window.setTimeout(() => setToast(null), TOAST_MS);
    }
  };

  return (
    <>
      <button
        type="button"
        className={s.root}
        onClick={share}
        aria-label="Поделиться результатом"
        title="Поделиться результатом"
      >
        <svg
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
      </button>
      <Toast open={toast !== null}>{toast}</Toast>
    </>
  );
}
