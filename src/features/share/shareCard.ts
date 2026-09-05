/**
 * What a shared result says, assembled apart from how it is drawn. The painter takes
 * this and puts it on a canvas; a test takes it and reads the words.
 */
import { formatTime } from '@/domain/points/time';
import type { PointsResult } from '@/domain/standards/types';
import { POOL_SHORT_LABEL, RANK_FULL_LABEL, RANK_LABEL, eventLabel } from '@/lib/labels';
import type { EventRoute } from '@/lib/routes';

export type ShareCard = {
  /** «Вольный стиль 50 м», the event without the pool. */
  event: string;
  /** «Бассейн 50 м». */
  pool: string;
  /** The rank in full, or the line that says there is none yet. */
  rank: string;
  /** The swim, printed the way the order prints it. */
  time: string;
  points: string;
  /** «до КМС 1.25 с», absent above МСМК. */
  gap: string | null;
};

export const NO_RANK = 'Разряда нет';

export const buildShareCard = (
  event: EventRoute,
  result: PointsResult,
  seconds: number,
): ShareCard => ({
  event: eventLabel(event),
  pool: `Бассейн ${POOL_SHORT_LABEL[event.pool]}`,
  rank: result.achievedRank === null ? NO_RANK : RANK_FULL_LABEL[result.achievedRank],
  time: formatTime(seconds),
  points: String(result.points),
  gap:
    result.nextRank === null || result.gapSeconds === null
      ? null
      : `до ${RANK_LABEL[result.nextRank]} ${result.gapSeconds.toFixed(2)} с`,
});

/** The file a reader saves when the system has no share sheet to offer. */
export const shareFileName = (card: ShareCard): string =>
  `razryad-${card.time.replace(/[:.]/g, '-')}.png`;
