import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav';
import { CALCULATOR_PATH, HOME_PATH } from '@/lib/routes';
import HomePage, { metadata } from './page';

/** The one heading of the page, which names whichever event the switches leave visible. */
const heading = () => screen.getByRole('heading', { level: 1 }).textContent;

describe('standards index page', () => {
  it('shows one distance at a time: the nine ranks down, slow rank first', () => {
    render(<HomePage />);

    const tables = screen.getAllByRole('table');
    expect(tables).toHaveLength(1);

    const cells = within(tables[0])
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      );
    expect(cells.map(([rank]) => rank)).toEqual([
      'III юношеский',
      'II юношеский',
      'I юношеский',
      'III спортивный',
      'II спортивный',
      'I спортивный',
      'КМС',
      'МС',
      'МСМК',
    ]);
    // The check row of the order: men, 50 m pool, freestyle 50 m.
    expect(cells.map(([, time]) => time)).toEqual([
      '55.80',
      '45.80',
      '35.80',
      '29.80',
      '27.60',
      '25.20',
      '23.95',
      '23.20',
      '21.91',
    ]);
  });

  it('names the event above the table, once, in full words rather than the chips', () => {
    render(<HomePage />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(heading()).toBe('Вольный стиль 50 м, бассейн 50 м');
  });

  it('switches the stroke and keeps the distance when the stroke has it', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('radio', { name: 'Брасс' }));

    expect(heading()).toBe('Брасс 50 м, бассейн 50 м');
    const last = within(screen.getByRole('table')).getAllByRole('row').at(-1);
    expect(last).toHaveTextContent('27.22');
  });

  it('snaps to the shortest distance when the stroke lacks the chosen one', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('radio', { name: '1500м' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Комплекс' }));

    expect(heading()).toBe('Комплексное плавание 200 м, бассейн 50 м');
  });

  it('assembles the title and an absolute canonical', () => {
    expect(metadata.title).toBe('Нормативы по плаванию — таблица разрядов ЕВСК');
    expect(String(metadata.alternates?.canonical)).toMatch(/^https:\/\/[^/]+\/$/);
  });
});

describe('header navigation', () => {
  it('points every item at a page the export writes', () => {
    const pages = new Set([HOME_PATH, CALCULATOR_PATH]);

    expect(NAV_ITEMS.map((item) => item.href).every((href) => pages.has(href))).toBe(true);
  });
});
