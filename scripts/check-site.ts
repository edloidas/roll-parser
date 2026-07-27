/**
 * Verifies the built site in `site/dist/` before it is deployed.
 *
 * `build-site.ts` wires assets together with string replacement, so a renamed
 * entrypoint or a new page silently produces HTML pointing at files that were
 * never emitted — a failure that typechecking cannot see and that would only
 * surface as a 404 in the browser. This walks the built HTML, resolves every
 * local asset reference against the filesystem, and fails loudly instead.
 *
 * Run via `bun run site:check` (expects `site:build` to have run first).
 */

import { readdir } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { DOCS_DIR_NAME, FONTS_DIR_NAME, REQUIRED_FILES } from './site-manifest.js';

const DIST_DIR = join(import.meta.dir, '..', 'site', 'dist');

/** Extensions treated as on-disk assets; anything else is a route. */
const ASSET_EXTENSIONS = ['.css', '.js', '.svg', '.woff2', '.woff', '.png', '.ico', '.json'];

/**
 * Dev-only path prefixes. Their presence in built HTML means the rewrite pass
 * in `build-site.ts` missed a reference.
 */
const DEV_PATHS = ['./src/', './public/'];

const errors: string[] = [];

async function main(): Promise<void> {
  await checkRequiredFiles();
  await checkFontsPresent();
  await checkHtmlReferences();

  if (errors.length > 0) {
    console.error(`Site check failed with ${errors.length} problem(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }

  console.log('Site check passed.');
}

async function checkRequiredFiles(): Promise<void> {
  for (const relative of REQUIRED_FILES) {
    if (!(await Bun.file(join(DIST_DIR, relative)).exists())) {
      errors.push(`missing required file: ${relative}`);
    }
  }
}

/** The build copies self-hosted fonts; an empty `fonts/` means that step broke. */
async function checkFontsPresent(): Promise<void> {
  try {
    const entries = await readdir(join(DIST_DIR, FONTS_DIR_NAME));
    const fonts = entries.filter((entry) => entry.endsWith('.woff2'));

    if (fonts.length === 0) errors.push(`${FONTS_DIR_NAME}/ contains no .woff2 files`);
  } catch {
    errors.push(`missing required directory: ${FONTS_DIR_NAME}/`);
  }
}

/** Every local asset URL in every built page must resolve to a real file. */
async function checkHtmlReferences(): Promise<void> {
  const pages = (await readdir(DIST_DIR, { recursive: true })).filter(
    (entry) => entry.endsWith('.html') && !entry.startsWith(`${DOCS_DIR_NAME}/`),
  );

  for (const page of pages) {
    const html = await Bun.file(join(DIST_DIR, page)).text();

    for (const devPath of DEV_PATHS) {
      if (html.includes(devPath)) {
        errors.push(`${page} still references the dev path "${devPath}"`);
      }
    }

    for (const reference of extractReferences(html)) {
      if (!isLocalAsset(reference)) continue;

      const resolved = resolveAgainstPage(page, reference);

      if (!(await Bun.file(join(DIST_DIR, resolved)).exists())) {
        errors.push(`${page} references missing asset "${reference}" (→ ${resolved})`);
      }
    }
  }
}

/** Pulls every `href="..."` and `src="..."` value out of a document. */
function extractReferences(html: string): string[] {
  const matches = html.matchAll(/(?:href|src)="([^"]+)"/g);
  return [...matches].map((match) => match[1] ?? '');
}

function isLocalAsset(reference: string): boolean {
  if (reference === '') return false;
  // ? Protocol-relative URLs start with `//`, so test them before the leading-slash case.
  if (reference.startsWith('//')) return false;
  if (/^[a-z]+:/i.test(reference)) return false;
  if (reference.startsWith('#')) return false;
  // Root-absolute references belong to `404.html`, which is served at arbitrary
  // depths and so links to routes rather than to files.
  if (reference.startsWith('/')) return false;

  const [path] = reference.split(/[?#]/);
  return ASSET_EXTENSIONS.some((extension) => (path ?? '').endsWith(extension));
}

/** Resolves a page-relative reference to a `dist`-relative path. */
function resolveAgainstPage(page: string, reference: string): string {
  const segments = page.split('/');
  segments.pop();

  const [path] = reference.split(/[?#]/);

  return normalize(join(segments.join('/'), path ?? ''));
}

await main();
