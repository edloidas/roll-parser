import pkg from '../package.json' with { type: 'json' };

const input = process.argv[2];
const pkgVersion = pkg.version;

if (input == null) {
  console.log(`package.json version: ${pkgVersion}`);
  process.exit(0);
}

const tagVersion = input.replace(/^v/, '');

if (tagVersion !== pkgVersion) {
  console.error(`Tag "${input}" (${tagVersion}) does not match package.json version (${pkgVersion})`);
  process.exit(1);
}

console.log(`Tag ${input} matches package.json version ${pkgVersion}`);
