import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AUTHOR_URL, SiteFooter } from './SiteFooter';

describe('SiteFooter', () => {
  it('links the author to the main site, tagged as the source of the visit', () => {
    render(<SiteFooter />);
    const link = screen.getByRole('link', { name: /borozdov\.ru/i });

    expect(link).toHaveAttribute('href', AUTHOR_URL);
    expect(link).toHaveAttribute('rel', 'author');
    expect(AUTHOR_URL).toContain('utm_source=razryad.borozdov.ru');
    expect(screen.getByText(/Сделал/)).toHaveTextContent(/Nikita Borozdov/);
  });
});
