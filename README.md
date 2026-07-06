<h1 align="center">Roll Parser</h1>

<p align="center">
High-performance dice notation parser for tabletop RPGs.<br>
TypeScript-first, Bun-optimized, Pratt parser architecture.
</p>

<p align="center">
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-6-blue.svg" alt="TypeScript"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-1.3+-black.svg" alt="Bun"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-22%2B-339933.svg" alt="Node.js"></a>
</p>

<p align="center">
  <a href="https://edloidas.github.io/roll-parser/"><strong>Try it online →</strong></a>
</p>

## Status

> **v3 Alpha** — Stages 1–3 (core engine, system compatibility, advanced
> features incl. rich structured `parts` output) are implemented with 1,000+
> tests, 100% function coverage, and a property-based test suite.
>
> For production use, install [v2.3.2](https://www.npmjs.com/package/roll-parser/v/2.3.2).

## Features

- **Basic dice**: `2d6`, `d20`, `4d6+4`, percentile `d%`, Fate/Fudge `4dF`
- **Full arithmetic**: `+`, `-`, `*`, `/`, `%`, `**` (also `^`), parentheses
- **Computed dice**: `(1+1)d(3*2)`, `(1d4)d6`
- **Keep/Drop**: `4d6kh3`, `2d20kl1`, `4d6dl1`, shorthand `4d6k3`
- **Exploding dice**: standard `1d6!`, compound `1d6!!`, penetrating `1d6!p`, with compare points `1d6!>=5`
- **Rerolls**: recursive `2d6r<2`, once `2d6ro<3`
- **Success counting**: `10d10>=6`, with failure tagging `10d10>=6f1`
- **PF2e degrees of success**: `1d20+10 vs 25` with nat-20/nat-1 upgrade/downgrade
- **Math functions**: `floor()`, `ceil()`, `round()`, `abs()`, `max()`, `min()`
- **Variables**: `1d20+@str`, `1d20+@{sneak attack}`
- **Grouped rolls**: `{1d8, 1d10}kh1`, `{4d10+5d6}kh2`
- **Sorting**: `4d6s`, `4d6sd` (display-only)
- **Crit thresholds**: `1d20cs>=19`, `1d20cf<3` (display-only, independent overrides)
- **Structured `parts` output**: every result carries a typed evaluation tree mirroring the AST — per-sub-expression totals, dice, resolved thresholds — for chat-log/character-sheet rendering without re-parsing
- **Source spans**: every AST node and `RollPart` carries `start`/`end` offsets into the notation; evaluator errors point at the exact failing sub-expression
- **Seedable RNG** (xorshift128) for reproducible rolls, mock RNG for tests
- **Typed errors** with stable `code`s and input positions
- **Safety limits**: `maxDice`, `maxExplodeIterations`, `maxRerollIterations`, parse depth cap

## Installation

```bash
bun add roll-parser
npm install roll-parser
```

The package is **ESM-only**. On Node.js ≥ 22 (required), CommonJS consumers
can still `require('roll-parser')` via `require(esm)`.

## Usage

```typescript
import { roll } from 'roll-parser';

const result = roll('4d6kh3');
result.total;      // e.g. 14
result.notation;   // '4d6kh3'
result.rendered;   // '4d6kh3[3, 6, ~~2~~, 5] = 14'
result.rolls;      // per-die results with kept/dropped/critical flags
```

### Options

```typescript
import { roll, SeededRNG } from 'roll-parser';

roll('4d6', { seed: 'character-1' });     // reproducible rolls
roll('4d6', { rng: new SeededRNG(42) });  // custom RNG instance (takes precedence)

roll('1d20+@str', {
  context: { str: 4 },                    // variable values
  onMissingVariable: 'zero',              // or 'throw' (default)
});

roll('100d6!', {
  maxDice: 1_000,                         // total dice cap, default 10,000
  maxExplodeIterations: 100,              // per-die explosion cap, default 1,000
  maxRerollIterations: 100,               // per-die reroll cap, default 1,000
});
```

### Results

| Field | Type | Notes |
|-------|------|-------|
| `total` | `number` | Final computed total (always finite — overflow throws) |
| `notation` | `string` | Original input |
| `expression` | `string` | Normalized form; meta-expressions render as their resolved values |
| `rendered` | `string` | Markdown breakdown: `~~n~~` dropped, `**n**` success, `__n__` failure |
| `rolls` | `DieResult[]` | Every die: `sides`, `result`, `modifiers`, `critical`, `fumble` |
| `parts` | `RollPart` | Typed evaluation tree mirroring the AST 1:1 (see below) |
| `successes` / `failures` | `number?` | Present when success counting was used |
| `degree` / `natural` | `DegreeOfSuccess?` / `number?` | Present for top-level `vs` expressions |

### Structured breakdown (`parts`)

`result.parts` is a discriminated union (16 variants — `dice`, `binaryOp`,
`modifier`, `versus`, …) where each part holds its own sub-total, resolved
thresholds/specs, and — for dice parts — the same `DieResult` objects as
`result.rolls`. JSON-serializable; `parts.total === result.total` always.

```typescript
const r = roll('4d6kh3 + 2');
// r.parts = { type: 'binaryOp', operator: '+', total: 16,
//   left: { type: 'modifier', specs: [{ kind: 'keep', selector: 'highest', count: 3 }],
//           target: { type: 'dice', count: 4, sides: 6, rolls: [...], ... }, total: 14 },
//   right: { type: 'literal', value: 2, total: 2 } }
```

Meta-expressions (`(1d4)d6` counts, computed thresholds) appear as resolved
numbers in the owning part; their dice live in `result.rolls` tagged `'meta'`.

### Error handling

All errors extend `RollParserError` with a typed `code`
(e.g. `DICE_LIMIT_EXCEEDED`, `DIVISION_BY_ZERO`, `AMBIGUOUS_DICE_CHAIN`);
lexer and parser errors also carry the input `position`.

```typescript
import { isRollParserError } from 'roll-parser';

try {
  roll(userInput);
} catch (error) {
  if (isRollParserError(error)) console.error(error.code, error.message);
}
```

### Testing your integrations

```typescript
import { createMockRng } from 'roll-parser/testing';

const result = roll('3d6', { rng: createMockRng([4, 2, 6]) });
result.total; // 12 — throws if the roll consumes more values than provided
```

### CLI

```bash
roll-parser 2d6+3
roll-parser 4d6kh3 --verbose --seed test
roll-parser --help
```

## Notation reference

| Notation | Meaning |
|----------|---------|
| `NdX`, `dX`, `Nd%`, `NdF` | Roll N X-sided / percentile / Fate dice |
| `khN` `klN` `dhN` `dlN` (`kN`) | Keep/drop highest/lowest N (default 1) |
| `!` `!!` `!p` | Explode: standard / compound / penetrating (optional `>=T` etc.) |
| `r<T`, `ro<T` | Reroll recursively / once while condition matches |
| `>=T`, `>T`, `=T`, `<T`, `<=T` | Count successes against threshold (terminal) |
| `fT`, `f<T` | Failure threshold after success counting |
| `vs DC` | PF2e degree of success against a DC |
| `s`, `sd` | Sort dice ascending/descending (display-only) |
| `csT`, `cfT` | Override crit/fumble display thresholds independently |
| `@name`, `@{any name}` | Variable from `context` |
| `{a, b}khN` | Grouped rolls; keep/drop by sub-roll subtotal |
| `floor() ceil() round() abs() max() min()` | Math functions |

## Performance

Run `bun bench` for the mitata suite (parse, evaluate, and end-to-end paths).
Indicative numbers on a modern x86-64 container (Bun 1.3):

| Operation | Time |
|-----------|------|
| `parse('2d6+3')` | ~0.4 µs |
| `roll('1d20+5')` | ~2.5 µs (~400k rolls/s) |
| `roll('4d6kh3')` | ~5 µs |
| `evaluate(parse('100d6'))` | ~17 µs |

Numbers include building the structured `parts` tree (always on).

## Known Limitations

- **`4d6d1` is a parse error, not "drop 1".** The bare `d` token is the dice
  operator, and `4d6d1` reading as "roll 4d6, use the result as a count of
  d1 dice" is a silent trap — so chaining `d` directly onto a dice expression
  throws `AMBIGUOUS_DICE_CHAIN`. Use `4d6dl1` to drop dice, or `(4d6)d1` for
  nested dice.
- **Threshold comparisons bind tight.** In explode and reroll thresholds,
  `1d6!>=5+2` parses as `(1d6!>=5)+2` — the comparison binds to the dice
  pool, not the arithmetic after it. For a computed threshold, parenthesize:
  `1d6!>=(5+2)`. Success-count thresholds bind the same way, but wrapping the
  resulting `SuccessCountNode` is a parse error (terminal by design), so
  `1d6>=5+2` throws — parenthesize: `1d6>=(5+2)`.
- **Meta-expressions in `result.expression` are substituted with their
  resolved values.** Dice counts, sides, modifier counts, and threshold
  expressions are rendered as the integer they evaluated to — so
  `result.expression` does not round-trip through `parse` when
  meta-expressions are present.

  ```typescript
  roll('(1d4)d6').expression;       // '2d6' (if 1d4 rolled 2)
  roll('1d6!>(1d2+3)').expression;  // '1d6!>5'
  ```

- **Sort flattens additive pools and drops per-pool brackets.** `(2d6+1d8)s`
  renders the combined pool as one sorted list — `(2d6 + 1d8)s[3, 4, 5]` —
  rather than the per-pool form `2d6[3, 4] + 1d8[5]`. Totals are preserved;
  only the rendered breakdown loses pool boundaries.
- **Outer parens drop from `result.expression` after threshold collapse.**
  `(1d20cs>19)cs=1` evaluates with `result.expression = '1d20cs>19cs=1'`
  because chained `cs` thresholds collapse into a single node. The notation
  re-parses to the same AST; only the textual form differs.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.com)
