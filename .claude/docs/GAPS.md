# Roll Parser v3 — Gap Analysis

Comprehensive audit of the codebase covering code quality, build/publish hygiene,
CI pipeline, documentation, parser correctness, and missing features.

Each finding links to the GitHub issue it was grouped into. Deferred findings
have no issue and are noted at the bottom.

## Critical

### ~~1. No dice count safety limit — process hangs on large inputs~~ *(→ [#19](https://github.com/edloidas/roll-parser/issues/19))* ✓ Resolved

Added `DEFAULT_MAX_DICE` (10,000) with aggregate counter across the full
expression. `maxDice` option in `RollOptions` and `EvaluateOptions` lets
consumers override the limit. Invalid values (NaN, Infinity, negatives) fall
back to the default.

### 2. CI test job has `continue-on-error: true` *(→ [#20](https://github.com/edloidas/roll-parser/issues/20))*

`.github/workflows/ci.yml:78` — The test step silently swallows failures.
PRs with broken tests show a green check. This completely defeats the purpose
of CI testing.

## High — Bugs

### 3. `4d6d1` parses as `(4d6)d1` — not "roll 4d6, drop 1" *(→ [#21](https://github.com/edloidas/roll-parser/issues/21))*

The lexer cannot distinguish `d` as "drop" from `d` as "dice" when followed by
a number. `4d6d1` is parsed as two nested dice operations: first roll `4d6`
(producing e.g. 14), then roll `14d1`. Only `dl`/`dh` syntax works for drop.
This is a known ambiguity from `Research.md` (section 2.1), but it is not
documented as a limitation and the README does not warn users.

### 4. `DieResult.modifiers` contains duplicate `"kept"` entries *(→ [#21](https://github.com/edloidas/roll-parser/issues/21))*

`src/evaluator/evaluator.ts:125` calls `markAllKept()` which adds `"kept"`,
then `mergeDropSets()` at line 275 adds `"kept"` again. Result:
`modifiers: ["kept", "kept"]` for kept dice. Consumers checking
`modifiers.length` or doing equality comparisons will get wrong results.

### 5. Non-integer results from division are not handled *(deferred)*

`roll('1d6/3')` can return `total: 1.3333333333333333`. The Research.md
(Requirement 3.2) states results should be integers unless math functions
introduce floats — but currently any division can produce floats with no
rounding. The `rendered` string shows ugly floating point.

Math is correct; `floor()` is the Stage 2 solution.

## High — Build/Publish

### 6. Test `.d.ts` files leak into `dist/` *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

`tsconfig.json` includes `src/**/*.ts` which captures `*.test.ts` files. The
`build:types` script emits 9 test declaration files + 9 `.d.ts.map` files into
`dist/`. These ship to npm consumers.

### 7. `files` in `package.json` includes `src` *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

All source files including 9 test files, the mock RNG, and CLI internals ship
to npm. Unnecessary package bloat.

### 8. ESM build uses `--target bun` *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

`build:esm` uses `bun build ... --target bun` which may emit Bun-specific APIs.
The ESM entry is exposed via the `"import"` export condition, which Node.js
consumers will use. This can break in non-Bun environments. The CJS build
correctly uses `--target node`.

## High — Documentation

### 9. CONTRIBUTING.md is entirely stale (v2-era) *(→ [#23](https://github.com/edloidas/roll-parser/issues/23))*

- Recommends emoji-prefixed commits (`:art:`, `:bug:`) which contradicts
  CLAUDE.md Conventional Commits format
- No mention of Bun, TypeScript, Biome, or any v3 tooling
- References generic "coding conventions" with no link to actual standards
- PR workflow does not match CLAUDE.md template

### 10. README says Stage 1 is "In Progress" — it is complete *(→ [#23](https://github.com/edloidas/roll-parser/issues/23))*

All Stage 1 features are implemented with 305 passing tests. The status badge
is misleading.

### 11. README `rendered` format example is incorrect *(→ [#23](https://github.com/edloidas/roll-parser/issues/23))*

Shows `"4d6kh3[6,5,3,2] = 14"` but actual output is
`"4d6[3, 6, ~~3~~, 3] = 12"` — no modifier suffix in rendered, spaces after
commas, and strikethrough for dropped dice.

## Medium — Code Quality

### ~~12. `maxIterations` option is defined but never used~~ *(→ [#19](https://github.com/edloidas/roll-parser/issues/19))* ✓ Resolved

Replaced `maxIterations` with `maxDice` in `RollOptions`. Now wired through
`evaluate()` → `EvalEnv` → `evalDice()` with aggregate tracking.

