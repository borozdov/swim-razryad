'use client';

import { useCallback, useEffect, useState } from 'react';
import { trackGoal } from '@/lib/analytics';
import {
  ONBOARDING_DONE_KEY,
  TOUR_STEPS,
  cardLeft,
  cardTop,
  shouldRunTour,
  spotlight,
  type Box,
} from '@/lib/onboarding';
import s from './Onboarding.module.css';

/** A moment after the page settles, so the tour does not meet a reader mid-tap. */
const DELAY_MS = 800;

const CARD_WIDTH = 320;
const MARGIN = 16;

const findTarget = (target: string): Element | null =>
  document.querySelector(`[data-tour='${target}']`);

const boxOf = (element: Element): Box => {
  const rect = element.getBoundingClientRect();
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
};

/**
 * The tour of fina.borozdov.ru: a scrim with a hole over the thing being explained, and a
 * card that names it. Three steps, once per reader, and out of the way at any tap.
 */
export function Onboarding() {
  const [step, setStep] = useState<number | null>(null);
  const [hole, setHole] = useState<Box | null>(null);

  /** The card is placed through variables on the root: the project writes no inline styles. */
  const place = useCallback((index: number) => {
    const element = findTarget(TOUR_STEPS[index].target);
    if (element === null) return false;
    const box = boxOf(element);
    const width = Math.min(CARD_WIDTH, window.innerWidth - MARGIN * 2);
    const root = document.documentElement;
    root.style.setProperty('--tour-width', `${width}px`);
    root.style.setProperty('--tour-left', `${cardLeft(box, width, window.innerWidth, MARGIN)}px`);
    root.style.setProperty('--tour-top', `${cardTop(box, TOUR_STEPS[index].place)}px`);
    setHole(spotlight(box));
    return true;
  }, []);

  useEffect(() => {
    if (!shouldRunTour(localStorage)) return;
    const timer = window.setTimeout(() => {
      // Nothing to point at means the wrong page for this tour; it waits for the right one.
      if (TOUR_STEPS.every((tour) => findTarget(tour.target) !== null) && place(0)) setStep(0);
    }, DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [place]);

  // A turned phone moves everything the tour points at.
  useEffect(() => {
    if (step === null) return;
    const onResize = () => place(step);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [step, place]);

  const finish = (reason: 'skip' | 'overlay' | 'end') => {
    trackGoal('onboarding_finish', { reason });
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    } catch {
      // Nothing to remember it with; the tour ends for this visit at least.
    }
    setStep(null);
    const root = document.documentElement;
    for (const name of ['--tour-width', '--tour-left', '--tour-top']) {
      root.style.removeProperty(name);
    }
  };

  const go = (next: number) => {
    if (next >= TOUR_STEPS.length) {
      finish('end');
      return;
    }
    trackGoal(next > (step ?? 0) ? 'onboarding_next' : 'onboarding_prev');
    if (place(next)) setStep(next);
  };

  if (step === null || hole === null) return null;
  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <div className={s.root} role="dialog" aria-modal="true" aria-label="Как пользоваться">
      {/* The scrim is a rectangle with a hole cut in it: everything outside the mask is dimmed. */}
      <svg className={s.spotlight} width="100%" height="100%" aria-hidden="true">
        <defs>
          <mask id="razryad-tour-hole">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={hole.x}
              y={hole.y}
              width={hole.width}
              height={hole.height}
              rx="14"
              ry="14"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          className={s.scrim}
          width="100%"
          height="100%"
          mask="url(#razryad-tour-hole)"
          onClick={() => finish('overlay')}
        />
      </svg>

      <div className={s.card}>
        <div className={s.head}>
          <p className={s.title}>{current.title}</p>
          <button
            type="button"
            className={s.skip}
            onClick={() => finish('skip')}
            aria-label="Пропустить"
          >
            ×
          </button>
        </div>
        <p className={s.text}>{current.text}</p>
        <div className={s.foot}>
          <span className={s.dots}>
            {TOUR_STEPS.map((tour, index) => (
              <span
                key={tour.target}
                className={index === step ? `${s.dot} ${s.dotOn}` : s.dot}
                aria-hidden="true"
              />
            ))}
          </span>
          <span className={s.buttons}>
            {step === 0 ? null : (
              <button type="button" className={s.prev} onClick={() => go(step - 1)}>
                Назад
              </button>
            )}
            <button type="button" className={s.next} onClick={() => go(step + 1)}>
              {last ? 'Понятно' : 'Далее'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
