'use client';

import { useEffect } from 'react';
import { trackGoal } from '@/lib/analytics';
import { CalculatorForm } from './CalculatorForm';
import { CalculatorResult } from './CalculatorResult';
import { toQuery, useCalculator } from './useCalculator';
import s from './Calculator.module.css';

/** Reads as a time, but the dataset carries no such event. Unreachable through the form. */
const NO_STANDARD = 'На эту дистанцию норматива в приказе нет';

const UNREADABLE = 'Время не разобрано';

const EMPTY = 'Введите время';

/** How long the time has to stand still before a calculation counts as made, in ms. */
const SETTLED_MS = 900;

export function Calculator() {
  const { state, update, distances, seconds, result, standard } = useCalculator();

  const unreadable = state.time !== '' && seconds === null;
  const placeholder = state.time === '' ? EMPTY : unreadable ? UNREADABLE : NO_STANDARD;

  const { pool, sex, stroke, distance } = state;
  const points = result?.points ?? null;
  const rank = result?.achievedRank ?? null;

  /*
    One goal per calculation, not per keystroke. The result is recomputed on every character
    typed, so the timer restarts with each of them and only the time a swimmer stops on is
    reported. Every dependency is a primitive: `result` is a fresh object each render and
    would restart the timer forever.
  */
  useEffect(() => {
    if (points === null) return;
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
  }, [points, rank, pool, sex, stroke, distance]);

  return (
    <div className={s.root}>
      <CalculatorForm state={state} distances={distances} invalid={unreadable} onChange={update}>
        <CalculatorResult
          result={result}
          placeholder={placeholder}
          event={{ pool: state.pool, stroke: state.stroke, distance: state.distance }}
          seconds={seconds}
          query={toQuery(state)}
          standard={standard}
        />
      </CalculatorForm>
    </div>
  );
}
