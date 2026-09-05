import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeInput } from './TimeInput';

const field = (label: string) => screen.getByRole('textbox', { name: label });
const quick = () => screen.getByRole('textbox', { name: 'Время' });

describe('TimeInput', () => {
  it('prints the three fields as one time, zeros where a field is blank', () => {
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    fireEvent.change(field('с'), { target: { value: '25' } });
    expect(onChange).toHaveBeenLastCalledWith('0:25.00');

    fireEvent.change(field('сот'), { target: { value: '2' } });
    expect(onChange).toHaveBeenLastCalledWith('0:25.20');

    fireEvent.change(field('м'), { target: { value: '1' } });
    expect(onChange).toHaveBeenLastCalledWith('1:25.20');
  });

  it('hands the caret to the next field after two digits', () => {
    render(<TimeInput value="" onChange={() => {}} />);

    field('м').focus();
    fireEvent.change(field('м'), { target: { value: '1' } });
    expect(field('м')).toHaveFocus();

    fireEvent.change(field('с'), { target: { value: '02' } });
    expect(field('сот')).toHaveFocus();
  });

  it('keeps digits only, two at most, in a field', () => {
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    fireEvent.change(field('с'), { target: { value: '2a5' } });
    expect(field('с')).toHaveValue('25');
  });

  it('lets the last typed source win and clears the other', () => {
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    fireEvent.change(field('с'), { target: { value: '25' } });
    fireEvent.change(quick(), { target: { value: '10532' } });
    expect(field('с')).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('10532');

    fireEvent.change(field('м'), { target: { value: '1' } });
    expect(quick()).toHaveValue('');
    expect(onChange).toHaveBeenLastCalledWith('1:00.00');
  });

  it('reports an empty string when every field is cleared', () => {
    const onChange = vi.fn();
    render(<TimeInput value="" onChange={onChange} />);

    fireEvent.change(field('с'), { target: { value: '25' } });
    fireEvent.change(field('с'), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('lets no letter into the quick line', () => {
    render(<TimeInput value="" onChange={() => {}} />);

    fireEvent.change(quick(), { target: { value: '2x5.2' } });
    expect(quick()).toHaveValue('25.2');
  });

  it('shows a value that arrives from outside in the quick line', () => {
    const { rerender } = render(<TimeInput value="" onChange={() => {}} />);

    rerender(<TimeInput value="2:37.45" onChange={() => {}} />);
    expect(quick()).toHaveValue('2:37.45');
  });
});
