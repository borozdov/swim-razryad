import type { Edition } from '@/domain/standards/types';
import { LCM_ROWS } from './lcm';
import { SCM_ROWS } from './scm';

/**
 * ЕВСК по виду спорта «плавание» as it stands from 26 November 2024.
 *
 * Numbers come from приложение № 1 to приказ Минспорта России от 06.11.2024 № 1092,
 * which replaces rows 1-43 of the table in пункт 3 of приложение № 19 to приказ
 * Минспорта России от 20.12.2021 № 999. Scanned original, 52 pages, published on
 * publication.pravo.gov.ru under номер опубликования 0001202411150002.
 *
 * Rows 1-18 of that table carry the 25 m pool and rows 24-40 the 50 m pool. Rows
 * 19-23 and 41-43 are relays and stay out of the dataset.
 */
export const EDITION_2024_11_26: Edition = {
  id: '2024-11-26',
  order: 'http://publication.pravo.gov.ru/document/0001202411150002',
  effectiveFrom: '2024-11-26',
  effectiveTo: null,
  rows: [...LCM_ROWS, ...SCM_ROWS],
};
