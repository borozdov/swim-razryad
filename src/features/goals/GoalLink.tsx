'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { trackGoal, type Goal } from '@/lib/analytics';

export type GoalLinkProps = {
  href: string;
  goal: Goal;
  params: Record<string, string>;
  className?: string;
  /** Set on a link out of the site: it becomes a plain anchor with this rel. */
  rel?: string;
  children: ReactNode;
};

/**
 * A link that reports a goal on the click. A client island so the pages of the reference
 * layer stay server-rendered around it, the way AuthorLink does it for the author's site.
 * The goal name comes in as a prop: one component serves every link worth counting.
 */
export function GoalLink({ href, goal, params, className, rel, children }: GoalLinkProps) {
  const report = () => trackGoal(goal, params);
  if (rel !== undefined) {
    return (
      <a href={href} className={className} rel={rel} onClick={report}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={report}>
      {children}
    </Link>
  );
}
