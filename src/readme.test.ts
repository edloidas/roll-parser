import { beforeAll, describe, expect, test } from 'bun:test';
import { ensureFreshDist } from './test-helpers.js';

/**
 * Executes the `typescript` fenced blocks in README.md and MIGRATION.md
 * against the built package and asserts the outputs their comments claim,
 * so a doc edit that falsifies an example fails the suite.
 *
 * The per-line convention:
 * - `expr; // <literal>` — evaluate `expr` and compare. Prose after ` — ` or
 *   a comma is ignored: `// 14, every run` asserts `14`.
 * - `expr; // throws …` — assert the line throws; when the comment quotes a
 *   code (`'DICE_LIMIT_EXCEEDED'`), assert `error.code` matches it.
 * - `expr;` followed by a lone `// <literal>` comment line — same assertion.
 * - Anything else (`// the kept dice`, `// e.g. 14`, `// 5..15`) — the line
 *   only executes; a throw still fails the block.
 *
 * Blocks are fragments, so they run with an injected scope instead of real
 * modules: import lines are validated against the actual entry points and
 * stripped, and every public export plus the free variables some samples
 * lean on (`userInput`, `notation`, `error`) is provided as a binding.
 * A `<!-- readme-test: skip -->` HTML comment directly above a fence opts a
 * block out — used for MIGRATION.md blocks that show the removed v2 API.
 */

//
// * Corpus extraction
//

const DOC_FILES = ['README.md', 'MIGRATION.md'];
const SKIP_MARKER = '<!-- readme-test: skip -->';

type DocBlock = {
  file: string;
  /** 1-based line of the opening fence. */
  fenceLine: number;
  lines: string[];
  skip: boolean;
};

function extractBlocks(file: string, text: string): DocBlock[] {
  const lines = text.split('\n');
  const blocks: DocBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!/^```(?:typescript|ts)\s*$/.test(lines[i] ?? '')) {
      continue;
    }

    let end = i + 1;
    while (end < lines.length && !/^```\s*$/.test(lines[end] ?? '')) {
      end++;
    }

    let above = i - 1;
    while (above >= 0 && (lines[above] ?? '').trim() === '') {
      above--;
    }

    blocks.push({
      file,
      fenceLine: i + 1,
      lines: lines.slice(i + 1, end),
      skip: (lines[above] ?? '').trim() === SKIP_MARKER,
    });
    i = end;
  }

  return blocks;
}

//
// * Expected-output convention
//

function parseLiteral(text: string): { value: unknown } | null {
  const raw = text.trim();

  const singleQuoted = raw.match(/^'((?:[^'\\]|\\.)*)'$/);
  if (singleQuoted) {
    return { value: (singleQuoted[1] ?? '').replace(/\\(.)/g, '$1') };
  }

  try {
    return { value: JSON.parse(raw) as unknown };
  } catch {
    return null;
  }
}

function parseExpected(comment: string): { value: unknown } | null {
  const text = comment.trim();
  // A claimed output often carries prose: `14, every run`, `9 — was `value``.
  for (const candidate of [text, text.split(' — ')[0] ?? '', text.split(',')[0] ?? '']) {
    const parsed = parseLiteral(candidate);
    if (parsed) {
      return parsed;
    }
  }
  return null;
}

//
// * Block compilation
//

type DocImport = { specifier: string; names: string[] };

// Assertion metadata is passed to the compiled block as a table and referenced by
// index, so no documented value is ever escaped into generated source.
type DocCase =
  | { kind: 'value'; line: number; source: string; expected: unknown }
  | { kind: 'throws'; line: number; source: string; code: string | null };

type CompiledBlock = {
  block: DocBlock;
  imports: DocImport[];
  code: string;
  cases: DocCase[];
};

const IMPORT_RE = /^import\s+(type\s+)?\{([^}]+)\}\s+from\s+'([^']+)';\s*$/;
const TRAILING_RE = /^(\s*)(.*?\S)\s*;\s*\/\/\s*(.*)$/;
const BARE_STATEMENT_RE = /^(\s*)(.*?\S)\s*;\s*$/;
const COMMENT_LINE_RE = /^\s*\/\/\s*(.*)$/;
const THROWS_RE = /^throws\b/;
const THROWS_CODE_RE = /'([A-Z0-9_]+)'/;
// Only bare expression statements can be wrapped in an assertion callback.
const NON_EXPRESSION_RE =
  /^(?:const|let|var|import|export|type|function|class|return|throw)\b|^[})\]]/;

