/**
 * Serves the built site (`site/dist/`) on localhost for full production-parity
 * preview — including the TypeDoc `/docs/` reference that the HMR dev server
 * (`site:dev`) does not build.
 *
 * Runs `site:build` first, then serves with GitHub-Pages-style path resolution:
 * an exact file, then `<path>.html`, then `<path>/index.html`. Extensionless
 * directory requests redirect to a trailing slash so relative asset URLs
 * resolve. Exits non-zero if the build fails.
 */

import { stat } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const DIST = join(ROOT, 'site', 'dist');
const PORT = Number(process.env.PORT ?? 3000);

await buildSite();

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const { pathname } = new URL(req.url);
    const decoded = decodeURIComponent(pathname);

    if (!decoded.endsWith('/') && (await isDirectory(join(DIST, decoded)))) {
      return Response.redirect(new URL(`${decoded}/`, req.url).toString(), 301);
    }

    const file = await resolveFile(decoded);
    if (file == null) return new Response('Not found', { status: 404 });

    return new Response(Bun.file(file));
  },
});

console.log(`Serving site/dist → http://localhost:${server.port}`);

async function buildSite(): Promise<void> {
  const proc = Bun.spawn(['bun', 'run', 'site:build'], {
    cwd: ROOT,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const code = await proc.exited;

  if (code !== 0) {
    console.error(`site:build failed with exit code ${code}`);
    process.exit(code);
  }
}

/** Resolves a request path to a file in `dist`, GitHub-Pages style. */
async function resolveFile(pathname: string): Promise<string | undefined> {
  const candidates = pathname.endsWith('/')
    ? [join(DIST, pathname, 'index.html')]
    : [join(DIST, pathname), join(DIST, `${pathname}.html`), join(DIST, pathname, 'index.html')];

  for (const candidate of candidates) {
    if (await Bun.file(candidate).exists()) return candidate;
  }

  return undefined;
}

async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}
