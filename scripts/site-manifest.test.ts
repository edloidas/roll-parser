import { describe, expect, it } from 'bun:test';
import { HASHED_ASSETS, type HashedAsset, hashedPattern, htmlRewrites } from './site-manifest.js';

const asset = (source: string, stem: string, extension: string): HashedAsset => ({
  source,
  stem,
  extension,
});

/** The emitted name for every hashed asset, as the build would report it. */
const emittedNames = new Map(
  HASHED_ASSETS.map(({ source, stem, extension }) => [source, `${stem}.abcd1234.${extension}`]),
);

describe('hashedPattern', () => {
  it('matches the emitted name for each declared asset', () => {
    for (const declared of HASHED_ASSETS) {
      const emitted = emittedNames.get(declared.source) ?? '';

      expect(hashedPattern(declared).test(emitted)).toBe(true);
    }
  });

  it('accepts both the base-36 bundle hash and the hex stylesheet hash', () => {
    const script = asset('main.ts', 'main', 'js');

    expect(hashedPattern(script).test('main.43478gn4.js')).toBe(true);
    expect(hashedPattern(asset('style.css', 'style', 'css')).test('style.ecbae398.css')).toBe(true);
  });

  it('rejects a sibling whose stem only shares a prefix (#277)', () => {
    const pattern = hashedPattern(asset('main.ts', 'main', 'js'));

    expect(pattern.test('main.worker.abcd1234.js')).toBe(false);
    expect(pattern.test('main-admin.abcd1234.js')).toBe(false);
  });

  it('rejects an unhashed name', () => {
    expect(hashedPattern(asset('main.ts', 'main', 'js')).test('main.js')).toBe(false);
  });

  it('treats a dot inside the stem literally (#277)', () => {
    const pattern = hashedPattern(asset('main.test.css', 'main.test', 'css'));

    expect(pattern.test('main.test.abcd1234.css')).toBe(true);
    expect(pattern.test('mainXtest.abcd1234.css')).toBe(false);
  });
});

describe('htmlRewrites', () => {
  it('points every dev asset URL at the emitted name', () => {
    const rewrites = htmlRewrites(emittedNames);

    for (const { source } of HASHED_ASSETS) {
      const pair = rewrites.find(([from]) => from === `./src/${source}`);

      expect(pair?.[1]).toBe(`./assets/${emittedNames.get(source)}`);
    }
  });

  it('leaves fonts and public files unhashed', () => {
    const rewrites = htmlRewrites(emittedNames);

    expect(rewrites).toContainEqual(['./public/fonts/', './fonts/']);
    expect(rewrites).toContainEqual(['./public/favicon.svg', './favicon.svg']);
  });

  it('throws when an asset was never emitted', () => {
    expect(() => htmlRewrites(new Map())).toThrow('no emitted name for "main.ts"');
  });
});
