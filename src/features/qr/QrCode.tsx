import { planQr } from '@/lib/qr';
import s from './QrCode.module.css';

export type QrCodeProps = {
  /** What a scanner reads out of the code. */
  text: string;
  /** The letter of the seal in the middle. */
  seal: string;
};

const EYE = 7;

/** Fractions of a module, carried over from the canvas the same code is drawn on in fina. */
const SEAL_PAD = 0.3;
const SEAL_RADIUS = 0.4;
const SEAL_LETTER = 0.5;

/**
 * The code as inline SVG, laid out in modules: one module is one unit of the viewBox, so
 * the plate scales to whatever width the card gives it and stays sharp.
 *
 * Drawn on the server at build time. The canvas version in fina has to wait for the font
 * before it can paint the letter of the seal, and repaints when it arrives; a <text> node
 * has no such race.
 */
export function QrCode({ text, seal }: QrCodeProps) {
  const plan = planQr(text);
  const side = plan.size + plan.quiet * 2;
  const modules = plan.cells
    .map(({ row, col }) => `M${plan.quiet + col} ${plan.quiet + row}h1v1h-1z`)
    .join('');

  const sealOrigin = plan.quiet + plan.seal.start;
  const sealCentre = sealOrigin + plan.seal.span / 2;

  return (
    <svg
      className={s.root}
      viewBox={`0 0 ${side} ${side}`}
      role="img"
      aria-label={`QR-код на ${text}`}
    >
      <rect className={s.paper} x="0" y="0" width={side} height={side} />
      <path className={s.ink} d={modules} />

      {/* Each eye is three squares inside one another, with no rounding. */}
      {plan.eyes.map((eye) => {
        const x = plan.quiet + eye.col;
        const y = plan.quiet + eye.row;
        return (
          <g key={`${eye.row}-${eye.col}`}>
            <rect className={s.ink} x={x} y={y} width={EYE} height={EYE} />
            <rect className={s.paper} x={x + 1} y={y + 1} width={EYE - 2} height={EYE - 2} />
            <rect className={s.ink} x={x + 2} y={y + 2} width={EYE - 4} height={EYE - 4} />
          </g>
        );
      })}

      <rect
        className={s.ink}
        x={sealOrigin + SEAL_PAD}
        y={sealOrigin + SEAL_PAD}
        width={plan.seal.span - SEAL_PAD * 2}
        height={plan.seal.span - SEAL_PAD * 2}
        rx={SEAL_RADIUS}
      />
      <text
        className={s.seal}
        x={sealCentre}
        y={sealCentre}
        fontSize={plan.seal.span * SEAL_LETTER}
        textAnchor="middle"
        dominantBaseline="central"
      >
        {seal}
      </text>
    </svg>
  );
}
