import s from './ScaleBar.module.css';

export type ScaleNode = {
  /** Display label of the node; the feature maps a domain rank to it. */
  label: string;
  points: number;
};

/** A caption under a run of nodes, centred between the first and the last of them. */
export type ScaleGroup = {
  label: string;
  from: number;
  to: number;
};

export type ScaleBarProps = {
  points: number;
  nodes: readonly ScaleNode[];
  groups?: readonly ScaleGroup[];
};

const HEIGHT = 58;
const TRACK_Y = 10;
const TRACK_HEIGHT = 4;
const TRACK_CENTER = TRACK_Y + TRACK_HEIGHT / 2;
/* One straight row of node labels, one row of group captions under it: nothing zigzags. */
const NODE_LABEL_Y = 32;
const GROUP_LABEL_Y = 50;

function toPercent(value: number, max: number): string {
  const clamped = Math.min(Math.max(value, 0), max);
  return `${((clamped / max) * 100).toFixed(2)}%`;
}

/* The last two nodes sit a tenth apart: both hang left off their tick so neither runs into the other. */
function labelAnchor(value: number, max: number): 'start' | 'middle' | 'end' {
  const share = value / max;
  if (share <= 0.1) return 'start';
  if (share >= 0.85) return 'end';
  return 'middle';
}

/* The second-to-last label steps a few pixels left of its tick, to leave air before the last one. */
function labelShift(value: number, max: number): number {
  const share = value / max;
  return share >= 0.85 && share < 0.95 ? -4 : 0;
}

export function ScaleBar({ points, nodes, groups = [] }: ScaleBarProps) {
  const max = Math.max(1, ...nodes.map((node) => node.points));
  const position = toPercent(points, max);
  return (
    <svg
      className={s.root}
      role="img"
      aria-label={`${Math.round(points)} из ${max}`}
      width="100%"
      height={HEIGHT}
      overflow="visible"
    >
      <rect className={s.track} x="0" y={TRACK_Y} width="100%" height={TRACK_HEIGHT} />
      <rect className={s.fill} x="0" y={TRACK_Y} width={position} height={TRACK_HEIGHT} />
      {nodes.map((node, index) => {
        const x = toPercent(node.points, max);
        return (
          <g key={index}>
            <line
              className={s.tick}
              x1={x}
              x2={x}
              y1={TRACK_Y - 4}
              y2={TRACK_Y + TRACK_HEIGHT + 4}
            />
            <text
              className={s.label}
              x={x}
              dx={labelShift(node.points, max)}
              y={NODE_LABEL_Y}
              textAnchor={labelAnchor(node.points, max)}
            >
              {node.label}
            </text>
          </g>
        );
      })}
      {groups.map((group, index) => (
        <text
          key={index}
          className={s.group}
          x={toPercent((group.from + group.to) / 2, max)}
          y={GROUP_LABEL_Y}
          textAnchor="middle"
        >
          {group.label}
        </text>
      ))}
      <circle className={s.marker} cx={position} cy={TRACK_CENTER} r="6" />
    </svg>
  );
}
