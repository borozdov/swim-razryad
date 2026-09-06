/**
 * The two sections of the app, one line each. A section joins the switch by adding an item
 * here, never by editing the markup that draws it.
 *
 * An item names a mode and not an address, because both modes live at one address: the
 * switch inside the app sets the mode, and the reference layer links back into it.
 */
import type { Mode } from './routes';

export type NavItem = {
  mode: Mode;
  label: string;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { mode: 'standards', label: 'Нормативы' },
  { mode: 'calculator', label: 'Калькулятор' },
];
