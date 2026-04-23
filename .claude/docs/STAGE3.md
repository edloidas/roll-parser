# Stage 3 — Implementation Guide

Consolidated design decisions, architecture notes, and implementation details for
Stage 3 features (epic [#30](https://github.com/edloidas/roll-parser/issues/30)).

Based on PRD sections 5.1–5.4, cross-library research on rpg-dice-roller, Roll20,
and FoundryVTT, and the Stage 2 implementation pattern (see [STAGE2.md](./STAGE2.md)).

## Foundation (Plan 0)

Implemented as a preparatory commit before any individual feature
(issue [#79](https://github.com/edloidas/roll-parser/issues/79)). Provides the
shared infrastructure all Stage 3 features depend on.

### Token Allocation

All Stage 3 token IDs allocated in a single pass. `EOF` moves from `30` to `38`
to keep group boundaries meaningful.

| ID | Name | Syntax | Group |
|----|------|--------|-------|
| 0 | `NUMBER` | `42`, `1.5` | Literals |
| 1 | `DICE` | `d`, `D` | Dice operators |
| 2 | `DICE_PERCENT` | `d%` | Dice operators |
| 3 | `DICE_FATE` | `dF` | Dice operators |
| 4–9 | `PLUS`..`POWER` | `+`, `-`, `*`, `/`, `%`, `**`/`^` | Arithmetic |
| 10–14 | `GREATER`..`EQUAL` | `>`, `>=`, `<`, `<=`, `=` | Comparison |
| 15–17 | `LPAREN`..`COMMA` | `(`, `)`, `,` | Grouping |
| 18–21 | `KEEP_HIGH`..`DROP_LOW` | `kh`/`k`, `kl`, `dh`, `dl` | Keep/drop |
| 22–24 | `EXPLODE`..`EXPLODE_PENETRATING` | `!`, `!!`, `!p` | Explode |
| 25–26 | `REROLL`, `REROLL_ONCE` | `r`, `ro` | Reroll |
| 27 | `FAIL` | `f` | Success counting |
| 28 | `FUNCTION` | `floor`, `ceil`, etc. | Functions |
| 29 | `VS` | `vs` | Keywords |
| **30** | **`LBRACE`** | `{` | **Group boundaries** |
| **31** | **`RBRACE`** | `}` | **Group boundaries** |
| **32** | **`AT`** | `@` | **Variables** |
| **33** | **`SORT_ASC`** | `s`, `sa` | **Sort modifiers** |
| **34** | **`SORT_DESC`** | `sd` | **Sort modifiers** |
| **35** | **`CRIT_SUCCESS`** | `cs` | **Crit thresholds** |
| **36** | **`CRIT_FAIL`** | `cf` | **Crit thresholds** |
| 37 | `EOF` | — | End of input |

Seven new tokens. `COMMA` (17) is reused for group sub-roll separation — no
new token is needed.

### Context Wiring

Three-way thread: `RollOptions → EvaluateOptions → EvalEnv`.

```typescript
// src/roll.ts
export type RollOptions = {
  // ...existing fields...
  context?: Record<string, number>;
  onMissingVariable?: 'throw' | 'zero';  // default: 'throw'
};

// src/types.ts
export type EvaluateOptions = {
  // ...existing fields...
  context?: Record<string, number>;
  onMissingVariable?: 'throw' | 'zero';
};

// src/evaluator/evaluator.ts (internal)
type EvalEnv = {
  // ...existing fields...
  context: Readonly<Record<string, number>>;  // always defined; empty object default
  onMissingVariable: 'throw' | 'zero';
};
```

The evaluator never sees `undefined` — `evaluate()` defaults to `{}` and `'throw'`
before building `EvalEnv`. This keeps `evalVariable` branch-free on presence checks.

### Lexer: Keyword Table Extensions

Stage 2's full-accumulation `scanIdentifier` handles multi-character keywords via a
lookup table. Stage 3 adds five new entries:

| Accumulated input | Token | Notes |
|---|---|---|
| `s` | `SORT_ASC` | Alone, not part of a longer word |
| `sa` | `SORT_ASC` | Explicit ascending |
| `sd` | `SORT_DESC` | |
| `cs` | `CRIT_SUCCESS` | |
| `cf` | `CRIT_FAIL` | |

Maximal munch is preserved by the full-accumulation strategy — `sa` and `sd` fully
accumulate before classification, so there is no risk of `s` winning over `sa`.

### Lexer: `@` Prefix Scanning

The `@` character introduces a variable reference. Unlike all other identifier
tokens — which lowercase their `value` — variable names must preserve their
original case (`@StrMod` ≠ `@strmod`). This requires a dedicated scanner.

Two forms:
- **Bare**: `@identifier` where `identifier` matches `[A-Za-z_][A-Za-z0-9_]*`
- **Braced**: `@{identifier}` where `identifier` is any sequence of printable
  characters except `}` and newline (includes spaces, hyphens, digits)

The lexer emits a single `AT` token whose `value` is the captured variable name
(without the `@` or braces). The parser's NUD handler for `AT` wraps it in a
`VariableNode`.

```typescript
// Pseudocode
private scanAt(): Token {
  const start = this.pos;
  this.advance(); // consume '@'
  let name: string;
  if (this.peek() === '{') {
    this.advance();
    const nameStart = this.pos;
    while (this.hasChar() && this.peek() !== '}' && this.peek() !== '\n') {
      this.advance();
    }
    if (this.peek() !== '}') throw new LexerError('Unterminated @{...} variable', start);
    name = this.input.slice(nameStart, this.pos);
    this.advance(); // consume '}'
  } else {
    const nameStart = this.pos;
    while (this.hasChar() && /[A-Za-z0-9_]/.test(this.peek())) this.advance();
    if (this.pos === nameStart) throw new LexerError('Empty @ variable', start);
    name = this.input.slice(nameStart, this.pos);
  }
  return { type: TokenType.AT, value: name, position: start };
}
```

### Implementation Order

1. Foundation (tokens + context + lexer extensions) — **already sequenced first** (Plan 0)
2. Variable injection ([#80](https://github.com/edloidas/roll-parser/issues/80)) — simple, self-contained
3. Sorting modifiers ([#82](https://github.com/edloidas/roll-parser/issues/82)) — simple, self-contained
4. Critical/fumble thresholds ([#83](https://github.com/edloidas/roll-parser/issues/83)) — builds on ComparePoint
5. Grouped rolls ([#81](https://github.com/edloidas/roll-parser/issues/81)) — most complex, dual semantics
6. Rich JSON parts output ([#84](https://github.com/edloidas/roll-parser/issues/84)) — requires other features stable

Items 2–4 can be parallelized. Item 5 is sequential (complex AST + evaluator work).
Item 6 is last (its `RollPart` union depends on seeing all new node types finalized).

---

## Design Decisions

Resolved before implementation. These apply across all Stage 3 features.

### Variable Case Preservation

Variable names are **case-sensitive**: `@StrMod` and `@strmod` refer to different
context keys. Context lookup uses strict key equality — no case folding, no
fuzzy matching.

This contradicts our existing identifier convention (Stage 1–2 keywords like `kh`,
`floor`, `vs` are all lowercased by the lexer), but matches user expectations from
Roll20 (`@{Strength Modifier}`) and FoundryVTT (`@abilities.cha.mod`) — both
preserve case.

Implementation: `scanAt` captures the raw source slice; `scanIdentifier` continues
to lowercase for keyword matching.

### onMissingVariable Option

```typescript
type OnMissingVariable = 'throw' | 'zero';
```

Default: `'throw'` (loud failure).

- `'throw'` — missing context key raises `EvaluatorError('Undefined variable: <name>')`.
  Preferred for character-sheet integrations where a missing attribute is a bug.
- `'zero'` — missing key evaluates to `0`. Useful for optional modifiers in
  user-facing chat commands (`1d20+@bless` when `bless` is not active).

No third option (`'ignore'` / `'default-to-something-else'`) — keeping the API small
and the error paths well-defined.

### Group Semantics: Single vs Multi Sub-Roll

This is the most consequential design decision in Stage 3. Grouped rolls behave
**differently** based on sub-roll count, matching rpg-dice-roller and Roll20:

| Group form | Example | Keep/drop operates on |
|---|---|---|
| Single sub-roll | `{4d10+5d6}kh2` | Individual dice (flat pool) |
| Multiple sub-rolls | `{4d6+2d8, 3d20+3, 5d10+1}kh1` | Sub-roll totals |

For the flat-pool case, the group behaves as if `4d10+5d6` were unwrapped but with
a pool-level modifier that spans across the `+`. For the sub-roll case, each
sub-expression's total is treated as a single "die" for the purposes of keep/drop.

**Rationale:** Users expect `{1d6, 1d6}kh1` to mean "roll each and keep the better
one" (advantage-style), not "keep the highest single die from the pool of 2 dice."
The single-sub-roll form is the escape hatch for pool semantics when the user
genuinely wants a combined pool.

**Evaluator impact:** `evalGroup` has two code paths:

```typescript
function evalGroup(node: GroupNode, env: EvalEnv, ctx: EvalContext): number {
  const subtotals = node.expressions.map(e => evalNode(e, env, ctx));
  if (node.expressions.length === 1) {
    // Flat pool: children's rolls are already in ctx.rolls
    return subtotals[0];
  }
  // Sub-roll mode: subtotals are the "dice" for downstream keep/drop
  return subtotals.reduce((a, b) => a + b, 0);
}
```

A wrapping `ModifierNode` detects `target.type === 'Group'` and
`target.expressions.length >= 2` to dispatch to sub-roll-mode keep/drop
(operating on subtotals) vs pool-mode (operating on individual dice).

### CritThreshold Collects Multiple Thresholds

`1d20cs=20cs=1cf>18` parses as a **single** `CritThresholdNode` with two
success thresholds and one fail threshold:

```typescript
type CritThresholdNode = {
  type: 'CritThreshold';
  successThresholds: ComparePoint[];  // zero or more
  failThresholds: ComparePoint[];     // zero or more
  target: ASTNode;
};
```

The parser's LED handler for `CRIT_SUCCESS` checks whether the current left-hand
side is already a `CritThresholdNode` — if so, it appends to the existing node's
array. Same for `CRIT_FAIL`. This keeps the AST flat.

A node with zero thresholds on both sides is impossible (the parser only creates
one when at least one `cs` or `cf` appears).

### Parts Tree: Always-On

The structured `parts` tree is always built during evaluation. No opt-in flag.

**Rationale:**
- Building the tree is O(n) in the AST size — essentially free.
- Opt-in doubles code paths in the evaluator and creates an awkward API surface.
- rpg-dice-roller and FoundryVTT both build their structured output unconditionally.

The flat `rolls: DieResult[]` array is retained for simple consumers.

### Modifier Execution Order

For reference, rpg-dice-roller's modifier execution priority (notation order is
irrelevant — they always run in this order):

| Priority | Modifier | Our lib |
|---|---|---|
| 1–2 | min/max clamp | Not in PRD |
| 3 | Explode | ✓ Stage 2 |
| 4 | Reroll | ✓ Stage 2 |
| 5 | Unique | Not in PRD |
| 6 | Keep | ✓ Stage 1 |
| 7 | Drop | ✓ Stage 1 |
| 8 | Target success/failure | ✓ Stage 2 |
| 9 | Critical success | Stage 3 |
| 10 | Critical failure | Stage 3 |
| 11 | Sorting | Stage 3 |

Our inside-out AST evaluation (notation-order) produces the same observable result
for Stage 3 modifiers because they are **pure post-processing**: sort reorders the
pool, cs/cf flip flags on existing `DieResult` objects. None change totals or
trigger new rolls. Whether they run before or after keep/drop in notation order
is moot — the final rendered pool is the same.

### Dropped Dice Keep Their Critical/Fumble Flags

When `cs`/`cf` modifiers are combined with keep/drop (`4d20dl1cs>17`), dropped
dice still get their `critical`/`fumble` flags set based on the custom threshold.
The rendered output shows `~~19~~**` for a dropped die that rolled 19 under
`cs>17` — dropped but flagged.

This matches rpg-dice-roller. The `critical`/`fumble` metadata is display-only
and should reflect what the die rolled, regardless of whether it contributes to
the total.

---

## Feature Specifications

### 1. Variable Injection

**Issue:** [#80](https://github.com/edloidas/roll-parser/issues/80)

**Syntax:** `@name`, `@{name with spaces}`

**Lexer:** `AT` token, case-preserving scanner (see Foundation §Lexer `@` Prefix).

**Parser:**
- NUD handler for `AT`: `{ type: 'Variable', name: token.value }`
- No LED (variable always appears at an expression position)
- Variables can appear anywhere an expression is valid: `1d20+@str`,
  `@count d@sides`, `(@base)d6+@{damage bonus}`

**AST:**
```typescript
type VariableNode = {
  type: 'Variable';
  name: string;
};
```

Add to `ASTNode` union. Add `isVariable` type guard. Add to `containsDice`
(returns `false` — variables are never dice).

**Evaluator:**
- New `evalVariable` function
- Looks up `env.context[node.name]`
- On missing key, dispatches on `env.onMissingVariable`:
  - `'throw'` → `new EvaluatorError('Undefined variable: <name>')`
  - `'zero'` → returns `0`

**Expression output:** Variables render as their value in `rendered`:
`1d20[15]+@str[3] = 18`. The original `@str` appears in `notation`; `expression`
shows the resolved value (`1d20 + 3`).

**Edge cases:**
- `@` with no name → LexerError (`Empty @ variable`)
- `@{}` → LexerError (`Empty @ variable`)
- `@{unterminated` → LexerError (`Unterminated @{...} variable`)
- `@123` → LexerError (first char must be letter or underscore)
- `@str.mod` → only `str` captured; `.` breaks the identifier
  (dot notation explicitly not supported in v3)
- Missing variable with `onMissingVariable: 'throw'` → EvaluatorError
- Missing variable with `onMissingVariable: 'zero'` → `0`
- Variable resolving to non-integer → accepted (same as literal decimals)
- Variable in dice count/sides position: `@count d@sides` → works (ASTNode
  allowed for count/sides since Stage 1)

**Tests must cover:**
- Bare form: `@str` with `context: { str: 3 }`
- Braced form: `@{Strength Modifier}` with spaces in key
- Case sensitivity: `@StrMod` ≠ `@strmod`
- Both missing-variable modes
- Integration with existing features: `1d20+@str+2`, `@count d6`, `(@base)d%`
- Nested in modifiers: `4d6kh(@keep)`, `1d20r<@threshold`
- Variable as compare value: `2d6>=@dc`

### 2. Grouped Rolls

**Issue:** [#81](https://github.com/edloidas/roll-parser/issues/81)

**Syntax:** `{expr}`, `{expr1, expr2, ...}`, with optional postfix modifiers.

**Lexer:** `LBRACE` and `RBRACE` tokens. `COMMA` reused from Stage 2.

**Parser:**
- NUD handler for `LBRACE`:
  1. Consume `LBRACE`
  2. Parse an expression
  3. If next token is `COMMA`, consume and parse another — repeat
  4. Expect `RBRACE`
  5. Build `GroupNode { expressions: [...] }`
- `LBRACE` and `RBRACE` have `BP = -1` (terminators outside NUD context)
- Groups can be modified by `kh`/`kl`/`dh`/`dl` (and Stage 2's success
  counting) like any other dice-containing expression — existing LED handlers
  for these modifiers accept the `GroupNode` as target

**AST:**
```typescript
type GroupNode = {
  type: 'Group';
  expressions: ASTNode[];  // at least 1
};
```

Add to `ASTNode` union. Add `isGroup` type guard. Add to `containsDice`:
```typescript
case 'Group':
  return node.expressions.some(containsDice);
```

**Evaluator:**

New `src/evaluator/modifiers/group.ts` module (or extend a new
`src/evaluator/group.ts`).

```typescript
function evalGroup(node: GroupNode, env: EvalEnv, ctx: EvalContext): number {
  // Each sub-expression contributes its rolls to ctx.rolls
  const subtotals = node.expressions.map(expr => evalNode(expr, env, ctx));
  return subtotals.reduce((sum, v) => sum + v, 0);
}
```

Wrapping `ModifierNode` detects the group target and dispatches:

```typescript
function evalKeepDropModifier(node: ModifierNode, env: EvalEnv, ctx: EvalContext): number {
  if (node.target.type === 'Group' && node.target.expressions.length >= 2) {
    return evalGroupKeepDrop(node, env, ctx);  // sub-roll mode
  }
  // Existing dice-pool mode (flat pool also handled here — single-sub-roll groups
  // just contribute their dice to the pool via evalGroup side-effects)
  return evalPoolKeepDrop(node, env, ctx);
}
```

**Sub-roll mode** (`expressions.length >= 2`):
- Each sub-expression's subtotal is a candidate for keep/drop
- Compute all subtotals, sort, keep/drop per modifier's `count` and `selector`
- Non-kept sub-rolls contribute `0` to the group total; their dice are flagged
  `'dropped'` in `ctx.rolls`

**Flat pool mode** (`expressions.length === 1`):
- Behaves identically to the unwrapped expression — the group is a no-op pass-through

**Modifiers on groups:**
- ✓ Keep/drop (`kh`, `kl`, `dh`, `dl`) — dual semantics above
- ✓ Success counting (`>N`, `f<N`) — applied to subtotals in multi mode, to
  individual dice in single mode (same as rpg-dice-roller)
- ✓ Sort (`s`, `sa`, `sd`) — applied to dice in single mode, to subtotals
  AND internal dice in multi mode
- ✗ Explode, reroll — these wrap bare dice only. A `{...}!` is a parse error.
- ✗ Critical thresholds — `cs`/`cf` wrap bare dice only.

**Nesting:** `{1d6, {5}}k` is allowed. The inner `{5}` is a trivial single-sub-roll
group evaluating to `5`; the outer is a 2-element group, so keep/drop works on
subtotals.

**Edge cases:**
- `{}` → ParseError (empty group)
- `{4d6}` → equivalent to `4d6` (single-sub-roll, no modifier)
- `{4d6+2d8, 3d20+3, 5d10+1}kh1` → keep highest subtotal
- `{4d10+5d6}kh2` → flat pool, keep 2 highest individual dice
- `{4d6}!` → ParseError (`Cannot explode a group`)
- `{1d6}cs>5` → ParseError (`Cannot apply crit threshold to a group`)
- Unterminated: `{1d6, 2d8` → ParseError (`Unterminated group`)
- Nested: `{{1d6, 2d8}kh1, 3d10}kl1` → valid, two levels of keep/drop
- Group containing only literals: `{3, 5, 7}kh1` → returns 7 (subtotals `[3, 5, 7]`)

**Tests must cover:**
- Single-element groups (pass-through equivalence)
- Multi-element groups with keep/drop (both selectors, both modifiers)
- Explicit flat-pool behavior (`{4d10+5d6}kh2`)
- Nested groups
- Interaction with arithmetic outside: `{1d6, 1d8}kh1 + 5`
- Groups inside arithmetic: `2 * {1d6, 1d8}kh1`
- Groups with Stage 2 features inside sub-expressions: `{1d6!, 2d6r<2}kh1`
- Rejection of invalid modifier on group: `{...}!`, `{...}cs>5`, `{...}r<2`
- `containsDice` recursion through groups

### 3. Sorting Modifiers

**Issue:** [#82](https://github.com/edloidas/roll-parser/issues/82)

**Syntax:** `expr s`, `expr sa`, `expr sd`

**Lexer:** `SORT_ASC` (matches `s` or `sa`) and `SORT_DESC` (matches `sd`).

**Parser:**
- LED handlers for both tokens
- `BP.MODIFIER` (35) — same tier as keep/drop
- Wrap target in `SortNode { order, target }`

**AST:**
```typescript
type SortNode = {
  type: 'Sort';
  order: 'ascending' | 'descending';
  target: ASTNode;
};
```

Add to `ASTNode` union. Add `isSort` guard. `containsDice` recurses into `target`.

**Evaluator:**

New `src/evaluator/modifiers/sort.ts`.

```typescript
function evalSort(node: SortNode, env: EvalEnv, ctx: EvalContext): number {
  const startIdx = ctx.rolls.length;
  const total = evalNode(node.target, env, ctx);
  // Sort only the dice produced by target, leaving prior pools untouched
  const produced = ctx.rolls.slice(startIdx);
  produced.sort((a, b) =>
    node.order === 'ascending' ? a.result - b.result : b.result - a.result
  );
  ctx.rolls.splice(startIdx, produced.length, ...produced);
  return total;
}
```

Sort is **purely visual** — does not change `total`, does not touch any
`DieModifier` flags.

**Dropped dice:** stay in the pool (kept in order) with their `'dropped'` flag
intact. A `4d6dl1s` sorts all four dice including the dropped one.

**Group interaction:** When `target` is a multi-sub-roll `GroupNode`, we need to
sort **both** levels (individual dice within each sub-roll, and sub-rolls by
total). Since sub-roll totals don't live in `ctx.rolls` (they live in the
evaluator's stack), the group evaluator exposes a hook — see group spec above.

**Edge cases:**
- `4d6s` → ascending (default)
- `4d6sa` → ascending (explicit, same result)
- `4d6sd` → descending
- `4d6dl1s` → sort after dl1; dropped die retains flag
- `4d6kh3s` → sort within kept dice (dropped die still present, flagged)
- `4d6!s` → explode first, then sort expanded pool
- `0d6s` → empty pool, no-op
- `4d6ss` → ParseError? Or allowed (double sort, same result)? **Decision: allow.**
  Sort is idempotent.
- `(1d6+2d8)s` → sorts the combined pool (1d6 + 2d8 all mixed). Note this
  differs from `{1d6+2d8}s` only in the parse tree; runtime behavior matches.

**Tests must cover:**
- All three keywords (`s`, `sa`, `sd`)
- Visual-only invariant: total is unchanged vs unsorted
- Sort after keep/drop preserves dropped flags
- Property test: sorted array is monotonic in the chosen direction
- Group integration (deferred to group tests)

### 4. Critical/Fumble Threshold Modifiers

**Issue:** [#83](https://github.com/edloidas/roll-parser/issues/83)

**Syntax:** `expr cs`, `expr cs{cp}`, `expr cf`, `expr cf{cp}`, chainable:
`expr cs>19 cs=1 cf<3`.

**Lexer:** `CRIT_SUCCESS` (`cs`), `CRIT_FAIL` (`cf`).

**Parser:**
- LED handlers for both tokens
- After consuming, check `isComparePointAhead()`:
  - If yes → parse a ComparePoint
  - If no → use a default (`= max_sides` for cs, `= 1` for cf). Actually deferred
    — the evaluator resolves defaults at eval time since `sides` is a runtime
    value. Parser stores `undefined` threshold.
- `BP.MODIFIER` (35)
- **Chaining**: if `left.type === 'CritThreshold'`, append to existing arrays:
  ```typescript
  case TokenType.CRIT_SUCCESS: {
    const cp = this.isComparePointAhead() ? this.parseComparePoint() : undefined;
    if (left.type === 'CritThreshold') {
      left.successThresholds.push(cp ?? { operator: '=', value: null as any });  // sentinel
      return left;
    }
    return { type: 'CritThreshold', successThresholds: [cp], failThresholds: [], target: left };
  }
  ```
  (Use a proper sentinel — see evaluator spec.)

**AST:**
```typescript
type CritThresholdNode = {
  type: 'CritThreshold';
  successThresholds: Array<ComparePoint | 'default'>;
  failThresholds: Array<ComparePoint | 'default'>;
  target: ASTNode;
};
```

`'default'` is the sentinel for bare `cs`/`cf` without a ComparePoint. The
evaluator resolves `'default'` to the target die's max/min sides at eval time.

Add `isCritThreshold` type guard.

**Evaluator:**

New `src/evaluator/modifiers/crit-threshold.ts`.

```typescript
function evalCritThreshold(node: CritThresholdNode, env: EvalEnv, ctx: EvalContext): number {
  const startIdx = ctx.rolls.length;
  const total = evalNode(node.target, env, ctx);
  const produced = ctx.rolls.slice(startIdx);

  for (const die of produced) {
    // Override critical flag
    const isCrit = node.successThresholds.some(t =>
      t === 'default'
        ? die.result === die.sides && die.sides > 1
        : matchesCondition(die.result, resolveComparePoint(t, env, ctx))
    );
    die.critical = isCrit;

    // Override fumble flag
    const isFumble = node.failThresholds.some(t =>
      t === 'default'
        ? die.result === 1
        : matchesCondition(die.result, resolveComparePoint(t, env, ctx))
    );
    die.fumble = isFumble;
  }

  return total;  // unchanged
}
```

`matchesCondition` is reused from `src/evaluator/modifiers/compare.ts`.

**Interaction with existing critical/fumble detection:** The `CritThresholdNode`
**replaces** the default behavior. Dice produced by a non-wrapped `DiceNode` still
use `result === sides` / `result === 1`. Only dice wrapped by `CritThreshold`
use the custom rules.

**Edge cases:**
- `1d20cs` → equivalent to default (crit on 20); allowed but redundant
- `1d20cs>19` → crit on 19–20
- `1d20cs=20cs=1` → crit on both 20 and 1 (unusual but supported)
- `1d20cs>19cf<3` → custom crit and fumble
- `1d20cs>19cf<3cs=10` → crit on `>19` OR `=10`, fumble on `<3`
- `4d6cs>4` → each die with result > 4 flagged critical (d6 has no "natural" crit)
- `1d20cs<1` → never matches (d20 can't roll < 1); all `critical: false`
- Dropped dice: `4d20dl1cs>17` → dropped die still gets flag if above threshold
- Explode interaction: `1d20!cs>19` → cs applies to ALL dice in expanded pool;
  crit does NOT affect explosion trigger (explosion still uses `result === sides`)
- Success counting interaction: `10d10>=6cs>8` → successes tagged with custom
  crit on top; `successes` count unchanged; `DieResult.critical` reflects custom
  threshold

**Tests must cover:**
- Default forms: `1d20cs`, `1d20cf`
- Custom thresholds: `cs>19`, `cs=20`, `cs>=19`, `cf<3`, `cf=1`, `cf=2`
- Multiple success: `cs=20cs=1`
- Multiple fail: `cf=1cf=2`
- Combined: `cs>19cf<3`
- Order-independence: `cs>19cf<3` vs `cf<3cs>19` produce same flags
- Rendered output uses `**value**` for crit, `__value__` for fumble
- Total unchanged (pure metadata)
- Explode unaffected by `cs` threshold (uses raw sides for trigger)
- Interaction with dropped dice

### 5. Rich JSON Parts Output

**Issue:** [#84](https://github.com/edloidas/roll-parser/issues/84)

**Syntax:** No notation change. Enriches `RollResult`.

**New type:**
```typescript
type RollPart =
  | { type: 'literal'; value: number }
  | { type: 'variable'; name: string; value: number }
  | { type: 'dice'; sides: number; rolls: DieResult[]; total: number }
  | { type: 'fateDice'; count: number; rolls: DieResult[]; total: number }
  | { type: 'binaryOp'; operator: '+'|'-'|'*'|'/'|'%'|'**'; left: RollPart; right: RollPart; total: number }
  | { type: 'unaryOp'; operator: '-'; operand: RollPart; total: number }
  | { type: 'modifier'; modifier: string; target: RollPart; total: number }
  | { type: 'explode'; variant: 'standard'|'compound'|'penetrating'; target: RollPart; total: number }
  | { type: 'reroll'; once: boolean; target: RollPart; total: number }
  | { type: 'successCount'; target: RollPart; successes: number; failures: number; total: number }
  | { type: 'versus'; roll: RollPart; dc: RollPart; degree: DegreeOfSuccess; total: number }
  | { type: 'functionCall'; name: string; args: RollPart[]; total: number }
  | { type: 'group'; parts: RollPart[]; keptIndices?: number[]; total: number }
  | { type: 'sort'; order: 'ascending'|'descending'; target: RollPart; total: number }
  | { type: 'critThreshold'; target: RollPart; total: number };
```

Discriminant is lowercase to distinguish from `ASTNode.type` (which is PascalCase).
This prevents accidental confusion between parse-tree and evaluation-tree at the
type level.

**RollResult extension:**
```typescript
type RollResult = {
  // ...existing fields...
  /** Structured breakdown of the evaluated expression, mirroring the AST. */
  parts: RollPart;
};
```

**Evaluator:**

Each `evalNode` branch returns both the numeric total AND a `RollPart`. The
cleanest approach: a single `evalNodeDetailed(node, env, ctx): { total: number;
part: RollPart }` function replaces `evalNode`. The existing `total`-only
consumers read `.total`.

Alternative: maintain a parallel stack in `EvalContext.partsStack` and push/pop
around each evaluation. Simpler to retrofit but easier to get wrong under
recursion.

**Recommendation:** refactor `evalNode` to return `{ total, part }` in the
foundation PR for this feature. Existing tests verify `total` unchanged.

**Edge cases:**
- Expression with no dice: `1+2` → `parts: { type: 'binaryOp', left: {literal,1}, right: {literal,2}, total: 3 }`
- Single die: `1d20` → `parts: { type: 'dice', sides: 20, rolls: [...], total: ... }`
- Nested modifiers: `4d6kh3` → `parts: { type: 'modifier', modifier: 'kh3',
  target: { type: 'dice', ... }, total: ... }`
- Variables resolve to their value: `@str` → `{ type: 'variable', name: 'str', value: 3 }`
- Functions show args: `floor(1d6/2)` → `{ type: 'functionCall', name: 'floor',
  args: [{type: 'binaryOp', ...}], total: ... }`
- Groups show all sub-roll parts plus kept indices: `{1d6, 1d8}kh1` →
  outer modifier wrapping `{ type: 'group', parts: [...], keptIndices: [1], total: ... }`

**Tests must cover:**
- Parts tree structure for each AST node type
- Total consistency: `result.parts.total === result.total`
- Variable resolution captured in parts
- Group kept-indices accurate
- Round-trip: JSON.stringify → JSON.parse produces equivalent structure
- No circular references in the tree
- Property test: arbitrary valid notation produces a parts tree whose `total`
  matches `result.total`

---

## Out of Scope (candidates for Stage 4)

These surfaced during Stage 3 research but are not covered by epic
[#30](https://github.com/edloidas/roll-parser/issues/30):

- **Roll descriptions / labels** — `4d6 # Fire damage`, `2d10 [ Fire damage ]`.
  Complements structured parts for UI rendering; worth pairing with a
  future output enhancement.
- **Min/Max clamp modifiers** — `1d6min2`, `1d6max5`. Clamps individual dice
  values post-roll. Distinct from the `min()`/`max()` math functions in Stage 2.
- **Unique modifier** — `3d6u`, `3d6uo`. Rerolls duplicates in a pool.
- **Alias expansion** — `adv` → `2d20kh1`, `dis` → `2d20kl1`. Mentioned in
  PRD §10 Phase 3 but not included in epic #30 body.
- **Dot-notation variables** — `@abilities.cha.mod`. FoundryVTT-style nested
  context access. Would require changing `context` from `Record<string, number>`
  to a recursive type.
