import Link from 'next/link';
import type { ReactNode } from 'react';
import { QrLink } from '@/features/qr/QrLink';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { InstallButton } from '@/features/pwa/InstallButton';
import { InstallModal } from '@/features/pwa/InstallModal';
import { InstallPrompt } from '@/features/pwa/InstallPrompt';
import { InstallProvider } from '@/features/pwa/InstallProvider';
import { SiteFooter } from '@/features/site-footer/SiteFooter';
import { SiteNav } from '@/features/site-nav/SiteNav';
import { KeyboardMode } from '@/features/viewport/KeyboardMode';
import { HOME_PATH } from '@/lib/routes';
import { ThemeToggle } from '@/ui';
import s from './SiteShell.module.css';

export type SiteShellProps = {
  children: ReactNode;
  /**
   * The row under the header. The app draws its own there, inside the screen, because the
   * row switches its panes and has to sit over the same state; every other page gets the
   * links back into the app.
   */
  nav?: ReactNode;
  /**
   * `screen` is the app: it fits the viewport whole and nothing scrolls. `page` is the
   * reference layer, prose and tables read from top to bottom. globals.css keys the
   * one-screen rule off the attribute this sets, because the root layout cannot tell
   * which of the two it is wrapping.
   */
  flow?: 'screen' | 'page';
};

/**
 * The chrome around a page of the site: wordmark, the two switches, the sections row and
 * the footer. A component and not the layout of the group, because the 404 page renders
 * off the root layout and has to wear the same chrome.
 */
export function SiteShell({ children, flow = 'screen', nav = <SiteNav /> }: SiteShellProps) {
  return (
    <InstallProvider>
      <div
        className={flow === 'page' ? `${s.shell} ${s.page}` : s.shell}
        data-screen={flow === 'page' ? 'page' : 'app'}
      >
        <header className={s.header}>
          <Link href={HOME_PATH} className={s.wordmark} aria-label="Разряд, by Borozdov">
            <span className={s.wordmarkTop}>Разряд</span>
            <span className={s.wordmarkBottom}>by Borozdov</span>
          </Link>
          <div className={s.actions}>
            <QrLink />
            <InstallButton />
            <ThemeToggle />
          </div>
        </header>
        {nav}
        <main className={s.main}>{children}</main>
        <SiteFooter />
      </div>
      <KeyboardMode />
      <InstallPrompt />
      <InstallModal />
      <Onboarding />
    </InstallProvider>
  );
}
