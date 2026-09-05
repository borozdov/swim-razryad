'use client';

import { CalculatorForm } from './CalculatorForm';
import { CalculatorResult } from './CalculatorResult';
import { toQuery, useCalculator } from './useCalculator';
import s from './Calculator.module.css';

/** Reads as a time, but the dataset carries no such event. Unreachable through the form. */
const NO_STANDARD = 'На эту дистанцию норматива в приказе нет';

const UNREADABLE = 'Время не разобрано';

const EMPTY = 'Введите время';

export function Calculator() {
  const { state, update, distances, seconds, result, standard } = useCalculator();

  const unreadable = state.time !== '' && seconds === null;
  const placeholder = state.time === '' ? EMPTY : unreadable ? UNREADABLE : NO_STANDARD;

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
