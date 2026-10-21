import type { EventKey, EventSelector } from '@/domain/standards/registry';
import { eventKey } from '@/domain/standards/registry';
import type { Pool } from '@/domain/standards/types';

/**
 * World Aquatics Points, base times of 2026: the table the points are scored against. The
 * system was FINA Points before the federation was renamed in 2023, and the app keeps the
 * old name because that is the one people search for.
 *
 * Transcribed from the official PDF, the same 70 values fina.borozdov.ru scores with,
 * checked there line by line on 2026-09-05. A base time is by definition the world record
 * ratified on the day the table comes into force, so the app needs no records of its own.
 */
export const BASE_TIMES_SOURCE =
  'https://resources.fina.org/fina/document/2026/09/05/9b48fb98-233c-4ce9-b67b-bc6163319bbd/Points-Base-times-SCM-and-LCM-2026_09.2026.pdf';

/**
 * The two pools are renewed on different days, and that is the trap: 25 m on 1 September,
 * 50 m on 1 January. baseTimes.test.ts goes red once either table is out of force.
 */
export const BASE_TIME_EDITIONS: Record<Pool, { from: string; to: string }> = {
  SCM: { from: '2026-09-01', to: '2027-08-31' },
  LCM: { from: '2026-01-01', to: '2026-12-31' },
};

/** Seconds, keyed like the dataset. */
export const BASE_TIMES: Readonly<Partial<Record<EventKey, number>>> = {
  'LCM|M|FREE|50': 20.91,
  'LCM|M|FREE|100': 46.4,
  'LCM|M|FREE|200': 102,
  'LCM|M|FREE|400': 219.96,
  'LCM|M|FREE|800': 452.12,
  'LCM|M|FREE|1500': 870.67,
  'LCM|M|BACK|50': 23.55,
  'LCM|M|BACK|100': 51.6,
  'LCM|M|BACK|200': 111.92,
  'LCM|M|BREAST|50': 25.95,
  'LCM|M|BREAST|100': 56.88,
  'LCM|M|BREAST|200': 125.48,
  'LCM|M|FLY|50': 22.27,
  'LCM|M|FLY|100': 49.45,
  'LCM|M|FLY|200': 110.34,
  'LCM|M|MEDLEY|200': 112.69,
  'LCM|M|MEDLEY|400': 242.5,
  'LCM|F|FREE|50': 23.61,
  'LCM|F|FREE|100': 51.71,
  'LCM|F|FREE|200': 112.23,
  'LCM|F|FREE|400': 234.18,
  'LCM|F|FREE|800': 484.12,
  'LCM|F|FREE|1500': 920.48,
  'LCM|F|BACK|50': 26.86,
  'LCM|F|BACK|100': 57.13,
  'LCM|F|BACK|200': 123.14,
  'LCM|F|BREAST|50': 29.16,
  'LCM|F|BREAST|100': 64.13,
  'LCM|F|BREAST|200': 137.55,
  'LCM|F|FLY|50': 24.43,
  'LCM|F|FLY|100': 54.6,
  'LCM|F|FLY|200': 121.81,
  'LCM|F|MEDLEY|200': 125.7,
  'LCM|F|MEDLEY|400': 263.65,
  'SCM|M|FREE|50': 19.9,
  'SCM|M|FREE|100': 44.84,
  'SCM|M|FREE|200': 98.61,
  'SCM|M|FREE|400': 212.25,
  'SCM|M|FREE|800': 440.46,
  'SCM|M|FREE|1500': 846.88,
  'SCM|M|BACK|50': 22.11,
  'SCM|M|BACK|100': 48.16,
  'SCM|M|BACK|200': 105.12,
  'SCM|M|BREAST|50': 24.95,
  'SCM|M|BREAST|100': 55.28,
  'SCM|M|BREAST|200': 119.52,
  'SCM|M|FLY|50': 21.32,
  'SCM|M|FLY|100': 47.68,
  'SCM|M|FLY|200': 106.85,
  'SCM|M|MEDLEY|100': 49.28,
  'SCM|M|MEDLEY|200': 108.88,
  'SCM|M|MEDLEY|400': 234.81,
  'SCM|F|FREE|50': 22.83,
  'SCM|F|FREE|100': 49.93,
  'SCM|F|FREE|200': 109.36,
  'SCM|F|FREE|400': 230.25,
  'SCM|F|FREE|800': 474,
  'SCM|F|FREE|1500': 908.24,
  'SCM|F|BACK|50': 25.23,
  'SCM|F|BACK|100': 54.02,
  'SCM|F|BACK|200': 117.33,
  'SCM|F|BREAST|50': 28.37,
  'SCM|F|BREAST|100': 62.36,
  'SCM|F|BREAST|200': 132.5,
  'SCM|F|FLY|50': 23.72,
  'SCM|F|FLY|100': 52.71,
  'SCM|F|FLY|200': 119.32,
  'SCM|F|MEDLEY|100': 55.11,
  'SCM|F|MEDLEY|200': 121.63,
  'SCM|F|MEDLEY|400': 255.48,
};

export const findBaseTime = (event: EventSelector): number | undefined =>
  BASE_TIMES[eventKey(event)];
