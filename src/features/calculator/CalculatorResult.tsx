import { nearbyStandards } from '@/domain/points/nearby';
import { RANK_ORDER, RANK_POINTS } from '@/domain/points/scale';
import { formatTime } from '@/domain/points/time';
import type { PointsResult, StandardRow } from '@/domain/standards/types';
import { RANK_FULL_LABEL, RANK_LABEL, RANK_NUMERAL } from '@/lib/labels';
import type { EventRoute } from '@/lib/routes';
import { ShareResultButton } from '@/features/share/ShareResultButton';
import { ScaleBar } from '@/ui';
import s from './CalculatorResult.module.css';

/** All nine nodes, always: the ladder is the same one whatever times the event carries. */
const SCALE_NODES = RANK_ORDER.map((rank) => ({
  label: RANK_NUMERAL[rank],
  points: RANK_POINTS[rank],
}));

/** The three runs of the ladder, so a bare numeral reads as youth, adult or a title. */
const SCALE_GROUPS = [
  { label: 'юношеские', from: RANK_POINTS.YOUTH_3, to: RANK_POINTS.YOUTH_1 },
  { label: 'спортивные', from: RANK_POINTS.ADULT_3, to: RANK_POINTS.ADULT_1 },
  { label: 'звания', from: RANK_POINTS.CMS, to: RANK_POINTS.MSMK },
];

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
              <span className={s.pointsLabel}>Очки</span>
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
      {result === null ? null : (
        <div className={s.scale}>
          <ScaleBar points={result.points} nodes={SCALE_NODES} groups={SCALE_GROUPS} />
        </div>
      )}
    </div>
  );
}
