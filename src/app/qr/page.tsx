import type { Metadata } from 'next';
import { QrScreen } from '@/features/qr/QrScreen';
import { qrMetadata } from '@/lib/seo';

export const metadata: Metadata = qrMetadata;

export default function QrPage() {
  return <QrScreen />;
}
