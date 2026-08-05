import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm, stat, symlink, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { pruneStale, stampCutoff } from './prune-dist.js';

let dir: string;
let cutoff: number;

/** Writes a file, backdating it well past the cutoff when `stale`. */
async function write(relative: string, stale: boolean): Promise<string> {
  const path = join(dir, relative);

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, 'x');

  if (stale) {
    const seconds = (cutoff - 60_000) / 1000;
    await utimes(path, seconds, seconds);
  }

  return path;
}

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'prune-dist-'));
  cutoff = await stampCutoff(dir);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe('stampCutoff', () => {
  it('creates the directory when it does not exist', async () => {
    const nested = join(dir, 'absent', 'deeper');

    expect(await stampCutoff(nested)).toBeGreaterThan(0);
    expect((await stat(nested)).isDirectory()).toBe(true);
  });

  it('leaves no stamp file behind', async () => {
    await stampCutoff(dir);

    expect(await Bun.file(join(dir, '.build-stamp')).exists()).toBe(false);
  });

  it('returns a cutoff that keeps files written after it', async () => {
    // Guards the reason this exists: on Linux, mtimes come from a coarser clock
    // than `Date.now()`, so a `Date.now()` cutoff can post-date the next write.
    for (let i = 0; i < 200; i++) await write(`fresh-${i}.js`, false);

    expect(await pruneStale(dir, cutoff)).toEqual([]);
  });
});

describe('pruneStale', () => {
  it('keeps files written at or after the cutoff', async () => {
    await write('index.js', false);
    await write('cli/index.js', false);

    expect(await pruneStale(dir, cutoff)).toEqual([]);
    expect(await Bun.file(join(dir, 'index.js')).exists()).toBe(true);
    expect(await Bun.file(join(dir, 'cli/index.js')).exists()).toBe(true);
  });

  it('deletes files older than the cutoff', async () => {
    await write('index.js', false);
    await write('removed.js', true);

    expect(await pruneStale(dir, cutoff)).toEqual(['removed.js']);
    expect(await Bun.file(join(dir, 'removed.js')).exists()).toBe(false);
    expect(await Bun.file(join(dir, 'index.js')).exists()).toBe(true);
  });

  it('reports nested paths relative to the pruned directory', async () => {
    await write('index.js', false);
    await write('evaluator/gone.js', true);
    await write('evaluator/kept.js', false);

    expect(await pruneStale(dir, cutoff)).toEqual(['evaluator/gone.js']);
    expect(await Bun.file(join(dir, 'evaluator/kept.js')).exists()).toBe(true);
  });

  it('removes a directory left empty by its stale files', async () => {
    await write('index.js', false);
    await write('dropped/a.js', true);
    await write('dropped/b.js', true);

    expect(await pruneStale(dir, cutoff)).toEqual(['dropped/a.js', 'dropped/b.js']);
    expect(await Bun.file(join(dir, 'dropped')).exists()).toBe(false);
  });

  it('keeps a directory holding a fresh file under a stale one', async () => {
    await write('outer/inner/fresh.js', false);
    await write('outer/stale.js', true);

    expect(await pruneStale(dir, cutoff)).toEqual(['outer/stale.js']);
    expect(await Bun.file(join(dir, 'outer/inner/fresh.js')).exists()).toBe(true);
  });

  it('does not follow a symlinked directory out of the tree', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'prune-dist-outside-'));
    const guarded = join(outside, 'keep.js');

    await writeFile(guarded, 'x');
    const stamp = (cutoff - 60_000) / 1000;
    await utimes(guarded, stamp, stamp);
    await symlink(outside, join(dir, 'link'), 'dir');

    await pruneStale(dir, cutoff);

    expect(await Bun.file(guarded).exists()).toBe(true);
    await rm(outside, { recursive: true, force: true });
  });

  it('refuses to prune when the directory itself is a symlink', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'prune-dist-root-'));
    const guarded = join(outside, 'keep.js');
    const link = join(dir, 'link-root');

    await writeFile(guarded, 'x');
    const stamp = (cutoff - 60_000) / 1000;
    await utimes(guarded, stamp, stamp);
    await symlink(outside, link, 'dir');

    await expect(pruneStale(link, cutoff)).rejects.toThrow(/Refusing to prune through a symlink/);
    expect(await Bun.file(guarded).exists()).toBe(true);
    await rm(outside, { recursive: true, force: true });
  });

  it('tolerates a directory that does not exist', async () => {
    expect(await pruneStale(join(dir, 'absent'), cutoff)).toEqual([]);
  });
});
