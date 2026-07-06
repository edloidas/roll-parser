/**
 * Builds the static GitHub Pages site into `site/dist/`.
 *
 * Bundles `site/src/main.ts` → `site/dist/assets/main.js` with `Bun.build`,
 * copies the stylesheet and favicon, and rewrites `index.html` so every asset
 * URL is relative (`./assets/...`) — required for hosting under the
 * `/roll-parser/` path on GitHub Pages. Exits non-zero on any failure.
 */

import { rm } from 'node:fs/promises';
import { join } from 'node:path';

const SITE_DIR = join(import.meta.dir, '..', 'site');
const DIST_DIR = join(SITE_DIR, 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');

async function build(): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });

  const output = await Bun.build({
    entrypoints: [join(SITE_DIR, 'src', 'main.ts')],
    outdir: ASSETS_DIR,
    target: 'browser',
    minify: true,
    naming: '[name].[ext]',
  });

  if (!output.success) {
    console.error('Bundle failed:');
    for (const log of output.logs) console.error(log);
    process.exit(1);
  }

  await copyStyles();
  await Bun.write(join(DIST_DIR, 'favicon.svg'), Bun.file(join(SITE_DIR, 'public', 'favicon.svg')));
  await writeHtml();

  console.log(`Site built → ${DIST_DIR}`);
}

/** Copies the stylesheet into `assets/`. */
async function copyStyles(): Promise<void> {
  await Bun.write(join(ASSETS_DIR, 'style.css'), Bun.file(join(SITE_DIR, 'src', 'style.css')));
}

/** Rewrites the dev HTML's asset paths to the built, relative ones. */
async function writeHtml(): Promise<void> {
  const html = await Bun.file(join(SITE_DIR, 'index.html')).text();

  const rewritten = html
    .replace('./src/style.css', './assets/style.css')
    .replace('./src/main.ts', './assets/main.js')
    .replace('./public/favicon.svg', './favicon.svg');

  await Bun.write(join(DIST_DIR, 'index.html'), rewritten);
}

await build();
