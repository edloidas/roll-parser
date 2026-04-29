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
 * Variable reference node (`@name` or `@{name with spaces}`).
 *
 * Resolves to a numeric value from the evaluator's `context` map at
 * evaluation time. Names are case-sensitive (`@StrMod` ≠ `@strmod`) — the
 * lexer preserves case in the `AT` token's `value`, distinct from other
 * identifier tokens which lowercase. Leaf node — no LED, never wraps a
 * sub-expression.
 */
export type VariableNode = {
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
export type GroupNode = {
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
export type SortNode = {
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
 * explosion triggers, or success counting. An empty `failThresholds`
 * forces `fumble: false` on every die (replace, not merge) — same
 * for `successThresholds` and `critical`.
 */
export type CritThresholdNode = {
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

/**
 * Wrapper kinds that `unwrapTransparent` can peel.
 *
 * "Transparent" is relative to the question being asked. `Modifier`/`Sort`/
 * `CritThreshold` are transparent for "what is the underlying operand?" when
 * deciding whether to reject a `Group` target — they preserve `containsDicePool`'s
 * answer for whatever they wrap. They are NOT transparent for "is this a
 * `SuccessCount`?" or "is this a `Versus`?", because the parsers that build
 * those wrappers already reject `SuccessCount`/`Versus` operands upstream.
 */
export type TransparentWrapperKind = 'Grouped' | 'Modifier' | 'Sort' | 'CritThreshold';

/**
 * Walks `node` while its `.type` is in `kinds`, returning the first descendant
 * that is not one of the listed wrappers. Each caller picks the subset that
 * matches its rejection semantics — see `TransparentWrapperKind` for guidance.
 *
 * Used by parser reject helpers to look past wrappers when deciding whether
 * an operand violates a rule (e.g., `Group` cannot be the target of `cs`/`cf`,
 * even when wrapped in `Modifier` like `{1d6}kh1cs>5`).
 */
export function unwrapTransparent(
  node: ASTNode,
  kinds: readonly TransparentWrapperKind[],
): ASTNode {
  let current = node;
  while (true) {
    switch (current.type) {
      case 'Grouped':
        if (!kinds.includes('Grouped')) return current;
        current = current.expression;
        break;
      case 'Modifier':
        if (!kinds.includes('Modifier')) return current;
        current = current.target;
        break;
      case 'Sort':
        if (!kinds.includes('Sort')) return current;
        current = current.target;
        break;
      case 'CritThreshold':
        if (!kinds.includes('CritThreshold')) return current;
        current = current.target;
        break;
      default:
        return current;
    }
  }
}

/**
 * Returns `true` only when `node`'s direct result is a dice pool —
 * `Dice`, `FateDice`, or a chained pool modifier (`Modifier` / `Explode` /
 * `Reroll`). Does NOT recurse through arithmetic wrappers (`BinaryOp`,
 * `UnaryOp`, `FunctionCall`), so `(1d6+5)` and `floor(1d6/2)` are rejected.
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
    case 'Sort':
    case 'CritThreshold':
      return containsDicePool(node.target);
    case 'Grouped':
      return containsDicePool(node.expression);
    case 'Group':
      // ? Multi-sub-roll groups (`{a, b, c}kh1`) always accept: keep/drop
      //   operates on subtotals, which are "compound dice" by definition —
      //   even a literal-only `{3, 5, 7}kh1` is valid. Single-sub-roll
      //   groups are the user's explicit opt-in to flat-pool semantics, so
      //   we deep-walk through arithmetic that a raw `(1d6+5)kh1` would
      //   reject. This is the `{}` escape hatch per Stage 3 spec.
      return node.expressions.length >= 2 || node.expressions.some(deepContainsDicePool);
    default:
      return false;
  }
}

/**
 * Deeper variant of `containsDicePool` that recurses through arithmetic and
 * function wrappers. Used from the `Group` case above (ordinary parenthesized
 * arithmetic `(1d6+5)kh1` must still reject, so the shallow `containsDicePool`
 * handles those directly) and from the Sort parser guard (sort accepts
 * `(1d6+2d8)s` per Stage 3 spec).
 */
export function deepContainsDicePool(node: ASTNode): boolean {
  switch (node.type) {
    case 'Dice':
    case 'FateDice':
      return true;
    case 'BinaryOp':
      return deepContainsDicePool(node.left) || deepContainsDicePool(node.right);
    case 'UnaryOp':
      return deepContainsDicePool(node.operand);
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      return deepContainsDicePool(node.target);
    case 'Versus':
      return deepContainsDicePool(node.roll) || deepContainsDicePool(node.dc);
    case 'FunctionCall':
      return node.args.some(deepContainsDicePool);
    case 'Grouped':
      return deepContainsDicePool(node.expression);
    case 'Group':
      return node.expressions.length >= 2 || node.expressions.some(deepContainsDicePool);
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
 *
 * Inside a `Group`, recursion uses `deepContainsFatePool` to mirror
 * `containsDicePool`'s deep walk through the same case — otherwise
 * `{4dF+1d6}cf` slips past the bare-Fate guard and the default fumble
 * check (`result === 1`) flips `+1` faces into fumbles.
 */
export function containsFatePool(node: ASTNode): boolean {
  switch (node.type) {
    case 'FateDice':
      return true;
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'Sort':
    case 'CritThreshold':
      return containsFatePool(node.target);
    case 'Grouped':
      return containsFatePool(node.expression);
    case 'Group':
      return node.expressions.some(deepContainsFatePool);
    default:
      return false;
  }
}

/**
 * Deeper variant of `containsFatePool` that recurses through arithmetic and
 * function wrappers. Mirrors `deepContainsDicePool`. Used from
 * `containsFatePool`'s `Group` case so single-sub-roll groups containing
 * arithmetic-wrapped Fate (`{4dF+1d6}cf`) still trip the bare-Fate guard.
 *
 * Outside a `Group`, ordinary parenthesized arithmetic (`(4dF+1d6)cf`) is
 * already rejected upstream by shallow `containsDicePool`, so this helper
 * intentionally stays Group-internal.
 */
export function deepContainsFatePool(node: ASTNode): boolean {
  switch (node.type) {
    case 'FateDice':
      return true;
    case 'BinaryOp':
      return deepContainsFatePool(node.left) || deepContainsFatePool(node.right);
    case 'UnaryOp':
      return deepContainsFatePool(node.operand);
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      return deepContainsFatePool(node.target);
    case 'Versus':
      return deepContainsFatePool(node.roll) || deepContainsFatePool(node.dc);
    case 'FunctionCall':
      return node.args.some(deepContainsFatePool);
    case 'Grouped':
      return deepContainsFatePool(node.expression);
    case 'Group':
      return node.expressions.some(deepContainsFatePool);
    default:
      return false;
  }
}

/**
 * Deep-walks a node to find any descendant `Group` with two or more
 * sub-expressions. Used by `rejectGroupTarget`'s single-sub-roll
 * passthrough so a multi-sub Group buried under arithmetic
 * (`{{1d6,2d8}+0}cs>5`), function calls (`{abs({1d6,2d8})}cs>5`), or any
 * other non-transparent wrapper still rejects with the same error code.
 *
 * Without this walk, the unwrap inside `rejectGroupTarget` only peels
 * `Grouped`/`Modifier`/`Sort`/`CritThreshold` — a multi-sub Group cloaked
 * in a `BinaryOp`/`UnaryOp`/`FunctionCall` revives issue #97.
 */
export function containsMultiSubGroup(node: ASTNode): boolean {
  switch (node.type) {
    case 'Group':
      return node.expressions.length >= 2 || node.expressions.some(containsMultiSubGroup);
    case 'BinaryOp':
      return containsMultiSubGroup(node.left) || containsMultiSubGroup(node.right);
    case 'UnaryOp':
      return containsMultiSubGroup(node.operand);
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      return containsMultiSubGroup(node.target);
    case 'Versus':
      return containsMultiSubGroup(node.roll) || containsMultiSubGroup(node.dc);
    case 'FunctionCall':
      return node.args.some(containsMultiSubGroup);
    case 'Grouped':
      return containsMultiSubGroup(node.expression);
    default:
      return false;
  }
}

/**
 * Deep-walks a node to find any descendant `Versus`. Used by
 * `rejectVersusTarget`'s single-sub-roll Group passthrough so a buried
 * Versus (`{1+(1d20 vs 15)}cs>18`, `{abs(1d20 vs 15)}cs>18`,
 * `{-(1d20 vs 15)}kh1`) still rejects with `NESTED_VERSUS` instead of
 * silently dropping `versusMetadata` at the modifier consumer site.
 */
export function containsVersus(node: ASTNode): boolean {
  switch (node.type) {
    case 'Versus':
      return true;
    case 'BinaryOp':
      return containsVersus(node.left) || containsVersus(node.right);
    case 'UnaryOp':
      return containsVersus(node.operand);
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      return containsVersus(node.target);
    case 'FunctionCall':
      return node.args.some(containsVersus);
    case 'Grouped':
      return containsVersus(node.expression);
    case 'Group':
      return node.expressions.some(containsVersus);
    default:
      return false;
  }
}
