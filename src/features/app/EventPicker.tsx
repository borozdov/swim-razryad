'use client';

import type { Distance, Pool, Sex, Stroke } from '@/domain/standards/types';
import { trackGoal, type Goal } from '@/lib/analytics';
import { POOL_SHORT_LABEL, SEX_SHORT_LABEL, STROKE_SHORT_LABEL } from '@/lib/labels';
import { Chips, Segmented } from '@/ui';
import type { AppState } from './useAppState';
import s from './EventPicker.module.css';

const POOLS: readonly Pool[] = ['SCM', 'LCM'];
const SEXES: readonly Sex[] = ['M', 'F'];
const STROKES: readonly Stroke[] = ['FREE', 'BACK', 'BREAST', 'FLY', 'MEDLEY'];

const POOL_OPTIONS = POOLS.map((pool) => ({ value: pool, label: POOL_SHORT_LABEL[pool] }));
const SEX_OPTIONS = SEXES.map((sex) => ({ value: sex, label: SEX_SHORT_LABEL[sex] }));
const STROKE_OPTIONS = STROKES.map((stroke) => ({
  value: stroke,
  label: STROKE_SHORT_LABEL[stroke],
}));

export type EventPickerProps = {
  state: AppState;
  distances: readonly Distance[];
  onChange: (patch: Partial<AppState>) => void;
};

/**
 * The four choices both modes are about, above the mode that is showing. One row of
 * controls and not one per mode: they are the same four choices, and a switch of mode
 * leaves them where they stand, unmounted by nothing.
 *
 * The same four goals fire from either mode, so each one names the mode it was tapped in;
 * without that the taps of a reader reading the table and of one entering a time would be
 * indistinguishable in Metrika.
 */
export function EventPicker({ state, distances, onChange }: EventPickerProps) {
  const report = (goal: Goal, value: string | number): void => {
    trackGoal(goal, { where: state.mode, value: String(value) });
  };

  return (
    <div className={s.root}>
      <div className={s.row} data-tour="event">
        <Segmented
          value={state.pool}
          options={POOL_OPTIONS}
          onChange={(pool) => {
            report('select_pool', pool);
            onChange({ pool });
          }}
          label="Бассейн"
          name="pool"
        />
        <Segmented
          value={state.sex}
          options={SEX_OPTIONS}
          onChange={(sex) => {
            report('select_sex', sex);
            onChange({ sex });
          }}
          label="Пол"
          name="sex"
        />
      </div>

      <div className={s.row} data-tour="stroke">
        <Chips
          value={state.stroke}
          options={STROKE_OPTIONS}
          onChange={(stroke) => {
            report('select_stroke', stroke);
            onChange({ stroke });
          }}
          label="Стиль"
          name="stroke"
        />
        <Chips
          value={state.distance}
          options={distances.map((distance) => ({ value: distance, label: `${distance}м` }))}
          onChange={(distance) => {
            report('select_distance', distance);
            onChange({ distance });
          }}
          label="Дистанция"
          name="distance"
        />
      </div>
    </div>
  );
}
