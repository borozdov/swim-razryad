/**
 * The last gate of `pnpm build`: every inline script in the export has to parse.
 *
 * The Metrika loader once shipped in a shape no browser could run, and nothing caught it.
 * The source was right, the unit tests read the source, and the built page was read by
 * nothing at all. Text assertions would not have caught it either: the build dropped eight
 * characters and left every substring a test looks for still in place. Parsing is the only
 * check that asks the question the page asks.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const OUT = resolve(process.cwd(), 'out');

const pages = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return pages(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });

/*
  Classic inline scripts only. A `src` is someone else's file and not ours to judge, and a
  type other than text/javascript is data or a module: JSON-LD is not code, and a module
  body is not something `new Function` is allowed to parse.
*/
const inlineScripts = (html) =>
  [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(
      ([, attributes]) =>
        !/\ssrc[\s=]/.test(attributes) &&
        (!/\stype[\s=]/.test(attributes) || /type=["']text\/javascript["']/.test(attributes)),
    )
    .map(([, , body]) => body);

const html = pages(OUT);
const broken = html.flatMap((page) =>
  inlineScripts(readFileSync(page, 'utf8')).flatMap((script, index) => {
    try {
      new Function(script);
      return [];
    } catch (error) {
      return [`${relative(OUT, page)}, inline script ${index + 1}: ${error.message}`];
    }
  }),
);

if (broken.length > 0) {
  console.error('Inline scripts no browser can run:');
  for (const line of broken) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`check-build: inline scripts parse on all ${html.length} pages of out/`);
