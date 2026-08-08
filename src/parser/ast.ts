/**
 * AST node type definitions for the dice notation parser.
 *
 * @module parser/ast
 */

import type { ComparePoint } from '../types.js';

/**
 * Source span carried by every AST node.
 *
 * `start` is inclusive, `end` exclusive, both in UTF-16 code units into the
 * original notation string. The parser sets both on every node it produces;
 * they are typed optional so hand-constructed ASTs (tests, programmatic
 * consumers) remain valid without positions.
 *
 * `notation.slice(start, end)` recovers the source text of any parsed node,
 * which is how the CLI underlines the failing sub-expression.
 *
 * @category AST
 */
export type NodeSpan = {
  readonly start?: number;
  readonly end?: number;
};

/**
 * Numeric literal node — an integer or decimal written directly in the
 * notation (`3`, `2.5`). Leaf node.
 *
 * Decimals are accepted and carried through arithmetic exactly as written;
 * only dice counts and sides are required to resolve to integers.
 *
 * @category AST
 */
export type LiteralNode = NodeSpan & {
  readonly type: 'Literal';
  readonly value: number;
};

/**
 * Dice roll node (`NdX`, `dX`, `d%`).
 *
 * `count` and `sides` are full sub-expressions, not numbers, which is what
 * makes computed dice like `(1+1)d(3*2)` and `(1d4)d6` expressible. Both are
 * evaluated first and must resolve to integers; `d%` desugars to a `sides`
 * literal of `100`, and an omitted count to a `count` literal of `1`.
 *
 * Dice rolled by the `count`/`sides` sub-expressions are meta-expression dice
 * — they land in `RollResult.rolls` tagged `'meta'` and belong to no pool.
 *
 * @category AST
 */
export type DiceNode = NodeSpan & {
  readonly type: 'Dice';
  readonly count: ASTNode;
  readonly sides: ASTNode;
};

/**
 * Fate/Fudge dice node (`dF`).
 * Each die produces a result in {-1, 0, +1}. No configurable sides.
 *
 * Fate dice carry `sides: 0` as a sentinel in their `DieResult`, and are
 * never `critical` or `fumble` — there is no maximum face to hit.
 *
 * @category AST
 */
export type FateDiceNode = NodeSpan & {
  readonly type: 'FateDice';
  readonly count: ASTNode;
};

/**
 * Binary operation node — the arithmetic backbone of an expression.
 *
 * | Operator | Meaning | Precedence | Associativity |
 * |----------|---------|-----------:|---------------|
 * | `+` `-` | add, subtract | 10 | left |
 * | `*` `/` `%` | multiply, divide, modulo | 20 | left |
 * | `**` | power (also spelled `^`) | 30 | right |
 *
 * Dice bind tighter than all of them (40), and postfix modifiers sit at 35,
 * so `2d6+3` is `(2d6)+3` and `4d6kh3*2` is `(4d6kh3)*2`. The `vs` operator
 * binds loosest of all (2) and has its own {@link VersusNode}.
 *
 * `/` and `%` throw `DIVISION_BY_ZERO` / `MODULO_BY_ZERO` on a zero right
 * side; any operator producing a non-finite total throws `NON_FINITE_RESULT`.
 * Division is not rounded — wrap it in `floor()` if you need an integer.
 *
 * @category AST
 */
export type BinaryOpNode = NodeSpan & {
  readonly type: 'BinaryOp';
  readonly operator: '+' | '-' | '*' | '/' | '%' | '**';
  readonly left: ASTNode;
  readonly right: ASTNode;
};

/**
 * Unary operation node — prefix negation, the only unary operator.
 *
 * Binding power 25 sits between multiplication and power, so `-1d4` is
 * `-(1d4)` (negate the roll) rather than `(-1)d4`, while `-2**2` is `-(2**2)`.
 *
 * @category AST
 */
export type UnaryOpNode = NodeSpan & {
  readonly type: 'UnaryOp';
  readonly operator: '-';
  readonly operand: ASTNode;
};

