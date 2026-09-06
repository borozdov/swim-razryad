import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav';
import { HOME_PATH, appPath } from '@/lib/routes';
import { SiteNav } from './SiteNav';

describe('SiteNav', () => {
  it('lists every item of the header data, nothing more', () => {
    render(<SiteNav />);

    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual(
      NAV_ITEMS.map((item) => appPath(item.mode)),
    );
  });

  /* Both items lead to the one page of the app: the default mode is its bare address. */
  it('sends both items to the app, and names the mode only where it has to', () => {
    render(<SiteNav />);

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));

    expect(hrefs).toContain(HOME_PATH);
    expect(hrefs).toContain(`${HOME_PATH}?mode=calculator`);
  });

  /* Neither is where the reader stands: this row hangs on the pages that are not the app. */
  it('marks no item as the page being read', () => {
    render(<SiteNav />);

    expect(screen.queryByRole('link', { current: 'page' })).not.toBeInTheDocument();
  });
});
