import type { ReactNode } from 'react';
import { SiteShell } from '@/features/site-shell/SiteShell';

/** Every section of the site. /qr/ sits outside this group and gets the bare root layout. */
export default function ShellLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