/**
 * Keep/drop modifier node (`khN`, `klN`, `dhN`, `dlN`, and the `kN`
 * shorthand for `khN`).
 *
 * Wraps a dice expression with keep highest/lowest or drop highest/lowest.
 * An omitted count defaults to 1, so `4d6kh` is `4d6kh1`. `count` is a full
 * sub-expression, so `4d6kh(1d2)` is legal — and its dice are drawn *before*
 * the pool.
 *
 * Chained modifiers (`4d6kh3dl1`) do not nest: the evaluator flattens the
 * chain and applies each spec independently to the same pool, unioning the
 * dropped sets, which is the Roll20 rule.
 *
 * @category AST
 */
export type KeepDropNode = NodeSpan & {
  readonly type: 'KeepDrop';
  readonly kind: 'keep' | 'drop';
  readonly selector: 'highest' | 'lowest';
  readonly count: ASTNode;
  readonly target: ASTNode;
};

/**
 * Exploding dice node (`!`, `!!`, `!p`, `!>Y`).
 * Wraps a dice expression with a standard, compounding, or penetrating
 * explosion. An absent `threshold` means "explode on the die's maximum face".
 *
 * Thresholds accept any comparator. In notation like `1d10!=10` (the
 * Storyteller "10-again" rule) the `!` is the explode marker and `=10` the
 * equality threshold — there is no `!=` comparator. Per-die explosion count
 * is capped by `EvaluationOptions.maxExplodeIterations`.
 *
 * @category AST
 */
export type ExplodeNode = NodeSpan & {
  readonly type: 'Explode';
  readonly variant: 'standard' | 'compound' | 'penetrating';
  readonly threshold?: ComparePoint;
  readonly target: ASTNode;
};

/**
 * Reroll node (`r<COND>`, `ro<COND>`).
 * Re-rolls dice that match a comparison condition. `once: true` for `ro`
 * keeps the second result regardless of match; `once: false` for `r`
 * re-rolls recursively until the condition no longer matches, bounded by
 * `EvaluationOptions.maxRerollIterations`.
 *
 * @category AST
 */
export type RerollNode = NodeSpan & {
  readonly type: 'Reroll';
  readonly once: boolean;
  readonly condition: ComparePoint;
  readonly target: ASTNode;
};

/**
 * Per-die clamp node (`minN`, `maxN`).
 * `4d6min2` raises every die below 2 to 2; `4d6max5` lowers every die above
 * 5 to 5. The clamp rewrites `DieResult.result` (preserving the raw face in
 * `initialResult`) and re-sums the pool; `critical`/`fumble` keep reflecting
 * the natural face. The bound is a full sub-expression (`4d6min(1d2)`),
 * drawn *after* the pool like other threshold arguments.
 *
 * Chained bounds nest and apply left to right: `4d6min2max5` clamps into
 * [2, 5].
 *
 * @category AST
 */
export type DieBoundNode = NodeSpan & {
  type: 'DieBound';
  bound: 'min' | 'max';
  value: ASTNode;
  target: ASTNode;
};

/**
 * Success counting node (`>=T`, `>T`, `<T`, `<=T`, `=T`, with optional `f=F`).
 *
 * Transforms a dice pool into a success count: each die meeting `threshold`
 * adds +1, each die meeting `failThreshold` subtracts 1. Terminal — a
 * `SuccessCountNode` may not be wrapped by any postfix modifier, binary
 * operator, unary operator, versus operand, or function argument. The
 * `failThreshold` accepts any `CompareOp`; bare `fN` defaults to `operator: '='`.
 *
 * @category AST
 */
export type SuccessCountNode = NodeSpan & {
  readonly type: 'SuccessCount';
  readonly target: ASTNode;
  readonly threshold: ComparePoint;
  readonly failThreshold?: ComparePoint;
};

