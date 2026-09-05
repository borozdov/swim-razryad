import type { MetadataRoute } from 'next';
import { QR_PATH } from '@/lib/routes';
import { canonicalUrl } from '@/lib/seo';

/*
  Metadata routes are route handlers, and `output: 'export'` refuses to collect one that
  has not declared itself static. Without this the build fails outright.
*/
export const dynamic = 'force-static';

/** The product is public in full. Out of the index: the primitives, and the QR card. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/kitchen-sink/', QR_PATH] },
    sitemap: canonicalUrl('/sitemap.xml'),
  };
}
