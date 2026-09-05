'use client';

import { trackGoal } from '@/lib/analytics';
import { useInstall } from './InstallProvider';
import s from './InstallPrompt.module.css';

/**
 * The install banner of fina.borozdov.ru, part for part: a row with the phone, the two
 * lines and the cross, and under it two buttons edge to edge. Where the browser hands
 * over no prompt, «Установить» opens the card with the instructions instead.
 */
export function InstallPrompt() {
  const install = useInstall();
  if (install === null || !install.offered || install.standalone) return null;

  const onInstall = () => {
    trackGoal('install_banner_action');
    if (install.ready) {
      void install.install();
      return;
    }
    install.openModal();
  };

  return (
    <aside className={s.root} role="alert" aria-live="polite" aria-label="Установка приложения">
      <div className={s.content}>
        <span className={s.icon}>
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </span>
        <span className={s.text}>
          <strong>Установите приложение</strong>
          <span>Добавьте на рабочий стол для быстрого доступа</span>
        </span>
        <button type="button" className={s.close} onClick={install.hide} aria-label="Закрыть">
          ×
        </button>
      </div>
      <div className={s.actions}>
        <button type="button" className={s.install} onClick={onInstall}>
          Установить
        </button>
        <button type="button" className={s.never} onClick={install.never}>
          Больше не показывать
        </button>
      </div>
    </aside>
  );
}
