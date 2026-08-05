/**
 * Removes build outputs that the current emit did not write.
 *
 * `tsc` overwrites its outputs in place but never deletes the ones whose source
 * is gone, so a build that does not wipe `dist/` first needs this instead. See
 * `build.ts` for why the wipe was dropped.
 *
 * @module prune-dist
 */

import type { Stats } from 'node:fs';
import { lstat, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const STAMP = '.build-stamp';

/**
 * Returns a cutoff for {@link pruneStale}, as the mtime of a file written into
 * `dir` right now. Creates `dir` if absent and leaves nothing behind.
 *
 * Not `Date.now()`: Linux mtimes come from the kernel's coarse clock, which lags
 * the precise one by up to a tick, so a file written after a `Date.now()` cutoff
 * can still stat as older than it.
 */
export async function stampCutoff(dir: string): Promise<number> {
  const path = join(dir, STAMP);

  await mkdir(dir, { recursive: true });
  await writeFile(path, '');
  const { mtimeMs } = await stat(path);
  await rm(path);

  return mtimeMs;
}

/**
 * Deletes every file under `dir` last modified before `cutoffMs`, then the
 * directories those deletions left empty. Returns the removed files, sorted and
 * relative to `dir` — emptied directories are cleanup, not results. A missing
 * `dir` yields `[]`.
 *
 * The caller must take `cutoffMs` before the emit starts, and must not call this
 * after a failed emit — a pass that wrote nothing makes every file look stale.
 *
 * Throws if `dir` is itself a symlink, rather than deleting through it.
 */
export async function pruneStale(dir: string, cutoffMs: number): Promise<string[]> {
  const removed: string[] = [];
  let root: Stats;

  try {
    root = await lstat(dir);
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') return [];
    throw error;
  }

  if (root.isSymbolicLink()) throw new Error(`Refusing to prune through a symlink: ${dir}`);

  async function walk(current: string, prefix: string): Promise<boolean> {
    const entries = await readdir(current);
    let kept = 0;

    for (const name of entries) {
      const path = join(current, name);
      const relative = prefix === '' ? name : `${prefix}/${name}`;
      // ! `lstat`, not `stat` — recursing through a symlinked directory would put
      // ! `rm` outside the tree this is allowed to delete from.
      const info = await lstat(path);

      if (info.isDirectory()) {
        if (await walk(path, relative)) kept++;
        else await rm(path, { recursive: true });
        continue;
      }

      if (info.mtimeMs >= cutoffMs) {
        kept++;
        continue;
      }

      await rm(path);
      removed.push(relative);
    }

    return kept > 0;
  }

  await walk(dir, '');

  return removed.sort();
}
