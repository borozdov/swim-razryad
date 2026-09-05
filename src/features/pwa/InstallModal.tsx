'use client';

import { trackGoal } from '@/lib/analytics';
import { useInstall } from './InstallProvider';
import s from './InstallModal.module.css';

/**
 * The card of fina.borozdov.ru that says how to install where the browser offers no
 * prompt of its own. On iOS it shows the two taps of Safari; elsewhere it installs.
 */
export function InstallModal() {
  const install = useInstall();
  if (install === null || !install.modal || install.standalone) return null;

  return (
    <div
      className={s.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Установить приложение"
      onClick={(event) => {
        // A tap on the scrim closes; a tap on the card must not.
        if (event.target === event.currentTarget) install.closeModal();
      }}
    >
      <div className={s.card}>
        <button type="button" className={s.close} onClick={install.closeModal} aria-label="Закрыть">
          ×
        </button>
        <h3 className={s.title}>Установить приложение</h3>
        {install.ios ? (
          <p className={s.instruction}>
            Нажмите значок{' '}
            <svg
              className={s.inlineIcon}
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
            </svg>{' '}
            <strong>Поделиться</strong> в браузере, затем выберите
            <br />
            <strong>«На экран Домой»</strong>
          </p>
        ) : (
          <>
            <p className={s.text}>
              Добавьте нормативы и калькулятор на главный экран: быстрый доступ и работа без
              интернета.
            </p>
            {install.ready ? (
              <button
                type="button"
                className={s.action}
                onClick={() => {
                  trackGoal('install_banner_action');
                  void install.install();
                }}
              >
                Установить
              </button>
            ) : (
              <p className={s.instruction}>
                Откройте меню браузера и выберите <strong>«Установить приложение»</strong>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
