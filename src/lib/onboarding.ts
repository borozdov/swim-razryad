/**
 * The tour a reader is shown once. The steps and the arithmetic live here so both can be
 * read and tested without a browser; the component only draws them.
 */

export const ONBOARDING_DONE_KEY = 'razryad.onboarding.done';

export type TourStep = {
  /** The `data-tour` mark of the element the step points at. */
  target: string;
  title: string;
  text: string;
  /** Where the card stands relative to the element it explains. */
  place: 'below' | 'above';
};

/** Three steps, top to bottom, the way the page itself reads. */
export const TOUR_STEPS: readonly TourStep[] = [
  {
    target: 'event',
    title: 'Бассейн и пол',
    text: 'Выберите бассейн, 25 или 50 метров, и пол спортсмена.',
    place: 'below',
  },
  {
    target: 'stroke',
    title: 'Стиль и дистанция',
    text: 'Выберите заплыв. Таблица под ним меняется сразу.',
    place: 'below',
  },
  {
    target: 'sections',
    title: 'Калькулятор',
    text: 'Введите своё время и узнайте разряд, остаток до следующего и очки.',
    place: 'below',
  },
];

/** Shown once. A storage that refuses to answer means no tour: a guess would repeat it. */
export const shouldRunTour = (storage: Pick<Storage, 'getItem'>): boolean => {
  try {
    return storage.getItem(ONBOARDING_DONE_KEY) !== '1';
  } catch {
    return false;
  }
};

export type Box = { x: number; y: number; width: number; height: number };

/** The hole of the spotlight: the element plus a little air, as in fina-point. */
export const spotlight = (box: Box, pad = 8): Box => ({
  x: box.x - pad,
  y: box.y - pad,
  width: box.width + pad * 2,
  height: box.height + pad * 2,
});

/** Centred on the element, but never past the edge of the screen. */
export const cardLeft = (box: Box, cardWidth: number, viewport: number, margin = 16): number => {
  const centred = box.x + box.width / 2 - cardWidth / 2;
  const rightmost = viewport - cardWidth - margin;
  return Math.max(margin, Math.min(centred, Math.max(margin, rightmost)));
};

/** Below the element, or above it when the step says so; the card is 16 pixels clear either way. */
export const cardTop = (box: Box, place: TourStep['place'], gap = 16): number =>
  place === 'below' ? box.y + box.height + gap : box.y - gap;
