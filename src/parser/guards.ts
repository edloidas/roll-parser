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
 * Peels nested `Grouped` wrappers, returning the first descendant that is not
 * one. The narrow unwrap for reject helpers whose forbidden node cannot live
 * inside `KeepDrop`/`Sort`/`CritThreshold` — those parsers already reject it
 * upstream, so peeling parentheses is all that is left to see through.
 */
export function unwrapGrouped(node: ASTNode): ASTNode {
  let current = node;
  while (current.type === 'Grouped') {
    current = current.expression;
  }
  return current;
}

/**
 * Peels every transparent wrapper — `Grouped`, `KeepDrop`, `Sort`,
 * `CritThreshold`, `DieBound` — returning the first descendant that is none of
 * them.
 *
 * "Transparent" is relative to the question being asked. These wrappers
 * preserve `containsDicePool`'s answer for whatever they wrap, so they are
 * transparent for "what is the underlying operand?" when deciding whether to
 * reject a `Group` target (e.g., `Group` cannot be the target of `cs`/`cf`,
 * even when wrapped in `KeepDrop` like `{1d6}kh1cs>5`). They are NOT
 * transparent for "is this a `SuccessCount`?" or "is this a `Versus`?" —
 * those questions use `unwrapGrouped`.
 */
export function unwrapAllTransparent(node: ASTNode): ASTNode {
  let current = node;
  while (true) {
    switch (current.type) {
      case 'Grouped':
        current = current.expression;
        break;
      case 'KeepDrop':
      case 'Sort':
      case 'CritThreshold':
      case 'DieBound':
        current = current.target;
        break;
      default:
        return current;
    }
  }
}

/**
 * Returns `true` when `node` or any descendant satisfies `isHit`. Recurses
 * directly through the entire node vocabulary: arithmetic operands,
 * modifier-chain targets, `Versus` sides, function arguments, and group
 * sub-expressions. This is the shared driver behind the four deep walkers
 * below. The shallow walkers (`containsDicePool`, `containsFatePool`) stay
 * hand-written because their rejection semantics deliberately stop at
 * arithmetic boundaries.
 */
function someDescendant(node: ASTNode, isHit: (node: ASTNode) => boolean): boolean {
  if (isHit(node)) return true;

  switch (node.type) {
    case 'BinaryOp':
      return someDescendant(node.left, isHit) || someDescendant(node.right, isHit);
    case 'UnaryOp':
      return someDescendant(node.operand, isHit);
    case 'KeepDrop':
    case 'Explode':
    case 'Reroll':
    case 'DieBound':
    case 'SuccessCount':
    case 'Sort':
    case 'CritThreshold':
      return someDescendant(node.target, isHit);
    case 'Versus':
      return someDescendant(node.roll, isHit) || someDescendant(node.dc, isHit);
    case 'FunctionCall': {
      for (const arg of node.args) {
        if (someDescendant(arg, isHit)) return true;
      }
      return false;
    }
    case 'Grouped':
      return someDescendant(node.expression, isHit);
    case 'Group': {
      for (const expression of node.expressions) {
        if (someDescendant(expression, isHit)) return true;
      }
      return false;
    }
    default:
      return false;
  }
}

// Hoisted `someDescendant` predicates — the deep walkers run on nearly every
// LED parse, so rebuilding these closures per call is measurable churn.
const isDicePoolHit = (current: ASTNode): boolean =>
  current.type === 'Dice' ||
  current.type === 'FateDice' ||
  (current.type === 'Group' && current.expressions.length >= 2);

const isFateDiceHit = (current: ASTNode): boolean => current.type === 'FateDice';

const isDiceHit = (current: ASTNode): boolean =>
  current.type === 'Dice' || current.type === 'FateDice';

const isMultiSubGroupHit = (current: ASTNode): boolean =>
  current.type === 'Group' && current.expressions.length >= 2;

const isVersusHit = (current: ASTNode): boolean => current.type === 'Versus';

/**
 * Returns `true` only when `node`'s direct result is a dice pool —
 * `Dice`, `FateDice`, or a chained pool modifier (`KeepDrop` / `Explode` /
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
    case 'KeepDrop':
    case 'Explode':
    case 'Reroll':
    case 'DieBound':
      return true;
    case 'Sort':
    case 'CritThreshold':
      return containsDicePool(node.target);
    case 'Grouped':
      return containsDicePool(node.expression);
    case 'Group':
      // Multi-sub-roll groups (`{a, b, c}kh1`) always accept: keep/drop operates
      // on subtotals, which are compound dice by definition — even a
      // literal-only `{3, 5, 7}kh1` is valid. A single-sub-roll group is the
      // user's explicit opt-in to flat-pool semantics, so it deep-walks
      // arithmetic that a raw `(1d6+5)kh1` rejects — the Stage 3 `{}` escape
      // hatch.
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
  return someDescendant(node, isDicePoolHit);
}

/**
 * Returns `true` when this node's total provably equals the sum of its kept
 * dice faces: a pool, a chain of pool modifiers over one, or an addition of
 * those. A multi-sub-roll `Group` qualifies when every sub-roll does, since its
 * total is their sum and `evalGroupKeepDrop` re-flags dropped sub-rolls' dice.
 *
 * Guards the single-sub-roll `Group` keep/drop target, whose flat-pool path
 * totals `sumKeptDice`. Anything else in there — a literal, a subtracted or
 * scaled dice term, a function call, a success count — contributes to the
 * group's own total but not to that face sum, so `{2d6+3}kh2` would lose the
 * `+3` and `{2d6-1d4}kh3` would flip the `1d4` from `-3` to `+3` while dropping
 * nothing.
 */
