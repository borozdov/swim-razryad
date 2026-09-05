/**
 * The header navigation, one line per page. A new page joins the header by adding
 * an item here, never by editing the markup of `layout.tsx`.
 */
import { CALCULATOR_PATH, HOME_PATH } from './routes';

export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: HOME_PATH, label: 'Нормативы' },
  { href: CALCULATOR_PATH, label: 'Калькулятор' },
];
