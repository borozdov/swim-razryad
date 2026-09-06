import type { MetadataRoute } from 'next';
import { CURRENT_EDITION, listEvents } from '@/domain/standards/registry';
import { HOME_PATH, RANKS_PATH, STANDARDS_ROOT, standardsPath } from '@/lib/routes';
import { canonicalUrl } from '@/lib/seo';

/*
  Metadata routes are route handlers, and `output: 'export'` refuses to collect one that
  has not declared itself static. Without this the build fails outright.
*/
export const dynamic = 'force-static';

/**
 * Every page the export writes and means a search to find: the app, and the reference
 * layer of one page per event plus the explainer. /kitchen-sink stays out, it renders the
 * primitives for the skeleton checklist; /qr/ stays out, it answers a camera; /kalkulyator/
 * stays out, it is the old address of a mode of the app and forwards to it.
 *
 * The list is built from `listEvents()` and not written down, so an edition that adds an
 * event adds its page and its sitemap entry in the same step.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // The numbers change only when a new edition of the order does, and that is the date.
  const lastModified = new Date(CURRENT_EDITION.effectiveFrom);
  const priority = (path: string): number => {
    if (path === HOME_PATH) return 1;
    if (path === STANDARDS_ROOT || path === RANKS_PATH) return 0.8;
    return 0.6;
  };

  return [HOME_PATH, STANDARDS_ROOT, RANKS_PATH, ...listEvents().map(standardsPath)].map(
    (path) => ({
      url: canonicalUrl(path),
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: priority(path),
    }),
  );
}
