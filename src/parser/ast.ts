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
 */
export type NodeSpan = {
  readonly start?: number;
  readonly end?: number;
};

/**
 * Numeric literal node.
 */
export type LiteralNode = NodeSpan & {
  type: 'Literal';
  value: number;
};

/**
 * Dice roll node.
 * Count and sides can be expressions to support computed dice like (1+1)d(3*2).
 */
export type DiceNode = NodeSpan & {
  type: 'Dice';
  count: ASTNode;
  sides: ASTNode;
};

/**
 * Fate/Fudge dice node (`dF`).
 * Each die produces a result in {-1, 0, +1}. No configurable sides.
 */
export type FateDiceNode = NodeSpan & {
  type: 'FateDice';
  count: ASTNode;
};

/**
 * Binary operation node.
 */
export type BinaryOpNode = NodeSpan & {
  type: 'BinaryOp';
  operator: '+' | '-' | '*' | '/' | '%' | '**';
  left: ASTNode;
  right: ASTNode;
};

/**
 * Unary operation node.
 */
export type UnaryOpNode = NodeSpan & {
  type: 'UnaryOp';
  operator: '-';
  operand: ASTNode;
};

/**
 * Keep/drop modifier node.
 * Wraps a dice expression with keep highest/lowest or drop highest/lowest.
 */
export type ModifierNode = NodeSpan & {
  type: 'Modifier';
  modifier: 'keep' | 'drop';
  selector: 'highest' | 'lowest';
  count: ASTNode;
  target: ASTNode;
};

/**
 * Exploding dice node (`!`, `!!`, `!p`, `!>Y`).
 * Wraps a dice expression with a standard, compounding, or penetrating
 * explosion. An absent `threshold` means "explode on the die's maximum face".
 */
export type ExplodeNode = NodeSpan & {
  type: 'Explode';
  variant: 'standard' | 'compound' | 'penetrating';
  threshold?: ComparePoint;
  target: ASTNode;
};

/**
 * Reroll node (`r<COND>`, `ro<COND>`).
 * Re-rolls dice that match a comparison condition. `once: true` for `ro`
 * keeps the second result regardless of match; `once: false` for `r`
 * re-rolls recursively until the condition no longer matches.
 */
