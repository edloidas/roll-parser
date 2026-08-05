/**
 * Builds `dist/` in the two passes `tsconfig.build*.json` describe, then removes
 * whatever the passes did not write.
 *
 * The emit deliberately does not start by wiping `dist/`. `site:dev` serves
 * `site/src`, which resolves `roll-parser` into `dist/`; deleting the directory
 * under a running dev server leaves it caching resolution failures it never
 * recovers from. Overwriting in place keeps every module resolvable throughout,
 * and `pruneStale` covers the deletions `tsc` will not do itself.
 *
 * `bun run clean` still exists for a pristine rebuild, and `release:dry` runs it
 * before validating: mtime staleness cannot survive a wipe, so a clock that steps
 * backward between builds can strand an orphan locally but never in a tarball.
 */

import { chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { pruneStale, stampCutoff } from './prune-dist.js';

const ROOT = join(import.meta.dir, '..');
const DIST = join(ROOT, 'dist');
const PROJECTS = ['tsconfig.build.json', 'tsconfig.build.types.json'];

// Anything in `dist/` older than this is from an earlier build: neither project
// enables `incremental`, so every pass rewrites all of its own outputs.
const cutoff = await stampCutoff(DIST);

for (const project of PROJECTS) {
  // `bunx` over `node_modules/.bin/tsc` — the latter is a POSIX shim that
  // `Bun.spawn` cannot execute on Windows.
  const { exited } = Bun.spawn(['bunx', 'tsc', '-p', project], {
    cwd: ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const code = await exited;

  // Pruning after a failed pass would delete the outputs it did not get to write.
  if (code !== 0) process.exit(code);
}

const removed = await pruneStale(DIST, cutoff);

await chmod(join(DIST, 'cli', 'index.js'), 0o755);

if (removed.length > 0)
  console.log(`Pruned ${removed.length} stale output(s): ${removed.join(', ')}`);
