import { readFileSync } from 'node:fs';
import pkg from '../package.json' with { type: 'json' };

const version = process.argv[2] ?? pkg.version;
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const heading = new RegExp(`^## \\[${version.replace(/[.+]/g, '\\$&')}\\]`, 'm');

if (!heading.test(changelog)) {
  console.error(`CHANGELOG.md has no section "## [${version}]". Add one before tagging.`);
  process.exit(1);
}

console.log(`CHANGELOG.md has section for ${version}`);
