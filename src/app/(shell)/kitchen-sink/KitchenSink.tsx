'use client';

import { useState, type ReactNode } from 'react';
import {
  Badge,
  Button,
  Card,
  Chips,
  ScaleBar,
  Segmented,
  Stat,
  Table,
  ThemeToggle,
  TimeInput,
} from '@/ui';
import s from './KitchenSink.module.css';

const POOLS = [
  { value: 'LCM', label: '50 м' },
  { value: 'SCM', label: '25 м' },
] as const;

type Pool = (typeof POOLS)[number]['value'];

const DISTANCES = [50, 100, 200, 400, 800, 1500].map((distance) => ({
  value: distance,
  label: `${distance} м`,
}));

/* Showcase only: the real parser lives in domain/points/time.ts. */
const TIME_SHAPE = /^[0-9:.,]+$/;

const SCALE_NODES = [
  { label: 'III', points: 100 },
  { label: 'II', points: 200 },
  { label: 'I', points: 300 },
  { label: 'III', points: 400 },
  { label: 'II', points: 500 },
  { label: 'I', points: 600 },
  { label: 'КМС', points: 750 },
  { label: 'МС', points: 900 },
  { label: 'МСМК', points: 1000 },
];

const SCALE_GROUPS = [
  { label: 'юношеские', from: 100, to: 300 },
  { label: 'спортивные', from: 400, to: 600 },
  { label: 'звания', from: 750, to: 1000 },
];

const TABLE_COLUMNS = ['Ступень', 'Норматив', 'Очки'];

const TABLE_ROWS: ReactNode[][] = [
  [<Badge key="msmk">МСМК</Badge>, '24.00', '1000'],
  [
    <Badge key="ms" inverted>
      МС
    </Badge>,
    '26.00',
    '900',
  ],
  [<Badge key="kms">КМС</Badge>, '28.50', '750'],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = `primitive-${title.toLowerCase()}`;
  return (
    <section className={s.section} aria-labelledby={id}>
      <h2 id={id} className={s.title}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function KitchenSink() {
  const [time, setTime] = useState('1:05.30');
  const [pool, setPool] = useState<Pool>('LCM');
  const [distance, setDistance] = useState(100);

  return (
    <div className={s.root}>
      <h1>Kitchen sink</h1>
      <p className={s.intro}>Десять примитивов из ui/ во всех вариантах пропсов.</p>

      <Section title="Button">
        <div className={s.row}>
          <Button variant="solid">Рассчитать</Button>
          <Button variant="outline">Сбросить</Button>
          <Button variant="solid" disabled>
            Недоступно
          </Button>
        </div>
      </Section>

      <Section title="TimeInput">
        <div className={s.grid}>
          <TimeInput value={time} onChange={setTime} invalid={!TIME_SHAPE.test(time)} />
          <TimeInput value="1:7" onChange={() => {}} invalid />
        </div>
      </Section>

      <Section title="Segmented">
        <div className={s.grid}>
          <Segmented label="Бассейн" value={pool} options={POOLS} onChange={setPool} />
        </div>
      </Section>

      <Section title="Chips">
        <Chips label="Дистанция" value={distance} options={DISTANCES} onChange={setDistance} />
      </Section>

      <Section title="Badge">
        <div className={s.row}>
          <Badge>КМС</Badge>
          <Badge inverted>МС</Badge>
        </div>
      </Section>

      <Section title="Table">
        <Table columns={TABLE_COLUMNS} rows={TABLE_ROWS} numericColumns={[1, 2]} />
      </Section>

      <Section title="Card">
        <div className={s.grid}>
          <Card label="Результат">
            <Stat value="742" label="Очки" size="md" />
          </Card>
          <Card>
            <p>Карточка без подписи.</p>
          </Card>
        </div>
      </Section>

      <Section title="Stat">
        <div className={s.grid}>
          <Stat value={742} label="Очки" size="lg" />
          <Stat value="1.25" label="До КМС, секунд" size="md" />
        </div>
      </Section>

      <Section title="ScaleBar">
        <ScaleBar points={742} nodes={SCALE_NODES} groups={SCALE_GROUPS} />
      </Section>

      <Section title="ThemeToggle">
        <div className={s.row}>
          <ThemeToggle />
        </div>
      </Section>
    </div>
  );
}