### 13. Mock RNG bundled into production entry point *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`src/index.ts:32` exports `createMockRng` and `MockRNGExhaustedError` from the
main package entry. This means test-only code is bundled into `dist/index.js`
and `dist/index.mjs`. Should be a separate `roll-parser/testing` export path.

### 14. `VERSION` constant duplicated *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`src/index.ts:42` hardcodes `VERSION = '3.0.0-alpha.0'` which must be manually
kept in sync with `package.json` `version`. These will inevitably drift.

### 15. Very wide public API surface *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

The entry point exports all internals: `Lexer`, `lex`, `LexerError`, `Parser`,
`ParseError`, `TokenType`, `Token`, `evaluate`, `EvaluatorError`, plus all AST
types and type guards. Most consumers only need `roll`, `parse`, and result
types. This makes the API surface hard to maintain across versions.

### 16. `bun-types` version is `latest` *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`package.json:67` — Floating version makes builds non-reproducible. Should be
pinned.

### 17. Power operator with no overflow guard *(deferred)*

`roll('2**63')` returns `9223372036854776000` (floating-point precision loss).
`roll('2**999')` returns `Infinity`. No guard or warning for numeric overflow.

JavaScript number semantics; known limitation.

### 18. `d%` (percentile dice) and `dF` (Fate dice) are not supported *(→ [#25](https://github.com/edloidas/roll-parser/issues/25))*

These are extremely common dice notations. `d%` should be equivalent to `d100`.
`dF` should roll Fate/Fudge dice (-1, 0, +1). Both throw errors currently.
Not documented as a limitation.

### 19. Implicit modifier count not supported *(→ [#21](https://github.com/edloidas/roll-parser/issues/21))*

`4d6kh` (meaning `4d6kh1`) throws `ParseError`. Users must always specify the
count. Many dice systems allow bare `kh`/`kl` to mean keep/drop 1.

### 20. `EvaluatorError` lacks structured context *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

Unlike `LexerError` (which has `position` and `character`) and `ParseError`
(which has `position` and `token`), `EvaluatorError` provides no information
about where in the expression the error occurred. For `2d6+1d0+3`, it throws
"Invalid dice sides: 0" but no indication that the error is in the second
dice group.

### 21. `1d1` is both critical and fumble simultaneously *(→ [#21](https://github.com/edloidas/roll-parser/issues/21))*

`createDieResult` at `src/evaluator/evaluator.ts:52-60` flags `critical: true`
when `result === sides` and `fumble: true` when `result === 1`. For `1d1`,
both are true. This is a semantic ambiguity with no guard.

### 22. MockRNG ignores `min`/`max` bounds *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`src/rng/mock.ts:57` — `nextInt` returns raw values from the sequence regardless
of `min`/`max` parameters. A test providing `createMockRng([100])` for a `1d6`
roll would produce `DieResult` with `result: 100, sides: 6`. No validation
against bounds.

### 23. `--seed` CLI flag rejects values starting with `-` *(→ [#21](https://github.com/edloidas/roll-parser/issues/21))*

`src/cli/args.ts:49` — `next.startsWith('-')` check prevents numeric seeds
like `--seed -42` via space-separated syntax. Users would need `--seed=-42`
instead.

## Medium — CI/Config

### 24. No coverage threshold enforcement *(→ [#20](https://github.com/edloidas/roll-parser/issues/20))*

The `coverage` script exists but CI never runs it. No threshold is enforced.
Coverage could silently regress.

### 25. No dependency caching in CI *(→ [#20](https://github.com/edloidas/roll-parser/issues/20))*

Each CI job runs `bun install` fresh. No Bun cache is used, slowing builds
unnecessarily.

### 26. Test job has unnecessary `needs: build` dependency *(→ [#20](https://github.com/edloidas/roll-parser/issues/20))*

`ci.yml:63` — Tests run against source, not build artifacts. The
`needs: build` serializes them unnecessarily.

### 27. No matrix testing *(→ [#20](https://github.com/edloidas/roll-parser/issues/20))*

CI only tests on `ubuntu-latest` with `bun-version: latest`. No testing across
multiple Bun versions or Node.js (relevant since CJS build targets Node).

### 28. Missing `sideEffects: false` in `package.json` *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

Tree-shaking-friendly libraries should declare this for bundler optimization.

### 29. `biome.json` has dead `bin/**/*.ts` include path *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

The `bin/` directory does not exist. Dead configuration.

