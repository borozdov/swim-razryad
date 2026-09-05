'use client';

import { ChoiceGroup, type ChoiceOption } from '../ChoiceGroup/ChoiceGroup';
import s from './Segmented.module.css';

export type SegmentedOption<T> = ChoiceOption<T>;

export type SegmentedProps<T extends string | number> = {
  value: T;
  options: readonly SegmentedOption<T>[];
  onChange: (value: T) => void;
  label: string;
  name?: string;
};

/** Two or three equal segments on one track. The active one is the inversion. */
export function Segmented<T extends string | number>(props: SegmentedProps<T>) {
  return (
    <ChoiceGroup
      {...props}
      classes={{ root: s.root, label: s.label, group: s.group, option: s.option, active: s.active }}
    />
  );
}
