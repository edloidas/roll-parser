# Roll Parser v3 — Issue Plan

Findings from GAPS.md grouped into actionable GitHub issues.
Each issue lists its constituent findings with original severity.

---

## Issue A — `fix: add dice count safety limit`

Single-focus critical fix. The most urgent correctness/security gap.

**Findings:**
- **[Critical]** #1 — No upper bound on dice count; `999999999999d6` hangs the process
- **[Medium]** #12 — `maxIterations` in `RollOptions` is declared but never read or used

**What needs to happen:**
- Add a `MAX_DICE_COUNT` constant (suggested: 10_000)
- Throw `EvaluatorError` when count exceeds the limit
- Wire `maxIterations` from `RollOptions` through `roll()` → `evaluate()` so consumers can override the limit
- Add tests for the limit boundary and the override

---

## Issue B — `ci: fix test pipeline and add quality gates`

All CI problems in one place.

**Findings:**
- **[Critical]** #2 — `continue-on-error: true` on test job; broken tests show green check
- **[Medium]** #24 — Coverage script exists but CI never runs it; no threshold enforced
- **[Medium]** #25 — No dependency caching; `bun install` runs fresh on every job
- **[Medium]** #26 — Test job has unnecessary `needs: build` dependency; serializes pipeline
- **[Medium]** #27 — No matrix testing; only `ubuntu-latest` with `bun-version: latest`

**What needs to happen:**
- Remove `continue-on-error: true`
- Add coverage step with threshold (>90% statement, 100% function per PLAN.md)
- Add `actions/cache` for Bun dependencies
- Decouple test job from build job (tests run against source)
- Decide on matrix: Bun LTS vs latest? Node.js for CJS validation?

---

## Issue C — `fix: parser and evaluator correctness`

Correctness bugs in the core engine. Groups smaller bugs that all touch
the same area of the codebase.

**Findings:**
- **[High]** #3 — `4d6d1` parses as `(4d6)d1` instead of "roll 4d6 drop 1"; bare `d`
  cannot be disambiguated from dice operator
- **[High]** #4 — `DieResult.modifiers` contains duplicate `"kept"` entries after
  modifier evaluation (`markAllKept` + `mergeDropSets` both add `"kept"`)
- **[Medium]** #19 — Implicit modifier count not supported; `4d6kh` throws ParseError
  instead of defaulting to `kh1`
- **[Medium]** #21 — `1d1` is flagged as both critical and fumble simultaneously
- **[Medium]** #23 — `--seed -42` fails; CLI rejects seed values starting with `-`

**Note on #3:** Fixing bare `d` as drop shorthand requires either a context-sensitive
lexer or a parser-level disambiguation. This is the hardest fix in this group.
Option A: document it as a known limitation and not fix it. Option B: implement
proper disambiguation. Needs a decision before the issue is created.

---

## Issue D — `build: fix npm publish artifacts`

Everything that affects what consumers get when they install the package.

**Findings:**
- **[High]** #6 — Test `.d.ts` files (9 files) and `.d.ts.map` files leak into `dist/`
  because `tsconfig.json` includes `src/**/*.ts`
- **[High]** #7 — `"files"` in `package.json` includes `"src"`, shipping all source
  (9 test files, mock RNG, CLI internals) to npm
- **[High]** #8 — `build:esm` uses `--target bun`; ESM entry may include Bun-specific
  APIs that break Node.js consumers
- **[Medium]** #28 — Missing `"sideEffects": false` in `package.json`
- **[Medium]** #29 — `biome.json` includes `bin/**/*.ts` but `bin/` does not exist
- **[Low]** #32 — `tsconfig.json` has `"noEmit": true` alongside `"declaration": true`;
  only works because `build:types` overrides `--noEmit false` on CLI
- **[Low]** #33 — No `"outDir"` in base tsconfig; `tsc` without `--noEmit` would
  emit into the source tree
- **[Low]** #35 — `"bin"` field uses shorthand string instead of explicit object

