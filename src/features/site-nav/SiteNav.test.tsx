import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav';
import { CALCULATOR_PATH, HOME_PATH } from '@/lib/routes';
import { SiteNav, isActivePath } from './SiteNav';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({ usePathname: () => pathname.current }));

describe('SiteNav', () => {
  it('lists every item of the header data, nothing more', () => {
    pathname.current = '/';
    render(<SiteNav />);

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(
      NAV_ITEMS.map((item) => item.href),
    );
  });

  it('marks the standards item on the home page', () => {
    pathname.current = '/';
    render(<SiteNav />);

    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent('Нормативы');
  });

  it('leaves the standards item active anywhere outside the calculator', () => {
    expect(isActivePath(HOME_PATH, HOME_PATH)).toBe(true);
    expect(isActivePath(CALCULATOR_PATH, HOME_PATH)).toBe(false);
  });

  it('marks the calculator active only on its own page', () => {
    pathname.current = CALCULATOR_PATH;
    render(<SiteNav />);

    expect(screen.getByRole('link', { current: 'page' })).toHaveTextContent('Калькулятор');
    expect(isActivePath(HOME_PATH, CALCULATOR_PATH)).toBe(false);
  });
});
