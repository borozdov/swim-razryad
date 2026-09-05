import { describe, expect, it } from 'vitest';
import { planQr, type QrCell, type QrPlan } from './qr';
import { HOME_PATH } from './routes';
import { canonicalUrl } from './seo';

const TARGET = canonicalUrl(HOME_PATH);

const plan = planQr(TARGET);

const covers = (cell: QrCell, origin: QrCell, span: number): boolean =>
  cell.row >= origin.row &&
  cell.row < origin.row + span &&
  cell.col >= origin.col &&
  cell.col < origin.col + span;

const sealOrigin = (p: QrPlan): QrCell => ({ row: p.seal.start, col: p.seal.start });

describe('planQr', () => {
  it('lays a square matrix of the size a QR version comes in', () => {
    expect(plan.size).toBeGreaterThanOrEqual(21);
    expect(plan.size % 4).toBe(1);
    expect(plan.quiet).toBe(1);
    expect(plan.cells.length).toBeGreaterThan(0);
  });

  it('puts a finder eye in three corners and never the fourth', () => {
    expect(plan.eyes).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: plan.size - 7 },
      { row: plan.size - 7, col: 0 },
    ]);
  });

  it('centres the seal, leaving the same margin on both sides', () => {
    const after = plan.size - plan.seal.start - plan.seal.span;

    expect(plan.seal.start).toBe(after);
    expect(plan.seal.span).toBeGreaterThan(0);
  });

  it('covers far less than the third of the code the H level tolerates', () => {
    const covered = (plan.seal.span * plan.seal.span) / (plan.size * plan.size);

    expect(covered).toBeLessThan(0.3);
  });

  it('leaves no data module under an eye or under the seal', () => {
    const underEye = plan.cells.some((cell) => plan.eyes.some((eye) => covers(cell, eye, 7)));
    const underSeal = plan.cells.some((cell) => covers(cell, sealOrigin(plan), plan.seal.span));

    expect(underEye).toBe(false);
    expect(underSeal).toBe(false);
  });

  it('keeps every module inside the matrix', () => {
    const outside = plan.cells.some(
      ({ row, col }) => row < 0 || col < 0 || row >= plan.size || col >= plan.size,
    );

    expect(outside).toBe(false);
  });

  it('answers the same plan for the same text', () => {
    expect(planQr(TARGET)).toEqual(plan);
  });

  it('grows the matrix when the text no longer fits the version', () => {
    const long = planQr(`${TARGET}${'x'.repeat(200)}`);

    expect(long.size).toBeGreaterThan(plan.size);
  });
});
