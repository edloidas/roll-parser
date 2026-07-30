# Testing — Project Constraints

Bun's test runner. Structure, `createMockRng` usage, fast-check conventions, and
co-location are all evident from the existing suites — match them. The coverage
floor lives in `bunfig.toml`, not here.

What follows is not inferable from reading the code, because the code only shows
the positive case.

## Error assertions

Use `expectRollError` from `src/test-helpers.ts`. Never a bare `try`/`catch`, and
never a new local helper — it asserts class and code, returns the error for
further assertions, and fails when nothing throws.

```typescript
import { expectRollError } from '../test-helpers.js';

expectRollError(() => parse('1d6!!!'), ParseError, 'INVALID_EXPLODE_TARGET');

const error = expectRollError(() => parse('(1+2'), ParseError, 'EXPECTED_TOKEN');
expect(error.position).toBe(4);
```

`src/test-helpers.ts` is test-only: excluded from `tsconfig.build.json` and from
the published `files`. Anything added there stays excluded from both.

## Error-code contract

`src/errors.test.ts` maps every `RollParserErrorCode` to a provoking input via a
`Record<RollParserErrorCode, CodeCase>` annotation. That annotation is the
completeness gate — adding a code without a case is a type error. Do not loosen
it to a partial or an index signature.

## CLI tests

Test the CLI in-process. `main()` takes injected `argv`/`stdout`/`stderr`, so
argument handling, exit codes, and error rendering all belong in
`cli/main.test.ts` — that keeps them visible to the coverage reporter and fast.

Subprocess tests are limited to two files, each testing something in-process
tests cannot reach:

- `cli/cli.test.ts` — the shebang entry point on a real process
- `cli/package-smoke.test.ts` — the packed tarball as a consumer installs it

Do not add per-case subprocess tests. New CLI behavior goes in `main.test.ts`.

## Regressions

Name the issue a regression test closes: `it('rejects 4d6d1 (#118)', …)`.