### 30. Comment line width mismatch *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`.claude/rules/comments.md` says "Lines <= 80 characters" but `biome.json`
sets `lineWidth: 100`.

## Low — Minor Issues

### 31. `PLAN.md` is stale *(→ [#23](https://github.com/edloidas/roll-parser/issues/23), fixed in 27d9cb6)*

Still says Phase 0 is "Current Step — Blocking" even though all phases are
complete.

### 32. `tsconfig.json` has confusing `noEmit: true` with `declaration: true` *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

The base config sets both, but `noEmit` prevents declarations from being
emitted. Only works because `build:types` overrides with `--noEmit false` on
the CLI. A separate `tsconfig.build.json` would be cleaner.

### 33. No `outDir` in base tsconfig *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

If someone runs `tsc` without `--noEmit`, declarations would be emitted into
the source tree.

### 34. Issue #1 from v2 still open *(→ [#23](https://github.com/edloidas/roll-parser/issues/23), already closed)*

"More functions similar to Roll20" from 2017 is still open. Should be closed
or updated to reference the v3 roadmap (Stage 2/3 features).

### 35. `bin` field uses shorthand form *(→ [#22](https://github.com/edloidas/roll-parser/issues/22))*

`"bin": "./dist/cli.js"` infers the command name from package name.
More explicit: `"bin": { "roll-parser": "./dist/cli.js" }`.

### 36. Large number literal precision *(deferred)*

`roll('99999999999999999999999999999')` returns `total: 1e+29` due to
JavaScript floating-point limits. No validation or warning.

JS float limits are expected.

### 37. Keep-drop modifier exports inconsistency *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

`src/evaluator/index.ts` exports modifier functions (`applyKeepHighest`, etc.)
but `src/index.ts` does not re-export them. They exist in an ambiguous state —
neither fully internal nor fully public.

### 38. No common base error class *(→ [#24](https://github.com/edloidas/roll-parser/issues/24))*

The three error classes (`LexerError`, `ParseError`, `EvaluatorError`) share
no common base class beyond `Error`. No error code enum or discriminant
property for programmatic error handling.

## GitHub Issues

Findings grouped into GitHub issues:

| Issue | Title | Findings |
|-------|-------|---------|
| [#19](https://github.com/edloidas/roll-parser/issues/19) | `fix: add dice count safety limit` | #1, #12 |
| [#20](https://github.com/edloidas/roll-parser/issues/20) | `ci: fix test pipeline and add quality gates` | #2, #24–#27 |
| [#21](https://github.com/edloidas/roll-parser/issues/21) | `fix: parser and evaluator correctness` | #3, #4, #19, #21, #23 |
| [#22](https://github.com/edloidas/roll-parser/issues/22) | `build: fix npm publish artifacts` | #6–#8, #28, #29, #32, #33, #35 |
| [#23](https://github.com/edloidas/roll-parser/issues/23) | `docs: update documentation for v3` | #9–#11, #31, #34 |
| [#24](https://github.com/edloidas/roll-parser/issues/24) | `refactor: clean up public API surface` | #13–#16, #20, #22, #30, #37, #38 |
| [#25](https://github.com/edloidas/roll-parser/issues/25) | `epic: implement Stage 2 — system compatibility` | #18 + roadmap below |

Deferred (no issue): #5, #17, #36

## Unimplemented Roadmap Features (Stage 2 & 3) → [#25](https://github.com/edloidas/roll-parser/issues/25)

From `PRD.md`, everything below is still missing:

| Stage | Feature | Syntax |
|-------|---------|--------|
| 2 | Exploding dice | `1d6!`, `1d6!!`, `1d6!p` |
| 2 | Reroll mechanics | `2d6r<2`, `2d6ro<3` |
| 2 | Success counting | `10d10>=6`, `10d10>=6f1` |
| 2 | Comparison operators | `>`, `>=`, `<`, `<=` |
| 2 | PF2e Degrees of Success | `1d20+10 vs 25` |
| 2 | Math functions | `floor()`, `ceil()`, `round()`, `abs()`, `max()`, `min()` |
| 2 | Grouped rolls | `{1d8, 1d10}kh1` |
| 3 | Variable injection | `1d20+@str`, `1d20+@{modifier}` |
| 3 | Sorting modifiers | `4d6s`, `4d6sd` |
| 3 | Critical/fumble thresholds | `1d20cs>19`, `1d20cf<2` |
| 3 | Rich JSON `parts` output | Structured breakdown per sub-expression |
| — | Percentile dice | `d%` |
| — | Fate/Fudge dice | `dF` |
