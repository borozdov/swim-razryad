/**
 * Whether the on-screen keyboard is up. Kept apart from the component so the rule can be
 * read and tested without a browser.
 */

/** Below this the viewport only lost the address bar, which is not a keyboard. */
export const KEYBOARD_MIN_HEIGHT = 140;

/** The floor keeps a collapsed viewport from squeezing the app into nothing. */
export const MIN_APP_HEIGHT = 360;

export const isKeyboardOpen = (base: number, visible: number, fieldFocused: boolean): boolean =>
  fieldFocused && base - visible > KEYBOARD_MIN_HEIGHT;

export const appHeight = (visible: number): number => Math.max(MIN_APP_HEIGHT, Math.floor(visible));
