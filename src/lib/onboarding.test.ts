import { describe, expect, it } from 'vitest';
import {
  ONBOARDING_DONE_KEY,
  TOUR_STEPS,
  cardLeft,
  cardTop,
  shouldRunTour,
  spotlight,
} from './onboarding';

const storage = (value: string | null): Pick<Storage, 'getItem'> => ({ getItem: () => value });

const box = { x: 100, y: 200, width: 120, height: 40 };

describe('the tour', () => {
  it('runs for a reader who has not seen it', () => {
    expect(shouldRunTour(storage(null))).toBe(true);
  });

  it('never runs twice', () => {
    expect(shouldRunTour(storage('1'))).toBe(false);
  });

  it('stays away when storage refuses to answer, rather than repeating itself', () => {
    expect(
      shouldRunTour({
        getItem: () => {
          throw new Error('denied');
        },
      }),
    ).toBe(false);
  });

  it('is short: three steps, each pointing at something on the page', () => {
    expect(TOUR_STEPS).toHaveLength(3);
    expect(TOUR_STEPS.every((step) => step.target !== '' && step.text.length < 90)).toBe(true);
  });

  it('remembers itself under one key', () => {
    expect(ONBOARDING_DONE_KEY).toBe('razryad.onboarding.done');
  });
});

describe('where the tour puts its card', () => {
  it('cuts the hole around the element with air to spare', () => {
    expect(spotlight(box)).toEqual({ x: 92, y: 192, width: 136, height: 56 });
  });

  it('centres the card on the element', () => {
    expect(cardLeft(box, 100, 375)).toBe(110);
  });

  it('keeps the card on screen at either edge', () => {
    expect(cardLeft({ ...box, x: 0, width: 40 }, 320, 375)).toBe(16);
    expect(cardLeft({ ...box, x: 360, width: 40 }, 320, 375)).toBe(39);
  });

  it('stands below the element, or above it when the step asks', () => {
    expect(cardTop(box, 'below')).toBe(256);
    expect(cardTop(box, 'above')).toBe(184);
  });
});