export type RerollNode = NodeSpan & {
  type: 'Reroll';
  once: boolean;
  condition: ComparePoint;
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
 */
export type SuccessCountNode = NodeSpan & {
  type: 'SuccessCount';
  target: ASTNode;
  threshold: ComparePoint;
  failThreshold?: ComparePoint;
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
 */
export type VersusNode = NodeSpan & {
  type: 'Versus';
  roll: ASTNode;
  dc: ASTNode;
};

/**
 * Math function call node (`floor(expr)`, `max(a, b, ...)`, etc.).
 *
 * Supports the fixed-arity functions `floor`, `ceil`, `round`, `abs`, and the
 * variadic functions `max`, `min` (minimum 2 args). Arity is validated at
 * parse time against a static table; by the time the evaluator sees a
 * `FunctionCallNode`, `args.length` is guaranteed to match the function.
 */
export type FunctionCallNode = NodeSpan & {
  type: 'FunctionCall';
  name: string;
  args: ASTNode[];
};

/**
 * Parenthesized group node (`(<expr>)`).
 *
 * Preserves explicit grouping typed by the user so that
 * `RollResult.expression` and `RollResult.rendered` round-trip through
 * `parse` without losing precedence information. Semantically transparent:
 * evaluation returns the inner expression's value unchanged.
 */
export type GroupedNode = NodeSpan & {
  type: 'Grouped';
  expression: ASTNode;
};

/**
 * Variable reference node (`@name` or `@{name with spaces}`).
 *
 * Resolves to a numeric value from the evaluator's `context` map at
 * evaluation time. Names are case-sensitive (`@StrMod` ≠ `@strmod`) — the
 * lexer preserves case in the `AT` token's `value`, distinct from other
 * identifier tokens which lowercase. Leaf node — no LED, never wraps a
 * sub-expression.
 */
export type VariableNode = NodeSpan & {
  type: 'Variable';
  name: string;
};

/**
 * Grouped-roll node (`{expr}`, `{expr1, expr2, ...}`).
 *
 * Distinct from `GroupedNode` (parenthesized wrapper) — a `GroupNode`
 * collects one or more sub-expressions whose evaluation semantics change
 * with the sub-roll count. `expressions.length === 1` is a passthrough
 * (flat-pool when wrapped by keep/drop); `expressions.length >= 2` treats
 * each sub-roll's subtotal as a compound die for keep/drop selection.
 */
export type GroupNode = NodeSpan & {
  type: 'Group';
  expressions: ASTNode[];
};

/**
 * Sort modifier node (`s`, `sa`, `sd`).
 *
 * Cosmetically reorders the dice produced by `target` in ascending or
 * descending order. Purely visual — does not affect `total`,
 * `successes`/`failures`, or any die-level flag (`kept`/`dropped`/
 * `critical`/`fumble`). Dropped dice retain their `dropped` flag and
 * appear in sorted position alongside kept dice.
 */
export type SortNode = NodeSpan & {
  type: 'Sort';
  order: 'ascending' | 'descending';
  target: ASTNode;
};

/**
 * Sentinel for bare `cs` / `cf` without a ComparePoint. Resolved to
 * `result === sides` (for critical) or `result === 1` (for fumble) at
 * evaluation time, using each die's own `sides`.
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
 */
export type CritThresholdNode = NodeSpan & {
  type: 'CritThreshold';
  successThresholds: CritThreshold[];
  failThresholds: CritThreshold[];
  target: ASTNode;
};

/**
 * Union type of all AST nodes.
 */
export type ASTNode =
  | LiteralNode
  | DiceNode
  | FateDiceNode
  | BinaryOpNode
  | UnaryOpNode
  | ModifierNode
  | ExplodeNode
  | RerollNode
  | SuccessCountNode
  | VersusNode
  | FunctionCallNode
  | GroupedNode
  | VariableNode
  | GroupNode
  | SortNode
  | CritThresholdNode;

/**
 * Type guard for LiteralNode.
 */
export function isLiteral(node: ASTNode): node is LiteralNode {
  return node.type === 'Literal';
}

/**
 * Type guard for DiceNode.
 */
export function isDice(node: ASTNode): node is DiceNode {
  return node.type === 'Dice';
}

/**
 * Type guard for FateDiceNode.
 */
export function isFateDice(node: ASTNode): node is FateDiceNode {
  return node.type === 'FateDice';
}

/**
 * Type guard for BinaryOpNode.
 */
export function isBinaryOp(node: ASTNode): node is BinaryOpNode {
  return node.type === 'BinaryOp';
}

/**
 * Type guard for UnaryOpNode.
 */
export function isUnaryOp(node: ASTNode): node is UnaryOpNode {
  return node.type === 'UnaryOp';
}

/**
 * Type guard for ModifierNode.
 */
export function isModifier(node: ASTNode): node is ModifierNode {
  return node.type === 'Modifier';
}

/**
 * Type guard for ExplodeNode.
 */
export function isExplode(node: ASTNode): node is ExplodeNode {
  return node.type === 'Explode';
}

/**
 * Type guard for RerollNode.
 */
export function isReroll(node: ASTNode): node is RerollNode {
  return node.type === 'Reroll';
}

/**
 * Type guard for SuccessCountNode.
 */
export function isSuccessCount(node: ASTNode): node is SuccessCountNode {
  return node.type === 'SuccessCount';
}

/**
 * Type guard for VersusNode.
 */
export function isVersus(node: ASTNode): node is VersusNode {
  return node.type === 'Versus';
}

/**
 * Type guard for FunctionCallNode.
 */
export function isFunctionCall(node: ASTNode): node is FunctionCallNode {
  return node.type === 'FunctionCall';
}

/**
 * Type guard for GroupedNode.
 */
export function isGrouped(node: ASTNode): node is GroupedNode {
  return node.type === 'Grouped';
}

/**
 * Type guard for VariableNode.
 */
export function isVariable(node: ASTNode): node is VariableNode {
  return node.type === 'Variable';
}

/**
 * Type guard for GroupNode.
 */
export function isGroup(node: ASTNode): node is GroupNode {
  return node.type === 'Group';
}

/**
 * Type guard for SortNode.
 */
export function isSort(node: ASTNode): node is SortNode {
  return node.type === 'Sort';
}

/**
 * Type guard for CritThresholdNode.
 */
export function isCritThreshold(node: ASTNode): node is CritThresholdNode {
  return node.type === 'CritThreshold';
}
