'use client';

import type { ReactNode } from 'react';
import type { Distance, Pool, Sex, Stroke } from '@/domain/standards/types';
import { POOL_SHORT_LABEL, SEX_SHORT_LABEL, STROKE_SHORT_LABEL } from '@/lib/labels';
import { Chips, Segmented, TimeInput } from '@/ui';
import type { CalculatorState } from './useCalculator';
import s from './CalculatorForm.module.css';

const POOLS: readonly Pool[] = ['SCM', 'LCM'];
const STROKES: readonly Stroke[] = ['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY'];
const SEXES: readonly Sex[] = ['M', 'F'];

const POOL_OPTIONS = POOLS.map((pool) => ({ value: pool, label: POOL_SHORT_LABEL[pool] }));
const STROKE_OPTIONS = STROKES.map((stroke) => ({
  value: stroke,
  label: STROKE_SHORT_LABEL[stroke],
}));
const SEX_OPTIONS = SEXES.map((sex) => ({ value: sex, label: SEX_SHORT_LABEL[sex] }));

export type CalculatorFormProps = {
  state: CalculatorState;
  distances: readonly Distance[];
  invalid: boolean;
  onChange: (patch: Partial<CalculatorState>) => void;
  /** The result, shown inside the same panel as the field, right under it. */
  children: ReactNode;
};

/** Every choice is one tap and always in view; the time is the only thing typed. */
export function CalculatorForm({
  state,
  distances,
  invalid,
  onChange,
  children,
}: CalculatorFormProps) {
  return (
    <div className={s.root}>
      <div className={s.row}>
        <Segmented
          value={state.pool}
          options={POOL_OPTIONS}
          onChange={(pool) => onChange({ pool })}
          label="Бассейн"
          name="pool"
        />
        <Segmented
          value={state.sex}
          options={SEX_OPTIONS}
          onChange={(sex) => onChange({ sex })}
          label="Пол"
          name="sex"
        />
      </div>

      <div className={s.row}>
        <Chips
          value={state.stroke}
          options={STROKE_OPTIONS}
          onChange={(stroke) => onChange({ stroke })}
          label="Стиль"
          name="stroke"
        />
        <Chips
          value={state.distance}
          options={distances.map((distance) => ({ value: distance, label: `${distance}м` }))}
          onChange={(distance) => onChange({ distance })}
          label="Дистанция"
          name="distance"
        />
      </div>

      <div className={s.panel}>
        <TimeInput
          value={state.time}
          onChange={(time) => onChange({ time })}
          invalid={invalid}
          name="time"
        />
        {children}
      </div>
    </div>
  );
}
