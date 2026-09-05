import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRENT_EDITION, findStandard, listEvents } from '@/domain/standards/registry';
import type { Distance, Pool } from '@/domain/standards/types';
import { StandardsPage } from '@/features/standards-page/StandardsPage';
import { breadcrumbJsonLd } from '@/lib/jsonLd';
import { eventHeading } from '@/lib/labels';
import { parseStandardsParams, standardsParams, type StandardsParams } from '@/lib/routes';
import { standardsMetadata } from '@/lib/seo';
import type { EventRoute } from '@/lib/routes';
import type { EventRows } from '@/lib/standardsCopy';
import { JsonLd } from '@/ui';

type PageProps = { params: Promise<StandardsParams> };

/** Every event the dataset carries. A combination the order does not set gets no page. */
export function generateStaticParams(): StandardsParams[] {
  return listEvents().map(standardsParams);
}

/** Both sexes of one event, or null when the order sets no such event. */
const rowsFor = (event: EventRoute): EventRows | null => {
  const M = findStandard({ ...event, sex: 'M' });
  const F = findStandard({ ...event, sex: 'F' });
  return M === undefined || F === undefined ? null : { M, F };
};

const OTHER_POOL: Record<Pool, Pool> = { LCM: 'SCM', SCM: 'LCM' };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const event = parseStandardsParams(await params);
  return event === null ? {} : standardsMetadata(event, CURRENT_EDITION);
}

export default async function EventStandardsPage({ params }: PageProps) {
  const event = parseStandardsParams(await params);
  if (event === null) notFound();

  const rows = rowsFor(event);
  if (rows === null) notFound();

  const pool = OTHER_POOL[event.pool];
  const acrossPool = rowsFor({ ...event, pool });

  // The order's own distances for this stroke and pool, shortest first.
  const siblings: Distance[] = listEvents()
    .filter((other) => other.pool === event.pool && other.stroke === event.stroke)
    .map((other) => other.distance)
    .sort((a, b) => a - b);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(event, eventHeading(event))} />
      <StandardsPage
        event={event}
        rows={rows}
        edition={CURRENT_EDITION}
        siblings={siblings}
        otherPool={acrossPool === null ? null : { pool, rows: acrossPool }}
      />
    </>
  );
}
