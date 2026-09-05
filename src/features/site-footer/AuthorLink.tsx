'use client';

import { trackGoal } from '@/lib/analytics';
import s from './SiteFooter.module.css';

export type AuthorLinkProps = { href: string };

/**
 * The one way out of the app. A client island only because the goal is reported on the
 * click; the footer around it stays server-rendered.
 */
export function AuthorLink({ href }: AuthorLinkProps) {
  return (
    <a className={s.authorLink} href={href} rel="author" onClick={() => trackGoal('to_site')}>
      borozdov.ru{' '}
      <span className={s.arrow} aria-hidden="true">
        →
      </span>
    </a>
  );
}