/**
 * Versus node (`<roll> vs <dc>`) — PF2e Degrees of Success.
 *
 * Both sides are full expressions. The `roll` side is evaluated and compared
 * against the `dc` side total, producing a `DegreeOfSuccess` with natural
 * d20 upgrade/downgrade applied when exactly one kept d20 appears on the
 * roll side. Lowest-precedence operator — chaining (`a vs b vs c`) is
 * rejected at parse time; nesting via parens (`a vs (b vs c)`) is rejected
 * at evaluation time.
 *
 * @category AST
 */
export type VersusNode = NodeSpan & {
  readonly type: 'Versus';
  readonly roll: ASTNode;
  readonly dc: ASTNode;
};

/**
 * Math function call node (`floor(expr)`, `max(a, b, ...)`, etc.).
 *
 * Supports the fixed-arity functions `floor`, `ceil`, `round`, `abs`, and the
 * variadic functions `max`, `min` (minimum 2 args). Arity is validated at
 * parse time against a static table; by the time the evaluator sees a
 * `FunctionCallNode`, `args.length` is guaranteed to match the function.
 *
 * `max`/`min` are variadic with no upper bound, so `max(1d20, 1d20, 1d20)`
 * is a valid three-way advantage roll.
 *
 * @category AST
 */
export type FunctionCallNode = NodeSpan & {
  readonly type: 'FunctionCall';
  readonly name: string;
  readonly args: readonly ASTNode[];
};

/**
 * Parenthesized group node (`(<expr>)`).
 *
 * Preserves explicit grouping typed by the user so that
 * `RollResult.expression` and `RollResult.rendered` round-trip through
 * `parse` without losing precedence information. Semantically transparent:
 * evaluation returns the inner expression's value unchanged.
 *
 * @category AST
 */
export type GroupedNode = NodeSpan & {
  readonly type: 'Grouped';
  readonly expression: ASTNode;
};

/**
 * Variable reference node (`@name` or `@{name with spaces}`).
 *
 * Resolves to a numeric value from the evaluator's `context` map at
 * evaluation time. Names are case-sensitive (`@StrMod` ≠ `@strmod`) — the
 * lexer preserves case in the `AT` token's `value`, distinct from other
 * identifier tokens which lowercase. Leaf node — no LED, never wraps a
 * sub-expression.
 *
 * A name missing from `context` throws `UNDEFINED_VARIABLE` unless
 * `onMissingVariable: 'zero'` is set.
 *
 * @category AST
 */
export type VariableNode = NodeSpan & {
  readonly type: 'Variable';
  readonly name: string;
};

/**
 * Grouped-roll node (`{expr}`, `{expr1, expr2, ...}`).
 *
 * Distinct from `GroupedNode` (parenthesized wrapper) — a `GroupNode`
 * collects one or more sub-expressions whose evaluation semantics change
 * with the sub-roll count. `expressions.length === 1` is a passthrough
 * (flat-pool when wrapped by keep/drop); `expressions.length >= 2` treats
 * each sub-roll's subtotal as a compound die for keep/drop selection.
 *
 * @category AST
 */
export type GroupNode = NodeSpan & {
  readonly type: 'Group';
  readonly expressions: readonly ASTNode[];
};

/**
 * Sort modifier node (`s`, `sa`, `sd`).
 *
 * Cosmetically reorders the dice produced by `target` in ascending or
 * descending order. Purely visual — does not affect `total`,
 * `successes`/`failures`, or any die-level flag (`kept`/`dropped`/
 * `critical`/`fumble`). Dropped dice retain their `dropped` flag and
 * appear in sorted position alongside kept dice.
 *
 * `s` and `sa` both mean ascending; `sd` is descending.
 *
 * @category AST
 */
export type SortNode = NodeSpan & {
  readonly type: 'Sort';
  readonly order: 'ascending' | 'descending';
  readonly target: ASTNode;
};

/**
 * Sentinel for bare `cs` / `cf` without a ComparePoint. Resolved at
 * evaluation time against each die's own `sides` and its natural face
 * (`initialResult ?? result`): critical when that face equals `sides`,
 * fumble when it equals 1.
 *
 * @category AST
 */
export type CritThreshold = ComparePoint | 'default';

