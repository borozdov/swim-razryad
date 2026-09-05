import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HOME_PATH } from '@/lib/routes';
import { SITE_URL, canonicalUrl } from '@/lib/seo';
import { QrScreen } from './QrScreen';

const host = new URL(SITE_URL).host;

describe('QR card', () => {
  it('points the code at the canonical home address', () => {
    render(<QrScreen />);

    expect(screen.getByRole('img').getAttribute('aria-label')).toContain(canonicalUrl(HOME_PATH));
  });

  it('draws three finder eyes and a seal carrying the letter of the app', () => {
    const { container } = render(<QrScreen />);
    const code = container.querySelector('svg[role="img"]');

    expect(code?.querySelectorAll('g')).toHaveLength(3);
    expect(code?.querySelector('text')?.textContent).toBe('Р');
  });

  it('prints the address a reader can also type', () => {
    render(<QrScreen />);

    expect(screen.getByText(host)).toBeInTheDocument();
  });

  it('offers the way back and the wordmark, both to the home page', () => {
    render(<QrScreen />);

    const home = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === HOME_PATH);

    expect(home.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole('link', { name: 'Назад' })).toBeInTheDocument();
  });

  it('carries a share button that says what it does', () => {
    render(<QrScreen />);

    expect(screen.getByRole('button', { name: 'Поделиться' })).toBeInTheDocument();
  });

  it('names what the app is in tags', () => {
    render(<QrScreen />);

    for (const tag of ['PWA', 'Оффлайн', 'Нормативы']) {
      expect(screen.getByText(tag)).toBeInTheDocument();
    }
  });
});
