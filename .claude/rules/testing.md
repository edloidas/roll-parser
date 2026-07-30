# Testing Standards

Uses Bun's built-in test runner (`bun test`).

## Structure

Nested `describe` gives context — keep test names short and descriptive.
`test` and `it` are interchangeable; the codebase uses both.

```typescript
describe('evaluate', () => {
  describe('arithmetic operations', () => {
    test('addition', () => { ... });
    test('complex expression with precedence', () => { ... });
  });
});
```

## Dice Tests

Use `createMockRng` for all deterministic dice tests. See `rng.md`.

```typescript
// Internal tests use relative imports:
import { createMockRng } from '../rng/mock.js';
// npm consumers use: import { createMockRng } from 'roll-parser/testing';

test('keeps highest die from pool', () => {
  const ast = parse('2d20kh1');
  const rng = createMockRng([7, 15]);
  const result = evaluate(ast, rng);

  expect(result.total).toBe(15);
});
```

## Error Assertions

Use `expectRollError` from `src/test-helpers.ts` — never a bare `try`/`catch`.
It asserts the class and the code, returns the error for further assertions, and
fails when nothing is thrown.

```typescript
import { expectRollError } from '../test-helpers.js';

expectRollError(() => parse('1d6!!!'), ParseError, 'INVALID_EXPLODE_TARGET');

// Returns the error when you need more than the code:
const error = expectRollError(() => parse('(1+2'), ParseError, 'EXPECTED_TOKEN');
expect(error.position).toBe(4);
```

`src/test-helpers.ts` is test-only infrastructure: it is excluded from the build
(`tsconfig.build.json`) and from the published tarball (`files`). Anything added
there must stay excluded from both.

### Error-Code Contract

`src/errors.test.ts` maps every `RollParserErrorCode` to an input that raises it
through a `Record<RollParserErrorCode, CodeCase>` annotation. That annotation is
the completeness gate — adding a code without adding a case is a type error.
Keep it that way; do not loosen the `Record` to a partial or an index signature.

## CLI Tests

Test the CLI in-process. `main()` takes injected `argv`/`stdout`/`stderr`, so
argument handling, exit codes, and error rendering are covered in
`cli/main.test.ts` without spawning — which keeps them visible to the coverage
reporter and the suite fast.

Subprocess tests are limited to two files, and both earn it by testing something
in-process tests cannot reach:

- `cli/cli.test.ts` — the shebang entry point wired to a real process
- `cli/package-smoke.test.ts` — the packed tarball as a consumer installs it

Do not add per-case subprocess tests. A new CLI behavior belongs in
`main.test.ts`.

## Property-Based Testing (fast-check)

Use for mathematical invariants. Typical `numRuns`: 100–500.
Pass a seeded `roll(notation, { seed })` when comparing two rolls on the same random sequence.

```typescript
import fc from 'fast-check';

test('NdX total is always in valid range [N, N*X]', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 20 }),
      fc.integer({ min: 1, max: 100 }),
      (count, sides) => {
        const result = roll(`${count}d${sides}`);
        return result.total >= count && result.total <= count * sides;
      },
    ),
    { numRuns: 500 },
  );
});
```

## Conventions

- Co-locate with source: `foo.ts` → `foo.test.ts`
- Regression tests name the issue they close: `it('rejects 4d6d1 (#118)', …)`
- Prefer one table-driven case list over near-identical `it` blocks — the suite
  already does this for the error-code contract, and `bench/` shares one case
  table across all four stages
- Coverage floor: 95% lines, 100% functions — enforced by
  `[test.coverageThreshold]` in `bunfig.toml` (`bun test --coverage`,
  `bun test:ci`). Change both together.
