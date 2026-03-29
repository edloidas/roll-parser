# Stage 2 — Implementation Guide

Consolidated design decisions, architecture notes, and implementation details for
Stage 2 features (epic [#25](https://github.com/edloidas/roll-parser/issues/25)).

Based on PRD sections 4.1–4.5, gap analysis (#18), and consilium review findings.

## Foundation (Plan 0)

Implemented as a preparatory commit before any individual feature. Provides the
shared infrastructure all Stage 2 features depend on.

### Token Allocation

All Stage 2 token IDs allocated in a single pass. Grouped semantically:

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
| 30 | `EOF` | — | End of input |

### ComparePoint

Canonical definition in `src/types.ts`:

```typescript
type CompareOp = '>' | '>=' | '<' | '<=' | '=';
type ComparePoint = { operator: CompareOp; value: ASTNode };
```

`value` is `ASTNode` (not `number`) to:
- Match the pattern used by `DiceNode.count` and `DiceNode.sides`
- Support computed thresholds like `>=ceil(5)` when math functions are available
- Support negative compare values via unary minus (`=-1` for Fate dice)

### Lexer: Full-Accumulation scanIdentifier

The lexer's `scanIdentifier` was rewritten from incremental peek-based scanning to
full-accumulation: all consecutive alpha characters are collected, then the result
is classified against a keyword lookup table.

This resolves:
- The `d`-in-`round` problem (`round` accumulates fully before classification)
- `d%` scanning (bare `d` checks for non-alpha `%` after accumulation)
- `f` vs `floor` disambiguation (`f` alone → FAIL, `floor` → FUNCTION)
- All future identifier keywords (`vs`, `r`, `ro`, etc.)

### Parser: ComparePoint Utilities

The `Parser` class exposes two methods for Stage 2 modifier parsers:

- `isComparePointAhead(): boolean` — peeks for comparison operator tokens
- `parseComparePoint(): ComparePoint` — consumes comparison operator + value expression

Comparison tokens have `BP = -1` (terminators), so they never interfere with the
main Pratt loop. They are consumed exclusively by modifier parsers.

### Implementation Order

1. Comparison operators (foundation — already done in Plan 0)
2. Percentile dice (`d%`) — simple, self-contained
3. Fate/Fudge dice (`dF`) — simple, self-contained
4. Math functions — parser/evaluator only (lexer done in Plan 0)
5. Exploding dice — depends on ComparePoint
6. Reroll mechanics — depends on ComparePoint
7. Success counting — depends on ComparePoint, most complex semantics
8. PF2e Degrees of Success — standalone

Items 2–3 and 5–6 can be parallelized within their groups.

---

## Design Decisions

Resolved during consilium review. These apply across all Stage 2 features.

### Modifier Chain Evaluation Order

The Pratt parser produces nested AST nodes based on left-to-right binding at
equal binding power (BP = 35 for all modifiers). The evaluator uses inside-out
evaluation via `evalNode` dispatch:

- `4d6!kh3` → `Modifier(kh3, Explode(Dice))` — explode first, then keep highest
- `4d6kh3!` → `Explode(Modifier(kh3, Dice))` — keep highest first, then explode
- `4d6r<2!kh3` → `Modifier(kh3, Explode(Reroll(Dice)))` — reroll → explode → keep

`flattenModifierChain` only applies when `ModifierNode` is outermost. New modifier
types (Explode, Reroll, SuccessCount) each have their own `eval*` function that
calls `evalNode` on their target. No changes to `flattenModifierChain` needed.

### VersusNode Evaluation

Handle inside `evalNode`, NOT at the `evaluate()` level. This preserves the AST
closure property (every ASTNode can be recursively evaluated).

Implementation:
- Add `insideVersus: boolean` to `EvalEnv` (default `false`)
- `evalVersus` checks the flag, throws if already `true`, sets it to `true`
- Evaluates roll side and DC side independently
- Stores degree/natural metadata on `EvalContext.versusMetadata`
- `evaluate()` reads `versusMetadata` and populates `RollResult.degree`/`.natural`

### Natural d20 Extraction (PF2e)

Rule: filter left-side rolls for `sides === 20` and not `'dropped'`.

- Exactly **one** kept d20 → that's the natural value (upgrade/downgrade applies)
- **Zero** kept d20s → `natural: undefined` (no upgrade/downgrade)
- **Multiple** kept d20s → `natural: undefined` (ambiguous, no upgrade/downgrade)

Covers standard PF2e patterns:
- `1d20+10 vs 25` — one d20 ✓
- `2d20kh1+5 vs 20` — advantage, one kept d20 ✓
- `2d20kl1+5 vs 20` — disadvantage, one kept d20 ✓

### Negative Compare Values

Supported out of the box. `ComparePoint.value` is `ASTNode`, so `=-1` parses as
`UnaryOp(-, Literal(1))` and evaluates to `-1`. This enables Fate dice comparisons
like `4dFr=-1` (reroll exact -1).

Tests for negative compare values must be included in the Fate dice and reroll
feature implementations.

### Safety Counters (Explode/Reroll)

Two independent per-die limits + existing global ceiling:

| Limit | Scope | Default | Purpose |
|-------|-------|---------|---------|
| `maxExplodeIterations` | Per die | 1,000 | Prevents `1d1!` infinite loop |
| `maxRerollIterations` | Per die | 1,000 | Prevents `1d6r<7` infinite loop |
| `maxDice` | Per expression | 10,000 | Prevents resource exhaustion |

Both explode and reroll increment `env.totalDiceRolled` for each re-roll, so the
global `maxDice` limit acts as the ultimate safety net. No shared iteration budget
needed.

### Success/Failure Threshold Overlap

When a die matches both success and fail thresholds (e.g., `10d10>=3f3` and die
rolls 3): **success wins**.

Evaluation order:
1. Check success threshold → if match, `+1` success, done
2. Else check fail threshold → if match, `-1` success
3. Else → neutral (no effect on count)

Negative totals are allowed (more failures than successes). No clamping to zero,
consistent with PRD 3.7 and WoD rules.

### Fate Dice DieResult

- `DieResult.sides = 0` — sentinel value identifying Fate dice
- `DieResult.result` ∈ `{-1, 0, +1}`
- `critical: false` always (no max-value concept)
- `fumble: false` always (no min-value concept)
- Dedicated `createFateDieResult()` in evaluator bypasses normal critical/fumble logic
- Rolling: `rng.nextInt(-1, 1)` directly
- Keep/drop works naturally (sorts by result value: -1 < 0 < +1)

### Penetrating Explosion Results

`result = rawRoll - 1` with **no floor**. A penetrating explosion on a d2 that
rolls 1 produces `result = 0`. This matches rpg-dice-roller convention.

The explosion check uses the **raw** roll value (before decrement). Only the
stored result is decremented.

### Rendered Output Extensions

Each new feature extends `renderDice` with its modifier:

| Modifier | Render | Meaning |
|----------|--------|---------|
| `'dropped'` | `~~value~~` | Dropped by keep/drop (existing) |
| `'rerolled'` | `~~value~~` | Intermediate reroll result (strikethrough) |
| `'exploded'` | unmarked | Generated by explosion chain |
| `'success'` | `**value**` | Counted as success |
| `'failure'` | `__value__` | Counted as failure |

---

## Feature Specifications

### 1. Percentile Dice (`d%`)

**Syntax:** `d%`, `2d%`, `d%+5`, `2d%kh1`

**Lexer:** `DICE_PERCENT` token (already implemented in Plan 0)

**Parser:**
- NUD: `d%` → `DiceNode(Literal(1), Literal(100))`
- LED: `2d%` → `DiceNode(left, Literal(100))`
- `getLeftBp`: `BP.DICE_LEFT` (40)

**AST:** No new node. Reuses `DiceNode` with `sides = Literal(100)`.

**Evaluator:** No changes. `DiceNode` with `sides = 100` works as-is.

**Expression output:** Shows `1d100` (canonical form). `notation` preserves `d%`.

**Edge cases:**
- `d%` → 1d100
- `2d%` → 2d100
- `d%+5` → 1d100 + 5
- `d % 3` → error (whitespace breaks the token)
- `d%%` → error (d% consumed, then bare % is MODULO with no NUD handler)

### 2. Fate/Fudge Dice (`dF`)

**Syntax:** `dF`, `4dF`, `dF+5`, `4dFkh2`

**Lexer:** `DICE_FATE` token (already implemented in Plan 0)

**Parser:**
- New AST node: `FateDiceNode = { type: 'FateDice'; count: ASTNode }`
- NUD: `dF` → `FateDice(Literal(1))`
- LED: `4dF` → `FateDice(left)`
- `getLeftBp`: `BP.DICE_LEFT` (40)
- No `getRightBp` needed (no sides expression to parse)

**AST:** Add `FateDiceNode` to `ASTNode` union. Add `isFateDice` type guard.

**Evaluator:**
- New `evalFateDice` function
- `createFateDieResult(result)`: `sides = 0`, `critical = false`, `fumble = false`
- Rolling: `rng.nextInt(-1, 1)` for each die
- Dice count validation and `maxDice` limit (same as `evalDice`)
- Expression: `4dF`, rendered: `4dF[-1, 0, 1, 1]`

**CLI format.ts:** Update regex from `/~~(\d+)~~/g` to `/~~(-?\d+)~~/g` for
negative values in strikethrough.

**Tests must cover:**
- `dF`, `4dF`, `dF+5`, `4dFkh2`, `4dFdl1`
- `0dF` → total 0, empty rolls
- `(-1)dF` → EvaluatorError
- All results have `sides === 0`, `critical === false`, `fumble === false`
- `4dF` total is in range `[-4, +4]` (property test)
- MockRNG with `[-1, 0, 1, 1]` → total 1
- Negative compare values: `4dFr=-1` (test with reroll feature)

### 3. Math Functions

**Syntax:** `floor(expr)`, `ceil(expr)`, `round(expr)`, `abs(expr)`,
`max(expr, expr, ...)`, `min(expr, expr, ...)`

**Lexer:** `FUNCTION` and `COMMA` tokens (already implemented in Plan 0)

**Parser:**
- New AST node: `FunctionCallNode = { type: 'FunctionCall'; name: string; args: ASTNode[] }`
- NUD handler for `FUNCTION`: `parseFunctionCall(token)`
- Argument parsing: `LPAREN` + comma-separated expressions + `RPAREN`
- Arity validation at parse time:

  | Function | Min args | Max args |
  |----------|----------|----------|
  | `floor` | 1 | 1 |
  | `ceil` | 1 | 1 |
  | `round` | 1 | 1 |
  | `abs` | 1 | 1 |
  | `max` | 2 | ∞ |
  | `min` | 2 | ∞ |

- `FUNCTION` and `COMMA` have `BP = -1` (terminators)

**AST:** Add `FunctionCallNode` to `ASTNode` union. Add `isFunctionCall` type guard.

**Evaluator:**
- New `evalFunctionCall` function
- Evaluates each arg in its own `EvalContext`
- Dispatches to `Math.floor`, `Math.ceil`, `Math.round`, `Math.abs`, `Math.max`, `Math.min`
- Expression: `floor(1d6 / 3)`, rendered: `floor(1d6[5] / 3) = 1`

**New error codes:** `INVALID_FUNCTION_ARITY`, `UNKNOWN_FUNCTION`

**Edge cases:**
- `floor(10/3)` → 3 (resolves GAPS #5 — non-integer division)
- `max(1d6, 1d8)` → higher of two rolls
- `floor(floor(10/3)/2)` → nested functions
- `floor()` → INVALID_FUNCTION_ARITY
- `floor(1, 2)` → INVALID_FUNCTION_ARITY
- `max(1d6)` → INVALID_FUNCTION_ARITY (needs 2+)
- `FLOOR(10/3)` → case-insensitive, works

### 4. Exploding Dice

**Syntax:** `1d6!`, `1d6!!`, `1d6!p`, `1d6!>5`, `1d6!!>=3`, `1d6!p>3`

**Lexer:** `EXPLODE`, `EXPLODE_COMPOUND`, `EXPLODE_PENETRATING` tokens
(already implemented in Plan 0)

**Parser:**
- New AST node:
  ```
  ExplodeNode = {
    type: 'Explode';
    variant: 'standard' | 'compound' | 'penetrating';
    threshold?: ComparePoint;
    target: ASTNode;
  }
  ```
- LED handler for all three explode tokens
- After consuming explode token, check `isComparePointAhead()` for optional threshold
- `getLeftBp`: `BP.MODIFIER` (35)
- Nested explode rejection: if `target.type === 'Explode'`, throw ParseError

**AST:** Add `ExplodeNode` to `ASTNode` union. Add `isExplode` type guard.

**Evaluator:**
- New `src/evaluator/modifiers/explode.ts` module
- `evalExplode`: evaluates target, determines threshold, applies explosion variant
- Default threshold (no ComparePoint): explode when `result === die.sides`
- Sides determined from `DieResult.sides` in the evaluated pool

**Variants:**

| Variant | Behavior | Pool effect |
|---------|----------|-------------|
| Standard (`!`) | Roll again, add new die to pool | Pool grows |
| Compound (`!!`) | Roll again, accumulate into original die's result | Pool unchanged |
| Penetrating (`!p`) | Roll again, new die result = rawRoll - 1 (no floor) | Pool grows |

**Safety:** `DEFAULT_MAX_EXPLODE_ITERATIONS = 1000` per die. New `EvalEnv` field:
`maxExplodeIterations`. Each explosion increments `env.totalDiceRolled`.

**DieResult modifiers:** Explosion-generated dice get `'exploded'` modifier.

**New error codes:** `EXPLODE_LIMIT_EXCEEDED`, `INVALID_EXPLODE_TARGET`

**Edge cases:**
- `1d1!` → hits 1000-iteration limit, throws EXPLODE_LIMIT_EXCEEDED
- `0d6!` → empty pool, no explosions, total = 0
- `4d6!kh3` → explode first, then keep highest 3 from expanded pool
- `d6!` → prefix dice, works naturally
- `1d6!!!` → ParseError (nested explode rejected)
- `1d6!!>5` → compound with threshold ≥5

### 5. Reroll Mechanics

**Syntax:** `2d6r<2`, `2d6ro<3`, `2d6r=1`, `2d6ro>=5`

**Lexer:** `REROLL` and `REROLL_ONCE` tokens (already implemented in Plan 0)

**Parser:**
- New AST node:
  ```
  RerollNode = {
    type: 'Reroll';
    once: boolean;
    condition: ComparePoint;
    target: ASTNode;
  }
  ```
- LED handler for `REROLL` and `REROLL_ONCE`
- After consuming reroll token, call `parseComparePoint()` (mandatory — bare `r` without condition is invalid)
- `getLeftBp`: `BP.MODIFIER` (35)

**AST:** Add `RerollNode` to `ASTNode` union. Add `isReroll` type guard.

**Evaluator:**
- New `src/evaluator/modifiers/reroll.ts` module
- `matchesCondition(result, condition)` — reusable comparison helper
- Recursive reroll (`once: false`): roll → check → if match, mark `'rerolled'` and re-roll → repeat until no match or limit hit
- Reroll once (`once: true`): roll → check → if match, mark `'rerolled'` and roll once more → keep second result regardless

**Safety:** `DEFAULT_MAX_REROLL_ITERATIONS = 1000` per die. Each reroll increments
`env.totalDiceRolled`.

**DieResult modifiers:**
- Intermediate dice: `['rerolled']` (rendered as strikethrough)
- Final kept dice: `['kept']`

**New error code:** `REROLL_LIMIT_EXCEEDED`

**Edge cases:**
- `2d6r<2` → reroll 1s until ≥2
- `2d6ro<3` → reroll 1–2 once, keep second result regardless
- `1d6r<7` → always rerolls (all d6 results < 7), hits 1000 limit
- `2d6r<2kh1` → reroll first, then keep highest from rerolled pool
- `2d6ro<2r<3` → chained: inner reroll-once, then outer recursive reroll
- `4dFr=-1` → reroll Fate dice that roll -1 (negative compare value test)

### 6. Success Counting (Dice Pools)

**Syntax:** `10d10>=6`, `10d10>=6f1`, `10d10>5`, `5d6>=5+3`

**Lexer:** Comparison tokens + `FAIL` token (already implemented in Plan 0)

**Parser:**
- New AST node:
  ```
  SuccessCountNode = {
    type: 'SuccessCount';
    target: ASTNode;
    threshold: ComparePoint;
    failThreshold?: ComparePoint;
  }
  ```
- LED handler for comparison tokens (GREATER, GREATER_EQUAL, LESS, LESS_EQUAL, EQUAL)
  when they appear after a dice expression
- After parsing threshold, check for `FAIL` token → if present, consume and parse
  fail value as `ComparePoint` with `operator: '='`
- `getLeftBp` for comparison tokens: `BP.MODIFIER` (35)
- `FAIL` has `BP = -1` (consumed inside `parseSuccessCount`, never standalone)
- Terminal constraint: if `target.type === 'SuccessCount'`, throw ParseError

**AST:** Add `SuccessCountNode` to `ASTNode` union. Add `isSuccessCount` type guard.

**Evaluator:**
- New `src/evaluator/modifiers/success-count.ts` module
- `compareResult(value, operator, threshold)` — pure comparison (reusable)
- Success/failure precedence: **success wins** (check success first, then fail)
- Total = count of successes minus count of failures (can be negative)
- Dropped dice excluded from counting

**New DieModifier values:** `'success'`, `'failure'`

**New optional RollResult fields:** `successes?: number`, `failures?: number`

**New error code:** `INVALID_THRESHOLD`

**Rendered output:** `**value**` for success, `__value__` for failure

**Edge cases:**
- `10d10>=6f1` → WoD standard (successes at 6+, failures at 1)
- `10d10>5` → strict greater than
- `5d6>=5+3` → count successes, then add 3 to count
- `10d10kh5>=6` → keep highest 5, then count among those
- `10d10>=6kh5` → ParseError (modifier after terminal SuccessCountNode)
- `1d6>=7` → impossible threshold, zero successes
- Negative total allowed (more failures than successes)

### 7. PF2e Degrees of Success

**Syntax:** `1d20+10 vs 25`, `2d20kh1+5 vs 20`

**Lexer:** `VS` token (already implemented in Plan 0)

**Parser:**
- New AST node:
  ```
  VersusNode = {
    type: 'Versus';
    roll: ASTNode;
    dc: ASTNode;
  }
  ```
- LED handler for `VS` token
- `BP: VS_LEFT = 2, VS_RIGHT = 3` (lowest precedence — below addition)
- Multiple `vs` rejected: if `left.type === 'Versus'`, throw ParseError

**AST:** Add `VersusNode` to `ASTNode` union. Add `isVersus` type guard.

**Evaluator:**
- Handled inside `evalNode` (not at `evaluate()` level)
- `EvalEnv.insideVersus: boolean` — prevents nesting, throws if already `true`
- Evaluates roll side and DC side in separate `EvalContext` objects
- `extractNatural(rolls)`: exactly one kept d20 → natural; else `undefined`
- `calculateDegree(total, dc, natural)`:
  - `total >= dc + 10` → CriticalSuccess
  - `total >= dc` → Success
  - `total > dc - 10` → Failure
  - else → CriticalFailure
  - Nat 20: upgrade one step (if < CriticalSuccess)
  - Nat 1: downgrade one step (if > CriticalFailure)
- Stores `{ dcTotal, rollCount }` in `EvalContext.versusMetadata`
- `evaluate()` reads metadata → populates `RollResult.degree` and `.natural`
- `RollResult.total` = roll total (not the degree enum value)

**New types:**
```
enum DegreeOfSuccess {
  CriticalFailure = 0,
  Failure = 1,
  Success = 2,
  CriticalSuccess = 3,
}
```

**New RollResult fields:** `degree?: DegreeOfSuccess`, `natural?: number`

**New error code:** `NESTED_VERSUS`

**Rendered:** `1d20[15] + 10 vs 25 = Success`

**Edge cases:**
- `1d20 vs 15` → simple check
- `1d20+10 vs 25` → with modifier
- `2d20kh1+5 vs 20` → advantage (one kept d20 → natural detected)
- `1d20+1d20 vs 25` → multiple kept d20s → natural undefined, no upgrade/downgrade
- `1d6+10 vs 15` → no d20 → natural undefined
- `1d20 vs 1d20+10` → contested check (DC side has dice)
- `1d20+5 vs 15 vs 20` → ParseError (multiple vs)
