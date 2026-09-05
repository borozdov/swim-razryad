import { describe, expect, it } from 'vitest';
import { KEYBOARD_MIN_HEIGHT, MIN_APP_HEIGHT, appHeight, isKeyboardOpen } from './keyboard';

describe('the keyboard rule', () => {
  it('calls the keyboard open when the viewport lost more than an address bar', () => {
    expect(isKeyboardOpen(812, 812 - KEYBOARD_MIN_HEIGHT - 1, true)).toBe(true);
  });

  it('ignores a viewport that only lost the address bar', () => {
    expect(isKeyboardOpen(812, 812 - 60, true)).toBe(false);
  });

  it('stays shut while no field has focus, whatever the viewport did', () => {
    expect(isKeyboardOpen(812, 400, false)).toBe(false);
  });

  it('never lets the app shrink below a usable height', () => {
    expect(appHeight(120)).toBe(MIN_APP_HEIGHT);
    expect(appHeight(640.7)).toBe(640);
  });
});
