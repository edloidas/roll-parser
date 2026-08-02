# Migrating from v2 to v3

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
