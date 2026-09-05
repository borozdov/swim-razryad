/**
 * The matrix of a QR code, turned into a list of squares to draw. What to draw lives
 * here, what draws it lives in features/qr, the same split as shareCard/drawShareCard.
 *
 * The geometry is the one fina.borozdov.ru/qr/ paints on a canvas: monolithic finder
 * eyes with no rounding, and a seal in the middle carrying a letter. Error correction
 * stays at H, which tolerates about 30% of the code being covered; the seal takes ~7%.
 */
import qrcode from 'qrcode-generator';

/** A module of the matrix, addressed the way the encoder addresses it. */
export type QrCell = { row: number; col: number };

export type QrPlan = {
  /** Modules per side. */
  size: number;
  /** The quiet zone every scanner expects around the code, in modules. */
  quiet: number;
  /** Data modules to fill. Whatever an eye or the seal covers is already gone. */
  cells: readonly QrCell[];
  /** Top-left module of each 7x7 finder eye: three corners, never the fourth. */
  eyes: readonly QrCell[];
  /** The square in the middle the seal covers, in modules. */
  seal: { start: number; span: number };
};

const EYE = 7;

/** A version 3 code is 29 modules; below that a nine-module seal would eat the payload. */
const sealSpan = (size: number): number => (size >= 29 ? 9 : 7);

export const planQr = (text: string): QrPlan => {
  const code = qrcode(0, 'H');
  code.addData(text);
  code.make();

  const size = code.getModuleCount();
  const eyes: readonly QrCell[] = [
    { row: 0, col: 0 },
    { row: 0, col: size - EYE },
    { row: size - EYE, col: 0 },
  ];

  const span = sealSpan(size);
  const start = Math.floor((size - span) / 2);
  const end = start + span - 1;

  const inEye = (row: number, col: number): boolean =>
    eyes.some(
      (eye) => row >= eye.row && row < eye.row + EYE && col >= eye.col && col < eye.col + EYE,
    );
  const inSeal = (row: number, col: number): boolean =>
    row >= start && row <= end && col >= start && col <= end;

  const cells: QrCell[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!code.isDark(row, col)) continue;
      if (inEye(row, col) || inSeal(row, col)) continue;
      cells.push({ row, col });
    }
  }

  return { size, quiet: 1, cells, eyes, seal: { start, span } };
};
