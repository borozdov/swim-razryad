'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/nav';
import { CALCULATOR_PATH, HOME_PATH } from '@/lib/routes';
import s from './SiteNav.module.css';

/** Two sections only: the calculator owns its prefix, the standards index owns the rest. */
export const isActivePath = (href: string, pathname: string): boolean =>
  href === CALCULATOR_PATH
    ? pathname.startsWith(CALCULATOR_PATH)
    : !pathname.startsWith(CALCULATOR_PATH);

/** Sections switch like the modes of a calculator: one big segmented row, always in view. */
export function SiteNav() {
  const pathname = usePathname() ?? HOME_PATH;
  return (
    <nav className={s.root} aria-label="Разделы" data-chrome="nav" data-tour="sections">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = isActivePath(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={active ? `${s.item} ${s.active}` : s.item}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
