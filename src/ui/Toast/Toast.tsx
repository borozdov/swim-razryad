'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import s from './Toast.module.css';

export type ToastProps = {
  /** Nothing renders while this is false, so a caller can mount the toast unconditionally. */
  open: boolean;
  children: ReactNode;
  /** One action inside the toast, for example the button that applies an update. */
  action?: { label: string; onClick: () => void };
};

/** A line of feedback over the app, inverted like every accent of the system. */
export function Toast({ open, children, action }: ToastProps) {
  // The install banner sits at the same edge and reads this to step over the toast.
  useEffect(() => {
    if (!open) return;
    document.documentElement.dataset.toast = 'open';
    return () => {
      delete document.documentElement.dataset.toast;
    };
  }, [open]);

  return (
    <div className={open ? `${s.root} ${s.open}` : s.root} role="status" aria-live="polite">
      <span className={s.text}>{children}</span>
      {action === undefined ? null : (
        <button type="button" className={s.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
