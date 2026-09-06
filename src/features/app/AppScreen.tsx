'use client';

import type { StandardRow } from '@/domain/standards/types';
import { Calculator } from '@/features/calculator/Calculator';
import { ModeSwitch, modePaneId, modeTabId } from '@/features/site-nav/ModeSwitch';
import { StandardsIndex } from '@/features/standards-index/StandardsIndex';
import { EventPicker } from './EventPicker';
import { useAppState } from './useAppState';
import s from './AppScreen.module.css';

export type AppScreenProps = {
  /** Every row of the edition: the table of each event ships prerendered, hidden until asked. */
  rows: readonly StandardRow[];
};

/**
 * The app, whole, at one address. The standards and the calculator were two pages and
 * every switch between them was a navigation that threw away the choices just made; here
 * they are two panes of one screen over one state, and the switch changes the pane only.
 */
export function AppScreen({ rows }: AppScreenProps) {
  const { state, update, distances, seconds, result, standard } = useAppState();
  const { mode, pool, stroke, distance, sex } = state;

  return (
    <div className={s.root}>
      <ModeSwitch mode={mode} onChange={(next) => update({ mode: next })} />
      <EventPicker state={state} distances={distances} onChange={update} />

      <div
        role="tabpanel"
        id={modePaneId('standards')}
        aria-labelledby={modeTabId('standards')}
        className={s.pane}
        hidden={mode !== 'standards'}
      >
        <StandardsIndex rows={rows} event={{ pool, stroke, distance }} sex={sex} />
      </div>

      <div
        role="tabpanel"
        id={modePaneId('calculator')}
        aria-labelledby={modeTabId('calculator')}
        className={s.pane}
        hidden={mode !== 'calculator'}
      >
        <Calculator
          state={state}
          seconds={seconds}
          result={result}
          standard={standard}
          onTimeChange={(time) => update({ time })}
        />
      </div>
    </div>
  );
}
