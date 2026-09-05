/**
 * The reference layer: one page per event of the order, every number of it visible, and a
 * way on to the neighbouring distance so a reader need not go back to the results page.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RANK_ORDER } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import { findStandard, listEvents } from '@/domain/standards/registry';
import { standardsParams } from '@/lib/routes';
import EventStandardsPage, { generateMetadata, generateStaticParams } from './page';

/** 100 m breaststroke, short course. Both pools carry it, so the comparison has something to say. */
const PARAMS = { pool: 'scm', stroke: 'breast', distance: '100' };

const renderEvent = async (params: typeof PARAMS) =>
  render(await EventStandardsPage({ params: Promise.resolve(params) }));

describe('the pages the export writes', () => {
  it('writes one per event of the edition, and no others', () => {
    expect(generateStaticParams()).toEqual(listEvents().map(standardsParams));
  });
});

describe('one event of the order', () => {
  it('shows both sexes at once, every rung of the ladder, slow rank first', async () => {
    await renderEvent(PARAMS);
    const men = findStandard({ pool: 'SCM', sex: 'M', stroke: 'BREAST', distance: 100 });
    const women = findStandard({ pool: 'SCM', sex: 'F', stroke: 'BREAST', distance: 100 });

    const cells = within(screen.getByRole('table'))
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      );

    expect(cells.map(([, m]) => m)).toEqual(
      RANK_ORDER.map((rank) => formatTime(men?.times[rank] ?? 0)),
    );
    expect(cells.map(([, , f]) => f)).toEqual(
      RANK_ORDER.map((rank) => formatTime(women?.times[rank] ?? 0)),
    );
  });

  it('carries one heading, in the words the event is searched with', async () => {
    await renderEvent(PARAMS);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Нормативы по плаванию: брасс 100 м, бассейн 25 м',
    );
  });

  /* Профицит counts a reader who never goes back to the results page: the way on is here. */
  it('links on to the neighbouring distances, the other pool and the calculator', async () => {
    await renderEvent(PARAMS);
    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));

    expect(hrefs).toContain('/normativy/scm/breast/50/');
    expect(hrefs).toContain('/normativy/scm/breast/200/');
    expect(hrefs).toContain('/normativy/lcm/breast/100/');
    expect(hrefs).toContain('/kalkulyator/?pool=scm&stroke=breast&distance=100');
  });

  it('assembles a title and an absolute canonical of its own', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve(PARAMS) });

    expect(metadata.title).toBe('Нормативы по плаванию: брасс 100 м, бассейн 25 м');
    expect(String(metadata.alternates?.canonical)).toBe(
      'https://razryad.borozdov.ru/normativy/scm/breast/100/',
    );
  });
});
