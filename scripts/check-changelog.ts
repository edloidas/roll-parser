/**
 * Verifies that CHANGELOG.md documents a version, and — with `--extract` —
 * prints that version's section body to stdout.
 *
 * The release workflow builds the GitHub Release body from the same section,
 * so both live here rather than in a second parser embedded in YAML.
 *
 * Usage:
 *   bun scripts/check-changelog.ts [version]
 *   bun scripts/check-changelog.ts [version] --extract
 *
 * `version` defaults to the one in package.json.
 */

import { readFileSync } from 'node:fs';
import pkg from '../package.json' with { type: 'json' };

const CHANGELOG_PATH = 'CHANGELOG.md';

const args = process.argv.slice(2);
const shouldExtract = args.includes('--extract');
const version = args.find((arg) => !arg.startsWith('--')) ?? pkg.version;

/**
 * Returns the body under `## [version]` with surrounding blank lines removed,
 * or `undefined` when no such heading exists.
 *
 * A section runs until the next release heading or until the link-reference
 * definitions that close the file (`[1.2.3]: https://...`).
 */
function findSection(changelog: string, target: string): string | undefined {
  const lines = changelog.split('\n');
  const heading = `## [${target}]`;
  const start = lines.findIndex((line) => line.startsWith(heading));

  if (start === -1) return undefined;

  const body: string[] = [];

  for (const line of lines.slice(start + 1)) {
    if (line.startsWith('## [')) break;
    if (/^\[[^\]]+\]: /.test(line)) break;
    body.push(line);
  }

  while (body[0]?.trim() === '') body.shift();
  while (body.at(-1)?.trim() === '') body.pop();

  return body.join('\n');
}

const section = findSection(readFileSync(CHANGELOG_PATH, 'utf8'), version);

if (section == null) {
  console.error(`CHANGELOG.md has no section "## [${version}]". Add one before tagging.`);
  process.exit(1);
}

if (shouldExtract) {
  if (section === '') {
    console.error(`CHANGELOG.md section "## [${version}]" is empty — nothing to release.`);
    process.exit(1);
  }

  console.log(section);
} else {
  console.log(`CHANGELOG.md has section for ${version}`);
}
