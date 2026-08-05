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

/**
 * Source name (`main.ts`, `style.css`) → emitted basename (`main.a1b2c3d4.js`).
 *
 * The build fills this in from what it actually wrote, so a hash never has to be
 * predicted twice.
 */
export type AssetNames = ReadonlyMap<string, string>;

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

/**
 * Rewrites applied to every page in {@link HTML_PAGES}.
 *
 * No pattern is a prefix of another, so the order is not significant.
 *
 * Fonts and {@link PUBLIC_FILES} keep their source names — same name, same bytes.
 */
export function htmlRewrites(assets: AssetNames): RewritePair[] {
  const emitted = (name: string): RewritePair => {
    const basename = assets.get(name);
    if (basename === undefined) throw new Error(`no emitted name for "${name}"`);

    return [`./src/${name}`, `./${ASSETS_DIR_NAME}/${basename}`];
  };

  return [
    ...HASHED_ASSETS.map((asset) => emitted(asset.source)),
    [`./public/${FONTS_DIR_NAME}/`, `./${FONTS_DIR_NAME}/`],
    ...PUBLIC_FILES.map((name): RewritePair => [`./public/${name}`, `./${name}`]),
  ];
}

/**
 * Rewrite applied to every stylesheet. The dev path is one level deeper than
 * the HTML one because it resolves from the CSS file's own location.
 */
export const CSS_REWRITES: RewritePair[] = [
  [`../public/${FONTS_DIR_NAME}/`, `../${FONTS_DIR_NAME}/`],
];

/**
 * Every unhashed file the build must emit, as a `dist`-relative path.
 *
 * Bundles and stylesheets are absent by design — {@link HASHED_ASSETS} covers those.
 */
export const REQUIRED_FILES: string[] = [
  ...HTML_PAGES,
  ...PUBLIC_FILES,
  `${DOCS_DIR_NAME}/index.html`,
];

/** An asset emitted into `assets/` as `<stem>.<hash>.<extension>`. */
export type HashedAsset = {
  readonly source: string;
  readonly stem: string;
  readonly extension: string;
};

/** What {@link SCRIPT_ENTRYPOINTS} becomes once bundled. */
export const SCRIPT_ASSETS: readonly HashedAsset[] = SCRIPT_ENTRYPOINTS.map((source) =>
  hashedAsset(source, 'js'),
);

/** {@link STYLESHEETS}, copied rather than bundled, so the extension is unchanged. */
export const STYLE_ASSETS: readonly HashedAsset[] = STYLESHEETS.map((source) =>
  hashedAsset(source, extensionOf(source)),
);

/** Every hashed file the build must emit exactly one of. */
export const HASHED_ASSETS: readonly HashedAsset[] = [...SCRIPT_ASSETS, ...STYLE_ASSETS];

/**
 * Matches the single file the build emits for an asset. A stem keeps its inner
 * dots, so leaving it unescaped would also match a sibling that differs there.
 */
export function hashedPattern({ stem, extension }: HashedAsset): RegExp {
  return new RegExp(`^${escapeRegExp(stem)}\\.[0-9a-z]+\\.${escapeRegExp(extension)}$`);
}

function hashedAsset(source: string, extension: string): HashedAsset {
  return { source, stem: source.replace(/\.[^.]+$/, ''), extension };
}

function extensionOf(source: string): string {
  return source.slice(source.lastIndexOf('.') + 1);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
