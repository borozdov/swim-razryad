import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

/*
  `next build` sets this from `trailingSlash: true` in next.config.ts, and next/link reads
  it to decide whether an href keeps its slash. Unset, Link strips the slash here and a link
  test would assert an href the deploy never emits.
*/
process.env.__NEXT_TRAILING_SLASH = 'true';

afterEach(() => {
  cleanup();
});
