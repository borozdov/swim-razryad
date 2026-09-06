import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NAV_ITEMS } from '@/lib/nav';
import { ModeSwitch, modePaneId } from './ModeSwitch';

describe('ModeSwitch', () => {
  it('draws the sections as tabs of one page, not as links away from it', () => {
    render(<ModeSwitch mode="standards" onChange={() => {}} />);

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(
      NAV_ITEMS.map((item) => item.label),
    );
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('marks the mode showing, and points it at the pane it shows', () => {
    render(<ModeSwitch mode="calculator" onChange={() => {}} />);

    const calculator = screen.getByRole('tab', { name: 'Калькулятор' });
    expect(calculator).toHaveAttribute('aria-selected', 'true');
    expect(calculator).toHaveAttribute('aria-controls', modePaneId('calculator'));
    expect(screen.getByRole('tab', { name: 'Нормативы' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('asks for the other mode when its tab is pressed', () => {
    const onChange = vi.fn();
    render(<ModeSwitch mode="standards" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Калькулятор' }));

    expect(onChange).toHaveBeenCalledWith('calculator');
  });

  /* The unselected tab is out of the tab order, so the arrows have to reach it. */
  it('walks the row with the arrow keys', () => {
    const onChange = vi.fn();
    render(<ModeSwitch mode="standards" onChange={onChange} />);

    fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });

    expect(onChange).toHaveBeenCalledWith('calculator');
  });
});
