/**
 * AST node type definitions for the dice notation parser.
 *
 * @module parser/ast
 */

import type { ComparePoint } from '../types';

/**
 * Numeric literal node.
 */
export type LiteralNode = {
  type: 'Literal';
  value: number;
};

/**
 * Dice roll node.
 * Count and sides can be expressions to support computed dice like (1+1)d(3*2).
 */
export type DiceNode = {
  type: 'Dice';
  count: ASTNode;
  sides: ASTNode;
};

/**
 * Fate/Fudge dice node (`dF`).
 * Each die produces a result in {-1, 0, +1}. No configurable sides.
 */
export type FateDiceNode = {
  type: 'FateDice';
  count: ASTNode;
};

/**
 * Binary operation node.
 */
export type BinaryOpNode = {
  type: 'BinaryOp';
  operator: '+' | '-' | '*' | '/' | '%' | '**';
  left: ASTNode;
  right: ASTNode;
};

/**
 * Unary operation node.
 */
export type UnaryOpNode = {
  type: 'UnaryOp';
  operator: '-';
  operand: ASTNode;
};

/**
 * Keep/drop modifier node.
 * Wraps a dice expression with keep highest/lowest or drop highest/lowest.
 */
export type ModifierNode = {
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
export type ExplodeNode = {
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
export type RerollNode = {
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
export type SuccessCountNode = {
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
export type VersusNode = {
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
export type FunctionCallNode = {
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
export type GroupedNode = {
  type: 'Grouped';
  expression: ASTNode;
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
  | GroupedNode;

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
 * Returns `true` if the AST contains a `Dice` or `FateDice` node reachable
 * through structural composition (BinaryOp, UnaryOp, keep/drop, explode,
 * reroll, success-count wrappers). Meta-expressions — dice count/sides,
 * modifier counts, and ComparePoint values — are treated as leaves and
 * never recursed into.
 *
 * Used by the parser to reject success-counting targets that don't actually
 * roll any dice (e.g. `1>=3`, `(1+2)>=3`).
 */
export function containsDice(node: ASTNode): boolean {
  switch (node.type) {
    case 'Dice':
    case 'FateDice':
      return true;
    case 'Literal':
      return false;
    case 'BinaryOp':
      return containsDice(node.left) || containsDice(node.right);
    case 'UnaryOp':
      return containsDice(node.operand);
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
      return containsDice(node.target);
    case 'Versus':
      return containsDice(node.roll) || containsDice(node.dc);
    case 'FunctionCall':
      return node.args.some(containsDice);
    case 'Grouped':
      return containsDice(node.expression);
  }
}

/**
 * Returns `true` only when `node`'s direct result is a dice pool —
 * `Dice`, `FateDice`, or a chained pool modifier (`Modifier` / `Explode` /
 * `Reroll`). Unlike `containsDice`, this does NOT recurse through arithmetic
 * wrappers (`BinaryOp`, `UnaryOp`, `FunctionCall`), so `(1d6+5)` and
 * `floor(1d6/2)` are rejected.
 *
 * Used by the parser to reject postfix pool-modifier targets (kh/kl/dh/dl,
 * !/!!/!p, r/ro) that wrap a non-pool expression. Operating on the inner
 * dice pool would silently drop the surrounding arithmetic.
 */
export function containsDicePool(node: ASTNode): boolean {
  switch (node.type) {
    case 'Dice':
    case 'FateDice':
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
      return true;
    case 'Grouped':
      return containsDicePool(node.expression);
    default:
      return false;
  }
}

/**
 * Returns `true` if the pool this node resolves to is (or wraps) a `FateDice`
 * pool. Walks through chained pool modifiers (`Modifier` / `Explode` /
 * `Reroll`) but not arithmetic wrappers — callers should run
 * `containsDicePool` first to reject those.
 *
 * Used by the parser to reject `!`, `!!`, `!p` applied to Fate pools
 * (`4dF!`, `(4dF)kh2!`, etc.). Fate explosion semantics are undefined, so
 * parse-time rejection is preferred over a silent evaluator no-op.
 */
export function containsFatePool(node: ASTNode): boolean {
  switch (node.type) {
    case 'FateDice':
      return true;
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
      return containsFatePool(node.target);
    case 'Grouped':
      return containsFatePool(node.expression);
    default:
      return false;
  }
}
