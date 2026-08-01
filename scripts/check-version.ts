import pkg from '../package.json' with { type: 'json' };

const input = process.argv[2];
const pkgVersion = pkg.version;

// src/version.ts is what the published library exports as VERSION, so it must
// never drift from package.json.
const versionFile = Bun.file(new URL('../src/version.ts', import.meta.url));
const versionSource = (await versionFile.exists()) ? await versionFile.text() : '';
const srcVersion = versionSource.match(/^export const version = '(.+)';\r?$/m)?.[1];

if (srcVersion !== pkgVersion) {
  console.error(
    `src/version.ts (${srcVersion ?? 'unparseable'}) does not match package.json version (${pkgVersion}).\n` +
      'Run "bun run generate:version" and commit the result.',
  );
  process.exit(1);
}

if (input == null) {
  console.log(`package.json version: ${pkgVersion} (src/version.ts in sync)`);
  process.exit(0);
}

const tagVersion = input.replace(/^v/, '');

if (tagVersion !== pkgVersion) {
  console.error(
    `Tag "${input}" (${tagVersion}) does not match package.json version (${pkgVersion})`,
  );
  process.exit(1);
}

console.log(`Tag ${input} matches package.json version ${pkgVersion}`);
