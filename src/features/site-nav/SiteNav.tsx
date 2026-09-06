import Link from 'next/link';
import { NAV_ITEMS } from '@/lib/nav';
import { appPath } from '@/lib/routes';
import s from './SiteNav.module.css';

/**
 * The way back into the app from a page that is not it: the reference layer and the 404.
 * Neither item is marked current, because neither is where the reader stands — the app is
 * one page elsewhere, and these are the two modes it can be opened in.
 */
export function SiteNav() {
  return (
    <nav className={s.root} aria-label="Разделы" data-chrome="nav">
      {NAV_ITEMS.map(({ mode, label }) => (
        <Link key={mode} href={appPath(mode)} className={s.item}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
