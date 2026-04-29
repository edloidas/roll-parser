# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Parser now rejects `SuccessCount` wrapped in meta-expression positions — modifier count, dice count/sides (infix and prefix), Fate/percentile dice count, SuccessCount threshold and bare `fN` value, and compare-point values used by Explode/Reroll. `mergeMetaRolls` also strips `success`/`failure` modifier tags on meta-forwarded dice as defense-in-depth ([#69](https://github.com/edloidas/roll-parser/issues/69))
- Parser now rejects `Versus` wrapped in the same meta-expression positions so a PF2e `vs` outcome cannot be silently dropped by `mergeMetaRolls`, and the `parseVersus` chain guard unwraps `Grouped` so `(1d20 vs 15) vs 10` throws `NESTED_VERSUS` at parse time instead of at eval ([#70](https://github.com/edloidas/roll-parser/issues/70))
- Single-sub-roll Group passthrough on `cs`/`cf` no longer smuggles a buried multi-sub Group past the parser. `{{1d20, 1d20}kh1}cs>18`, `{{1d6, 2d8}+0}cs>5`, `{abs({1d6, 2d8})}cs>5`, and `{floor({1d6, 2d8}/1)}cs>5` now reject with `INVALID_CRIT_THRESHOLD_TARGET` via a new `containsMultiSubGroup` deep-walk in `rejectGroupTarget` ([#109](https://github.com/edloidas/roll-parser/issues/109))
- Single-sub-roll Group passthrough no longer flips Fate `+1` faces to fumble. `{4dF+1d6}cf`, `({4dF+1d6})cf`, and `{abs(4dF)}cf` now reject via a new `deepContainsFatePool` mirror of `deepContainsDicePool` used inside `containsFatePool`'s Group case ([#109](https://github.com/edloidas/roll-parser/issues/109))
- Single-sub-roll Group passthrough no longer smuggles `Versus` past the meta-expression rejection, so `{1d20 vs 15}cs>18`, `{1d20 vs 15}s`, `{1d20 vs 15}kh1`, `{1+(1d20 vs 15)}cs>18`, `{abs(1d20 vs 15)}cs>18`, and `4d6>={1d20 vs 15}` now throw `NESTED_VERSUS`. `parseModifier` also gained the `rejectVersusTarget` call it was missing — closing a pre-existing inconsistency where `(1d20 vs 15)kh1` rejected with a different error code while the brace form silently dropped `degree`/`natural` ([#109](https://github.com/edloidas/roll-parser/issues/109))

### Notes

These are intentional behaviours documented for the first time, not changes — semantics are unchanged.

- `cs`/`cf` use replace semantics on `critical`/`fumble`: supplying only `cf<3` clears default crit on a natural 20. Chain `cs` first (`1d20cscf<3`) to keep the default crit alongside a custom fumble ([#96](https://github.com/edloidas/roll-parser/issues/96))
- Sort flattens additive pools: `(2d6+1d8)s` renders as one combined sorted list rather than per-pool brackets. Same applies to wrapped pools like `floor(4d6)s`. Totals are preserved ([#96](https://github.com/edloidas/roll-parser/issues/96))
- Outer parens drop from `result.expression` when chained `cs`/`cf` thresholds collapse: `(1d20cs>19)cs=1` renders as `1d20cs>19cs=1`. Re-parses to the same AST; only the textual form differs ([#96](https://github.com/edloidas/roll-parser/issues/96))

## [3.0.0-alpha.0] - 2026-04-20

First alpha of the v3 rewrite. Stage 1 (core engine) is complete; Stage 2 (dice mechanics) is largely in place.

### Added

Core engine (Stage 1):

- Lexer and token system ([#3](https://github.com/edloidas/roll-parser/issues/3))
- Pratt parser and AST types ([#4](https://github.com/edloidas/roll-parser/issues/4))
- Seedable RNG system with `SeededRNG` (xorshift128) and `MockRNG` helpers ([#5](https://github.com/edloidas/roll-parser/issues/5))
- AST evaluator with keep/drop modifiers (`kh`, `kl`, `dh`, `dl`) ([#6](https://github.com/edloidas/roll-parser/issues/6))
- Public `roll(notation, options)` API with `RollResult` / `DieResult` types ([#7](https://github.com/edloidas/roll-parser/issues/7))
- `roll-parser` CLI with `--help`, `--version`, `--verbose`, `--seed` flags; ESM + CJS dual build ([#8](https://github.com/edloidas/roll-parser/issues/8))

Dice mechanics (Stage 2):

- Percentile dice notation (`d%`) ([#35](https://github.com/edloidas/roll-parser/issues/35))
- Fate/Fudge dice (`dF`) ([#36](https://github.com/edloidas/roll-parser/issues/36))
- Math functions: `floor()`, `ceil()`, `round()`, `abs()`, `max()`, `min()` ([#37](https://github.com/edloidas/roll-parser/issues/37))
- Exploding dice — `!` (standard), `!!` (compound), `!p` (penetrating) — with optional compare points ([#38](https://github.com/edloidas/roll-parser/issues/38))
- Reroll mechanics (`r`, `ro`) with compare points ([#39](https://github.com/edloidas/roll-parser/issues/39))
- Success counting / dice pools with `>`, `>=`, `<`, `<=`, `=` operators and `fN` failure tagging ([#40](https://github.com/edloidas/roll-parser/issues/40))
- PF2e Degrees of Success via the `vs` keyword, with nat-20/1 upgrade/downgrade ([#41](https://github.com/edloidas/roll-parser/issues/41))

### Changed

- **BREAKING:** complete rewrite from v2.x. Public API, semantics, and notation coverage are not compatible with the 2.x line. Pin to `roll-parser@2.3.2` for the legacy implementation.
- Public API surface trimmed: `Lexer`, `Parser`, `lex`, `TokenType`, `Token`, and mock RNG exports removed from the root entry. `createMockRng` moved to the `roll-parser/testing` subpath. Added typed `RollParserError` base class with `RollParserErrorCode` union and `isRollParserError()` type guard ([#24](https://github.com/edloidas/roll-parser/issues/24))

### Fixed

- Modifier chaining now matches the Roll20 standard: chained modifiers are flattened and each applies independently to the full pool; drop sets are unioned ([#12](https://github.com/edloidas/roll-parser/issues/12))
- Dice count safety limit via `maxDice` option (default 10,000), enforced across the whole expression to prevent DoS via additive groups like `5000d6+5000d6` ([#19](https://github.com/edloidas/roll-parser/issues/19))
- Parser and evaluator correctness: duplicate `kept` modifier entries, implicit modifier count defaulting to 1 (`4d6kh` → `4d6kh1`), `critical` flag suppression when `sides === 1`, negative `--seed` CLI values ([#21](https://github.com/edloidas/roll-parser/issues/21))

[Unreleased]: https://github.com/edloidas/roll-parser/compare/v3.0.0-alpha.0...HEAD
[3.0.0-alpha.0]: https://github.com/edloidas/roll-parser/releases/tag/v3.0.0-alpha.0
