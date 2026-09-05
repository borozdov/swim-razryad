'use client';

import { useId, type KeyboardEvent } from 'react';

export type ChoiceOption<T> = { value: T; label: string };

export type ChoiceGroupProps<T extends string | number> = {
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  label: string;
  name?: string;
  /** Class names of the host primitive: the group logic is shared, the look is not. */
  classes: { root: string; label: string; group: string; option: string; active: string };
};

/**
 * One tap picks a value: a radio group of buttons, the pattern behind Segmented and
 * Chips. Arrow keys move the choice like a native radio group does.
 */
export function ChoiceGroup<T extends string | number>({
  value,
  options,
  onChange,
  label,
  name,
  classes,
}: ChoiceGroupProps<T>) {
  const labelId = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
    buttons[(index + step + options.length) % options.length]?.focus();
  };

  return (
    <div className={classes.root}>
      <span id={labelId} className={classes.label}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className={classes.group}
        onKeyDown={handleKeyDown}
        data-name={name}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              className={active ? `${classes.option} ${classes.active}` : classes.option}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
