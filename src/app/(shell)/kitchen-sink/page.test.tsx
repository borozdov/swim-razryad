import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import KitchenSinkPage from './page';

const PRIMITIVES = [
  'Button',
  'TimeInput',
  'Segmented',
  'Chips',
  'Badge',
  'Table',
  'Card',
  'Stat',
  'ScaleBar',
  'ThemeToggle',
];

describe('/kitchen-sink', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('mounts every primitive without errors', () => {
    render(<KitchenSinkPage />);

    for (const name of PRIMITIVES) {
      expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(PRIMITIVES.length);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('renders the interactive primitives as native controls', () => {
    render(<KitchenSinkPage />);

    expect(screen.getAllByRole('button').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByRole('textbox')).toHaveLength(8);
    expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
    expect(screen.getAllByRole('radio', { checked: true })).toHaveLength(2);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '742 из 1000' })).toBeInTheDocument();
  });

  it('shows both states of TimeInput', () => {
    render(<KitchenSinkPage />);

    const [valid, invalid] = screen.getAllByRole('textbox', { name: 'Время' });
    expect(valid).toHaveAttribute('aria-invalid', 'false');
    expect(invalid).toHaveAttribute('aria-invalid', 'true');
  });
});
