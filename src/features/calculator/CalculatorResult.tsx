import { rankPoints } from '@/domain/points/calculate';
import { nearbyStandards } from '@/domain/points/nearby';
import { RANK_ORDER } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import type { PointsResult, Rank, StandardRow } from '@/domain/standards/types';
import { RANK_FULL_LABEL, RANK_LABEL, RANK_NUMERAL } from '@/lib/labels';
import type { EventRoute } from '@/lib/routes';
import { ShareResultButton } from '@/features/share/ShareResultButton';
import { ScaleBar } from '@/ui';
import s from './CalculatorResult.module.css';

/**
 * Where each rank stands on the bar. Not its points: FINA points pack the three youth ranks
 * into the first tenth of the track and the three titles into a few pixels, and their labels
 * run into each other on nearly every event. The bar is a ladder, and the result is placed
 * between the two ranks around it.
 */
const LADDER: Record<Rank, number> = {
  YOUTH_3: 100,
  YOUTH_2: 200,
  YOUTH_1: 300,
  ADULT_3: 400,
  ADULT_2: 500,
  ADULT_1: 600,
  CMS: 750,
  MS: 900,
  MSMK: 1000,
};

/** All nine nodes, always: the ladder is the same one whatever times the event carries. */
const SCALE_NODES = RANK_ORDER.map((rank) => ({ label: RANK_NUMERAL[rank], points: LADDER[rank] }));

/** The three runs of the ladder, so a bare numeral reads as youth, adult or a title. */
const SCALE_GROUPS = [
  { label: 'юношеские', from: LADDER.YOUTH_3, to: LADDER.YOUTH_1 },
  { label: 'спортивные', from: LADDER.ADULT_3, to: LADDER.ADULT_1 },
  { label: 'звания', from: LADDER.CMS, to: LADDER.MSMK },
];

/**
 * The result on the ladder: as far between the two ranks around it as its points are between
 * theirs. Slower than every rank, it runs down to zero; faster than МСМК, it stops at the end.
 */
const ladderPosition = (points: number, standard: StandardRow): number => {
  let lower = { points: 0, at: 0 };
  for (const { rank, points: rankScore } of rankPoints(standard)) {
    const upper = { points: rankScore, at: LADDER[rank] };
    if (points < upper.points) {
      return (
        lower.at + ((upper.at - lower.at) * (points - lower.points)) / (upper.points - lower.points)
      );
    }
    lower = upper;
  }
  return lower.at;
};

export type CalculatorResultProps = {
  /** Null while there is nothing to show; `placeholder` then says why. */
  result: PointsResult | null;
  placeholder: string;
  /** What the result is about, so it can be shared as a picture and as a link. */
  event: EventRoute;
  seconds: number | null;
  query: string;
  /** The row of the order, for the standards of the rungs around the result. */
  standard: StandardRow | undefined;
};

/** The rank leads, the gap to the next one follows, the points come last and smallest. */
export function CalculatorResult({
  result,
  placeholder,
  event,
  seconds,
  query,
  standard,
}: CalculatorResultProps) {
  const nearby =
    result === null || standard === undefined ? [] : nearbyStandards(result, standard.times);

  return (
    <div className={s.root}>
      <div className={result === null ? s.card : `${s.card} ${s.ready}`} aria-live="polite">
        {result === null || seconds === null ? (
          <p className={s.placeholder}>{placeholder}</p>
        ) : (
          <>
            <ShareResultButton event={event} result={result} seconds={seconds} query={query} />
            <span className={s.label}>Разряд</span>
            <p className={s.rank}>
              {result.achievedRank === null ? 'Разряда нет' : RANK_FULL_LABEL[result.achievedRank]}
            </p>
            {result.nextRank === null || result.gapSeconds === null ? null : (
              <p className={s.gap}>
                <span className={s.gapLabel}>до {RANK_LABEL[result.nextRank]}</span>
                <span className={s.gapValue}>{result.gapSeconds.toFixed(2)}</span>
                <span className={s.gapUnit}>с</span>
              </p>
            )}
            <p className={s.points}>
              <span className={s.pointsLabel}>Очки FINA</span>
              <span className={s.pointsValue}>{result.points}</span>
            </p>
            {nearby.length === 0 ? null : (
              <dl className={s.nearby}>
                {nearby.map(({ rank, seconds: standardSeconds, achieved }) => (
                  <div
                    key={rank}
                    className={achieved ? `${s.nearbyRow} ${s.nearbyDone}` : s.nearbyRow}
                  >
                    <dt className={s.nearbyRank}>{RANK_LABEL[rank]}</dt>
                    <dd className={s.nearbyTime}>{formatTime(standardSeconds)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </div>
      {result === null || standard === undefined ? null : (
        <div className={s.scale}>
          <ScaleBar
            points={ladderPosition(result.points, standard)}
            nodes={SCALE_NODES}
            groups={SCALE_GROUPS}
            label={`Очки FINA: ${result.points}`}
          />
        </div>
      )}
    </div>
  );
}
