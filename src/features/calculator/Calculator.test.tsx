import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CURRENT_EDITION } from '@/domain/standards/registry';
import { AppScreen } from '@/features/app/AppScreen';

/**
 * The calculator is one mode of the app and holds no state of its own, so it is exercised
 * through the screen that owns it, opened on the query a shared link would carry.
 *
 * The check row of приказ № 1092: men, 50 m pool, freestyle 50 m. I разряд is 25.20,
 * КМС 23.95, МС 23.20, so a swim of 25.20 sits exactly on the I разряд node.
 */
const CHECK_ROW = '?mode=calculator&pool=lcm&stroke=free&distance=50&sex=m';

const renderAt = (query: string) => {
  window.history.replaceState(null, '', query);
  return render(<AppScreen rows={CURRENT_EDITION.rows} />);
};

const timeField = () => screen.getByRole('textbox', { name: 'Время' });

/** The checked option of one radio group, by the group's label. */
const checkedRadio = (label: string): string =>
  within(screen.getByRole('radiogroup', { name: label })).getByRole('radio', { checked: true })
    .textContent ?? '';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('the result of the check row', () => {
  it('leads with the rank spelled out, then the gap, then the points', () => {
    renderAt(`${CHECK_ROW}&time=25.20`);

    // 25.20 is the I разряд standard itself, so the scale reads its node exactly.
    expect(screen.getByText('I спортивный', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('до КМС').parentElement).toHaveTextContent('1.25');
    expect(screen.getByText('Очки').parentElement).toHaveTextContent('600');
  });

  it('reads the three fields as one time', () => {
    renderAt(CHECK_ROW);

    fireEvent.change(screen.getByRole('textbox', { name: 'с' }), { target: { value: '25' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'сот' }), { target: { value: '20' } });

    expect(screen.getByText('I спортивный', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText('Очки').parentElement).toHaveTextContent('600');
  });

  it('prints the standards of the rung made and the rung ahead', () => {
    renderAt(`${CHECK_ROW}&time=25.20`);

    // I разряд is 25.20 and КМС is 23.95 in the check row of the order.
    const nearby = screen.getAllByRole('definition').map((node) => node.textContent);
    expect(nearby).toEqual(['25.20', '23.95']);
  });

  it('puts all nine nodes on the scale and the result among them', () => {
    renderAt(`${CHECK_ROW}&time=25.20`);

    const scale = screen.getByRole('img', { name: '600 из 1000' });
    const labels = [...scale.querySelectorAll('text')].map((node) => node.textContent);

    expect(labels).toEqual([
      'III',
      'II',
      'I',
      'III',
      'II',
      'I',
      'КМС',
      'МС',
      'МСМК',
      'юношеские',
      'спортивные',
      'звания',
    ]);
  });

  it('names the title in full and leaves no gap above МСМК', () => {
    renderAt(`${CHECK_ROW}&time=21.91`);

    expect(screen.getByText('Мастер спорта международного класса')).toBeInTheDocument();
    expect(screen.queryByText(/^до /)).not.toBeInTheDocument();
  });

  it('says there is no rank below III юношеский', () => {
    renderAt(`${CHECK_ROW}&time=1:30`);

    expect(screen.getByText('Разряда нет')).toBeInTheDocument();
    expect(screen.getByText('до III юношеский')).toBeInTheDocument();
  });
});

describe('a time that is still being typed', () => {
  it('shows a result as soon as the digits read as a time', () => {
    renderAt(CHECK_ROW);

    fireEvent.change(timeField(), { target: { value: '45' } });

    expect(screen.getByText('II юношеский', { selector: 'p' })).toBeInTheDocument();
    expect(timeField()).toHaveAttribute('aria-invalid', 'false');
  });

  it('lets no letter into the field', () => {
    renderAt(CHECK_ROW);

    fireEvent.change(timeField(), { target: { value: '2x5.2' } });

    expect(timeField()).toHaveValue('25.2');
  });
});

describe('a time the notation does not accept', () => {
  it('marks the field and shows the reason in place of the result', () => {
    renderAt(CHECK_ROW);

    fireEvent.change(timeField(), { target: { value: '1:99' } });

    expect(timeField()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByText('Очки')).not.toBeInTheDocument();
    expect(screen.getByText('Время не разобрано')).toBeInTheDocument();
  });

  it('asks for a time while the field is empty', () => {
    renderAt(CHECK_ROW);

    expect(timeField()).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Очки')).not.toBeInTheDocument();
    expect(screen.getByText('Введите время')).toBeInTheDocument();
  });
});

describe('the link a result travels as', () => {
  it('restores the whole form from the query', () => {
    renderAt('?mode=calculator&pool=scm&stroke=breast&distance=200&sex=f&time=2:37.45');

    expect(timeField()).toHaveValue('2:37.45');
    expect(checkedRadio('Бассейн')).toBe('25 м');
    expect(checkedRadio('Пол')).toBe('Ж');
    expect(checkedRadio('Стиль')).toBe('Брасс');
    expect(checkedRadio('Дистанция')).toBe('200м');
  });

  it('writes every change back into the query', () => {
    renderAt(`${CHECK_ROW}&time=25.20`);

    fireEvent.click(screen.getByRole('radio', { name: '25 м' }));

    expect(window.location.search).toBe(
      '?pool=scm&stroke=free&distance=50&sex=m&mode=calculator&time=25.20',
    );
  });

  it('ignores an age a link from the old form may still carry', () => {
    renderAt(`${CHECK_ROW}&time=23.95&age=9`);

    // Nine years old used to block КМС; without the filter the time alone decides.
    expect(screen.getByText('Кандидат в мастера спорта')).toBeInTheDocument();
  });
});
