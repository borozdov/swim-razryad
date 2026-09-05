/**
 * The directory of the reference layer. Its job is to be the one page that links to every
 * event page: without it a crawler meets thirty-five orphans and the sitemap is the only
 * thing vouching for them.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { listEvents } from '@/domain/standards/registry';
import { standardsPath } from '@/lib/routes';
import StandardsHubPage, { metadata } from './page';

describe('the directory of the reference layer', () => {
  it('links to every event page the export writes', () => {
    render(<StandardsHubPage />);
    const hrefs = new Set(screen.getAllByRole('link').map((link) => link.getAttribute('href')));

    for (const event of listEvents()) {
      expect(hrefs.has(standardsPath(event))).toBe(true);
    }
  });

  it('carries one heading and an absolute canonical of its own', () => {
    render(<StandardsHubPage />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(String(metadata.alternates?.canonical)).toBe('https://razryad.borozdov.ru/normativy/');
  });
});
