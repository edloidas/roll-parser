/**
 * Footprint probe: bundled size and cold-import cost per library.
 *
 * Size is esbuild-bundled (browser platform, minified) then gzipped — what a
 * bundler-using consumer actually ships. Import cost is a fresh subprocess per
 * library, so module-init work is not amortized across the suite.
 */

import { gzipSync } from 'node:zlib';
import * as esbuild from 'esbuild';

const ENTRIES: Record<string, string> = {
  'roll-parser': `export { roll, parse } from '../../src/index.js';`,
  'rpg-dice-roller': `export { DiceRoll } from '@dice-roller/rpg-dice-roller';`,
  'randsum/roller': `export { roll } from '@randsum/roller';`,
  'dice-roller-parser': `export { DiceRoller } from 'dice-roller-parser';`,
  'airjp73/dice-notation': `export { roll } from '@airjp73/dice-notation';`,
  'dice-typescript': `export { Dice } from 'dice-typescript';`,
  droll: `export { roll } from 'droll';`,
};

const IMPORTS: Record<string, string> = {
  'roll-parser': `await import('../../src/index.js');`,
  'rpg-dice-roller': `await import('@dice-roller/rpg-dice-roller');`,
  'randsum/roller': `await import('@randsum/roller');`,
  'dice-roller-parser': `await import('dice-roller-parser');`,
  'airjp73/dice-notation': `await import('@airjp73/dice-notation');`,
  'dice-typescript': `await import('dice-typescript');`,
  droll: `await import('droll');`,
};

async function bundle(entry: string, platform: 'browser' | 'node'): Promise<Uint8Array> {
  const built = await esbuild.build({
    stdin: { contents: entry, resolveDir: import.meta.dir, loader: 'ts' },
    bundle: true,
    minify: true,
    format: 'esm',
    platform,
    write: false,
    logLevel: 'silent',
  });
  return built.outputFiles[0]?.contents ?? new Uint8Array();
}

for (const [name, entry] of Object.entries(ENTRIES)) {
  let sizeReport: string;
  try {
    const bytes = await bundle(entry, 'browser');
    sizeReport = `${(bytes.byteLength / 1024).toFixed(1)} kB min, ${(gzipSync(bytes).byteLength / 1024).toFixed(1)} kB gzip`;
  } catch {
    // A browser build that cannot resolve a `node:` builtin is itself a
    // finding — fall back to the node platform so the size is still reported.
    const bytes = await bundle(entry, 'node');
    sizeReport = `${(bytes.byteLength / 1024).toFixed(1)} kB min, ${(gzipSync(bytes).byteLength / 1024).toFixed(1)} kB gzip (node only)`;
  }

  const code = `const t = performance.now(); ${IMPORTS[name]} console.log((performance.now() - t).toFixed(1));`;
  const child = Bun.spawn(['bun', '-e', code], {
    cwd: import.meta.dir,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const exitCode = await child.exited;
  const importMs =
    exitCode === 0 ? `${(await new Response(child.stdout).text()).trim()} ms` : 'import failed';

  console.log(`${name.padEnd(24)} ${sizeReport.padEnd(34)} import ${importMs}`);
}
