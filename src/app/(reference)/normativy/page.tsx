import type { Metadata } from 'next';
import { CURRENT_EDITION, listEvents } from '@/domain/standards/registry';
import { StandardsHub } from '@/features/standards-hub/StandardsHub';
import { standardsHubMetadata } from '@/lib/seo';

export const metadata: Metadata = standardsHubMetadata;

export default function StandardsHubPage() {
  return <StandardsHub events={listEvents()} edition={CURRENT_EDITION} />;
}
