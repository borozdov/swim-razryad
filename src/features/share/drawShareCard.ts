/**
 * Paints a shared result, 1080 by 1080. Colours are read from the CSS variables of the
 * look in force, never written here: the project keeps every colour literal in
 * globals.css, and this way the картинка follows the theme the reader chose.
 */
import type { ShareCard } from './shareCard';

const SIZE = 1080;
const MARGIN = 70;
const HEAD_HEIGHT = 110;
const RADIUS = 16;

type Palette = {
  canvas: string;
  surface: string;
  inset: string;
  hairline: string;
  slate: string;
  softened: string;
  ink: string;
};

const readPalette = (root: Element): Palette => {
  const style = getComputedStyle(root);
  const role = (name: string): string => style.getPropertyValue(name).trim();
  return {
    canvas: role('--canvas'),
    surface: role('--surface'),
    inset: role('--inset'),
    hairline: role('--hairline'),
    slate: role('--slate'),
    softened: role('--softened'),
    ink: role('--ink'),
  };
};

const SANS = 'Inter, system-ui, -apple-system, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace';

/** Uppercase, wide tracking: the label voice of the system. */
const label = (context: CanvasRenderingContext2D, text: string, y: number, colour: string) => {
  context.fillStyle = colour;
  context.font = `500 26px ${SANS}`;
  context.letterSpacing = '5px';
  context.fillText(text.toUpperCase(), SIZE / 2, y);
  context.letterSpacing = '0px';
};

/** Shrinks a line until it fits the card, so a long rank never runs off the edge. */
const fitText = (
  context: CanvasRenderingContext2D,
  text: string,
  weight: number,
  start: number,
  max: number,
): number => {
  let size = start;
  context.font = `${weight} ${size}px ${SANS}`;
  while (context.measureText(text).width > max && size > 24) {
    size -= 2;
    context.font = `${weight} ${size}px ${SANS}`;
  }
  return size;
};

export const drawShareCard = async (card: ShareCard, root: Element): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext('2d');
  if (context === null) throw new Error('Canvas is unavailable');

  const colour = readPalette(root);
  // Without this the first paint falls back to a system face and the digits jump.
  try {
    await document.fonts.load(`700 150px ${MONO}`);
    await document.fonts.load(`600 60px ${SANS}`);
  } catch {
    // A refused font load is not a reason to refuse the picture.
  }

  context.fillStyle = colour.canvas;
  context.fillRect(0, 0, SIZE, SIZE);

  const cardSide = SIZE - MARGIN * 2;
  context.fillStyle = colour.surface;
  context.beginPath();
  context.roundRect(MARGIN, MARGIN, cardSide, cardSide, RADIUS);
  context.fill();
  context.strokeStyle = colour.hairline;
  context.lineWidth = 2;
  context.stroke();

  // The head strip carries the wordmark, the way the app carries it.
  context.save();
  context.beginPath();
  context.roundRect(MARGIN, MARGIN, cardSide, HEAD_HEIGHT, [RADIUS, RADIUS, 0, 0]);
  context.fillStyle = colour.inset;
  context.fill();
  context.restore();
  context.beginPath();
  context.moveTo(MARGIN, MARGIN + HEAD_HEIGHT);
  context.lineTo(MARGIN + cardSide, MARGIN + HEAD_HEIGHT);
  context.strokeStyle = colour.hairline;
  context.stroke();

  context.textAlign = 'center';
  label(context, 'Разряд — by Borozdov', MARGIN + HEAD_HEIGHT / 2 + 11, colour.slate);

  const eventSize = fitText(context, card.event.toUpperCase(), 600, 66, cardSide - 80);
  context.fillStyle = colour.ink;
  context.font = `600 ${eventSize}px ${SANS}`;
  context.letterSpacing = '-1px';
  context.fillText(card.event.toUpperCase(), SIZE / 2, 320);
  context.letterSpacing = '0px';
  label(context, card.pool, 375, colour.slate);

  // The rank leads, on an inverted plate: the one accent the system allows.
  label(context, 'Разряд', 470, colour.slate);
  const rank = card.rank.toUpperCase();
  const rankSize = fitText(context, rank, 700, 96, cardSide - 120);
  context.font = `700 ${rankSize}px ${SANS}`;
  const rankWidth = context.measureText(rank).width;
  const plateHeight = rankSize + 70;
  context.fillStyle = colour.ink;
  context.beginPath();
  context.roundRect(SIZE / 2 - rankWidth / 2 - 44, 505, rankWidth + 88, plateHeight, 8);
  context.fill();
  context.fillStyle = colour.canvas;
  context.fillText(rank, SIZE / 2, 505 + plateHeight / 2 + rankSize / 3);

  // The swim itself, monospaced with tabular figures.
  label(context, 'Время', 740, colour.slate);
  context.fillStyle = colour.softened;
  context.font = `600 110px ${MONO}`;
  context.fillText(card.time, SIZE / 2, 845);

  context.fillStyle = colour.slate;
  context.font = `500 30px ${SANS}`;
  const tail = card.gap === null ? `Очки ${card.points}` : `${card.gap}  ·  Очки ${card.points}`;
  context.fillText(tail, SIZE / 2, 910);

  label(context, 'razryad.borozdov.ru', 975, colour.slate);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob === null ? reject(new Error('Картинка не собралась')) : resolve(blob)),
      'image/png',
      1,
    );
  });
};
