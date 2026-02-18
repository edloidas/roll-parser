# build: exclude test declarations from dist and enforce CI test failures

Two build/CI quality issues discovered during #8 analysis that should be fixed
separately from the CLI implementation.

## Problem 1: Test declarations leak into dist/

`build:types` (via `tsc --emitDeclarationOnly`) processes all `src/**/*.ts`
including test files. This produces 12 unnecessary files in `dist/`:

```
dist/integration.test.d.ts
dist/integration.test.d.ts.map
dist/property.test.d.ts
dist/property.test.d.ts.map
dist/evaluator/evaluator.test.d.ts
dist/evaluator/evaluator.test.d.ts.map
dist/lexer/lexer.test.d.ts
dist/lexer/lexer.test.d.ts.map
dist/parser/parser.test.d.ts
dist/parser/parser.test.d.ts.map
dist/rng/rng.test.d.ts
dist/rng/rng.test.d.ts.map
```

These get published to npm via the `"files": ["dist", "src"]` field.

### Fix

Create `tsconfig.build.json` extending `tsconfig.json` with an `exclude` for
`**/*.test.ts`, and update `build:types` to use it:

```json
{
  "extends": "./tsconfig.json",
  "exclude": ["src/**/*.test.ts"]
}
```

```diff
- "build:types": "tsc --emitDeclarationOnly --declaration --noEmit false --outDir dist"
+ "build:types": "tsc -p tsconfig.build.json --emitDeclarationOnly --declaration --noEmit false --outDir dist"
```

## Problem 2: CI test job never fails the pipeline

In `.github/workflows/ci.yml`, the test job has `continue-on-error: true`
(line 78), meaning test failures do not block PR merges. With 266 passing tests
and a stable Stage 1 core, this guard should be removed.

### Fix

Remove `continue-on-error: true` from the test step in `ci.yml`.

## Acceptance Criteria

- [ ] `dist/` contains no `*.test.d.ts` or `*.test.d.ts.map` files after
      `bun run build`
- [ ] CI test job fails the pipeline when tests fail
- [ ] `bun validate` still passes

<sub>Drafted with AI assistance</sub>
