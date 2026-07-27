/**
 * Builds the static GitHub Pages site into `site/dist/`.
 *
 * Bundles both entrypoints (`main.ts`, `reference.ts`) → `site/dist/assets/`
 * with a single `Bun.build`, copies the stylesheets, favicon, and self-hosted
 * fonts, and rewrites both HTML files so every asset URL is relative
 * (`./assets/...`, `./fonts/...`) — required for hosting under the
 * `/roll-parser/` path on GitHub Pages. Exits non-zero on any failure.
 */

import { existsSync } from 'node:fs';
import { readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import type { RewritePair } from './site-manifest.js';
import {
  ASSETS_DIR_NAME,
  CSS_REWRITES,
  DOCS_DIR_NAME,
  FONTS_DIR_NAME,
  HTML_PAGES,
  HTML_REWRITES,
  PUBLIC_FILES,
  SCRIPT_ENTRYPOINTS,
  STYLESHEETS,
} from './site-manifest.js';

const SITE_DIR = join(import.meta.dir, '..', 'site');
const SRC_DIR = join(SITE_DIR, 'src');
const PUBLIC_DIR = join(SITE_DIR, 'public');
const DIST_DIR = join(SITE_DIR, 'dist');
const ASSETS_DIR = join(DIST_DIR, ASSETS_DIR_NAME);
const FONTS_DIR = join(DIST_DIR, FONTS_DIR_NAME);
const DOCS_DIR = join(DIST_DIR, DOCS_DIR_NAME);

async function build(): Promise<void> {
  await rm(DIST_DIR, { recursive: true, force: true });

  const output = await Bun.build({
    entrypoints: SCRIPT_ENTRYPOINTS.map((name) => join(SRC_DIR, name)),
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
  await copyPublicFiles();
  await writeHtml();

  await generateDocs();
  await injectDocsThemeScript();

  console.log(`Site built → ${DIST_DIR}`);
}

/**
 * Injects a synchronous, pre-paint theme script into every generated docs page.
 *
 * TypeDoc's own inline script (at `<body>` start) applies the theme from its
 * `tsd-theme` key. This runs first — in `<head>` — and seeds `tsd-theme` from
 * the site-wide `theme-preference` key (mapping `auto` → `os`), so TypeDoc
 * paints the correct theme with no flash. The deferred bridge (`site/typedoc.js`)
 * still handles write-back on change, the Settings panel, and live cross-tab sync.
 */
async function injectDocsThemeScript(): Promise<void> {
  const script =
    '<script>{' +
    "const m={auto:'os',light:'light',dark:'dark'};" +
    "const t=m[localStorage.getItem('theme-preference')]||'os';" +
    "localStorage.setItem('tsd-theme',t);" +
    'document.documentElement.dataset.theme=t;' +
    '}</script>';

  const entries = await readdir(DOCS_DIR, { recursive: true });

  for (const entry of entries) {
    if (!entry.endsWith('.html')) continue;

    const path = join(DOCS_DIR, entry);
    const html = await Bun.file(path).text();
    if (html.includes('theme-preference')) continue;

    await Bun.write(path, html.replace('<head>', `<head>${script}`));
  }
}

/**
 * Generates the TypeDoc API reference into `dist/docs/`. Runs after the main
 * build so the initial `rm -rf dist` cannot wipe it. Exits non-zero on failure.
 *
 * Uses the binary from the `scripts/docs` workspace rather than a root `bunx
 * typedoc`: TypeDoc 0.28.x peers at TypeScript <=6.0.x and throws on the root
 * `typescript@7`, so that workspace nests a `typescript@6` for it to resolve.
 * Config still comes from the root `typedoc.json`, whose relative paths are
 * resolved against the repo root passed as `cwd`.
 */
async function generateDocs(): Promise<void> {
  const root = join(import.meta.dir, '..');
  const typedocBin = join(root, 'scripts', 'docs', 'node_modules', '.bin', 'typedoc');

  if (!existsSync(typedocBin)) {
    console.error(
      `TypeDoc binary not found at ${typedocBin}.\n` +
        'The API reference is generated from the `scripts/docs` workspace, which nests its own\n' +
        'typescript@6 because TypeDoc 0.28.x rejects the root typescript@7 — see the rationale in\n' +
        'scripts/docs/package.json. Run `bun install` at the repo root to install that workspace.',
    );
    process.exit(1);
  }

  const proc = Bun.spawn([typedocBin, '--options', 'typedoc.json'], {
    cwd: root,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const code = await proc.exited;

  if (code !== 0) {
    console.error(`TypeDoc failed with exit code ${code}`);
    process.exit(code);
  }

  console.log(`API reference built → ${DOCS_DIR}`);
}

/**
 * Copies the stylesheets into `assets/`, rewriting the dev-relative font path
 * (`../public/fonts/`) to its dist location (`../fonts/`) so `url(...)` still
 * resolves from the CSS file's new home in `assets/`.
 */
async function copyStyles(): Promise<void> {
  for (const name of STYLESHEETS) {
    const css = await Bun.file(join(SRC_DIR, name)).text();
    await Bun.write(join(ASSETS_DIR, name), applyRewrites(css, CSS_REWRITES));
  }
}

/** Copies the loose `public/` files that sit at the `dist/` root. */
async function copyPublicFiles(): Promise<void> {
  for (const name of PUBLIC_FILES) {
    await Bun.write(join(DIST_DIR, name), Bun.file(join(PUBLIC_DIR, name)));
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
    await Bun.write(join(DIST_DIR, page), applyRewrites(html, HTML_REWRITES));
  }
}

function applyRewrites(source: string, rewrites: RewritePair[]): string {
  return rewrites.reduce((text, [from, to]) => text.replaceAll(from, to), source);
}

await build();