// One output line per input line, so failure messages keep the documented line numbers.
function compileBlock(block: DocBlock): CompiledBlock {
  const imports: DocImport[] = [];
  const out: string[] = [];
  const cases: DocCase[] = [];

  for (let i = 0; i < block.lines.length; i++) {
    const line = block.lines[i] ?? '';
    const lineNo = block.fenceLine + 1 + i;

    if (/^\s*import\b/.test(line)) {
      const match = line.match(IMPORT_RE);
      if (!match) {
        throw new Error(`${block.file}:${lineNo} — unsupported import form in a doc block`);
      }
      const names = match[1]
        ? []
        : (match[2] ?? '')
            .split(',')
            .map((name) => name.trim())
            .filter((name) => name !== '' && !name.startsWith('type '));
      imports.push({ specifier: match[3] ?? '', names });
      out.push('');
      continue;
    }

    const trailing = line.match(TRAILING_RE);
    if (trailing) {
      const [, indent = '', expr = '', comment = ''] = trailing;
      if (!NON_EXPRESSION_RE.test(expr)) {
        if (THROWS_RE.test(comment.trim())) {
          const index =
            cases.push({
              kind: 'throws',
              line: lineNo,
              source: line.trim(),
              code: comment.match(THROWS_CODE_RE)?.[1] ?? null,
            }) - 1;
          out.push(`${indent}__throws(${index}, () => (${expr}));`);
          continue;
        }
        const expected = parseExpected(comment);
        if (expected) {
          const index =
            cases.push({
              kind: 'value',
              line: lineNo,
              source: line.trim(),
              expected: expected.value,
            }) - 1;
          out.push(`${indent}__assert(${index}, () => (${expr}));`);
          continue;
        }
      }
      out.push(line);
      continue;
    }

    const bare = line.match(BARE_STATEMENT_RE);
    const nextComment = (block.lines[i + 1] ?? '').match(COMMENT_LINE_RE);
    if (bare && nextComment) {
      const [, indent = '', expr = ''] = bare;
      const expected = NON_EXPRESSION_RE.test(expr) ? null : parseExpected(nextComment[1] ?? '');
      if (expected) {
        const index =
          cases.push({
            kind: 'value',
            line: lineNo,
            source: `${line.trim()} ${(block.lines[i + 1] ?? '').trim()}`,
            expected: expected.value,
          }) - 1;
        out.push(`${indent}__assert(${index}, () => (${expr}));`);
        continue;
      }
    }

    out.push(line);
  }

  return { block, imports, code: out.join('\n'), cases };
}

//
// * Execution
//

type AssertFn = (index: number, actual: () => unknown) => void;
type ThrowsFn = (index: number, run: () => unknown) => void;

const transpiler = new Bun.Transpiler({ loader: 'ts' });

let namespaces: Record<string, Record<string, unknown>> = {};
let scope: Record<string, unknown> = {};

beforeAll(async () => {
  await ensureFreshDist();

  // ! Keep the specifier computed — a literal 'roll-parser' fails `tsc --noEmit`
  // on a fresh clone, where `dist/` (the self-reference target) does not exist yet.
  const packageName = 'roll-parser';
  const api = (await import(packageName)) as Record<string, unknown>;
  const testing = (await import(`${packageName}/testing`)) as Record<string, unknown>;
  namespaces = { [packageName]: api, [`${packageName}/testing`]: testing };

  const roll = api.roll as (notation: string) => unknown;
  const notation = '2d6+1d0+3';
  let error: unknown;
  try {
    roll(notation);
  } catch (caught) {
    error = caught;
  }

  scope = {
    ...api,
    ...testing,
    // Free variables the samples use without declaring.
    userInput: '2d20kh1+5',
    notation,
    error,
    // Samples narrate through console; keep the test output clean.
    console: { log() {}, error() {}, warn() {}, info() {} },
  };
}, 60_000);

function lookupCase<K extends DocCase['kind']>(
  file: string,
  cases: DocCase[],
  index: number,
  kind: K,
): Extract<DocCase, { kind: K }> {
  const entry = cases[index];
  if (entry?.kind !== kind) {
    throw new Error(`${file} — compiled ${kind} case ${index} is missing or misaligned`);
  }
  return entry as Extract<DocCase, { kind: K }>;
}

function makeAssert(file: string, cases: DocCase[]): AssertFn {
  return (index, actual) => {
    const { line, source, expected } = lookupCase(file, cases, index, 'value');
    const value = actual();
    if (!Bun.deepEquals(value, expected, true)) {
      throw new Error(
        `${file}:${line} documents an output the code does not produce\n` +
          `  ${source}\n` +
          `  expected: ${JSON.stringify(expected)}\n` +
          `  actual:   ${JSON.stringify(value)}`,
      );
    }
  };
}

function makeThrows(file: string, cases: DocCase[]): ThrowsFn {
  return (index, run) => {
    const { line, source, code } = lookupCase(file, cases, index, 'throws');
    try {
      run();
    } catch (caught) {
      const actualCode = (caught as { code?: unknown }).code;
      if (code != null && actualCode !== code) {
        throw new Error(
          `${file}:${line} documents a throw with code '${code}', got '${String(actualCode)}'\n  ${source}`,
        );
      }
      return;
    }
    throw new Error(`${file}:${line} documents a throw that did not happen\n  ${source}`);
  };
}

