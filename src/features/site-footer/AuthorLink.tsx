'use client';

import type { ReactNode } from 'react';
import { trackGoal } from '@/lib/analytics';

/** Where the reader was standing when they left. One goal, two places it can fire from. */
export type AuthorSource = 'footer' | 'bio';

export type AuthorLinkProps = {
  href: string;
  from: AuthorSource;
  className?: string;
  children: ReactNode;
};

/**
 * The way out of the app to the author's own site. A client island only because the goal
 * is reported on the click; whatever wraps it stays server-rendered.
 *
 * Two things carry the source, and both are needed: the goal parameter tells our own
 * Metrika which link was followed, and the utm_campaign in `href` tells the counter on
 * the far side. Neither can see what the other sees.
 */
export function AuthorLink({ href, from, className, children }: AuthorLinkProps) {
  return (
    <a
      className={className}
      href={href}
      rel="author"
      onClick={() => trackGoal('to_site', { from })}
    >
      {children}
    </a>
  );
}