---

## Issue E — `docs: update documentation for v3`

All stale or wrong documentation.

**Findings:**
- **[High]** #9 — `CONTRIBUTING.md` is entirely v2-era: emoji commits, no Bun/Biome/TS,
  mismatched PR workflow
- **[High]** #10 — README says Stage 1 is "In Progress"; all 305 tests pass, it is complete
- **[High]** #11 — README `rendered` example shows `"4d6kh3[6,5,3,2] = 14"` but actual
  output format is `"4d6[3, 6, ~~3~~, 3] = 12"`
- **[Low]** #31 — `PLAN.md` still says Phase 0 is "Current Step — Blocking"
- **[Low]** #34 — GitHub Issue #1 from 2017 ("More functions similar to Roll20") is still
  open; should be closed in favor of the Stage 2/3 roadmap issue

---

## Issue F — `refactor: clean up public API surface`

Design concerns about what the package exports and how errors work.
Lower urgency but important before a stable v3 release.

**Findings:**
- **[Medium]** #13 — `createMockRng` and `MockRNGExhaustedError` are exported from the
  main entry point; test-only code ships in prod bundles
- **[Medium]** #14 — `VERSION` constant hardcoded in `src/index.ts`; will drift from
  `package.json` version
- **[Medium]** #15 — Very wide API surface: all internals (`Lexer`, `Parser`, `TokenType`,
  etc.) exported; locks implementation into public contract
- **[Medium]** #16 — `bun-types` pinned to `"latest"` instead of a fixed version;
  non-reproducible builds
- **[Medium]** #20 — `EvaluatorError` has no structured context (position, node, code);
  unlike `LexerError` and `ParseError`
- **[Medium]** #22 — `MockRNG.nextInt` ignores `min`/`max` bounds; can produce logically
  invalid `DieResult` objects in tests
- **[Medium]** #30 — Comment rules say ≤80 chars but `biome.json` sets `lineWidth: 100`
- **[Low]** #37 — Keep-drop modifier functions exported from evaluator barrel but not
  from `src/index.ts`; ambiguous public/private status
- **[Low]** #38 — No common base error class; consumers must use `instanceof` against
  three separate classes

---

## Issue G — `epic: implement Stage 2 — system compatibility`

All unimplemented roadmap features from `Research.md`. Kept as a single
epic issue to track without prescribing implementation order.

**Findings:**
- **[Roadmap]** Exploding dice — `1d6!`, `1d6!!`, `1d6!p`
- **[Roadmap]** Reroll mechanics — `2d6r<2`, `2d6ro<3`
- **[Roadmap]** Success counting — `10d10>=6`, `10d10>=6f1`
- **[Roadmap]** Comparison operators — `>`, `>=`, `<`, `<=`
- **[Roadmap]** PF2e Degrees of Success — `1d20+10 vs 25`
- **[Roadmap]** Math functions — `floor()`, `ceil()`, `round()`, `abs()`, `max()`, `min()`
- **[Roadmap]** Grouped rolls — `{1d8, 1d10}kh1`
- **[Roadmap]** Variable injection — `1d20+@str`, `1d20+@{modifier}`
- **[Roadmap]** Sorting modifiers — `4d6s`, `4d6sd`
- **[Roadmap]** Critical/fumble thresholds — `1d20cs>19`, `1d20cf<2`
- **[Roadmap]** Rich JSON `parts` output per sub-expression
- **[Roadmap]** Percentile dice — `d%` (alias for `d100`)
- **[Roadmap]** Fate/Fudge dice — `dF` (-1, 0, +1)

---

## Finding disposition (not turned into issues)

Items from GAPS.md intentionally excluded or deferred:

- **#5** (non-integer division) — Math is correct; `floor()` is the Stage 2 solution.
  Document as intended behavior.
- **#17** (power overflow) — JavaScript JS number semantics; document as a known
  limitation. No guard needed.
- **#36** (large number literals) — Same as above; JS float limits are expected.
