# Roll Parser v3 — Issue Plan

Findings from GAPS.md grouped into actionable GitHub issues.
Each issue lists its constituent findings with original severity.

---

## Issue A — `fix: add dice count safety limit` → [#19](https://github.com/edloidas/roll-parser/issues/19)

Single-focus critical fix. The most urgent correctness/security gap.

**Findings:**
- **[Critical]** #1 — No upper bound on dice count; `999999999999d6` hangs the process
- **[Medium]** #12 — `maxIterations` in `RollOptions` is declared but never read or used

---

## Issue B — `ci: fix test pipeline and add quality gates` → [#20](https://github.com/edloidas/roll-parser/issues/20)

All CI problems in one place.

**Findings:**
- **[Critical]** #2 — `continue-on-error: true` on test job; broken tests show green check
- **[Medium]** #24 — Coverage script exists but CI never runs it; no threshold enforced
- **[Medium]** #25 — No dependency caching; `bun install` runs fresh on every job
- **[Medium]** #26 — Test job has unnecessary `needs: build` dependency; serializes pipeline
- **[Medium]** #27 — No matrix testing; only `ubuntu-latest` with `bun-version: latest`

---

## Issue C — `fix: parser and evaluator correctness` → [#21](https://github.com/edloidas/roll-parser/issues/21)

Correctness bugs in the core engine.

**Findings:**
- **[High]** #3 — `4d6d1` parses as `(4d6)d1` instead of "roll 4d6 drop 1" — documented as known limitation
- **[High]** #4 — `DieResult.modifiers` contains duplicate `"kept"` entries
- **[Medium]** #19 — Implicit modifier count not supported; `4d6kh` throws instead of defaulting to `kh1`
- **[Medium]** #21 — `1d1` is flagged as both critical and fumble — fumble takes precedence
- **[Medium]** #23 — `--seed -42` fails; CLI rejects seed values starting with `-`

---

## Issue D — `build: fix npm publish artifacts` → [#22](https://github.com/edloidas/roll-parser/issues/22)

Everything that affects what consumers get when they install the package.

**Findings:**
- **[High]** #6 — Test `.d.ts` files leak into `dist/`
- **[High]** #7 — `"files"` includes `"src"`, shipping test files to npm
- **[High]** #8 — `build:esm` uses `--target bun`; may break Node.js consumers
- **[Medium]** #28 — Missing `"sideEffects": false`
- **[Medium]** #29 — `biome.json` includes `bin/**/*.ts` but `bin/` does not exist
- **[Low]** #32 — `tsconfig.json` `noEmit`/`declaration` conflict
- **[Low]** #33 — No `outDir` in base tsconfig
- **[Low]** #35 — `"bin"` field uses shorthand string

---

## Issue E — `docs: update documentation for v3` → [#23](https://github.com/edloidas/roll-parser/issues/23)

**Findings:**
- **[High]** #9 — `CONTRIBUTING.md` is entirely v2-era — to be deleted
- **[High]** #10 — README says Stage 1 is "In Progress"
- **[High]** #11 — README `rendered` example shows wrong output format
- **[Low]** #31 — `PLAN.md` phase status — fixed directly (27d9cb6)
- **[Low]** #34 — GitHub Issue #1 from 2017 — already closed

---

## Issue F — `refactor: clean up public API surface` → [#24](https://github.com/edloidas/roll-parser/issues/24)

Design concerns about what the package exports and how errors work.

**Findings:**
- **[Medium]** #13 — `createMockRng` and `MockRNGExhaustedError` exported from main entry
- **[Medium]** #14 — `VERSION` constant hardcoded; drifts from `package.json`
- **[Medium]** #15 — Very wide API surface; all internals exported
- **[Medium]** #16 — `bun-types` pinned to `"latest"`
- **[Medium]** #20 — `EvaluatorError` has no structured context
- **[Medium]** #22 — `MockRNG.nextInt` ignores `min`/`max` bounds
- **[Medium]** #30 — Comment rules say ≤80 chars but `biome.json` sets `lineWidth: 100`
- **[Low]** #37 — Keep-drop modifier functions have ambiguous public/private status
- **[Low]** #38 — No common base error class

---

## Issue G — `epic: implement Stage 2 — system compatibility` → [#25](https://github.com/edloidas/roll-parser/issues/25)

All unimplemented roadmap features from `Research.md`.

**Features:**
- Exploding dice — `1d6!`, `1d6!!`, `1d6!p`
- Reroll mechanics — `2d6r<2`, `2d6ro<3`
- Success counting — `10d10>=6`, `10d10>=6f1`
- Comparison operators — `>`, `>=`, `<`, `<=`
- PF2e Degrees of Success — `1d20+10 vs 25`
- Math functions — `floor()`, `ceil()`, `round()`, `abs()`, `max()`, `min()`
- Grouped rolls — `{1d8, 1d10}kh1`
- Variable injection — `1d20+@str`, `1d20+@{modifier}`
- Sorting modifiers — `4d6s`, `4d6sd`
- Critical/fumble thresholds — `1d20cs>19`, `1d20cf<2`
- Rich JSON `parts` output per sub-expression
- Percentile dice — `d%` (alias for `d100`)
- Fate/Fudge dice — `dF` (-1, 0, +1)

---

## Finding disposition (not turned into issues)

Items from GAPS.md intentionally excluded or deferred:

- **#5** (non-integer division) — Math is correct; `floor()` is the Stage 2 solution.
- **#17** (power overflow) — JavaScript number semantics; known limitation.
- **#36** (large number literals) — JS float limits are expected.
