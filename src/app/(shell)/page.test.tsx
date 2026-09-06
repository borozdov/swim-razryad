import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav';
import { HOME_PATH, appPath } from '@/lib/routes';
import HomePage, { metadata } from './page';

/** The one heading of the page, which names whichever event the switches leave visible. */
const heading = () => screen.getByRole('heading', { level: 1 }).textContent;

/** The checked option of one radio group, by the group's label. */
const checkedRadio = (label: string): string =>
  within(screen.getByRole('radiogroup', { name: label })).getByRole('radio', { checked: true })
    .textContent ?? '';

beforeEach(() => {
  window.history.replaceState(null, '', HOME_PATH);
});

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
    expect(metadata.title).toBe('Нормативы по плаванию и калькулятор разряда ЕВСК');
    expect(String(metadata.alternates?.canonical)).toMatch(/^https:\/\/[^/]+\/$/);
  });
});

describe('the two modes on one page', () => {
  it('shows the table or the calculator, never both', () => {
    render(<HomePage />);

    expect(screen.getAllByRole('table')).toHaveLength(1);
    expect(screen.queryByRole('textbox', { name: 'Время' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));

    expect(screen.queryAllByRole('table')).toHaveLength(0);
    expect(screen.getByRole('textbox', { name: 'Время' })).toBeInTheDocument();
  });

  it('keeps every choice the reader made when the mode switches', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('radio', { name: '25 м' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Ж' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Брасс' }));
    fireEvent.click(screen.getByRole('radio', { name: '200м' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));

    expect(checkedRadio('Бассейн')).toBe('25 м');
    expect(checkedRadio('Пол')).toBe('Ж');
    expect(checkedRadio('Стиль')).toBe('Брасс');
    expect(checkedRadio('Дистанция')).toBe('200м');

    fireEvent.click(screen.getByRole('tab', { name: 'Нормативы' }));

    expect(heading()).toBe('Брасс 200 м, бассейн 25 м');
  });

  it('keeps a time typed in the calculator while the table is read', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Время' }), {
      target: { value: '25.20' },
    });
    fireEvent.click(screen.getByRole('tab', { name: 'Нормативы' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));

    expect(screen.getByRole('textbox', { name: 'Время' })).toHaveValue('25.20');
    expect(screen.getByText('I спортивный', { selector: 'p' })).toBeInTheDocument();
  });

  it('switches the mode without leaving the address, and says so in the query', () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));

    expect(window.location.pathname).toBe(HOME_PATH);
    expect(window.location.search).toBe('?pool=lcm&stroke=free&distance=50&sex=m&mode=calculator');

    fireEvent.click(screen.getByRole('tab', { name: 'Нормативы' }));

    expect(window.location.search).toBe('?pool=lcm&stroke=free&distance=50&sex=m');
  });

  it('opens in the mode the query names', () => {
    window.history.replaceState(null, '', '?mode=calculator&pool=lcm&stroke=free&distance=50');
    render(<HomePage />);

    expect(screen.getByRole('tab', { name: 'Калькулятор' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('textbox', { name: 'Время' })).toBeInTheDocument();
  });
});

describe('the sections of the app', () => {
  it('gives every item of the switch a mode of the one page, and no address of its own', () => {
    for (const item of NAV_ITEMS) {
      expect(new URL(appPath(item.mode), 'https://example.com').pathname).toBe(HOME_PATH);
    }
  });
});
