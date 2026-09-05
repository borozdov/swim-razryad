'use client';

import { ChoiceGroup, type ChoiceOption } from '../ChoiceGroup/ChoiceGroup';
import s from './Chips.module.css';

export type ChipOption<T> = ChoiceOption<T>;

export type ChipsProps<T extends string | number> = {
  value: T;
  options: readonly ChipOption<T>[];
  onChange: (value: T) => void;
  label: string;
  name?: string;
};

/** Wrapping rows of bordered chips, each row filled flush. The active one is the inversion. */
export function Chips<T extends string | number>(props: ChipsProps<T>) {
  return (
    <ChoiceGroup
      {...props}
      classes={{ root: s.root, label: s.label, group: s.group, option: s.option, active: s.active }}
    />
  );
}
