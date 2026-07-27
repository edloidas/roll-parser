/**
 * Parser-internal AST guards.
 *
 * These helpers answer structural questions the parser's reject rules ask
 * ("does this operand resolve to a dice pool?", "is a Versus buried in
 * here?"). They are implementation detail of `parser.ts` — the public
 * `isXxx` type guards stay in `ast.ts`.
 *
 * @module parser/guards
 */

import type { ASTNode } from './ast.js';

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
 * Yields every direct child of `node`, covering the full node vocabulary:
 * arithmetic operands, modifier-chain targets, `Versus` sides, function
 * arguments, and group sub-expressions. Leaves yield nothing.
 */
function* childNodes(node: ASTNode): Generator<ASTNode> {
  switch (node.type) {
    case 'BinaryOp':
      yield node.left;
      yield node.right;
      return;
    case 'UnaryOp':
      yield node.operand;
      return;
    case 'Modifier':
    case 'Explode':
    case 'Reroll':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      yield node.target;
      return;
    case 'Versus':
      yield node.roll;
      yield node.dc;
      return;
    case 'FunctionCall':
      yield* node.args;
      return;
    case 'Grouped':
      yield node.expression;
      return;
    case 'Group':
      yield* node.expressions;
      return;
    default:
      return;
  }
}

/**
 * Returns `true` when `node` or any descendant satisfies `isHit`. Recurses
 * through the entire node vocabulary via `childNodes` — this is the shared
 * driver behind the four deep walkers below. The shallow walkers
 * (`containsDicePool`, `containsFatePool`) stay hand-written because their
 * rejection semantics deliberately stop at arithmetic boundaries.
 */
function someDescendant(node: ASTNode, isHit: (node: ASTNode) => boolean): boolean {
  if (isHit(node)) return true;

  for (const child of childNodes(node)) {
    if (someDescendant(child, isHit)) return true;
  }

  return false;
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
 *
 * A multi-sub-roll `Group` counts as a pool in its own right (compound dice),
 * matching `containsDicePool`'s Group rule.
 */
export function deepContainsDicePool(node: ASTNode): boolean {
  return someDescendant(
    node,
    (current) =>
      current.type === 'Dice' ||
      current.type === 'FateDice' ||
      (current.type === 'Group' && current.expressions.length >= 2),
  );
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
  return someDescendant(node, (current) => current.type === 'FateDice');
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
  return someDescendant(
    node,
    (current) => current.type === 'Group' && current.expressions.length >= 2,
  );
}

/**
 * Deep-walks a node to find any descendant `Versus`. Used by
 * `rejectVersusTarget`'s single-sub-roll Group passthrough so a buried
 * Versus (`{1+(1d20 vs 15)}cs>18`, `{abs(1d20 vs 15)}cs>18`,
 * `{-(1d20 vs 15)}kh1`) still rejects with `NESTED_VERSUS` instead of
 * silently dropping `versusMetadata` at the modifier consumer site.
 */
export function containsVersus(node: ASTNode): boolean {
  return someDescendant(node, (current) => current.type === 'Versus');
}
