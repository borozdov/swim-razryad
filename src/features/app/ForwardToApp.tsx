'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { HOME_PATH, appPath } from '@/lib/routes';
import type { Mode } from '@/lib/routes';
import s from './ForwardToApp.module.css';

export type ForwardToAppProps = {
  mode: Mode;
};

/**
 * The doormat of an address that is no longer a screen. Whatever the old link named — a
 * pool, a stroke, a time somebody shared two years ago — is carried over as it stands and
 * only the mode is written on top, because the query of the app reads the same vocabulary.
 * `replace` and not `assign`: Back has to leave the site, not bounce off this page.
 */
export function ForwardToApp({ mode }: ForwardToAppProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', mode);
    window.location.replace(`${HOME_PATH}?${params.toString()}`);
  }, [mode]);

  return (
    <div className={s.root}>
      <p>Калькулятор теперь на главной.</p>
      <Link href={appPath(mode)} className={s.link}>
        Открыть →
      </Link>
    </div>
  );
}
