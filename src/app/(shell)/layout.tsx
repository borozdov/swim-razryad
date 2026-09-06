import type { ReactNode } from 'react';
import { SiteShell } from '@/features/site-shell/SiteShell';

/**
 * The app and the two pages that stand beside it. No sections row from the shell: the app
 * draws its own inside the screen, because there it switches panes instead of navigating.
 * /qr/ sits outside this group and gets the bare root layout.
 */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <SiteShell nav={null}>{children}</SiteShell>;
}
