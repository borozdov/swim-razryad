'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import s from './Button.module.css';

export type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'style'> & {
  /** solid is the inverted fill, the only accent the system has; outline is the quiet action. */
  variant: 'solid' | 'outline';
  children: ReactNode;
};

export function Button({ variant, type = 'button', children, ...rest }: ButtonProps) {
  const variantClass = variant === 'solid' ? s.solid : s.outline;
  return (
    <button {...rest} type={type} className={`${s.root} ${variantClass}`}>
      {children}
    </button>
  );
}
