<p align="center">
  <a href="https://roll-parser.edloidas.io/"><img src="https://raw.githubusercontent.com/edloidas/roll-parser/master/.github/logo.svg" width="92" alt="roll-parser logo"></a>
</p>

<h1 align="center">Roll Parser</h1>

<p align="center">
Dice notation for tabletop RPGs, rolled into structured results.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/roll-parser"><img src="https://img.shields.io/npm/v/roll-parser?color=cb3837" alt="npm version"></a>
  <a href="https://github.com/edloidas/roll-parser/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/edloidas/roll-parser/ci.yml?branch=master&label=CI" alt="CI status"></a>
  <a href="https://github.com/edloidas/roll-parser/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/roll-parser?color=blue" alt="MIT license"></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/node/v/roll-parser?color=5fa04e" alt="Node.js >= 22.12"></a>
</p>

<p align="center">
  <a href="https://roll-parser.edloidas.io/"><strong>Playground</strong></a> ·
  <a href="https://roll-parser.edloidas.io/reference"><strong>Notation Guide</strong></a> ·
  <a href="https://roll-parser.edloidas.io/docs/"><strong>API Reference</strong></a>
</p>

Roll dice:

```typescript
import { roll } from 'roll-parser';

const result = roll('4d6kh3');
result.total; // e.g. 14
result.rendered; // e.g. '4d6[3, 6, ~~2~~, 5] = 14'
```

Read the breakdown instead of re-parsing the string:

```typescript
const result = roll('4d6kh3 + 2');

result.parts.type; // 'binaryOp'
result.parts.total === result.total; // true — every node of the tree carries its sub-total
result.rolls.filter((die) => !die.modifiers.includes('dropped')); // the kept dice
```

Pin the dice in your tests:

```typescript
import { createMockRng } from 'roll-parser/testing';

roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) }).total; // 14, every run
```

## Why roll-parser

