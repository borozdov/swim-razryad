import type { ReactNode } from 'react';
import s from './Card.module.css';

export type CardProps = {
  children: ReactNode;
  label?: string;
};

export function Card({ children, label }: CardProps) {
  return (
    <div className={s.root}>
      {label ? <span className={s.label}>{label}</span> : null}
      {children}
    </div>
  );
}
