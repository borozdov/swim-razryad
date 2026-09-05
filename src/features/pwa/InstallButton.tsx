'use client';

import { trackGoal } from '@/lib/analytics';
import { useInstall } from './InstallProvider';
import s from './InstallButton.module.css';

/**
 * Installs the app from the header, the way fina.borozdov.ru does it: the tap opens the
 * card, and the card either installs or says how. Nothing to show once the app already
 * runs from the home screen.
 */
export function InstallButton() {
  const install = useInstall();
  if (install === null || install.standalone) return null;

  const onClick = () => {
    trackGoal('install_open');
    install.openModal();
  };

  return (
    <button
      type="button"
      className={s.root}
      onClick={onClick}
      aria-label="Установить приложение"
      title="Установить приложение"
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
        <path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1" />
        <polyline points="16 12 12 16 8 12" />
        <line x1="12" y1="16" x2="12" y2="4" />
      </svg>
    </button>
  );
}
