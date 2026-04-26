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

## Status

> **v3 Alpha** — Stage 1 (Core Engine) is complete with 300+ tests.
> Stages 2–3 are planned.
>
> For production use, install [v2.3.2](https://www.npmjs.com/package/roll-parser/v/2.3.2).

## Features

### Stage 1: Core Engine (Complete)

- Basic dice notation: `2d6`, `d20`, `4d6+4`
- Full arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Parentheses: `(1d4+1)*2`
- Keep/Drop modifiers: `4d6kh3`, `2d20kl1`, `4d6dl1`
- Computed dice: `(1+1)d(3*2)`
- Seedable RNG for reproducible rolls

### Stage 2: System Compatibility (Planned)

- Exploding dice: `1d6!`, `1d6!!`, `1d6!p`
- Reroll mechanics: `2d6r<2`, `2d6ro<3`
- Success counting: `10d10>=6`, `10d10>=6f1`
- Math functions: `floor()`, `ceil()`, `max()`, `min()`

### Stage 3: Advanced Features (Planned)

- Variables: `1d20+@str`, `1d20+@{modifier}`
- Grouped rolls: `{1d8, 1d10}kh1`
- Rich JSON output with roll breakdown

## Installation

```bash
bun add roll-parser
npm install roll-parser
```

## Usage

```typescript
import { roll } from 'roll-parser';

const result = roll('4d6kh3');
console.log(result.total);    // e.g., 14
console.log(result.notation); // "4d6kh3"
```

### CLI

```bash
roll-parser 2d6+3
roll-parser 4d6kh3
roll-parser --help
```

## Known Limitations

- **`4d6d1` parses as nested dice, not "drop 1".** The bare `d` token is always
  interpreted as the dice operator, so `4d6d1` becomes `(4d6)d1` (roll 4d6, then
  use the result as the count for d1). To drop dice, use the explicit `dl`
  (drop lowest) or `dh` (drop highest) modifiers: `4d6dl1`.
- **Threshold comparisons bind tight.** In explode and reroll thresholds,
  `1d6!>=5+2` parses as `(1d6!>=5)+2` and `2d6r<=1+1` as `(2d6r<=1)+1` — the
  comparison binds to the dice pool, not the arithmetic after it. For a
  computed threshold, parenthesize: `1d6!>=(5+2)`. Success-count thresholds
  bind the same way, but wrapping the resulting `SuccessCountNode` is a parse
  error (terminal by design), so `1d6>=5+2` and `10d10>=6f1+1` throw —
  parenthesize the threshold to keep everything inside the success-count:
  `1d6>=(5+2)`, `10d10>=6f(1+1)`.
- **PF2e natural-20 upgrade only survives the compound explode.** On a `vs`
  check, `1d20!! vs DC` preserves the natural-20 upgrade when the d20
  explodes, but `1d20! vs DC` and `1d20!p vs DC` do not. Standard and
  penetrating explodes leave two kept d20s in the pool, and the "exactly one
  kept d20" rule makes natural-value detection return `undefined`. Use the
  compound form when the nat-20 upgrade must be preserved through an
  explode.
- **Meta-expressions in `result.expression` are substituted with their
  resolved values.** Dice counts, sides, modifier counts, and threshold
  expressions are rendered as the integer they evaluated to, not the original
  sub-expression — so `result.expression` does not round-trip through `parse`
  when meta-expressions are present.

  ```typescript
  roll('(1d4)d6').expression;       // '2d6' (if 1d4 rolled 2)
  roll('1d6!>(1d2+3)').expression;  // '1d6!>5'
  ```

  The round-trip property test does not exercise meta-expressions, so the
  gap is invisible to CI. Do not rely on `result.expression` as a faithful
  re-parseable form when your notation contains meta-expressions.
- **`cs`/`cf` use replace semantics on `critical`/`fumble`.** Supplying only
  `cf<3` clears every die's `critical` to `false` — including a natural 20
  on `1d20cf<3` — because the empty `successThresholds` array overrides the
  default crit. Chain `cs` first to preserve the default crit alongside a
  custom fumble: `1d20cscf<3`.
- **Sort flattens additive pools and drops per-pool brackets.** `(2d6+1d8)s`
  renders the combined pool as one sorted list — `(2d6 + 1d8)s[3, 4, 5]` —
  rather than the per-pool form `2d6[3, 4] + 1d8[5]` that bare `2d6+1d8`
  produces. The same flattening applies inside wrapped pools like
  `floor(4d6)s`. Totals are preserved; only the rendered breakdown loses
  pool boundaries.
- **Outer parens drop from `result.expression` after threshold collapse.**
  `(1d20cs>19)cs=1` evaluates with `result.expression = '1d20cs>19cs=1'`
  because chained `cs` thresholds collapse into a single `CritThresholdNode`
  with merged thresholds. The notation re-parses to the same AST, so
  behaviour is harmless — but tools diffing the original notation against
  `expression` will see a spurious change.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.com)
