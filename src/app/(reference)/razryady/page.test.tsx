/**
 * The explainer page answers the questions a table of times answers for nobody: what a
 * rank is, in what order they run, and from what age each one can be awarded.
 */
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RANK_MIN_AGE, RANK_ORDER } from '@/domain/points/scale';
import { RANK_FULL_LABEL } from '@/lib/labels';
import RanksRoute, { metadata } from './page';

describe('the explainer page', () => {
  it('lists the nine rungs in order, each with the age the order sets for it', () => {
    render(<RanksRoute />);

    const cells = within(screen.getByRole('table'))
      .getAllByRole('row')
      .slice(1)
      .map((row) =>
        within(row)
          .getAllByRole('cell')
          .map((cell) => cell.textContent),
      );

    expect(cells).toHaveLength(RANK_ORDER.length);
    expect(cells.map(([, age]) => age)).toEqual(
      RANK_ORDER.map((rank) => `${RANK_MIN_AGE[rank]} лет`),
    );
    for (const rank of RANK_ORDER) {
      expect(cells.some(([name]) => name?.startsWith(RANK_FULL_LABEL[rank]))).toBe(true);
    }
  });

  it('carries one heading and names the credential no competitor has', () => {
    render(<RanksRoute />);

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText(/мастер спорта по плаванию/)).toBeInTheDocument();
  });

  it('assembles a title and an absolute canonical', () => {
    expect(String(metadata.title)).toContain('Разряды по плаванию');
    expect(String(metadata.alternates?.canonical)).toBe('https://razryad.borozdov.ru/razryady/');
  });
});
