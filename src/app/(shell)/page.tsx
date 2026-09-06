import type { Metadata } from 'next';
import { CURRENT_EDITION } from '@/domain/standards/registry';
import { AppScreen } from '@/features/app/AppScreen';
import { siteJsonLd } from '@/lib/jsonLd';
import { appMetadata } from '@/lib/seo';
import { JsonLd } from '@/ui';

export const metadata: Metadata = appMetadata(CURRENT_EDITION);

export default function HomePage() {
  // The same rows the distance pages prerender from, so the index cannot go stale.
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <AppScreen rows={CURRENT_EDITION.rows} />
    </>
  );
}
