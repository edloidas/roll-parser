/**
 * Builds the static GitHub Pages site into `site/dist/`.
 *
 * Bundles both entrypoints (`main.ts`, `reference.ts`) → `site/dist/assets/`
 * with a single `Bun.build`, copies the stylesheets, favicon, and self-hosted
 * fonts, and rewrites both HTML files so every asset URL is relative
 * (`./assets/...`, `./fonts/...`) — required for hosting under the
 * `/roll-parser/` path on GitHub Pages. Exits non-zero on any failure.
 */

import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const SITE_DIR = join(import.meta.dir, '..', 'site');
const SRC_DIR = join(SITE_DIR, 'src');
const PUBLIC_DIR = join(SITE_DIR, 'public');
const DIST_DIR = join(SITE_DIR, 'dist');
const ASSETS_DIR = join(DIST_DIR, 'assets');
const FONTS_DIR = join(DIST_DIR, 'fonts');

const STYLESHEETS = ['style.css', 'reference.css'];
const HTML_PAGES = ['index.html', 'reference.html'];

async function build(): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });

  const output = await Bun.build({
    entrypoints: [join(SRC_DIR, 'main.ts'), join(SRC_DIR, 'reference.ts')],
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
  await copyFonts();
  await Bun.write(join(DIST_DIR, 'favicon.svg'), Bun.file(join(PUBLIC_DIR, 'favicon.svg')));
  await writeHtml();

  await generateDocs();

  console.log(`Site built → ${DIST_DIR}`);
}

/**
 * Generates the TypeDoc API reference into `dist/docs/`. Runs after the main
 * build so the initial `rm -rf dist` cannot wipe it. Shells out to the local
 * `typedoc` binary (config in `typedoc.json`) and exits non-zero on failure.
 */
async function generateDocs(): Promise<void> {
  const proc = Bun.spawn(['bunx', 'typedoc'], {
    cwd: join(import.meta.dir, '..'),
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const code = await proc.exited;

  if (code !== 0) {
    console.error(`TypeDoc failed with exit code ${code}`);
    process.exit(code);
  }

  console.log(`API reference built → ${join(DIST_DIR, 'docs')}`);
}

/**
 * Copies the stylesheets into `assets/`, rewriting the dev-relative font path
 * (`../public/fonts/`) to its dist location (`../fonts/`) so `url(...)` still
 * resolves from the CSS file's new home in `assets/`.
 */
async function copyStyles(): Promise<void> {
  for (const name of STYLESHEETS) {
    const css = await Bun.file(join(SRC_DIR, name)).text();
    const rewritten = css.replaceAll('../public/fonts/', '../fonts/');
    await Bun.write(join(ASSETS_DIR, name), rewritten);
  }
}

/** Copies every self-hosted font into `dist/fonts/`. */
async function copyFonts(): Promise<void> {
  const srcFonts = join(PUBLIC_DIR, 'fonts');
  const entries = await readdir(srcFonts);

  for (const entry of entries) {
    if (!entry.endsWith('.woff2')) continue;
    await Bun.write(join(FONTS_DIR, entry), Bun.file(join(srcFonts, entry)));
  }
}

/** Rewrites each dev HTML file's asset paths to the built, relative ones. */
async function writeHtml(): Promise<void> {
  for (const page of HTML_PAGES) {
    const html = await Bun.file(join(SITE_DIR, page)).text();

    const rewritten = html
      .replaceAll('./src/style.css', './assets/style.css')
      .replaceAll('./src/reference.css', './assets/reference.css')
      .replaceAll('./src/main.ts', './assets/main.js')
      .replaceAll('./src/reference.ts', './assets/reference.js')
      .replaceAll('./public/fonts/', './fonts/')
      .replaceAll('./public/favicon.svg', './favicon.svg');

    await Bun.write(join(DIST_DIR, page), rewritten);
  }
}

await build();