export function sumsToKeptFaces(node: ASTNode): boolean {
  switch (node.type) {
    case 'Dice':
    case 'FateDice':
      return true;
    case 'KeepDrop':
    case 'Explode':
    case 'Reroll':
    case 'DieBound':
    case 'Sort':
    case 'CritThreshold':
      return sumsToKeptFaces(node.target);
    case 'Grouped':
      return sumsToKeptFaces(node.expression);
    case 'Group':
      return node.expressions.every(sumsToKeptFaces);
    case 'BinaryOp':
      return node.operator === '+' && sumsToKeptFaces(node.left) && sumsToKeptFaces(node.right);
    default:
      return false;
  }
}

/**
 * Returns `true` when comparing this node's dice one face at a time is faithful
 * to what it totals. Shaped like `sumsToKeptFaces` but answering a different
 * question, so the two differ on three node types:
 *
 * - `SuccessCount` passes — a nested count re-scores the very same faces.
 * - `Versus` looks only at its roll side — no pool pass ever counts a DC.
 * - a multi-sub-roll `Group` fails everywhere, because its units are subtotals.
 *   `sumsToKeptFaces` accepts one, a sum of subtotals still being a face sum.
 *
 * Guards the flat success-count path, whose units are individual dice. The
 * subtotal path takes a direct multi-sub-roll `Group` before this is consulted.
 */
export function countsPerDie(node: ASTNode): boolean {
  switch (node.type) {
    case 'Dice':
    case 'FateDice':
      return true;
    case 'KeepDrop':
    case 'Explode':
    case 'Reroll':
    case 'DieBound':
    case 'Sort':
    case 'CritThreshold':
    case 'SuccessCount':
      return countsPerDie(node.target);
    case 'Versus':
      return countsPerDie(node.roll);
    case 'Grouped':
      return countsPerDie(node.expression);
    case 'Group':
      return node.expressions.length === 1 && node.expressions.every(countsPerDie);
    case 'BinaryOp':
      return node.operator === '+' && countsPerDie(node.left) && countsPerDie(node.right);
    default:
      return false;
  }
}

/**
 * Deep-walks a node to find any descendant `Dice` or `FateDice`. Unlike
 * `deepContainsDicePool`, a multi-sub-roll `Group` is not a hit in its own
 * right — only real dice are.
 *
 * Used by the success-count parser guard, which tallies individual dice rather
 * than subtotals: a literal-only group satisfies `containsDicePool` yet rolls
 * nothing to tally.
 */
export function containsDice(node: ASTNode): boolean {
  return someDescendant(node, isDiceHit);
}

/**
 * Returns `true` if the pool this node resolves to is (or wraps) a `FateDice`
 * pool. Walks through chained pool modifiers (`KeepDrop` / `Explode` /
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
    case 'KeepDrop':
    case 'Explode':
    case 'Reroll':
    case 'DieBound':
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
  return someDescendant(node, isFateDiceHit);
}

/**
 * Deep-walks a node to find any descendant `Group` with two or more
 * sub-expressions. Used by `rejectGroupTarget`'s single-sub-roll
 * passthrough so a multi-sub Group buried under arithmetic
 * (`{{1d6,2d8}+0}cs>5`), function calls (`{abs({1d6,2d8})}cs>5`), or any
 * other non-transparent wrapper still rejects with the same error code.
 *
 * Without this walk, the unwrap inside `rejectGroupTarget` only peels
 * `Grouped`/`KeepDrop`/`Sort`/`CritThreshold` — a multi-sub Group cloaked
 * in a `BinaryOp`/`UnaryOp`/`FunctionCall` reaches the evaluator, where it
 * flags crits on dice belonging to dropped sub-rolls.
 */
export function containsMultiSubGroup(node: ASTNode): boolean {
  return someDescendant(node, isMultiSubGroupHit);
}

/**
 * Deep-walks a node to find any descendant `Versus`. A buried Versus
 * (`floor(1d20 vs 15)`, `(1d20 vs 15)+0`, `{1+(1d20 vs 15)}`) must reject with
 * `NESTED_VERSUS` rather than silently drop `versusMetadata` at the consumer.
 *
 * Two callers, both on that hole: `rejectVersusMetaOperand` guards every meta
 * operand — dice count and sides, keep/drop count, thresholds, die bounds — and
 * `rejectVersusTarget` uses it for its single-sub-roll Group passthrough.
 * `evalMetaOperand` runs the same walk as the hand-built-AST backstop.
 */
export function containsVersus(node: ASTNode): boolean {
  return someDescendant(node, isVersusHit);
}
