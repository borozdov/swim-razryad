import type { ReactNode } from 'react';
import { SiteShell } from '@/features/site-shell/SiteShell';

/**
 * The reference layer wears the same chrome as the app but is allowed to scroll: these
 * pages are prose and a full table, not a screen. It is a group of its own and not part
 * of (shell), because that group's layout hands the shell its one-screen flow.
 */
export default function ReferenceLayout({ children }: { children: ReactNode }) {
  return <SiteShell flow="page">{children}</SiteShell>;
}
