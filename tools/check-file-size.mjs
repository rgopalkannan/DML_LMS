/* Source-file policy from the development guideline: source files stay at about 250 lines or fewer. */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const MAX_LINES = 250;
const ROOTS = ['server/src', 'server/test', 'client/src'];
const EXTENSIONS = /\.(ts|tsx|css)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(name)) yield path;
  }
}

const tooLong = [];
for (const root of ROOTS) {
  try {
    for (const file of walk(root)) {
      const lines = readFileSync(file, 'utf8').split('\n').length;
      if (lines > MAX_LINES) tooLong.push(`${relative('.', file)}: ${lines} lines`);
    }
  } catch {
    /* a root that does not exist yet has nothing to check */
  }
}
if (tooLong.length) {
  process.stderr.write(`Files over ${MAX_LINES} lines:\n${tooLong.join('\n')}\n`);
  process.exit(1);
}
process.stdout.write(`OK: every source file is ${MAX_LINES} lines or fewer.\n`);
