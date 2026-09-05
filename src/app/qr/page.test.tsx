import { describe, expect, it } from 'vitest';
import { QR_PATH } from '@/lib/routes';
import { canonicalUrl } from '@/lib/seo';
import { metadata } from './page';

describe('/qr/', () => {
  it('claims its own address as canonical', () => {
    expect(String(metadata.alternates?.canonical)).toBe(canonicalUrl(QR_PATH));
  });

  it('asks to stay out of the index: it answers a camera, not a search', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
