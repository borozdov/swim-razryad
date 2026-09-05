import type { Metadata } from 'next';
import { CURRENT_EDITION } from '@/domain/standards/registry';
import { RanksPage } from '@/features/ranks-page/RanksPage';
import { ranksMetadata } from '@/lib/seo';

export const metadata: Metadata = ranksMetadata;

export default function RanksRoute() {
  return <RanksPage edition={CURRENT_EDITION} />;
}