- **Complete notation.** Keep/drop, three flavours of exploding dice, rerolls,
  min/max clamps, success pools, crit thresholds, sorting, grouped rolls, PF2e
  degrees of success, math functions, variables, computed dice — enough for D&D 5e,
  Pathfinder, World of Darkness, Shadowrun, Fate, Savage Worlds, and Call of
  Cthulhu without escape hatches. Spelled the way
  [Roll20](https://help.roll20.net/hc/en-us/articles/360037773133-Dice-Reference)
  spells it wherever the two overlap, so the notation your table already uses
  keeps working.
- **Deterministic.** Every die goes through an injectable `RNG`. Seed a roll to
  reproduce it, or script the sequence and assert exact totals.
- **Structured.** Results are not strings. Each roll returns a typed tree
  mirroring the expression one-to-one, with per-node sub-totals, resolved
  thresholds, and source spans — enough to render a character sheet or a chat
  log without re-parsing anything.
- **Safe on untrusted input.** Dice count, explosion depth, reroll depth, and
  parse depth are all bounded, and every failure is a typed error with a stable
  code and a source span.
- **Small and fast.** ≈11.9 kB brotli for the whole library, ≈5.5 kB for just
  `parse`, ≈213 B for the testing entry point. Zero runtime dependencies, zero
  `node:` imports. A `1d20` round trip takes about 0.5 µs.
- **Tested.** 1,500+ tests behind CI-enforced coverage floors — 100% of
  functions, 98% of lines — including every code example in this README, which
  must produce the values its comments claim.
- **Measured, not asserted.** A
  [comparison suite](https://github.com/edloidas/roll-parser/tree/master/bench/competitors)
  runs 23 canonical notations through every dice-notation library published on
  npm and validates each cell over 5,000 rolls against its closed-form mean —
  support means *statistically correct*, not merely parsed. roll-parser is the
  only one that gets all 23 right. Run `bun run bench:competitors` and check
  the numbers yourself.

## Contents

- [Install](#install)
- [Notation reference](#notation-reference)
- [Recipes by game system](#recipes-by-game-system)
- [Working with results](#working-with-results)
- [Randomness](#randomness)
- [Options](#options)
- [Error handling](#error-handling)
- [Using the parser directly](#using-the-parser-directly)
- [TypeScript](#typescript)
- [CLI](#cli)
- [Performance](#performance)
- [Known limitations](#known-limitations)
- [Versioning](#versioning)
- [Upgrading from 2.x](#upgrading-from-2x)
- [Contributing](#contributing)
- [License](#license)

## Install

<!-- readme-test: skip -->

```bash
npm install roll-parser
```

> [!IMPORTANT]
> **ESM-only.** Node.js ≥ 22.12 is required — the floor at which
> `require(esm)` is unflagged — so CommonJS consumers can still
> `require('roll-parser')` even though the published files are ESM.

For TypeScript consumers, `moduleResolution` must be `bundler`, `node16`, or
`nodenext` — the package resolves through `exports` only, so the legacy `node10`
resolution does not find it. **TypeScript ≥ 5.0** is the supported floor — the
first release with `moduleResolution: bundler`. CI typechecks a consumer fixture
against the packed tarball on 5.0, 5.4, 5.9, 6.x, and 7.x, and asserts the types
really resolve rather than degrading to `any`. `node16`/`nodenext` setups do
resolve on 4.9, but that combination is untested and outside the promise.

Bundlers tree-shake the library cleanly: the library entries are side-effect-free
and touch no `process` or filesystem globals. Only the CLI entry is marked as
having effects, since it calls `main()` at module scope.

### CDN / browser without a bundler

The published files are environment-neutral ES modules, so they load directly
in the browser. Use a bundling CDN endpoint — it serves the whole module graph
as one request:

```html
<script type="module">
  import { roll } from 'https://cdn.jsdelivr.net/npm/roll-parser/+esm';

  console.log(roll('4d6kh3').total);
</script>
```

`https://esm.sh/roll-parser` works the same way. Raw file URLs
(`unpkg.com/roll-parser`) also work but fetch each module separately.

### Upgrading from 2.x

v3 is a complete rewrite and the API is not compatible — see
[MIGRATION.md](MIGRATION.md). To stay on the old line, pin `roll-parser@2.3.2`.

## Notation reference

The notation tracks
[Roll20's Dice Reference](https://help.roll20.net/hc/en-us/articles/360037773133-Dice-Reference)
wherever the two overlap: `kh`/`kl`/`dh`/`dl`, `!`/`!!`/`!p`, `r`/`ro`, success
and failure counting, `cs`/`cf`, grouped rolls, and `floor`/`ceil`/`round`/`abs`
all use Roll20's spelling and semantics. It is not a strict superset — sorting
(`s`), PF2e `vs` checks, `max`/`min`, and computed dice counts and sides are
additions, and two Roll20 forms are deliberately rejected (`4d6d1`, arithmetic
after a success count) — see [Known limitations](#known-limitations).

Notation is case-insensitive and whitespace-tolerant — `2 D 20 KH 1` and
`2d20kh1` are the same expression, newlines included. The one exception is
variable names: `@StrMod` and `@strmod` are different variables.

### Dice

| Notation | Meaning |
|----------|---------|
| `NdX` | Roll `N` dice with `X` sides — `2d6` |
| `dX` | Count defaults to 1 — `d20` is `1d20` |
| `Nd%` | Percentile dice; `d%` normalizes to `1d100` |
| `NdF` | Fate/Fudge dice, each −1, 0, or +1 — `4dF` |
| `(expr)dX` | Computed count — `(1d4)d6` rolls 1d4, then that many d6 |
| `Nd(expr)` | Computed sides — `(1+1)d(3*2)` is `2d6` |

### Arithmetic and functions

| Notation | Meaning |
|----------|---------|
| `+` `-` `*` `/` `%` | Add, subtract, multiply, divide, modulo |
| `**` or `^` | Power, right-associative |
| `-expr` | Unary minus, binding to the whole dice expression: `-1d4` is `-(1d4)` |
| `( )` | Explicit grouping — `(1d6+2)*3` |
| `2.5` | Decimal literals, in arithmetic only — never as a dice count or side count |
| `floor(x)` `ceil(x)` `round(x)` `abs(x)` `sqrt(x)` | One argument each |
| `pow(a, b)` | Exactly two arguments — same as `a ** b` |
| `max(a, b, …)` `min(a, b, …)` | Variadic, two arguments minimum — `max(1d20, 1d20, 1d20)` |
| `@name` `@{any name}` | Variable from the `context` option |

### Modifiers

Postfix modifiers attach to a dice pool. Counts are optional and default to
**1** — `4d6kh` means `4d6kh1`.

| Notation | Meaning |
|----------|---------|
| `khN` / `kN` | Keep the highest `N` — `4d6kh3` |
| `klN` | Keep the lowest `N` — `2d20kl1` (disadvantage) |
| `dhN` / `dlN` | Drop the highest / lowest `N` — `4d6dl1` |
| `!` | Explode: a max roll adds another die |
| `!!` | Compound explode: extra dice fold into the original die's value |
| `!p` | Penetrating explode: each extra die takes a −1 penalty |
| `!<cmp>` | Explode on a threshold instead of the max face — `1d6!>=5`, `5d10!=10` |
| `r<cmp>` | Reroll recursively while the condition holds — `2d6r<2` |
| `ro<cmp>` | Reroll once, keeping the second result — `2d6ro<3` |
| `minN` / `maxN` | Clamp each die's value — `4d6min2` lifts 1s to 2, `4d6max5` caps 6s at 5 |
| `s` / `sa` / `sd` | Sort ascending / ascending / descending — display only |
| `cs` / `cs<cmp>` | Override the crit threshold — bare `cs` means "max face" |
| `cf` / `cf<cmp>` | Override the fumble threshold — bare `cf` means "1" |

`<cmp>` is a comparator (`>`, `>=`, `<`, `<=`, `=`) plus a value, which may
itself be an expression: `1d6!>(1d2+3)`. In `5d10!=10` the `!` is the explode
operator and `=10` is its threshold — it reads "explode on a 10", not "explode
on not-ten". Explode and reroll always need an explicit comparator: `2d6r1` is
a syntax error, `2d6r=1` is not.

Chained keep/drop modifiers do **not** nest. `4d6kh3dl1` flattens into two
specs applied independently to the same pool, with the dropped sets unioned —
the Roll20 rule.

### Pools and checks

| Notation | Meaning |
|----------|---------|
| `<cmp>T` | Count dice meeting the threshold as successes — `10d10>=6` |
| `fT` / `f<cmp>T` | Subtract dice meeting the failure threshold — `10d10>=6f1`, `10d10>=6f<=2` |
| `<roll> vs <dc>` | PF2e degree of success, with nat-20/nat-1 upgrade and downgrade |
| `{a, b}khN` | Grouped roll: each sub-roll's subtotal competes as one compound die |
| `{a+b}khN` | Single-sub-roll group: keep/drop selects across the flattened pool |

> [!IMPORTANT]
> Success counting is **terminal** — nothing may wrap it, so `10d10>=6 + 2` is
> a parse error. Put the arithmetic inside the threshold: `10d10>=(4+2)`.

> [!WARNING]
> A bare `d` after a dice expression is rejected: `4d6d1` throws
> `AMBIGUOUS_DICE_CHAIN`. Write `4d6dl1` to drop a die, or `(4d6)d1` if you
> really meant nested dice.

## Recipes by game system

Every notation below links to a live roll in the
[playground](https://roll-parser.edloidas.io/).

| System | Notation | What it does |
|--------|----------|--------------|
| D&D 5e | [`4d6kh3`](https://roll-parser.edloidas.io/?d=4d6kh3) | Roll an ability score |
| D&D 5e | [`2d20kh1+7`](https://roll-parser.edloidas.io/?d=2d20kh1%2B7) | Attack with advantage |
| D&D 5e | [`2d6ro<3+4`](https://roll-parser.edloidas.io/?d=2d6ro%3C3%2B4) | Great Weapon Fighting — reroll 1s and 2s once |
| D&D 5e | [`8d6`](https://roll-parser.edloidas.io/?d=8d6) | Fireball damage |
| Pathfinder 2e | [`1d20+12 vs 20`](https://roll-parser.edloidas.io/?d=1d20%2B12%20vs%2020) | Check against a DC, with degrees of success |
| World of Darkness | [`7d10>=6f1`](https://roll-parser.edloidas.io/?d=7d10%3E%3D6f1) | Successes with a botch threshold |
| World of Darkness | [`5d10!=10>=8`](https://roll-parser.edloidas.io/?d=5d10!%3D10%3E%3D8) | 10-again, successes on 8+ |
| Shadowrun | [`12d6>=5`](https://roll-parser.edloidas.io/?d=12d6%3E%3D5) | Count hits on 5 or 6 |
| Fate | [`4dF+2`](https://roll-parser.edloidas.io/?d=4dF%2B2) | Four Fudge dice plus a skill |
| Savage Worlds | [`{1d8!, 1d6!}kh1`](https://roll-parser.edloidas.io/?d=%7B1d8!%2C%201d6!%7Dkh1) | Trait die vs. exploding wild die |
| Call of Cthulhu | [`d%`](https://roll-parser.edloidas.io/?d=d%25) | Percentile roll |

```typescript
// Pathfinder 2e — the natural d20 face drives the degree upgrade
const check = roll('1d20+7 vs 15', { rng: createMockRng([12]) });
check.degree; // DegreeOfSuccess.Success (2)
check.natural; // 12
check.rendered; // '1d20[12] + 7 vs 15 = Success'

// World of Darkness — successes and failures are tallied separately
const pool = roll('10d10>=6f1', { seed: 'demo' });
pool.total; // 5 — successes minus failures
[pool.successes, pool.failures]; // [7, 2]
```

## Working with results

### RollResult

| Field | Type | Notes |
|-------|------|-------|
| `total` | `number` | Final total. Always finite — overflow throws instead |
| `notation` | `string` | Exactly what you passed in |
| `expression` | `string` | Normalized form; meta-expressions appear as their resolved values |
| `rendered` | `string` | Markdown breakdown with per-die markers |
| `rolls` | `DieResult[]` | Every die in order: `sides`, `result`, `modifiers`, `critical`, `fumble` |
| `parts` | `RollPart` | Typed evaluation tree mirroring the AST 1:1 |
| `successes` / `failures` | `number?` | Present only when success counting was used |
| `degree` / `natural` | `DegreeOfSuccess?` / `number?` | Present only for a top-level `vs` |

`Readonly` at the top level and fully JSON-serializable — this is exactly what
the CLI's `--json` flag prints.

```typescript
JSON.stringify(roll('3d6', { rng: createMockRng([4, 2, 6]) }));
```

```json
{
  "total": 12,
  "notation": "3d6",
  "expression": "3d6",
  "rendered": "3d6[4, 2, 6] = 12",
  "rolls": [
    { "sides": 6, "result": 4, "modifiers": ["kept"], "critical": false, "fumble": false },
    { "sides": 6, "result": 2, "modifiers": ["kept"], "critical": false, "fumble": false },
    { "sides": 6, "result": 6, "modifiers": ["kept"], "critical": true, "fumble": false }
  ],
  "parts": { "type": "dice", "count": 3, "sides": 6, "rolls": ["…"], "total": 12, "start": 0, "end": 3 }
}
```

> [!NOTE]
> `rolls[]` and the `rolls[]` inside `parts` hold the *same* `DieResult`
> objects — no deep clone, so annotating a die is visible through both views.

### The parts tree

`result.parts` is a 16-variant discriminated union mirroring the AST one-to-one.
Each part carries its sub-total, its resolved thresholds, and the `start`/`end`
offsets of the notation it came from.

```typescript
import type { RollPart } from 'roll-parser';

function describe(part: RollPart): string {
  switch (part.type) {
    case 'literal':
      return String(part.value);
    case 'dice':
      return `${part.count}d${part.sides}[${part.rolls.map((d) => d.result).join(', ')}]`;
    case 'binaryOp':
      return `${describe(part.left)} ${part.operator} ${describe(part.right)}`;
    case 'keepDrop':
      return `${describe(part.target)} [${part.specs.length} keep/drop]`;
    default: // fateDice, variable, grouped, unaryOp, explode, reroll,
      return part.type; // successCount, versus, functionCall, group, sort, critThreshold
  }
}

describe(roll('4d6kh3 + 2', { rng: createMockRng([3, 6, 2, 5]) }).parts);
// '4d6[3, 6, 2, 5] [1 keep/drop] + 2'
```

Invariants worth relying on: `result.parts.total === result.total`,
`successCount.total === successes - failures`, and every part's `rolls[]`
sharing references with `result.rolls`. A `sort` part's `rolls[]` is its
target's pool in sorted order — chained sorts (`4d6s sd`) nest, and the
outermost one holds the order `rendered` shows.

Meta-expressions do **not** appear as nested parts. `(1d4)d6`, `4d6kh(1d2)`, and
`1d6!>(1d2+3)` surface only their resolved numbers in the owning part; their
dice land in `result.rolls` tagged `'meta'` so an audit log can still show them.

### Rendering

`result.rendered` uses markdown markers, so a Discord bot or chat log can print
it as-is: `~~n~~` for a die dropped by keep/drop or group selection, `**n**` for
a success, `__n__` for a failure.

```typescript
roll('4d6kh3', { seed: 'demo' }).rendered; // '4d6[1, 6, ~~1~~, 3] = 10'
roll('4d6sd', { seed: 'demo' }).rendered; // '4d6sd[6, 3, 1, 1] = 11'

// Source spans map any sub-total back onto the characters the user typed
const { start, end } = roll('4d6kh3 + 2', { seed: 'demo' }).parts; // 0, 10
```

The render prefix echoes explode, reroll, min/max, sort, crit, and
success-count modifiers, but **not** keep/drop — `4d6kh3` renders as `4d6[…]`
while `8d6!` renders as `8d6![…]`. Read `result.expression` when you need the
modifier back.

## Randomness

Every die is drawn through the `RNG` interface — no roll path bypasses the RNG
you chose. `Math.random()` appears in exactly one place: seeding a `SeededRNG`
when you do not supply a seed — the auto-seed hashes `Date.now()` together with
two `Math.random()` draws, giving roughly 100 bits of width rather than the 32 an
XOR of clock and one draw would cap it at. That width is what keeps two
auto-seeded generators from landing on the same stream; it is not a claim about
unpredictability, which stays bounded by however the host engine seeds
`Math.random()`. Pass a seed or your own `RNG` and it is never reached.

```typescript
type RNG = {
  next(): number; // float in [0, 1)
  nextInt(min: number, max: number): number; // integer in [min, max]
};
```

### Seeded rolls

`roll(notation)` builds a fresh `SeededRNG` (xoshiro128\*\*, period 2^128 − 1) per
call. Pass `seed` to make it reproducible, or `rng` to supply your own instance
— `rng` wins when both are given.

Behind a seed sit three stages. cyrb128 hashes the seed into all four state
words, so the full 128 bits are seeded rather than a single word; xoshiro128\*\*
generates the stream; and `nextInt` maps each draw onto the die's faces by
rejection sampling, discarding the values that would make a plain `% sides`
favour the low faces. Seeds are stringified before hashing — numeric seeds keep
all 53 exact bits instead of truncating to 32, unrelated strings are
overwhelmingly unlikely to land on the same state, and `42` and `'42'` name the
same stream.

```typescript
import { SeededRNG, roll } from 'roll-parser';

roll('2d6+3', { seed: 'demo' }).total; // 10, every time

// An injected instance keeps advancing; `{ seed }` restarts the stream
const rng = new SeededRNG('demo');
roll('1d20', { rng }).total; // 1
roll('1d20', { rng }).total; // 20
```

The same seed and the same notation produce the same dice for the lifetime of a
major version, with one narrow exception for distribution bugs — see
[Versioning](#versioning) for the exact promise. Across majors they do not: the
mapping changed between 3.0.0-beta.0 and 3.0.0. The generator is also not
cryptographically secure. If a roll has to survive an upgrade, persist the
`RollResult`, not the seed.

### Replay and save/resume

`SeededRNG` can hand out its internal state as an `RngState` — a format version
followed by four unsigned 32-bit words — and take one back through its
constructor. Restoring copies the words verbatim, with no re-hashing and no
warm-up draws, so the resumed stream continues exactly where the snapshot was
taken. That holds for snapshots `state()` produced — the type is the contract,
and within the current version a hand-built tuple is coerced to 32 bits per
word rather than rejected.

That answers the question an auto-seeded roll otherwise cannot. `roll('1d20')`
mints a seed and discards it; snapshot the state first and the roll is
reproducible after the fact:

```typescript
import { SeededRNG, roll } from 'roll-parser';

const rng = new SeededRNG(); // auto-seeded, seed discarded
const snapshot = rng.state();

const first = roll('1d20', { rng });
const replay = roll('1d20', { rng: new SeededRNG(snapshot) });
first.total === replay.total; // true
```

The same snapshot is what a mid-session save writes: it is a plain tuple, so
`JSON.stringify` round-trips it, and loading it resumes the campaign's dice
rather than restarting them.

> [!WARNING]
> `state()` is for replay and save/resume, **not** for forking substreams. A
> restored generator resumes the parent's stream verbatim, so two children taken
> a few draws apart replay the same sequence at an offset — their rolls predict
> each other exactly. xoshiro has no jump function here to separate them.

To give each entity its own stream, derive a seed per entity instead. cyrb128
sends unrelated strings to states that are overwhelmingly unlikely to coincide,
which is what makes this work:

```typescript
import { SeededRNG } from 'roll-parser';

const goblin = new SeededRNG('world:goblin');
const orc = new SeededRNG('world:orc');

goblin.nextInt(1, 20); // 9
orc.nextInt(1, 20); // 1
```

`RngState` carries the same version binding as a seed: the words are opaque, and
a release that changes the engine behind them bumps the leading version. A
snapshot from a different version is rejected with an `INCOMPATIBLE_RNG_STATE`
error rather than resumed under the wrong semantics, so a save file that
outlives the promise fails loudly:

```typescript
import { SeededRNG } from 'roll-parser';

const foreign = [0, 1, 2, 3, 4] as const; // a version this build does not speak

new SeededRNG(foreign); // throws 'INCOMPATIBLE_RNG_STATE'
```

### Custom RNGs

Anything structurally matching `RNG` works, so a crypto-backed or table-driven
generator drops straight in:

```typescript
import { roll, type RNG } from 'roll-parser';

const cryptoRng: RNG = {
  next: () => crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32,
  nextInt: (min, max) => min + Math.floor(cryptoRng.next() * (max - min + 1)),
};

roll('4d6kh3', { rng: cryptoRng });
```

### Testing

`roll-parser/testing` is a ≈215 B entry point holding the mock RNG.

```typescript
import { createMockRng, MockRNGExhaustedError } from 'roll-parser/testing';

roll('3d6', { rng: createMockRng([4, 2, 6]) }).total; // 12

try {
  roll('4d6', { rng: createMockRng([1, 2, 3]) });
} catch (error) {
  error instanceof MockRNGExhaustedError; // true
  (error as MockRNGExhaustedError).consumed; // 3
}
```

The mock is deliberately strict so that a miscounted sequence fails loudly
instead of silently passing: it never wraps around, and `nextInt` throws a
`RangeError` when a scripted value falls outside the requested range —
`createMockRng([7])` cannot satisfy a `d6`.

**Draw order.** Values are consumed left to right, one `nextInt` per die. Two
rules cover meta-expressions:

1. **Keep/drop counts are drawn before the pool** — the evaluator resolves the
   modifier chain first, then rolls the dice it selects from. Applies to `kh`,
   `kl`, `dh`, `dl`.
2. **Threshold expressions are drawn after the pool** — explode, reroll,
   min/max, crit-threshold, and success-count modifiers post-process a pool
   that already exists, so their thresholds (and clamp bounds like
   `4d6min(1d2)`) resolve later.

`4d6kh(1d2)` with `[1, 5, 3, 4, 6]` — the keep count draws first:

| Draw | Consumed by |
|------|-------------|
| 1 | `1d2`, the keep count → `1` |
| 2–5 | `4d6` pool → `5, 3, 4, 6` |
| | total `6` — the highest die |

`4d6cs>(1d2)` with `[5, 3, 4, 6, 1]` — the threshold draws last:

| Draw | Consumed by |
|------|-------------|
| 1–4 | `4d6` pool → `5, 3, 4, 6` |
| 5 | `1d2`, the crit threshold → `1` |
| | total `18` — all four dice crit against `>1` |

## Options

Everything `roll()` accepts, in one place. `evaluate()` takes the same
options minus `rng`/`seed` (it receives the RNG directly) plus `notation`.

| Option | Default | Effect |
|--------|---------|--------|
| `rng` | fresh `SeededRNG` | Randomness source. Wins over `seed` when both are given |
| `seed` | random | Seeds the per-call `SeededRNG`. Ignored when `rng` is set |
| `context` | `{}` | Values for `@name` / `@{name}` variable references |
| `onMissingVariable` | `'throw'` | A variable absent from `context` throws `UNDEFINED_VARIABLE`; `'zero'` substitutes `0` instead |
| `maxDice` | `10_000` | [Safety limit](#safety-limits): total dice per expression, integer `>= 1` |
| `maxExplodeIterations` | `1_000` | [Safety limit](#safety-limits): explosions per die, integer `>= 0` |
| `maxRerollIterations` | `1_000` | [Safety limit](#safety-limits): recursive rerolls per die, integer `>= 0` |

```typescript
import { roll } from 'roll-parser';

roll('1d20+@prof', { context: { prof: 3 }, seed: 'demo' }).total; // 4
roll('1d20+@prof', { onMissingVariable: 'zero', seed: 'demo' }).total; // 1
```

### Safety limits

Untrusted notation is bounded by default, and every limit can be lowered per
call. `maxDice` counts the total dice across the whole expression —
explosions, rerolls, and meta-expressions included — so `6000d6+6000d6`
breaches the default. `maxExplodeIterations` and `maxRerollIterations` apply
per die.

```typescript
roll('99999d6', { maxDice: 100 }); // throws, code 'DICE_LIMIT_EXCEEDED'
```

The limits themselves are validated, and they fail closed. Omit one — or pass
`undefined` or `null`, which a partial config or a JSON body produces — and it
takes its default; supply anything else that is not a safe integer in range and
the call throws `INVALID_EVALUATION_LIMIT` before rolling a single die. There is
no coercion: `maxDice: Number(untrusted)` rejects bad input rather than quietly
reverting to the permissive default.

| Supplied `maxDice` | Result |
|--------------------|--------|
| omitted, `undefined`, `null` | `10_000` — the default |
| `100` | `100` |
| `'100'` | throws `INVALID_EVALUATION_LIMIT` |
| `NaN`, `Infinity`, `-Infinity` | throws `INVALID_EVALUATION_LIMIT` |
| `0`, `-1` | throws `INVALID_EVALUATION_LIMIT` |
| `0.5`, `2.9` | throws `INVALID_EVALUATION_LIMIT` |

`maxExplodeIterations` and `maxRerollIterations` follow the same rules, except
that `0` is valid — it disables the modifier's recursion rather than rejecting
every roll.

```typescript
roll('1d6', { maxDice: 0 }); // throws, code 'INVALID_EVALUATION_LIMIT'
```

One limit is not configurable: expression nesting is capped at
`MAX_PARSE_DEPTH` (128). Deeply nested input — 20,000 parentheses, say —
throws a typed `MAX_DEPTH_EXCEEDED` instead of blowing the stack, which keeps
`isRollParserError` a complete filter for adversarial input.

## Error handling

Every failure raised by lexing, parsing, evaluation, or options validation
extends `RollParserError` and carries a stable `code`. Two failures do not, and
both need an injected mock to occur — see [Errors outside the
hierarchy](#errors-outside-the-hierarchy). Use
`isRollParserError` as the outer filter — anything it rejects came from
somewhere else, so rethrow it. What it does *not* tell you is whose fault the
failure was: it answers `true` for bad notation, for a bad options object, and
for a broken invariant in here alike, so it is the wrong test to hang a
user-facing message on. [`isNotationError`](#notation-errors) is that test.
Library errors carry a brand on their prototype, so unlike
`instanceof` the filter still matches an error thrown in an iframe or a `vm`
context, or by a second copy of the library in `node_modules` at 3.0.0 or newer.
It is a brand and not a `code` sniff, so a foreign error whose own `code` happens
to collide with one of ours is rejected rather than reported to your user as a
bad roll. Holding the brand is proof of origin, so the `code` is trusted rather
than checked against this build's list — an error from a newer minor passes
carrying a code this version has never heard of.

```typescript
import { isRollParserError, roll } from 'roll-parser';

try {
  roll(userInput);
} catch (error) {
  if (!isRollParserError(error)) throw error;
  console.error(error.code, error.message);
}
```

That filter is complete for untrusted input, including input that is not a
string at all. `notation` is typed `string`, but the APIs that produce it hand
you `string | null` — an absent slash-command option, a missing JSON field — so
a non-string is checked at the boundary and reported as `INVALID_NOTATION_TYPE`
rather than escaping as a bare `TypeError`:

```typescript
roll(null as unknown as string); // throws, code 'INVALID_NOTATION_TYPE'
```

One boundary the filter cannot cross is a worker. `postMessage` and
`structuredClone` rebuild an `Error` from `message` and `stack` alone — `code`,
`name`, and the prototype are all discarded — so a roll-parser error that
arrives from a worker is no longer recognizable as one. Roll inside the worker
and post the parts you need:

<!-- readme-test: skip -->

```typescript
try {
  post({ ok: true, total: roll(notation).total });
} catch (error) {
  if (!isRollParserError(error)) throw error;
  post({ ok: false, code: error.code, message: error.message });
}
```

### Errors outside the hierarchy

Two failures can surface from `roll()` without extending `RollParserError` or
carrying a `code`, and both come from `roll-parser/testing`:

| Thrown | When |
|--------|------|
| `MockRNGExhaustedError` | a `createMockRng` sequence runs out of values mid-roll |
| `RangeError` | a scripted value falls outside the `[min, max]` a die asked for |

Neither is reachable unless you passed `{ rng: createMockRng(...) }` yourself, so
the filter stays complete for untrusted notation — this is a miscounted test
fixture, not a runtime failure mode, and it is deliberately left un-branded so it
cannot be mistaken for one. `isRollParserError` returns `false` for both, which
means the `if (!isRollParserError(error)) throw error` line above already does
the right thing: the exhausted mock propagates to your test runner and fails the
test, rather than being swallowed by a `catch` written for bad dice notation.

Nothing else in the library documents `instanceof` as the check — for these two
it is the only option, and `MockRNGExhaustedError` exposes `consumed` to tell you
how many draws the sequence supplied before it ran dry. See
[Testing](#testing) for the worked example.

### Notation errors

`isRollParserError` establishes origin; `isNotationError` splits what is left
into "tell the user" and "report a bug". It is `true` only for the codes the
*input* is answerable for, which is all of them but six:

| Excluded code | Why it is not the user's fault |
|---------------|--------------------------------|
| `INVALID_EVALUATION_LIMIT` | a bad `maxDice` / `maxExplodeIterations` / `maxRerollIterations` |
| `INVALID_VARIABLE_VALUE` | a non-finite entry in the `context` you supplied |
| `INCOMPATIBLE_RNG_STATE` | an RNG snapshot from another version |
| `UNKNOWN_NODE_TYPE`, `UNKNOWN_OPERATOR`, `UNKNOWN_FUNCTION` | a hand-built AST, or a bug in here |

So a bot that treats every `isRollParserError` as bad notation answers "check
your dice" to `maxDice: '100'` — its own bug — and to a broken library
invariant. Branch on both:

```typescript
import { isNotationError, isRollParserError, roll } from 'roll-parser';

try {
  roll(userInput);
} catch (error) {
  if (!isRollParserError(error)) throw error;
  if (isNotationError(error)) console.log(`Bad notation: ${error.message}`);
  else console.error('a bug, not a typo:', error.code);
}
```

The subset is exported as `NOTATION_ERROR_CODES`, with `NotationErrorCode` as its
union — `isNotationError` narrows `code` to that union, so a message catalog
keyed by it stays exhaustive without covering the six.

Two boundaries are worth knowing. `DIVISION_BY_ZERO`, `MODULO_BY_ZERO`, and
`NON_FINITE_RESULT` are included because notation alone reaches them (`1d6/0`,
`10**400`), but a `context` variable reaches them too — a `true` is not proof the
notation was at fault. And unlike `isRollParserError`, which trusts the brand and
never re-reads the code, `isNotationError` has to check the code against the list
this build carries: an error from a *newer* copy of the library, carrying a
notation code added after your build, reads as `false` and lands in the bug
branch. That is the safe direction, but keep versions aligned when the
distinction drives more than a message.

### Error classes

| Class | Stage | Extra fields |
|-------|-------|--------------|
| `RollParserError` | base | `code` |
| `LexerError` | lexing | `position`, `character` |
| `ParseError` | parsing | `position`, `token` |
| `EvaluatorError` | evaluation | `nodeType`, `start`, `end` |

Error messages never embed the source position. Read it from the class fields,
or read it uniformly through `getErrorSpan`.

### Error codes

`RollParserErrorCode` is a union of 34 codes today — match on the code, not the
message, and give the `switch` a `default` arm: new codes arrive in minor
releases (never patches), so an exhaustive switch would turn a minor upgrade
into a silent fall-through. See [Versioning](#versioning) for the full policy.
The ones you will meet first: `EXPECTED_TOKEN` and
`UNEXPECTED_TOKEN` for malformed notation, `AMBIGUOUS_DICE_CHAIN` for `4d6d1`,
`UNDEFINED_VARIABLE` for a `@name` missing from `context`, and
`DICE_LIMIT_EXCEEDED` when a [safety limit](#safety-limits) trips. The full
list lives in the [API reference](https://roll-parser.edloidas.io/docs/).

### Source spans

`getErrorSpan` normalizes the lexer/parser `position` and the evaluator
`start`/`end` into one shape — enough to underline the failure:

```typescript
const span = getErrorSpan(error); // { start } or { start, end }, or undefined
if (span != null) {
  const width = (span.end ?? span.start + 1) - span.start;
  console.log(notation);
  console.log(' '.repeat(span.start) + '^'.repeat(width));
}

// 2d6+&            2d6+1d0+3
//     ^                ^^^
```

## Using the parser directly

`roll` is `evaluate(parse(notation), rng)`. Split it to validate without
rolling, or to roll the same notation many times.

```typescript
import { evaluate, lex, parse, SeededRNG } from 'roll-parser';

parse(userInput); // validate, consuming no randomness

// Parse once, roll many — skips lexing and parsing after the first roll
const ast = parse('4d6kh3');
const rng = new SeededRNG('demo');
const scores = Array.from({ length: 6 }, () => evaluate(ast, rng).total);

lex('2d20+5'); // [NUMBER, DICE, NUMBER, PLUS, NUMBER, EOF] — for editor integrations
```

`ASTNode` is a discriminated union of 16 node types with a type guard for each,
so a walker narrows without casts:

```typescript
import { type ASTNode, isBinaryOp, isDice, isLiteral, parse } from 'roll-parser';

function countPools(node: ASTNode): number {
  if (isDice(node)) return 1;
  if (isLiteral(node)) return 0;
  if (isBinaryOp(node)) return countPools(node.left) + countPools(node.right);
  return 'target' in node ? countPools(node.target) : 0;
}

countPools(parse('2d6+3')); // 1
```

`DiceNode.count` and `DiceNode.sides` are full sub-expressions rather than
numbers — that is what makes `(1d4)d6` expressible.

## TypeScript

Every public symbol is typed and documented in the generated
[API reference](https://roll-parser.edloidas.io/docs/). The
types you name in practice are few — `RollResult` and `RollPart` for reading
results, `RollOptions` and `RNG` for configuring a roll, `ASTNode` for walking
the syntax tree, `RollParserErrorCode` for handling failures — and the rest
(`Token` from `lex`, `ErrorSpan` from `getErrorSpan`, and the like) arrives
through inference from the functions that return it.

`RollPart` and `ASTNode` are both discriminated unions, so a `switch` over the
discriminant narrows each arm to the right variant. Give it a `default` arm
anyway — new notation means new variants, and those arrive in minor releases
(see [Versioning](#versioning)). `RollPart` discriminants are camelCase
(`'binaryOp'`), `ASTNode` discriminants PascalCase (`'BinaryOp'`), which keeps
the two trees distinguishable at a glance.

Type resolution across module settings ([see Install](#install)) is verified
in CI by `@arethetypeswrong/cli` and `publint`.

## CLI

<!-- readme-test: skip -->

```bash
npx roll-parser 2d6+3
```

```
Usage: roll-parser [options] [--] <notation>

Options:
  -h, --help       Show this help message
  --version        Show version number
  -v, --verbose    Show detailed roll breakdown
  --json           Print the whole result as compact JSON (wins over --verbose)
  --seed <value>   Use seed for reproducible rolls
  --               Treat every following argument as notation
```

```bash
$ roll-parser 2d6+3 --seed demo
10

$ roll-parser 4d6kh3 --verbose --seed demo
4d6[1, 6, (1), 3] = 10

$ roll-parser "1d20+7 vs 15" --json --seed demo
{"total":8,"notation":"1d20+7 vs 15","expression":"1d20 + 7 vs 15","rendered":"1d20[1] + 7 vs 15 = Critical Failure",...}

$ roll-parser "2d6+1d0+3"
Error: Invalid dice sides: 0
  2d6+1d0+3
      ^

$ roll-parser --seed demo -- -1d6+3
2
```

Verbose mode rewrites the markdown markers for plain terminals: `~~n~~` becomes
`(n)`, `**n**` becomes `[n]`, `__n__` becomes `{n}`. `--seed` takes both
`--seed value` and `--seed=value`, and accepts any non-empty value including a
dash-prefixed one. `--help` and `--version` win over any usage error that
precedes them. Errors go to stderr; only the result goes to stdout.

| Exit code | Meaning |
|----------:|---------|
| `0` | Success |
| `1` | Roll or parse error |
| `2` | Usage error — unknown option, missing notation |

## Performance

| Notation | `lex` | `parse` | `roll` (end to end) |
|----------|------:|--------:|--------------------:|
| `1d20` | 85 ns | 164 ns | **0.49 µs** (~2.0M rolls/s) |
| `2d6+3` | 98 ns | 215 ns | **0.77 µs** |
| `4d6kh3` | 122 ns | 245 ns | **1.2 µs** |
| `10d10>=6f1` | 161 ns | 336 ns | **2.0 µs** |
| `100d6` | 82 ns | 168 ns | **2.6 µs** |

The `roll` column pays for a fresh `SeededRNG` per call, which an injected RNG
avoids. Every roll also builds the `parts` tree; there is no opt-out and these
numbers include it. A 1000-die pool costs roughly 47x a `1d20` (~23 µs here),
while lexing and parsing stay flat at ~84 / ~168 ns.

<details>
<summary>Measurement protocol</summary>

Values are **p50**, from
[mitata](https://github.com/evanwashere/mitata) with forced per-iteration GC
(`.gc('inner')`), taken as the per-record median of four full
`bun run bench:json` passes, every row agreeing within 5% except
`lex / 4d6kh3` at 7%. Measured 2026-08-05 on Bun
1.3.14, Apple M2 Pro, macOS, idle and on AC power. The `4d6kh3` and
`10d10>=6f1` `roll` figures were re-measured 2026-08-06 over three passes
agreeing within 4%, after per-die `'dc'` tag checks entered the keep/drop and
success-count paths; the remaining rows re-measured within noise. Read them as
two significant digits: another machine shifts every row, and a busy one
inflates the heavy cases most.

p50 rather than mean, because the mean here is effectively a GC-pause
histogram and swings ±40% between processes. Every bench body is JIT-primed
before measurement and pinned to mitata's batched sampling mode, so all cases
are timed the same way — mitata otherwise picks the mode from cold calls and
mis-times mid-weight cases by 10-30x.

</details>

Run `bun run bench` for the full suite, or `bench:lex` / `bench:parse` /
`bench:evaluate` / `bench:roll` for one stage. Cross-library numbers live in
the [competitor suite](https://github.com/edloidas/roll-parser/tree/master/bench/competitors)
(`bun run bench:competitors`). Every push to `master` publishes its p50s to a
[trend chart](https://edloidas.io/roll-parser/dev/bench/), and CI comments on
any commit that regresses a case past 1.75x. Bundle size is gated in CI by
`size-limit`; the budgets live in `package.json`.

## Known limitations

- **Keep/drop does not echo into the render prefix.** `4d6kh3` renders as
  `4d6[1, 6, ~~1~~, 3] = 10`, while every other modifier family does echo
  (`8d6![…]`, `4d6sd[…]`, `10d10>=6f1[…]`). The dropped die is still marked;
  only the `kh3` is missing, and `result.expression` has it.
- **`4d6d1` is a parse error, not "drop 1".** The bare `d` is the dice
  operator, and reading `4d6d1` as "roll 4d6, then roll that many d1" is a
  silent trap, so it throws `AMBIGUOUS_DICE_CHAIN`.
- **Threshold comparisons bind tight.** `1d6!>=5+2` parses as `(1d6!>=5)+2`;
  parenthesize for a computed threshold, `1d6!>=(5+2)`. Success counts bind the
  same way but are terminal, so `1d6>=5+2` errors outright — write
  `1d6>=(5+2)`.
- **`result.expression` substitutes meta-expressions with their resolved
  values,** so it does not round-trip through `parse` when they are present:
  `roll('(1d4)d6').expression` is `'4d6'` when the `1d4` rolled 4, and
  `roll('1d6!>(1d2+3)').expression` is `'1d6!>5'`.
- **Sort flattens additive pools.** `(2d6+1d8)s` renders as one combined sorted
  list, `(2d6 + 1d8)s[2, 3, 6] = 11`, rather than `2d6[2, 6] + 1d8[3]`. Totals
  are unaffected; only the breakdown loses pool boundaries.
- **Outer parentheses drop when crit thresholds collapse.** `(1d20cs>19)cs=1`
  reports `expression: '1d20cs>19cs=1'` because chained `cs`/`cf` fold into one
  node. It re-parses to the same AST; only the text differs.
- **Sorting a multi-sub-roll group is rejected.** `{2d6, 1d8}s` throws
  `INVALID_SORT_TARGET`. Spec-correct sorting there is hierarchical — dice
  within each sub-roll, then sub-rolls by total — and the evaluator only
  flat-sorts, so the syntax is refused rather than shipped wrong. Single
  sub-roll groups (`{2d6+1d8}s`) still work as the flat-pool escape hatch.
- **Division does not floor.** `7/2` totals `3.5`, not `3` — arithmetic is plain
  IEEE-754 throughout. Wrap it when you need an integer: `floor(7/2)` totals `3`.
- **The power operator has no overflow guard.** `2**999` totals `5.357…e+300`.
  Only a non-finite result throws `NON_FINITE_RESULT`, so finite-but-enormous
  totals pass through unflagged.
- **Integer literals above `Number.MAX_SAFE_INTEGER` lose precision.** Totals are
  JavaScript numbers, so `9007199254740993` evaluates to `9007199254740992`. Dice
  `sides` past that ceiling are rejected with `INVALID_DICE_SIDES`, but plain
  literals are not.

## Versioning

[Semantic Versioning](https://semver.org/spec/v2.0.0.html), with the type-level
and randomness details spelled out below, because for a library like this one
they are where "breaking" is ambiguous.

**Unions are open.** `RollParserErrorCode`, `RollPart`, `ASTNode`, `TokenType`,
and `DieModifier` all gain members in minor releases — new notation means new
node types, new part types, and new error codes. Give every `switch` over them
a `default` arm. Members are only ever removed or renamed in a major.

**Types.** Widening a parameter, adding an optional option, and adding a field
to a returned object are all minor. Removing or narrowing anything you can name
from the public entry points is major. Every type reachable from a public
signature is exported — you should never need to reach into `dist/`.

**Randomness is stable within a major.** The seed → dice mapping holds for the
lifetime of a major version: the same seed and notation keep producing the same
dice across patches and minors, which is what makes seeds usable for replay and
test fixtures. One exception, and it is narrow — a genuine distribution bug
(bias, faulty rejection sampling) may change the mapping in a **minor** release,
never silently in a patch, and always with a `BREAKING` note in the changelog.
`RngState` snapshots carry the same binding and enforce it: they are stamped
with a format version, and restoring one from another version throws
`INCOMPATIBLE_RNG_STATE` instead of resuming a stream that never existed. If you
need a roll to survive a major upgrade, persist the `RollResult`, not the seed or
the state.

**What is deliberately mutable.** `RollResult.rolls` and the `parts` tree stay
mutable so you can annotate your own views; the AST and tokens are typed
`readonly` throughout, so the compiler rejects mutating a parsed node or token
in place. See [Working with results](#working-with-results).

**Runtimes.** The supported floor is Node ≥ 22.12, current Bun, current Deno,
Cloudflare Workers, any browser with ES2022, and TypeScript ≥ 5.0 for the
shipped types. Raising a floor or dropping a runtime is a major. The library
imports no `node:` builtins, and Node, Deno, Cloudflare Workers, and the browser
each install the packed tarball in CI and assert a known roll from it — headless
Chromium for the browser claim, Deno's npm resolution for Deno, and local
`workerd` for Workers. Bun is the development runtime and runs the full test
suite instead. Other edge runtimes are not in the matrix, but nothing in the
library is aimed at a specific host.

## Contributing

Bug reports, notation gaps, and pull requests are welcome — open an
[issue](https://github.com/edloidas/roll-parser/issues) to start. See
[CONTRIBUTING.md](CONTRIBUTING.md) for the Bun-only toolchain, the pre-commit
hook, commit conventions, and the release flow.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.io)