/**
 * Critical threshold modifier node (`cs`, `cf`).
 *
 * Overrides the default `critical`/`fumble` flag logic for the dice
 * produced by `target`. Bare `cs`/`cf` uses the `'default'` sentinel
 * (max face / 1). Custom thresholds accept any ComparePoint. Chaining
 * collapses into a single node — `1d20cs=20cs=1cf>18` has two success
 * and one fail threshold. Display-only: does not change `total`,
 * explosion triggers, or success counting. `cs` and `cf` are independent
 * overrides — a side with no explicit thresholds keeps the default rule
 * (the evaluator substitutes the `'default'` sentinel at apply time).
 *
 * @category AST
 */
export type CritThresholdNode = NodeSpan & {
  readonly type: 'CritThreshold';
  readonly successThresholds: readonly CritThreshold[];
  readonly failThresholds: readonly CritThreshold[];
  readonly target: ASTNode;
};

/**
 * Discriminated union of all 17 AST node types — what {@link parse} returns
 * and what {@link evaluate} consumes.
 *
 * Narrow it either by switching on `node.type` (PascalCase discriminants, as
 * opposed to the camelCase ones on {@link RollPart}) or with the exported
 * type guards: {@link isLiteral}, {@link isDice}, {@link isFateDice},
 * {@link isBinaryOp}, {@link isUnaryOp}, {@link isKeepDrop},
 * {@link isExplode}, {@link isReroll}, {@link isDieBound},
 * {@link isSuccessCount}, {@link isVersus}, {@link isFunctionCall},
 * {@link isGrouped}, {@link isVariable}, {@link isGroup}, {@link isSort},
 * {@link isCritThreshold}.
 *
 * Nodes are plain data with no methods, so they are structurally clonable and
 * safe to cache. Every parser-produced node carries a {@link NodeSpan}.
 *
 * @example A guard-based walker — count the dice an expression can roll
 * ```typescript
 * import {
 *   type ASTNode, isBinaryOp, isDice, isFateDice, isGroup, isGrouped,
 *   isFunctionCall, isLiteral, isUnaryOp, isVersus, parse,
 * } from 'roll-parser';
 *
 * function countPools(node: ASTNode): number {
 *   if (isDice(node) || isFateDice(node)) return 1;
 *   if (isLiteral(node)) return 0;
 *   if (isBinaryOp(node)) return countPools(node.left) + countPools(node.right);
 *   if (isUnaryOp(node)) return countPools(node.operand);
 *   if (isGrouped(node)) return countPools(node.expression);
 *   if (isVersus(node)) return countPools(node.roll) + countPools(node.dc);
 *   if (isGroup(node)) return node.expressions.reduce((n, e) => n + countPools(e), 0);
 *   if (isFunctionCall(node)) return node.args.reduce((n, a) => n + countPools(a), 0);
 *   // Every remaining variant is a postfix modifier wrapping `target`.
 *   return 'target' in node ? countPools(node.target) : 0;
 * }
 *
 * countPools(parse('2d6+3')); // 1
 * countPools(parse('{2d20kh1+5, 3d8!}kh1')); // 2
 * countPools(parse('1+2')); // 0
 * ```
 *
 * @category AST
 */
export type ASTNode =
  | LiteralNode
  | DiceNode
  | FateDiceNode
  | BinaryOpNode
  | UnaryOpNode
  | KeepDropNode
  | ExplodeNode
  | RerollNode
  | DieBoundNode
  | SuccessCountNode
  | VersusNode
  | FunctionCallNode
  | GroupedNode
  | VariableNode
  | GroupNode
  | SortNode
  | CritThresholdNode;

/**
 * Narrows an {@link ASTNode} to a numeric literal (`3`, `2.5`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link LiteralNode}
 *
 * @category AST
 */
export function isLiteral(node: ASTNode): node is LiteralNode {
  return node.type === 'Literal';
}

/**
 * Narrows an {@link ASTNode} to a dice pool (`2d6`, `d%`, `(1d4)d6`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link DiceNode}
 *
 * @category AST
 */
export function isDice(node: ASTNode): node is DiceNode {
  return node.type === 'Dice';
}

