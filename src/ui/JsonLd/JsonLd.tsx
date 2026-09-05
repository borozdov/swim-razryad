import type { ReactNode } from 'react';

export type JsonLdProps = {
  /** A plain object; it is serialised here so a page never hand-writes JSON. */
  data: Record<string, unknown>;
};

/**
 * Structured data for search engines. The tag renders nothing, so it costs the one-screen
 * layout no height.
 */
export function JsonLd({ data }: JsonLdProps): ReactNode {
  return (
    <script
      type="application/ld+json"
      // The payload is built in lib/, never from anything a reader typed.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
