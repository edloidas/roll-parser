/**
 * Single source of truth for the demo site's asset layout.
 *
 * `build-site.ts` emits these files and rewrites the dev URLs that point at
 * them; `check-site.ts` asserts the same files exist afterwards. Keeping both
 * sides derived from the lists below means a renamed entrypoint or a new page
 * cannot drift out of sync — previously the names were hand-copied across four
 * places and only a 404 in the browser would reveal a mismatch.
 *
 * Paths are written as they appear in the dev HTML (`./src/...`, `./public/...`)
 * and in `dist/` (`./assets/...`, `./fonts/...`).
 */

/** A literal `from` → `to` substitution applied with `String.replaceAll`. */
export type RewritePair = readonly [from: string, to: string];

/** Directory names inside `site/dist/`. */
export const ASSETS_DIR_NAME = 'assets';
export const FONTS_DIR_NAME = 'fonts';
export const DOCS_DIR_NAME = 'docs';

/** Browser entrypoints in `site/src/`, bundled into `assets/` as `.js`. */
export const SCRIPT_ENTRYPOINTS = ['main.ts', 'reference.ts'];

/** Stylesheets in `site/src/`, copied into `assets/`. */
export const STYLESHEETS = ['style.css', 'reference.css'];

/**
 * Pages copied from `site/` into `dist/` with their asset URLs rewritten.
 *
 * `404.html` carries no external asset references, so the rewrite pass is a
 * no-op for it — it is listed only to get copied into `dist/`. Both GitHub
 * Pages and Cloudflare Pages serve it by convention for unmatched paths;
 * without it Cloudflare falls back to `index.html` with a 200.
 */
export const HTML_PAGES = ['index.html', 'reference.html', '404.html'];

/** Single files copied from `site/public/` into the `dist/` root. */
export const PUBLIC_FILES = ['favicon.svg'];

/** `main.ts` → `main.js`; the bundler renames entrypoints on the way out. */
function toBundleName(entrypoint: string): string {
  return entrypoint.replace(/\.ts$/, '.js');
}

/**
 * Rewrites applied to every page in {@link HTML_PAGES}.
 *
 * No pattern is a prefix of another, so the order is not significant.
 */
export const HTML_REWRITES: RewritePair[] = [
  ...STYLESHEETS.map((name): RewritePair => [`./src/${name}`, `./${ASSETS_DIR_NAME}/${name}`]),
  ...SCRIPT_ENTRYPOINTS.map(
    (name): RewritePair => [`./src/${name}`, `./${ASSETS_DIR_NAME}/${toBundleName(name)}`],
  ),
  [`./public/${FONTS_DIR_NAME}/`, `./${FONTS_DIR_NAME}/`],
  ...PUBLIC_FILES.map((name): RewritePair => [`./public/${name}`, `./${name}`]),
];

/**
 * Rewrite applied to every stylesheet. The dev path is one level deeper than
 * the HTML one because it resolves from the CSS file's own location.
 */
export const CSS_REWRITES: RewritePair[] = [
  [`../public/${FONTS_DIR_NAME}/`, `../${FONTS_DIR_NAME}/`],
];

/** Every file the build must emit, as a `dist`-relative path. */
export const REQUIRED_FILES: string[] = [
  ...HTML_PAGES,
  ...PUBLIC_FILES,
  ...SCRIPT_ENTRYPOINTS.map((name) => `${ASSETS_DIR_NAME}/${toBundleName(name)}`),
  ...STYLESHEETS.map((name) => `${ASSETS_DIR_NAME}/${name}`),
  `${DOCS_DIR_NAME}/index.html`,
];