/**
 * Narrows an {@link ASTNode} to a Fate/Fudge pool (`4dF`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link FateDiceNode}
 *
 * @category AST
 */
export function isFateDice(node: ASTNode): node is FateDiceNode {
  return node.type === 'FateDice';
}

/**
 * Narrows an {@link ASTNode} to an arithmetic operation (`+ - * / % **`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link BinaryOpNode}
 *
 * @category AST
 */
export function isBinaryOp(node: ASTNode): node is BinaryOpNode {
  return node.type === 'BinaryOp';
}

/**
 * Narrows an {@link ASTNode} to a prefix negation (`-1d4`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link UnaryOpNode}
 *
 * @category AST
 */
export function isUnaryOp(node: ASTNode): node is UnaryOpNode {
  return node.type === 'UnaryOp';
}

/**
 * Narrows an {@link ASTNode} to a keep/drop modifier (`kh`, `kl`, `dh`, `dl`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link KeepDropNode}
 *
 * @category AST
 */
export function isKeepDrop(node: ASTNode): node is KeepDropNode {
  return node.type === 'KeepDrop';
}

/**
 * Narrows an {@link ASTNode} to an explosion (`!`, `!!`, `!p`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link ExplodeNode}
 *
 * @category AST
 */
export function isExplode(node: ASTNode): node is ExplodeNode {
  return node.type === 'Explode';
}

/**
 * Narrows an {@link ASTNode} to a reroll (`r`, `ro`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link RerollNode}
 *
 * @category AST
 */
export function isReroll(node: ASTNode): node is RerollNode {
  return node.type === 'Reroll';
}

/**
 * Narrows an {@link ASTNode} to a success count (`>=6`, with optional `f1`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link SuccessCountNode}
 *
 * @category AST
 */
export function isSuccessCount(node: ASTNode): node is SuccessCountNode {
  return node.type === 'SuccessCount';
}

/**
 * Narrows an {@link ASTNode} to a PF2e degree-of-success check (`vs`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link VersusNode}
 *
 * @category AST
 */
export function isVersus(node: ASTNode): node is VersusNode {
  return node.type === 'Versus';
}

/**
 * Narrows an {@link ASTNode} to a math function call (`floor`, `max`, …).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link FunctionCallNode}
 *
 * @category AST
 */
export function isFunctionCall(node: ASTNode): node is FunctionCallNode {
  return node.type === 'FunctionCall';
}

/**
 * Narrows an {@link ASTNode} to a parenthesized group (`(1d6+2)`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link GroupedNode}
 *
 * @category AST
 */
export function isGrouped(node: ASTNode): node is GroupedNode {
  return node.type === 'Grouped';
}

/**
 * Narrows an {@link ASTNode} to a variable reference (`@str`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link VariableNode}
 *
 * @category AST
 */
export function isVariable(node: ASTNode): node is VariableNode {
  return node.type === 'Variable';
}

/**
 * Narrows an {@link ASTNode} to a braced grouped roll (`{1d8, 1d10}`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link GroupNode}
 *
 * @category AST
 */
export function isGroup(node: ASTNode): node is GroupNode {
  return node.type === 'Group';
}

/**
 * Narrows an {@link ASTNode} to a sort modifier (`s`, `sa`, `sd`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link SortNode}
 *
 * @category AST
 */
export function isSort(node: ASTNode): node is SortNode {
  return node.type === 'Sort';
}

/**
 * Narrows an {@link ASTNode} to a crit-threshold override (`cs`, `cf`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link CritThresholdNode}
 *
 * @category AST
 */
export function isCritThreshold(node: ASTNode): node is CritThresholdNode {
  return node.type === 'CritThreshold';
}

/**
 * Narrows an {@link ASTNode} to a per-die clamp (`min2`, `max5`).
 *
 * @param node - Any AST node
 * @returns `true` when `node` is a {@link DieBoundNode}
 *
 * @category AST
 */
export function isDieBound(node: ASTNode): node is DieBoundNode {
  return node.type === 'DieBound';
}
