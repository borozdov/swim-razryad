import type { ReactNode } from 'react';
import s from './Badge.module.css';

export type BadgeProps = {
  children: ReactNode;
  /** Inverted fill marks the achieved step. */
  inverted?: boolean;
};

export function Badge({ children, inverted = false }: BadgeProps) {
  return <span className={inverted ? `${s.root} ${s.inverted}` : s.root}>{children}</span>;
}
