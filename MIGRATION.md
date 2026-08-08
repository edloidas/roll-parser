# Migration notes

Newest first. [Upgrading from 3.1.0 to 3.2.0](#upgrading-from-310-to-320) ·
[Upgrading from 3.0.0 to 3.1.0](#upgrading-from-300-to-310) ·
[Migrating from v2 to v3](#migrating-from-v2-to-v3) ·
[Upgrading from a v3 pre-release](#upgrading-from-a-v3-pre-release)

## Upgrading from 3.1.0 to 3.2.0

Nothing was removed and no type changed, and the seed → dice mapping is
untouched — the same seed and notation roll the same faces they did in 3.1.0.
The whole of this section is one fix to penetrating explode and the three
places its output is visible.

**`!p` continuation dice now carry `initialResult`.** A penetrating explosion
stores `raw - 1` on each die it appends, and used to record the face it
replaced nowhere, so the `initialResult ?? result` idiom `DieResult` documents
returned the decremented value and a natural 20 was indistinguishable from a
19.

```typescript
import { roll } from 'roll-parser';
import { createMockRng } from 'roll-parser/testing';

const die = roll('1d20!p', { rng: createMockRng([20, 20, 5]) }).rolls[1];

die.result; // 19
die.initialResult; // 20 — was `undefined`
```

Standard `!` is unchanged: its appended dice store what they rolled, so they
still carry no `initialResult`. Two things can bite:

- **Deep-equality assertions against a `!p` pool fail.** The appended dice gain
  a field. Assert on what you care about, or add `initialResult` to the
  expected die.
- **`--json` and `JSON.stringify(result)` payloads grow** by one number per
  appended `!p` die. Expressions without `!p` are unchanged.

**Bare `cs`/`cf` judges a `!p` die by the face it rolled.** The side you do not
override reads the natural face, which now exists on these dice — so a
continuation that rolled its maximum is critical even though it displays one
less, matching the flags plain `1d6!p` already set.

```typescript
import { roll } from 'roll-parser';
import { createMockRng } from 'roll-parser/testing';

const result = roll('1d6!pcf>5', { rng: createMockRng([6, 6, 3]) });

result.rendered; // '1d6!pcf>5[6, 5, 2] = 13'
result.rolls[1].critical; // true — was `false`, judged by the stored 5
```

`1d6cf>5!p` and `1d6!pcf>5` now agree. 3.1.0's README documented them as
disagreeing, and [Modifiers](README.md#modifiers) is rewritten to match: an
explicit threshold is still a predicate over a die's current `result`, so `!!`,
`minN`, and `maxN` remain order-sensitive.

**One `vs` case stops discarding its natural face.** A clamped explosion
continuation used to be counted as a second primary d20, and two primaries
suppress the natural 20 / natural 1 step.

```typescript
import { DegreeOfSuccess, roll } from 'roll-parser';
import { createMockRng } from 'roll-parser/testing';

const result = roll('1d20!min5 vs 30', { rng: createMockRng([20, 2, 12]) });

result.natural; // 20 — was `undefined`
result.degree === DegreeOfSuccess.Success; // true — was `Failure`
```

This needs a `vs` whose roll side both appends explosion dice and clamps them.
Without the clamp — `1d20! vs 30` — the continuation never looked like a
primary, and those degrees are unchanged.

## Upgrading from 3.0.0 to 3.1.0

Nothing was removed and no behaviour changed: `total`, `expression`, `rendered`,
`rolls`, and `degree` are byte-identical to 3.0.0 for every expression. The
whole of this section is about one added field.

**`RollPart` gained `rolls` on three variants.** The `explode`, `reroll`, and
`successCount` members now carry `rolls: DieResult[]` — the pool the modifier
produced — joining `sort`, which always had it. They needed it: standard and
penetrating explosions and both reroll forms *append* dice, and those dice
appeared nowhere in the part tree, so a part could not describe its own output.

<!-- readme-test: skip -->
```typescript
// 3.0.0 — the explosion die is missing from the tree
roll('2d6!').parts.target.rolls.length; // 2, but `rendered` shows three dice

// 3.1.0 — the modifier carries the pool it actually rendered
roll('2d6!').parts.rolls.length; // 3
```

Per the [versioning policy](README.md#versioning), adding a field to a returned
object is a minor. Reading `parts` is unaffected and needs no change. Three
things can still bite:

- **Constructing one of those parts stops compiling** — `TS2322: Property
  'rolls' is missing in type … but required`. This is only reachable in test
  fixtures and mocks, since no library function accepts a `RollPart`. Add the
  pool, or widen the annotation.
- **Deep-equality assertions against those parts fail.** Add `rolls` to the
  expected object, or assert on the fields you care about instead of the whole
  part.
- **`--json` and `JSON.stringify(result)` payloads grow** for expressions using
  explode, reroll, or success counting, because the pool is serialized on the
  modifier as well as on its target — roughly +40% to +96% depending on pool
  size. Expressions without those modifiers are unchanged. Budget for it if you
  log, cache, or ship results over a wire.

**The CLI renders nested dropped sub-rolls correctly.** `--verbose` on a dropped
group sub-roll nested inside another one used to emit mismatched delimiters —
`{{(1d6[1]), 1d8[4]}, ({)1d10[1](, 1d12[3]})}`. It now emits
`{{(1d6[1]), 1d8[4]}, ({(1d10[1]), 1d12[3]})}`. Anything parsing that output
should be reading `--json` instead.

**New, optional: `roll-parser/render`.** A subpath export whose
`renderBreakdown(result, marks?)` rebuilds the breakdown from `result.parts`
with markers you choose, so you no longer have to regex the markdown out of
`rendered`. With no marks its output is byte-identical to `rendered`, which
makes it a drop-in starting point:

```typescript
import { roll } from 'roll-parser';
import { renderBreakdown } from 'roll-parser/render';
import { createMockRng } from 'roll-parser/testing';

const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });

renderBreakdown(result) === result.rendered; // true
renderBreakdown(result, { dropped: (_die, text) => `(${text})` });
// '4d6[3, 6, (2), 5] = 14'
```

See [Custom markers](README.md#custom-markers) for the six slots and the order
they compose in. Nothing forces you to adopt it — `rendered` is unchanged and
is not deprecated.

## Migrating from v2 to v3

v3 is a full rewrite. Nothing in the 2.x API carries over — the entry points,
the result shape, the error behaviour, and parts of the notation all changed. To
stay on the old line, pin `roll-parser@2.3.2`; it is unmaintained but unaffected
by any of this.

**Packaging.** v2 was CommonJS with a `main` field. v3 is ESM-only and resolves
through `exports`, so Node.js ≥ 22.12 is required and TypeScript needs
`moduleResolution` of `bundler`, `node16`, or `nodenext`. CommonJS callers can
still `require('roll-parser')` on Node ≥ 22.12, where `require(esm)` is
unflagged.

**One entry point instead of thirteen.** v2 exposed a matrix of
`parse*`/`roll*`/`parseAndRoll*` functions plus `Roll`, `WodRoll`, and `Result`
classes. v3 has `roll(notation, options)` for the common path, and
`parse`/`evaluate` when you want the two halves separately.

| v2 | v3 |
|----|----|
| `parseAndRoll(n)`, `parseAndRollClassic(n)`, `parseAndRollWod(n)` | `roll(n)` |
| `parseAndRollSimple(n)` | removed — simple notation is gone, see below |
| `parse(n)` → `Roll`/`WodRoll` data object | `parse(n)` → AST (a different, richer shape) |
| `roll(obj)`, `rollClassic(obj)`, `rollWod(obj)` | `evaluate(parse(n), rng)` |
| `parseClassicRoll(n)`, `parseWodRoll(n)` | `parse(n)` — one grammar covers both, so there is no per-dialect parser |
| `parseSimpleRoll(n)` | removed — simple notation is gone, see below |
| `random(faces)` | `new SeededRNG().nextInt(1, faces)` |
| `convert(obj)`, `Roll`, `WodRoll`, `Result` | removed — there are no roll-description objects to build or convert |

**Result fields moved.** v2 returned `Result { notation, value, rolls }` where
`rolls` was a plain `number[]`. The v3 snippets below draw from
`createMockRng` (exported by `roll-parser/testing`) so their numbers are exact
rather than whatever the dice happened to do:

<!-- readme-test: skip -->
```typescript
// v2
const res = parseAndRoll('2d10+1'); // { notation: '2d10+1', value: 9, rolls: [2, 6] }

// v3 — mock RNG so the numbers below are the actual ones, not a lucky roll
const res = roll('2d10+1', { rng: createMockRng([2, 6]) });
res.total; // 9          — was `value`
res.expression; // '2d10 + 1' — was `notation` (normalized form)
res.notation; // '2d10+1'  — the input string, verbatim
res.rolls.map((die) => die.result); // [2, 6] — `rolls` is now DieResult[]
```

**Invalid input throws instead of returning `null`.** v2's `parse` and
`parseAndRoll` returned `null` for anything they could not read, so failures
were easy to miss. v3 throws a typed error with a stable `code` and a source
span:

<!-- readme-test: skip -->
```typescript
// v2
if (parseAndRoll(input) == null) {
  /* handle */
}

// v3
try {
  roll(input);
} catch (error) {
  if (isRollParserError(error)) error.code; // e.g. 'UNEXPECTED_IDENTIFIER'
  else throw error;
}
```

See [Error handling](README.md#error-handling) for the error classes and span
helpers; the full code list lives in the
[API reference](https://roll-parser.edloidas.io/docs/).

**Notation changes.** Classic notation (`2d10+1`, `d6`) parses unchanged. Two
v2 forms do not:

- **Simple notation is gone.** `2 10 -1` no longer means `2d10-1`. Whitespace is
  now insignificant between tokens rather than a separator, so `2 10 -1` is a
  parse error. Convert these to classic notation.
- **WoD thresholds are inclusive and explicit.** v2's `>N` meant "N or higher",
  so v2 `4d10!>8f1` becomes v3 `4d10!=10>=8f1`. Two things changed: `>` is
  strictly greater-than in v3 (use `>=` for v2's meaning), and an explosion
  combined with a success count needs its own compare point — a bare `!`
  followed by `>=` reads the threshold as the explode target and then fails on
  the `f`.

**Pool totals are no longer clamped.** v2 returned `Math.max(successes -
failures, 0)`, hiding botches below zero. v3 reports the real arithmetic, and
splits the tally out:

```typescript
const pool = roll('4d10>=8f1', { rng: createMockRng([1, 1, 1, 5]) });
pool.total; // -3  — v2 would have reported 0
pool.successes; // 0
pool.failures; // 3
```

**The CLI takes one notation, not a list.** v2 read every positional argument as
a separate roll and printed one line each, falling back to `d20` when you passed
none. v3 joins the positional arguments into a single notation — so `roll-parser
2d6 + 3` works — and treats a missing notation as a usage error (exit code 2)
rather than rolling a d20. A v2 invocation like `roll-parser 1d6 1d8` now fails
to parse; run the CLI twice, or roll `1d6+1d8` if you wanted the sum.

Everything else in v3 is new surface rather than a replacement — the `parts`
tree, injectable RNGs, source spans, safety limits, and the wider notation set
have no v2 equivalent to migrate from. The
[full list of breaking changes](CHANGELOG.md) is in the changelog.

## Upgrading from a v3 pre-release

`3.0.0-alpha.0` and `3.0.0-beta.0` derived a single 32-bit number from the seed
— djb2 for strings, a `>>> 0` truncation for numbers — expanded it with
splitmix32, and ran an xorshift128 core. `3.0.0` replaces all of it: cyrb128
hashes the seed straight into the full 128-bit state, and xoshiro128\*\*
generates the stream. Every seeded sequence therefore changed — the same seed
and notation roll different dice. Nothing in the API moved, so this surfaces
only as tests asserting pinned faces, or as saved games that stored a seed.

The fix is the same one the reproducibility contract has always implied: a seed
is stable within a major version, not across one, so **persist the
`RollResult`** — it holds the totals, the per-die faces, and the rendered
breakdown — rather than re-deriving rolls from a stored seed. Tests that need
exact faces should use `createMockRng` from `roll-parser/testing`, which is
engine-independent.

When you need a live generator to survive a save and resume, snapshot its state
instead of its seed. `state()` returns a format version plus four unsigned
32-bit words that the constructor takes back verbatim, with no re-hashing and no
warm-up:

```typescript
import { SeededRNG, roll } from 'roll-parser';

const rng = new SeededRNG('campaign');
const save = JSON.stringify(rng.state());

const live = roll('1d20', { rng });
const resumed = roll('1d20', { rng: new SeededRNG(JSON.parse(save)) });
live.total === resumed.total; // true
```

`RngState` carries the same major-version binding as a seed — good for a save
file within a major, not across one. The binding is enforced rather than
documented: a snapshot from another format version throws
`INCOMPATIBLE_RNG_STATE` instead of resuming under different semantics, so a
stale save fails at load rather than diverging quietly. Snapshots taken with
`3.0.0-beta.0`, which had no version word, are rejected the same way.
