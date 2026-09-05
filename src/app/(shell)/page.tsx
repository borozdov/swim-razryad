import type { Metadata } from 'next';
import { CURRENT_EDITION } from '@/domain/standards/registry';
import { StandardsIndex } from '@/features/standards-index/StandardsIndex';
import { siteJsonLd } from '@/lib/jsonLd';
import { standardsIndexMetadata } from '@/lib/seo';
import { JsonLd } from '@/ui';

export const metadata: Metadata = standardsIndexMetadata(CURRENT_EDITION);

export default function HomePage() {
  // The same rows the distance pages prerender from, so the index cannot go stale.
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <StandardsIndex rows={CURRENT_EDITION.rows} />
    </>
  );
}
