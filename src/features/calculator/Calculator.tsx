'use client';

import { useEffect } from 'react';
import type { PointsResult, StandardRow } from '@/domain/standards/types';
import type { AppState } from '@/features/app/useAppState';
import { toQuery } from '@/features/app/useAppState';
import { trackGoal } from '@/lib/analytics';
import { TimeInput } from '@/ui';
import { CalculatorResult } from './CalculatorResult';
import s from './Calculator.module.css';

/** Reads as a time, but the dataset carries no such event. Unreachable through the form. */
const NO_STANDARD = 'На эту дистанцию норматива в приказе нет';

const UNREADABLE = 'Время не разобрано';

const EMPTY = 'Введите время';

/** How long the time has to stand still before a calculation counts as made, in ms. */
const SETTLED_MS = 900;

export type CalculatorProps = {
  state: AppState;
  /** Null while the text is not a swim time the notation accepts. */
  seconds: number | null;
  result: PointsResult | null;
  /** The row of the order behind the result, so the plate can print the standards themselves. */
  standard: StandardRow | undefined;
  onTimeChange: (time: string) => void;
};

/** The field and its answer on one surface: the mode that turns a time into a rank. */
export function Calculator({ state, seconds, result, standard, onTimeChange }: CalculatorProps) {
  const { mode, pool, sex, stroke, distance, time } = state;

  const unreadable = time !== '' && seconds === null;
  const placeholder = time === '' ? EMPTY : unreadable ? UNREADABLE : NO_STANDARD;

  const points = result?.points ?? null;
  const rank = result?.achievedRank ?? null;

  /*
    One goal per calculation, not per keystroke. The result is recomputed on every character
    typed, so the timer restarts with each of them and only the time a swimmer stops on is
    reported. Every dependency is a primitive: `result` is a fresh object each render and
    would restart the timer forever. The mode is one of them because the two modes share
    the event: changing a distance while reading the table recomputes a result nobody is
    looking at, and a calculation nobody sees is not a calculation.
  */
  useEffect(() => {
    if (points === null || mode !== 'calculator') return;
    const timer = setTimeout(() => {
      trackGoal('calc_time_to_points', {
        pool,
        sex,
        stroke,
        distance,
        points,
        rank: rank ?? 'none',
      });
    }, SETTLED_MS);
    return () => clearTimeout(timer);
  }, [points, rank, mode, pool, sex, stroke, distance]);

  return (
    <div className={s.root}>
      <TimeInput value={time} onChange={onTimeChange} invalid={unreadable} name="time" />
      <CalculatorResult
        result={result}
        placeholder={placeholder}
        event={{ pool, stroke, distance }}
        seconds={seconds}
        query={toQuery(state)}
        standard={standard}
      />
    </div>
  );
}
