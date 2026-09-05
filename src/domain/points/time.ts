/**
 * The border between the printed notation of a swim time and the number of seconds
 * the domain works with. Nothing else in the domain touches a time string.
 */

const HUNDREDTHS_IN_SECOND = 100;
const HUNDREDTHS_IN_MINUTE = 6000;
const SECONDS_IN_MINUTE = 60;

/** `m:ss`, `m:ss.h`, `m:ss.hh`, with a comma or a dot before the fraction. */
const WITH_COLON = /^(\d{1,2}):(\d{1,2})(?:[.,](\d{1,2}))?$/;

/** `m.ss.hh` and `m,ss,hh`: how a phone keyboard without a colon writes minutes. */
const WITH_TWO_MARKS = /^(\d{1,2})[.,](\d{1,2})[.,](\d{1,2})$/;

/** `ss`, `ss.h`, `ss.hh`, `sss.hh`: seconds with an optional fraction, no minute part. */
const WITHOUT_MINUTES = /^(\d{1,3})(?:[.,](\d{1,2}))?$/;

/**
 * No swim of the order finishes under twenty seconds, so `1.21` cannot be 1.21 s and
 * is read as 1:21, the way a phone keyboard without a colon writes minutes.
 */
const SHORTEST_SWIM_SECONDS = 20;

/** Three to six bare digits read as the packed `MMSSHH` a stopwatch prints without marks. */
const PACKED = /^\d{3,6}$/;

const pad = (value: number): string => String(value).padStart(2, '0');

/** A fraction typed as one digit is tenths: `58.3` is `58.30`, never `58.03`. */
const hundredthsOf = (fraction: string | undefined): number =>
  fraction === undefined ? 0 : Number(fraction.padEnd(2, '0'));

/** Null for a zero total: a swim of no duration is not a time. */
const toSeconds = (minutes: number, seconds: number, hundredths: number): number | null => {
  const total = minutes * HUNDREDTHS_IN_MINUTE + seconds * HUNDREDTHS_IN_SECOND + hundredths;
  return total === 0 ? null : total / HUNDREDTHS_IN_SECOND;
};

/**
 * Parse a swim time into seconds, as leniently as the notation allows, so a result
 * shows while the time is still being typed. Returns null for anything outside the
 * accepted notation, so an input field can mark itself invalid instead of throwing.
 */
export const parseTime = (input: string): number | null => {
  const trimmed = input.trim();

  // Bare digits first: `102` is a packed 1.02, not 102 seconds with a lost fraction.
  if (PACKED.test(trimmed)) {
    const packed = trimmed.padStart(6, '0');
    const seconds = Number(packed.slice(2, 4));
    if (seconds >= SECONDS_IN_MINUTE) return null;
    return toSeconds(Number(packed.slice(0, 2)), seconds, Number(packed.slice(4, 6)));
  }

  const long = WITH_COLON.exec(trimmed) ?? WITH_TWO_MARKS.exec(trimmed);
  if (long !== null) {
    const seconds = Number(long[2]);
    if (seconds >= SECONDS_IN_MINUTE) return null;
    return toSeconds(Number(long[1]), seconds, hundredthsOf(long[3]));
  }

  const short = WITHOUT_MINUTES.exec(trimmed);
  if (short !== null) {
    const whole = Number(short[1]);
    const fraction = hundredthsOf(short[2]);
    if (short[2] !== undefined && whole < SHORTEST_SWIM_SECONDS && fraction < SECONDS_IN_MINUTE) {
      return toSeconds(whole, fraction, 0);
    }
    return toSeconds(0, whole, fraction);
  }

  return null;
};

/**
 * Print seconds the way the order prints them: `ss.hh` under a minute, `m:ss.hh`
 * from a minute up. Hundredths are the smallest unit a swim result carries.
 */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`Not a time in seconds: ${seconds}`);
  }

  const total = Math.round(seconds * HUNDREDTHS_IN_SECOND);
  const minutes = Math.floor(total / HUNDREDTHS_IN_MINUTE);
  const wholeSeconds = Math.floor((total % HUNDREDTHS_IN_MINUTE) / HUNDREDTHS_IN_SECOND);
  const hundredths = total % HUNDREDTHS_IN_SECOND;

  return minutes === 0
    ? `${wholeSeconds}.${pad(hundredths)}`
    : `${minutes}:${pad(wholeSeconds)}.${pad(hundredths)}`;
};