async function runBlock(compiled: CompiledBlock): Promise<void> {
  const { block, imports, code, cases } = compiled;

  for (const imp of imports) {
    const ns = namespaces[imp.specifier];
    if (!ns) {
      throw new Error(
        `${block.file}:${block.fenceLine} imports from '${imp.specifier}', which is not a public entry point`,
      );
    }
    for (const name of imp.names) {
      if (!(name in ns)) {
        throw new Error(
          `${block.file}:${block.fenceLine} imports '${name}', which '${imp.specifier}' does not export`,
        );
      }
    }
  }

  const js = transpiler.transformSync(code);
  const bindings = Object.keys(scope).join(', ');
  const factory = new Function(
    '__scope',
    '__assert',
    '__throws',
    `'use strict';\nconst { ${bindings} } = __scope;\nreturn (async () => {\n${js}\n})();`,
  ) as (
    scopeArg: Record<string, unknown>,
    assertArg: AssertFn,
    throwsArg: ThrowsFn,
  ) => Promise<unknown>;

  await factory(scope, makeAssert(block.file, cases), makeThrows(block.file, cases));
}

//
// * Test registration
//

const corpus: { file: string; compiled: CompiledBlock[]; skipped: DocBlock[] }[] = [];
for (const file of DOC_FILES) {
  const text = await Bun.file(new URL(`../${file}`, import.meta.url)).text();
  const blocks = extractBlocks(file, text);
  corpus.push({
    file,
    compiled: blocks.filter((block) => !block.skip).map(compileBlock),
    skipped: blocks.filter((block) => block.skip),
  });
}

for (const { file, compiled, skipped } of corpus) {
  describe(`${file} examples`, () => {
    for (const entry of compiled) {
      test(`block at line ${entry.block.fenceLine}`, async () => {
        await runBlock(entry);
      });
    }
    for (const block of skipped) {
      test.skip(`block at line ${block.fenceLine} (opted out)`, () => {});
    }
  });
}

describe('doc example corpus', () => {
  test('extraction still finds the fenced blocks', () => {
    const blocks = corpus.flatMap((entry) => entry.compiled);
    const assertions = blocks.reduce((sum, entry) => sum + entry.cases.length, 0);
    // Floors, not exact counts — they catch a fence-language or convention
    // change that silently stops extraction, without rotting on every edit.
    expect(blocks.length).toBeGreaterThanOrEqual(12);
    expect(assertions).toBeGreaterThanOrEqual(15);
  });

  // No doc block currently mixes both assertion kinds, so nothing else pins the
  // compile-time case indices to the ones the generated code looks up at runtime.
  describe('a block mixing value and throw assertions', () => {
    const KEEP_HIGHEST = "roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) }).total; // 14";
    const OVER_LIMIT = "roll('99999d6', { maxDice: 100 }); // throws, code 'DICE_LIMIT_EXCEEDED'";
    const PLAIN_POOL = "roll('2d6', { rng: createMockRng([2, 6]) }).total; // 8";
    const compile = (blockLines: string[]): CompiledBlock =>
      compileBlock({ file: 'synthetic.md', fenceLine: 10, lines: blockLines, skip: false });

    test('keeps every case aligned with its documented line', async () => {
      const compiled = compile([KEEP_HIGHEST, OVER_LIMIT, PLAIN_POOL]);
      expect(compiled.cases).toEqual([
        { kind: 'value', line: 11, source: KEEP_HIGHEST, expected: 14 },
        { kind: 'throws', line: 12, source: OVER_LIMIT, code: 'DICE_LIMIT_EXCEEDED' },
        { kind: 'value', line: 13, source: PLAIN_POOL, expected: 8 },
      ]);
      await runBlock(compiled);
    });

    test('reports the trailing assertion against its own line when it fails', async () => {
      const falsified = [KEEP_HIGHEST, OVER_LIMIT, PLAIN_POOL.replace('// 8', '// 9')];
      await expect(runBlock(compile(falsified))).rejects.toThrow(
        /synthetic\.md:13 documents an output the code does not produce/,
      );
    });
  });

  test('the trailing-comment convention parses the shapes the docs use', () => {
    expect(parseExpected("'binaryOp'")).toEqual({ value: 'binaryOp' });
    expect(parseExpected('14, every run')).toEqual({ value: 14 });
    expect(parseExpected('9          — was `value`')).toEqual({ value: 9 });
    expect(parseExpected('[4, 0]')).toEqual({ value: [4, 0] });
    expect(parseExpected("'2d6[2, 6] + 3 = 11'")).toEqual({ value: '2d6[2, 6] + 3 = 11' });
    expect(parseExpected('true, at every level of the tree')).toEqual({ value: true });
    expect(parseExpected('e.g. 14')).toBeNull();
    expect(parseExpected('5..15')).toBeNull();
    expect(parseExpected('the kept dice')).toBeNull();
    expect(parseExpected('DegreeOfSuccess.Success (2)')).toBeNull();
  });
});
