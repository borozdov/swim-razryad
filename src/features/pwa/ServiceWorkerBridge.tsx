'use client';

import { useEffect, useState } from 'react';
import { Toast } from '@/ui';

/**
 * Registers the service worker and offers the update instead of taking it. A worker that
 * activated itself would reload the page under the reader's hands, possibly mid-typing,
 * so the new one waits until the button below posts SKIP_WAITING.
 */
export function ServiceWorkerBridge() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      // Guarded: controllerchange can fire more than once, and one reload is enough.
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        if (registration.waiting) setWaiting(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          if (installing === null) return;
          installing.addEventListener('statechange', () => {
            // A worker installed while another controls the page is an update, not a first run.
            if (installing.state === 'installed' && navigator.serviceWorker.controller) {
              setWaiting(installing);
            }
          });
        });
      })
      .catch(() => {
        // No offline this visit. Nothing else about the app depends on it.
      });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  return (
    <Toast
      open={waiting !== null}
      action={{
        label: 'Обновить',
        onClick: () => {
          waiting?.postMessage({ type: 'SKIP_WAITING' });
          setWaiting(null);
        },
      }}
    >
      Новая версия
    </Toast>
  );
}
