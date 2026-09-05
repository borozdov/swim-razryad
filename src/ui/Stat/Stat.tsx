import s from './Stat.module.css';

export type StatProps = {
  value: string | number;
  label: string;
  size: 'lg' | 'md';
};

export function Stat({ value, label, size }: StatProps) {
  const sizeClass = size === 'lg' ? s.lg : s.md;
  return (
    <div className={`${s.root} ${sizeClass}`}>
      <span className={s.value}>{value}</span>
      <span className={s.label}>{label}</span>
    </div>
  );
}
