# Migration notes

Newest first.

- [Upgrading from 3.1.0 to 3.2.0](#upgrading-from-310-to-320)
- [Upgrading from 3.0.0 to 3.1.0](#upgrading-from-300-to-310)
- [Migrating from v2 to v3](#migrating-from-v2-to-v3)
- [Upgrading from a v3 pre-release](#upgrading-from-a-v3-pre-release)

## Upgrading from 3.1.0 to 3.2.0

Nothing was removed from the API, no type changed, and the seed → dice mapping
is untouched — the same seed and notation roll the same faces they did in
3.1.0. What moves falls in two buckets. Several group forms that used to
evaluate now throw a parse error — `{3, 5, 7}>=4`, `{2d6+3}kh2`, `{2d6*2}kh2`,
`{3d20+5}>=21`, and `{2d6, 2d8}kh1>=4` — each listed below with a rewrite. The
rest are values that moved: `initialResult` on `!p` dice, one `vs` degree, the
`expression` and `rendered` strings, and the totals and tags of nested and
grouped success counts.

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
const result = roll('1d6!pcf>5', { rng: createMockRng([6, 6, 3]) });

result.rendered; // '1d6!pcf>5[6, 5, 2] = 13'
result.rolls[1].critical; // true — was `false`, judged by the stored 5
```

If you assert `critical` or `fumble` on `!p` continuation dice, re-derive the
expected flag from `initialResult ?? result`. Order stops mattering here:
`1d6cf>5!p` and `1d6!pcf>5` now agree, where 3.1.0's README documented them as
disagreeing, and [Modifiers](README.md#modifiers) is rewritten to match. An
explicit threshold is still a predicate over a die's current `result`, so `!!`,
`minN`, and `maxN` remain order-sensitive.

**Adjacent bare modifiers keep a space in `expression` and `rendered`.** `cs`,
`cf`, `s`, and `sd` with no threshold or count end in a letter the lexer scans
as an identifier, so the normalized form used to re-lex as one token and no
longer round-tripped through `parse`.

```typescript
roll('1d20cs cf', { rng: createMockRng([20]) }).expression; // '1d20cs cf' — was '1d20cscf'
roll('4d6 s kh2', { rng: createMockRng([1, 2, 3, 4]) }).rendered;
// '4d6s[~~1~~, ~~2~~, 3, 4] = 7' — the prefix was '4d6skh2'
```

Only those four codes are affected; `4dF` and `!p` end in letters but are their
own tokens, so they stay flush. Snapshot assertions over `expression` or
`rendered` for an affected expression need re-recording.

**One `vs` case stops discarding its natural face.** Only `vs` expressions
whose roll side both appends explosion dice and clamps them — `!` or `!!`
combined with `minN`/`maxN` — are affected: a clamped continuation used to be
counted as a second primary d20, and two primaries suppress the natural 20 /
natural 1 step. Without the clamp (`1d20! vs 30`) the continuation never looked
like a primary, and those degrees are unchanged.

```typescript
import { DegreeOfSuccess } from 'roll-parser';

const result = roll('1d20!min5 vs 30', { rng: createMockRng([20, 2, 12]) });

result.natural; // 20 — was `undefined`
result.degree === DegreeOfSuccess.Success; // true — was `Failure`
```

If you pinned `natural` or `degree` on such a roll, re-record it.

**Success counting a dice-less group is now a parse error.** `{3, 5, 7}>=4`
used to return the group's sum with `successes: 0`, so the
`successCount.total === successes - failures` invariant the README offers read
`15 === 0`. There are no dice to tally, and whether a group's units should be
its subtotals is undecided, so the form is refused instead.

```typescript
roll('{3, 5, 7}>=4'); // throws 'INVALID_SUCCESS_COUNT_TARGET' — was 15
roll('{3, 5, 7}kh1>=4'); // throws 'INVALID_SUCCESS_COUNT_TARGET' — was 7
roll('{3, 0d6}>=4').total; // 0 — was 3
```

Groups holding at least one pool are untouched — `{3, 1d6}>=4` counts the `1d6`
exactly as it did. `0d6>=4` also still parses and totals 0; only targets that
can never roll a die are rejected. There is no in-notation rewrite for a
literal-only group: replace the literals with the pool they stood in for
(`3d6>=4`), or drop the count and keep the group's sum (`{3, 5, 7}`).

**A second success count re-scores the pool instead of adding to it.** Group
braces let one count wrap another (`{4d6>=5f1}<=2f6`), which the parse-time
reject on a direct `4d6>=5>=1` never reached. The inner pass used to leave its
tags behind, so a die could come back both `'success'` and `'failure'` and the
top-level counts stopped describing the total. The outermost count now owns the
tags outright.

```typescript
const result = roll('{4d6>=5f1}<=2f6', { rng: createMockRng([6, 5, 2, 1]) });

result.total; // 1
result.successes; // 2 — was 4
result.failures; // 1 — was 0
result.rendered; // '{4d6>=5f1}<=2f6[__6__, 5, **2**, **1**] = 1'
```

`total` never moved — it always came from the outermost count, so a test
asserting only `total` needs no change. What changed is `successes`,
`failures`, `rolls[].modifiers`, and `rendered`, which now agree with it, so
`successCount.total === successes - failures` holds again. A lone
count is untouched, and so is a nested pair whose thresholds agree
(`{4d6>=5}>=5`). Dropped dice come out untagged; only the DC side of a `vs`
keeps tags from an inner count, since no pool pass may tally it.

**Keep/drop on a single-sub-roll group now takes added dice terms only.** The
flat-pool form totals the faces it kept, so any term in the sub-roll that is not
an added die face was discarded from the total with no error and no marker.
`{2d6+3}kh2` lost the `+3`, and `{2d6-1d4}kh3` — which drops nothing — flipped
the `1d4` from `-3` to `+3`. The parser already refused `(2d6+3)kh2` for exactly
this reason; the brace form now does too.

```typescript
roll('{2d6+3}kh2', { rng: createMockRng([4, 5]) }); // throws 'INVALID_KEEP_DROP_TARGET' — was 9
roll('{2d6-1d4}kh3', { rng: createMockRng([4, 5, 3]) }); // throws 'INVALID_KEEP_DROP_TARGET' — was 12
roll('{2d6*2}kh2', { rng: createMockRng([4, 5]) }); // throws 'INVALID_KEEP_DROP_TARGET'
roll('{2d6+0}kh2', { rng: createMockRng([4, 5]) }); // throws 'INVALID_KEEP_DROP_TARGET' — identity terms too
roll('{4d6+2d8}kh3', { rng: createMockRng([6, 6, 6, 1, 8, 1]) }).total; // 20 — unchanged
```

Also newly rejected, same cause: a function-wrapped pool (`{abs(1d6-1d8)}kh1`),
and a success count, which returned the face sum rather than the tally.
`{4d6>=5}kh1` throws `INVALID_SUCCESS_COUNT_TARGET`, not the keep/drop code — a
single-sub-roll group used to hide the count from the reject that `(4d6>=5)kh1`
has always hit, and both spellings now report the same thing.

The check is structural rather than arithmetic, so identity terms are refused
with the rest even though their total was already right: `{2d6+0}kh2`,
`{2d6*1}kh2`, and `{2d6+1d8-0}kh3` all throw.

Additive pools are the form this syntax exists for and are untouched —
`{4d6+2d8}kh3`, `{2d6kh1+1d8}kh2`, `{{1d6, 1d8}+2d6}kh2`. Multi-sub-roll groups
never had the bug, since keep/drop compares subtotals there: `{2d6+3, 1d8}kh1`
still works. To keep a rejected expression, move the arithmetic outside the
selection (`{2d6}kh2+3`) or give each term its own sub-roll.

**Success counting a multi-sub-roll group now scores subtotals, not dice.**
`{2d6, 2d6}>=10` used to compare all four faces against 10 and find nothing,
while `{2d6, 2d6}kh1` on the same node saw two compound dice worth 11 and 3.
Roll20 counts one success per sub-roll total, and that is what the count does
now.

```typescript
const result = roll('{2d6, 2d6}>=10', { rng: createMockRng([6, 5, 2, 1]) });

result.total; // 1 — was 0
result.successes; // 1 — was 0
result.rendered; // '{2d6[6, 5], 2d6[2, 1]}>=10 = 1'
```

Four things move with it:

- **`rendered`** shows each sub-roll's own bracket instead of one flat pool —
  the dice are no longer the units.
- **`rolls[].modifiers`** comes back untagged: no `'success'` or `'failure'` on
  any die, for the same reason. Read `successes` / `failures` instead.
- **`fT` thresholds** score subtotals too, so `{4d6+2d8, 3d20+3,
  5d10+1}>=40f<=10` weighs three subtotals rather than 21 faces.
- **A literal sub-roll** is a subtotal like any other, so it is scored rather
  than skipped.

```typescript
const literal = roll('{3, 1d6}>=4f<=3', { rng: createMockRng([6]) });

literal.successes; // 1
literal.failures; // 1 — was 0
literal.total; // 0 — was 1
```

Single-sub-roll groups (`{4d6}>=5`, `{2d6+1d8}>=5`) are the flat-pool form and
are unchanged.

**Two group spellings of a success count are now parse errors.** Both used to
reach the flat counter with the subtotals already gone.

```typescript
roll('{3d20+5}>=21'); // throws 'INVALID_SUCCESS_COUNT_TARGET' — was a count of bare faces
roll('{2d6, 2d8}kh1>=4'); // throws 'INVALID_SUCCESS_COUNT_TARGET' — was a count of loose dice
roll('({2d6, 2d8})>=4'); // throws 'INVALID_SUCCESS_COUNT_TARGET'
```

- **`{3d20+5}>=21`** hits the single-sub-roll rule keep/drop already has: that
  form compares one face at a time, so a scalar term never reaches the
  comparison. A scaled or function-wrapped pool goes with it — `{2d6*2}>=4` and
  `{floor(2d6/2)}>=2` throw too, exactly as `{2d6*2}kh2` does. To keep it, fold
  the scalar into the threshold: `3d20>=16` counts the same dice.
- **`{2d6, 2d8}kh1>=4`** covers every way a multi-sub-roll group can arrive
  somewhere other than as the count's direct target — `{{2d6, 2d8}}>=4` and
  `({2d6, 2d8})>=4` throw the same code. To keep it, count the group directly:
  `{2d6, 2d8}>=4`.

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

**New, optional: `renderBreakdown` from `roll-parser/render`.** A subpath
export whose `renderBreakdown(result, marks?)` rebuilds the breakdown from `result.parts`
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
`rolls` was a plain `number[]`.

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
