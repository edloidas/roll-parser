/**
 * AST evaluator - transforms parsed AST into roll results.
 *
 * @module evaluator/evaluator
 */

import { describeValue, EvaluatorError, RollParserError, stampEvaluatorSpan } from '../errors.js';
import type {
  ASTNode,
  BinaryOpNode,
  CritThreshold,
  CritThresholdNode,
  DiceNode,
  DieBoundNode,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  GroupNode,
  KeepDropNode,
  LiteralNode,
  RerollNode,
  SortNode,
  SuccessCountNode,
  UnaryOpNode,
  VariableNode,
  VersusNode,
} from '../parser/ast.js';
import { isKeepDrop } from '../parser/ast.js';
import type { RNG } from '../rng/types.js';
import type {
  CompareOp,
  ComparePoint,
  DieModifier,
  DieResult,
  EvaluateOptions,
  KeepDropSpec,
  ResolvedComparePoint,
  ResolvedCritThreshold,
  RollPart,
  RollResult,
} from '../types.js';
import { DegreeOfSuccess } from '../types.js';
import { createDieResult, createFateDieResult } from './die.js';
import { chargeDice, type EvalEnv } from './env.js';
import { applyCritThresholds } from './modifiers/crit-threshold.js';
import { applyDieBound } from './modifiers/die-bound.js';
import {
  applyCompoundExplode,
  applyPenetratingExplode,
  applyStandardExplode,
  buildShouldExplode,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
} from './modifiers/explode.js';
import {
  isVersusDc,
  rewriteFlags,
  SELECTION_AND_TALLY_FLAGS,
  SELECTION_FLAGS,
} from './modifiers/flags.js';
import { markDroppedIndices, sumKeptDice } from './modifiers/keep-drop.js';
import {
  applyRecursiveReroll,
  applyRerollOnce,
  DEFAULT_MAX_REROLL_ITERATIONS,
} from './modifiers/reroll.js';
import { sortDice } from './modifiers/sort.js';
import { countSuccesses } from './modifiers/success-count.js';

// Defined in `errors.ts` so the modifier modules can throw it without an ESM
// value cycle back through here; re-exported for importers that expect it here.
export { EvaluatorError };

//
// * Limits
//

/**
 * Default value of `EvaluationOptions.maxDice`: the number of dice a single
 * evaluation may roll before `DICE_LIMIT_EXCEEDED` is thrown.
 *
 * Counted across the whole expression, not per pool, so `6000d6+6000d6`
 * breaches it. Includes dice rolled by explosions, rerolls, and
 * meta-expressions.
 *
 * @category Limits
 */
export const DEFAULT_MAX_DICE = 10_000;

/**
 * Largest rollable `sides` value. `SeededRNG.nextInt` cannot sample ranges
 * above 2^53 without bias and throws a bare `RangeError` there, so cap one
 * below that and report an `EvaluatorError` instead — every failure the
 * library raises must satisfy `isRollParserError`.
 */
const MAX_DICE_SIDES = Number.MAX_SAFE_INTEGER;

/**
 * Resolves a user-supplied evaluation limit, failing closed.
 *
 * Absent (`undefined` / `null`) takes the library default — the no-options
 * path. Anything else must be a safe integer at or above `min`; strings,
 * `NaN`, `±Infinity`, negatives, and fractions all throw — substituting the
 * default for a rejected value would hand the caller a *higher* limit than
 * they asked for.
 */
function resolveLimit(
  value: number | undefined,
  option: string,
  fallback: number,
  min: number,
): number {
  if (value == null) return fallback;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min) {
    throw new RollParserError(
      `Option '${option}' must be an integer >= ${min}, received ${describeValue(value)}`,
      'INVALID_EVALUATION_LIMIT',
    );
  }
  return value;
}

export { DEFAULT_MAX_EXPLODE_ITERATIONS, DEFAULT_MAX_REROLL_ITERATIONS };

//
// * Context
//

/**
 * Per-branch mutable accumulator for tracking rolls and output during recursion.
 *
 * Module-level export, deliberately absent from `src/index.ts` — the package
 * surface never mentions it. See {@link mergeMetaRolls} for why the export
 * exists at all.
 */
export type EvalContext = {
  rolls: DieResult[];
  expressionParts: string[];
  renderedParts: string[];
  /**
   * Populated by `evalVersus` with the resolved degree and natural value.
   * `evaluate()` reads this from the top-level ctx to surface `degree` and
   * `natural` on the final `RollResult`. Only populated when `vs` is the
   * root of the expression.
   */
  versusMetadata?: {
    degree: DegreeOfSuccess;
    natural: number | undefined;
    dcTotal: number;
  };
};

/**
 * Creates an empty per-branch accumulator. Every sub-evaluation runs in a
 * fresh context so its rolls and rendered fragments can be merged back on the
 * parent's terms.
 */
function createContext(): EvalContext {
  return { rolls: [], expressionParts: [], renderedParts: [] };
}

/**
 * Flattened representation of a keep/drop modifier for chain evaluation.
 * Superset of the public `KeepDropSpec` (adds the notation `code`).
 */
type KeepDropChainEntry = KeepDropSpec & { code: string };

/**
 * Every branch returns its numeric total AND the `RollPart` it contributes
 * to the structured breakdown — TypeScript exhaustiveness guarantees no
 * branch can forget to produce a part.
 */
type EvalResult = {
  total: number;
  part: RollPart;
};

//
// * Shared helpers
//

/**
 * Copies an AST node's source span onto a part (spread into the literal).
 * Empty when the AST was built without parser spans.
 */
function partSpan(node: ASTNode): { start?: number; end?: number } {
  if (node.start == null || node.end == null) return {};
  return { start: node.start, end: node.end };
}

/**
 * Appends every element of `source` to `target`.
 *
 * Replaces `target.push(...source)` — the spread form passes one argument per
 * element and overflows the call stack somewhere above half a million dice,
 * which a user-raised `maxDice` can reach. A `RangeError` there would escape
 * the `isRollParserError` contract.
 */
function appendAll<T>(target: T[], source: readonly T[]): void {
  for (const item of source) {
    target.push(item);
  }
}

/** Drops the internal notation `code`, leaving the public `KeepDropSpec` shape. */
function toPublicSpecs(specs: KeepDropChainEntry[]): KeepDropSpec[] {
  return specs.map(({ code: _code, ...spec }) => spec);
}

/**
 * Renders dice results for display. Marker priority: dropped wins over
 * success/failure (dropped dice are never counted), success wins over
 * failure (a die cannot be both). Example: `[~~1~~, **6**, __1__, 3]`.
 *
 * Dice tagged `'meta'` (rolled to compute sub-expression parameters such as
 * count/sides/threshold) are hidden from the rendered output — they exist in
 * `RollResult.rolls` for audit, not for display.
 */
function renderDice(dice: DieResult[]): string {
  // Hot path: one pass into a single string — filter + map + join allocated two
  // intermediate arrays plus a string per die.
  let rendered = '[';
  let isFirst = true;

  for (const die of dice) {
    const { modifiers } = die;

    // Fast path: a die untouched by any modifier carries exactly ['kept'].
    // Skipping the `meta` scan here and the three in `renderDie` more than
    // halves a plain `1000d6` — rendering dominates large unmodified pools.
    if (modifiers.length === 1 && modifiers[0] === 'kept') {
      rendered = isFirst ? `${rendered}${die.result}` : `${rendered}, ${die.result}`;
      isFirst = false;
      continue;
    }

    if (modifiers.includes('meta')) continue;

    if (!isFirst) rendered += ', ';
    isFirst = false;

    rendered += renderDie(die.result, modifiers);
  }

  return `${rendered}]`;
}

/** Marker-wrapped spelling of one die, per `renderDice`'s priority order. */
function renderDie(result: number, modifiers: readonly DieModifier[]): string {
  if (modifiers.includes('dropped')) return `~~${result}~~`;
  if (modifiers.includes('success')) return `**${result}**`;
  if (modifiers.includes('failure')) return `__${result}__`;
  return String(result);
}

/**
 * Forwards rolls from a throwaway sub-expression context into the parent
 * audit trail, tagging them as `'meta'` + `'dropped'`. Meta dice are dice
 * rolled to compute parameters (dice count, sides, threshold, modifier
 * count) — they consume RNG and count against `maxDice`, so they must be
 * inspectable. Tagging them `'dropped'` keeps totals correct via
 * `sumKeptDice`; `'meta'` lets renderers hide them and lets callers
 * distinguish them from ordinary pool dice.
 *
 * `'success'`/`'failure'` tags are stripped here as defense-in-depth against
 * a SuccessCount leaking into a meta sub-expression (parser rejects all such
 * wrappings; this strip ensures a future parse regression cannot leak tags
 * into the top-level `successes`/`failures` scan).
 */
// Exported rather than `@internal`: the tag strip above is unreachable through
// any parseable notation, so pinning it needs a direct call with a hand-built
// context — and `@internal` would hide that guarantee from the docs.
export function mergeMetaRolls(parent: EvalContext, source: EvalContext): void {
  for (const die of source.rolls) {
    parent.rolls.push({
      ...die,
      modifiers: rewriteFlags(die.modifiers, SELECTION_AND_TALLY_FLAGS, 'meta', 'dropped'),
    });
  }
}

//
// * Node dispatch
//

/**
 * Evaluates an AST node, returning its total and `RollPart` while updating
 * the context.
 *
 * Errors bubbling up get the source span of the tightest node that was being
 * evaluated — the innermost `evalNode` frame stamps first, outer frames leave
 * an already-stamped error untouched.
 */
function evalNode(node: ASTNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  try {
    return evalNodeInner(node, rng, ctx, env);
  } catch (error) {
    if (error instanceof EvaluatorError && node.start != null) {
      stampEvaluatorSpan(error, node.start, node.end);
    }
    throw error;
  }
}

function evalNodeInner(node: ASTNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  switch (node.type) {
    case 'Literal':
      return evalLiteral(node, ctx);

    case 'Dice':
      return evalDice(node, rng, ctx, env);

    case 'FateDice':
      return evalFateDice(node, rng, ctx, env);

    case 'BinaryOp':
      return evalBinaryOp(node, rng, ctx, env);

    case 'UnaryOp':
      return evalUnaryOp(node, rng, ctx, env);

    case 'KeepDrop':
      return evalKeepDrop(node, rng, ctx, env);

    case 'Explode':
      return evalExplode(node, rng, ctx, env);

    case 'Reroll':
      return evalReroll(node, rng, ctx, env);

    case 'DieBound':
      return evalDieBound(node, rng, ctx, env);

    case 'SuccessCount':
      return evalSuccessCount(node, rng, ctx, env);

    case 'Versus':
      return evalVersus(node, rng, ctx, env);

    case 'FunctionCall':
      return evalFunctionCall(node, rng, ctx, env);

    case 'Grouped':
      return evalGrouped(node, rng, ctx, env);

    case 'Group':
      return evalGroup(node, rng, ctx, env);

    case 'Sort':
      return evalSort(node, rng, ctx, env);

    case 'CritThreshold':
      return evalCritThreshold(node, rng, ctx, env);

    case 'Variable':
      return evalVariable(node, ctx, env);

    default: {
      const exhaustive: never = node;
      throw new EvaluatorError(
        `Unknown node type: ${(exhaustive as ASTNode).type}`,
        'UNKNOWN_NODE_TYPE',
        (exhaustive as ASTNode).type,
      );
    }
  }
}

//
// * Leaf nodes
//

function evalLiteral(node: LiteralNode, ctx: EvalContext): EvalResult {
  const { value } = node;
  ctx.expressionParts.push(String(value));
  ctx.renderedParts.push(String(value));
  return { total: value, part: { type: 'literal', value, total: value, ...partSpan(node) } };
}

/**
 * Re-derives whether a variable name needs braces in its rendered form.
 *
 * The lexer accepts `@name` (bare) or `@{name with spaces}` (braced) but
 * strips the braces from the captured value. To round-trip through `rendered`
 * we re-derive bracedness from the name shape — anything outside the bare
 * identifier grammar implies the user wrote braces (or would need them).
 */
function variableNeedsBraces(name: string): boolean {
  return !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/**
 * Looks up a variable in `env.context` and resolves missing keys per
 * `env.onMissingVariable`. The resolved scalar is the variable's value;
 * `expression` shows the resolved number (mirrors how literals render),
 * while `rendered` keeps the original `@name` (or `@{name}`) annotated with
 * the resolved value in brackets so readers can attribute the number.
 */
function evalVariable(node: VariableNode, ctx: EvalContext, env: EvalEnv): EvalResult {
  const present = Object.hasOwn(env.context, node.name);
  if (!present) {
    if (env.onMissingVariable === 'throw') {
      throw new EvaluatorError(
        `Undefined variable: ${node.name}`,
        'UNDEFINED_VARIABLE',
        'Variable',
      );
    }
    const display = variableNeedsBraces(node.name) ? `@{${node.name}}` : `@${node.name}`;
    ctx.expressionParts.push('0');
    ctx.renderedParts.push(`${display}[0]`);
    return {
      total: 0,
      part: { type: 'variable', name: node.name, value: 0, total: 0, ...partSpan(node) },
    };
  }

  const value = env.context[node.name] as number;
  if (!Number.isFinite(value)) {
    throw new EvaluatorError(
      `Invalid variable value: ${node.name} = ${value}`,
      'INVALID_VARIABLE_VALUE',
      'Variable',
    );
  }
  const display = variableNeedsBraces(node.name) ? `@{${node.name}}` : `@${node.name}`;
  ctx.expressionParts.push(String(value));
  ctx.renderedParts.push(`${display}[${value}]`);
  return {
    total: value,
    part: { type: 'variable', name: node.name, value, total: value, ...partSpan(node) },
  };
}

//
// * Dice pools
//

/**
 * Evaluates a meta sub-expression (dice count, dice sides, a modifier count, a
 * threshold) in an isolated context and forwards its rolls into `ctx` as meta
 * dice.
 *
 * A `Literal` operand — the overwhelming majority (`3d6`, `4d6kh3`, `1d20!>18`)
 * — is answered from the node without allocating the throwaway context: a
 * literal draws no RNG, produces no rolls, and cannot throw, so the merge has
 * nothing to carry. Draw order is untouched (see README, Randomness).
 */
function evalMetaOperand(node: ASTNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  if (node.type === 'Literal') return node.value;

  const metaCtx = createContext();
  const value = evalNode(node, rng, metaCtx, env).total;
  mergeMetaRolls(ctx, metaCtx);
  return value;
}

/** Rejects dice counts that cannot address a pool. */
function requireDiceCount(count: number, nodeType: 'Dice' | 'FateDice'): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new EvaluatorError(`Invalid dice count: ${count}`, 'INVALID_DICE_COUNT', nodeType);
  }
}

/**
 * Rolls `count` dice and writes the pool into `ctx` — the tail shared by
 * `evalDice` and `evalFateDice`. `rollDie` produces one die (drawing exactly
 * one RNG value), `notation` is the canonical `NdX` / `NdF` spelling used by
 * both the expression and rendered forms.
 *
 * `rollDie` is responsible for stamping `'kept'` at construction. A fresh pool
 * has no pre-dropped dice, so the `markAllKept` pass this used to run could
 * only ever append that one flag — at the cost of cloning every die. The same
 * reasoning makes the running `total` exact: nothing here is dropped, so it
 * equals `sumKeptDice(dice)`.
 */
function rollPool(
  count: number,
  notation: string,
  rollDie: () => DieResult,
  ctx: EvalContext,
): { total: number; rolls: DieResult[] } {
  const dice: DieResult[] = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    const die = rollDie();
    dice.push(die);
    total += die.result;
  }

  appendAll(ctx.rolls, dice);

  ctx.expressionParts.push(notation);
  ctx.renderedParts.push(`${notation}${renderDice(dice)}`);

  return { total, rolls: dice };
}

/**
 * RNG draw order: `count` expression → `sides` expression → pool dice
 * (one `nextInt` per die, left-to-right). Meta-expressions on `count`/`sides`
 * (e.g. `(1+1)d(3*2)`) draw before the pool. For keep/drop-argument
 * meta-expressions like `4d6kh(1d2)`, `flattenKeepDropChain` draws the
 * keep/drop args first, then `evalKeepDrop` calls `evalDice` for the base
 * pool. See README, Randomness → Draw order, for the full spec.
 */
function evalDice(node: DiceNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const count = evalMetaOperand(node.count, rng, ctx, env);
  const sides = evalMetaOperand(node.sides, rng, ctx, env);

  requireDiceCount(count, 'Dice');
  if (!Number.isInteger(sides) || sides < 1) {
    throw new EvaluatorError(`Invalid dice sides: ${sides}`, 'INVALID_DICE_SIDES', 'Dice');
  }
  if (sides > MAX_DICE_SIDES) {
    throw new EvaluatorError(
      `Dice sides ${sides} exceeds maximum of ${MAX_DICE_SIDES}`,
      'INVALID_DICE_SIDES',
      'Dice',
    );
  }

  chargeDice(env, count, 'Dice');

  const { total, rolls } = rollPool(
    count,
    `${count}d${sides}`,
    // Fresh `['kept']` per die — `success-count` appends tally flags in
    // place, so a shared literal would tag the whole pool at once.
    () => createDieResult(sides, rng.nextInt(1, sides), ['kept']),
    ctx,
  );

  return { total, part: { type: 'dice', count, sides, rolls, total, ...partSpan(node) } };
}

function evalFateDice(node: FateDiceNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const count = evalMetaOperand(node.count, rng, ctx, env);

  requireDiceCount(count, 'FateDice');
  chargeDice(env, count, 'FateDice');

  const { total, rolls } = rollPool(
    count,
    `${count}dF`,
    () => createFateDieResult(rng.nextInt(-1, 1), ['kept']),
    ctx,
  );

  return { total, part: { type: 'fateDice', count, rolls, total, ...partSpan(node) } };
}

//
// * Context merging
//

/**
 * Propagates `versusMetadata` onto a parent so `degree`/`natural` survive
 * wrappers like `floor(...)`, `(vs) + 0`, or `-(vs)`. Throws `NESTED_VERSUS`
 * if the parent already carries metadata — two versus results cannot occupy
 * the same `RollResult`. No-op when `metadata` is `undefined`.
 *
 * Use this directly when the caller has already pushed (or transformed) `rolls`
 * itself. For the default case where the child's raw rolls flow up unchanged,
 * use `mergeContext` instead.
 *
 * A **postfix modifier** may propagate only when it leaves `total` equal to the
 * value the degree was resolved from — `evalVersus` computes `degree` once,
 * against the total it saw, so a modifier that re-totals invalidates it. Among
 * the modifiers only `evalSort` (reorders) and `evalCritThreshold` (tags)
 * qualify. `evalExplode` adds dice, `evalReroll` replaces them, `evalKeepDrop`
 * removes them, `evalDieBound` re-sums after clamping, and `evalSuccessCount`
 * redefines `total` as a success tally, so none of those five may.
 * `evalGroupKeepDrop` applies the rule per sub-roll, propagating only from
 * sub-rolls it kept.
 *
 * Judge a modifier by what it does to `total`, not by which dice survive. The
 * membership reading — "every die still contributes" — admits `evalDieBound`,
 * which drops no dice and still invalidates the degree.
 *
 * Arithmetic wrappers are the deliberate exception named above: `(vs) + 100`
 * reports `degree` beside a total of 103, because the wrapper post-processes a
 * number without altering the comparison the degree came from. That is why they
 * route through `mergeContext` rather than being held to the rule here.
 */
function propagateMetadata(parent: EvalContext, metadata: EvalContext['versusMetadata']): void {
  if (!metadata) return;
  if (parent.versusMetadata) {
    throw new EvaluatorError(
      'Multiple versus operators in the same expression',
      'NESTED_VERSUS',
      'Versus',
    );
  }
  parent.versusMetadata = metadata;
}

/**
 * Merges a child sub-context back into its parent. Copies `rolls` and
 * delegates `versusMetadata` propagation to `propagateMetadata`.
 *
 * Does not merge `expressionParts` / `renderedParts` — each wrapper formats
 * those with its own operator/function syntax.
 */
function mergeContext(parent: EvalContext, child: EvalContext): void {
  appendAll(parent.rolls, child.rolls);
  propagateMetadata(parent, child.versusMetadata);
}

//
// * Arithmetic
//

function evalBinaryOp(node: BinaryOpNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const leftCtx = createContext();
  const rightCtx = createContext();

  const left = evalNode(node.left, rng, leftCtx, env);
  const right = evalNode(node.right, rng, rightCtx, env);

  mergeContext(ctx, leftCtx);
  mergeContext(ctx, rightCtx);

  const leftExpr = leftCtx.expressionParts.join('');
  const rightExpr = rightCtx.expressionParts.join('');
  const leftRendered = leftCtx.renderedParts.join('');
  const rightRendered = rightCtx.renderedParts.join('');

  ctx.expressionParts.push(`${leftExpr} ${node.operator} ${rightExpr}`);
  ctx.renderedParts.push(`${leftRendered} ${node.operator} ${rightRendered}`);

  const total = applyBinaryOperator(node.operator, left.total, right.total);

  return {
    total,
    part: {
      type: 'binaryOp',
      operator: node.operator,
      left: left.part,
      right: right.part,
      total,
      ...partSpan(node),
    },
  };
}

function applyBinaryOperator(
  operator: BinaryOpNode['operator'],
  left: number,
  right: number,
): number {
  switch (operator) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      if (right === 0) {
        throw new EvaluatorError('Division by zero', 'DIVISION_BY_ZERO', 'BinaryOp');
      }
      return left / right;
    case '%':
      if (right === 0) {
        throw new EvaluatorError('Modulo by zero', 'MODULO_BY_ZERO', 'BinaryOp');
      }
      return left % right;
    case '**':
      return left ** right;
    default: {
      const exhaustive: never = operator;
      throw new EvaluatorError(`Unknown operator: ${exhaustive}`, 'UNKNOWN_OPERATOR', 'BinaryOp');
    }
  }
}

function evalUnaryOp(node: UnaryOpNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const innerCtx = createContext();
  const inner = evalNode(node.operand, rng, innerCtx, env);

  mergeContext(ctx, innerCtx);

  const innerExpr = innerCtx.expressionParts.join('');
  const innerRendered = innerCtx.renderedParts.join('');

  ctx.expressionParts.push(`-${innerExpr}`);
  ctx.renderedParts.push(`-${innerRendered}`);

  const total = -inner.total;

  return {
    total,
    part: { type: 'unaryOp', operator: '-', operand: inner.part, total, ...partSpan(node) },
  };
}

//
// * Groups and functions
//

function evalGrouped(node: GroupedNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const innerCtx = createContext();
  const inner = evalNode(node.expression, rng, innerCtx, env);

  mergeContext(ctx, innerCtx);

  ctx.expressionParts.push(`(${innerCtx.expressionParts.join('')})`);
  ctx.renderedParts.push(`(${innerCtx.renderedParts.join('')})`);

  return {
    total: inner.total,
    part: { type: 'grouped', inner: inner.part, total: inner.total, ...partSpan(node) },
  };
}

/**
 * Evaluates a grouped roll `{expr1, expr2, ...}`.
 *
 * Each sub-expression is evaluated in an isolated context, then its rolls
 * and `versusMetadata` propagate up via `mergeContext`. Sub-roll subtotals
 * sum to the group's total. When the group is the base target of a
 * keep/drop modifier with `expressions.length >= 2`, `evalKeepDrop`
 * intercepts first and never calls this function — dual semantics
 * (flat-pool vs sub-roll) are decided there.
 */
function evalGroup(node: GroupNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const subExprs: string[] = [];
  const subRendered: string[] = [];
  const subParts: RollPart[] = [];
  let total = 0;

  for (const expr of node.expressions) {
    const subCtx = createContext();
    const sub = evalNode(expr, rng, subCtx, env);
    mergeContext(ctx, subCtx);
    subExprs.push(subCtx.expressionParts.join(''));
    subRendered.push(subCtx.renderedParts.join(''));
    subParts.push(sub.part);
    total += sub.total;
  }

  ctx.expressionParts.push(`{${subExprs.join(', ')}}`);
  ctx.renderedParts.push(`{${subRendered.join(', ')}}`);

  // No `keptIndices` — bare groups (and single-sub passthroughs) perform
  // no sub-roll selection; only `evalGroupKeepDrop` sets it.
  return { total, part: { type: 'group', parts: subParts, total, ...partSpan(node) } };
}

function evalFunctionCall(
  node: FunctionCallNode,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): EvalResult {
  const argCtxs: EvalContext[] = [];
  const argResults: EvalResult[] = [];

  for (const arg of node.args) {
    const argCtx = createContext();
    argResults.push(evalNode(arg, rng, argCtx, env));
    argCtxs.push(argCtx);
  }

  for (const argCtx of argCtxs) {
    mergeContext(ctx, argCtx);
  }

  const argExprs = argCtxs.map((c) => c.expressionParts.join(''));
  const argRendereds = argCtxs.map((c) => c.renderedParts.join(''));

  ctx.expressionParts.push(`${node.name}(${argExprs.join(', ')})`);
  ctx.renderedParts.push(`${node.name}(${argRendereds.join(', ')})`);

  const total = applyFunction(
    node.name,
    argResults.map((r) => r.total),
  );

  return {
    total,
    part: {
      type: 'functionCall',
      name: node.name,
      args: argResults.map((r) => r.part),
      total,
      ...partSpan(node),
    },
  };
}

function applyFunction(name: string, values: number[]): number {
  switch (name) {
    case 'floor':
      return Math.floor(requireUnaryArg(name, values));
    case 'ceil':
      return Math.ceil(requireUnaryArg(name, values));
    case 'round':
      // `Math.round` breaks halves toward +∞: `round(2.5) === 3` but
      // `round(-2.5) === -2`. Symmetric rounding must be composed via `floor`.
      return Math.round(requireUnaryArg(name, values));
    case 'abs':
      return Math.abs(requireUnaryArg(name, values));
    case 'sqrt':
      // A negative argument yields NaN, surfaced as `NON_FINITE_RESULT` by
      // the top-level finiteness check — same policy as `1/0`.
      return Math.sqrt(requireUnaryArg(name, values));
    case 'pow': {
      const [base, exponent] = requireBinaryArgs(name, values);
      return base ** exponent;
    }
    case 'max':
      return extremumOf(values, 'max');
    case 'min':
      return extremumOf(values, 'min');
    default:
      throw new EvaluatorError(`Unknown function: ${name}`, 'UNKNOWN_FUNCTION', 'FunctionCall');
  }
}

/**
 * Folded replacement for `Math.max(...values)` / `Math.min(...values)`.
 *
 * `max`/`min` are variadic, so a pathological argument count blows the call
 * stack with a bare `RangeError` in the spread form. NaN still poisons the
 * result the way `Math.max` does, so a non-finite argument keeps surfacing as
 * `NON_FINITE_RESULT` rather than being silently skipped.
 */
function extremumOf(values: number[], kind: 'max' | 'min'): number {
  let result = kind === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;

  for (const value of values) {
    if (Number.isNaN(value)) return Number.NaN;
    if (kind === 'max' ? value > result : value < result) result = value;
  }

  return result;
}

function requireUnaryArg(name: string, values: number[]): number {
  const [x] = values;
  if (x == null) {
    // Unreachable: the parser validates arity before evaluation. Present to
    // satisfy `noNonNullAssertion`.
    throw new EvaluatorError(
      `Function '${name}' requires an argument`,
      'UNKNOWN_FUNCTION',
      'FunctionCall',
    );
  }
  return x;
}

function requireBinaryArgs(name: string, values: number[]): [number, number] {
  const [a, b] = values;
  if (a == null || b == null) {
    // ? Unreachable: parser validates arity before evaluation. Defensive for
    // `noNonNullAssertion`.
    throw new EvaluatorError(
      `Function '${name}' requires two arguments`,
      'UNKNOWN_FUNCTION',
      'FunctionCall',
    );
  }
  return [a, b];
}

//
// * Keep/drop modifiers
//

/** Notation spelling of each keep/drop combination. */
const KEEP_DROP_CODES = {
  keep: { highest: 'kh', lowest: 'kl' },
  drop: { highest: 'dh', lowest: 'dl' },
} as const;

function keepDropCode(kind: KeepDropSpec['kind'], selector: KeepDropSpec['selector']): string {
  return KEEP_DROP_CODES[kind][selector];
}

/**
 * Walks a nested KeepDropNode chain, collecting specs outermost-first,
 * then reverses to notation order (innermost-first).
 */
function flattenKeepDropChain(
  node: KeepDropNode,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): { specs: KeepDropChainEntry[]; baseTarget: ASTNode } {
  const specs: KeepDropChainEntry[] = [];
  let current: ASTNode = node;

  while (isKeepDrop(current)) {
    const modCount = evalMetaOperand(current.count, rng, ctx, env);

    if (!Number.isInteger(modCount) || modCount < 0) {
      throw new EvaluatorError(
        `Invalid keep/drop count: ${modCount}`,
        'INVALID_KEEP_DROP_COUNT',
        'KeepDrop',
      );
    }

    specs.push({
      kind: current.kind,
      selector: current.selector,
      count: modCount,
      code: keepDropCode(current.kind, current.selector),
    });
    current = current.target;
  }

  specs.reverse();
  return { specs, baseTarget: current };
}

/**
 * Applies each modifier independently to the full dice pool
 * and merges drop sets via union. A die is dropped if ANY modifier dropped it.
 *
 * Mutates each die's flags in place — the same `DieResult` objects are
 * shared between `RollResult.rolls` and the `RollPart` tree. Each spec still
 * selects against the unmodified pool: `markDroppedIndices` reads results and
 * writes only into `droppedMask`, so no spec can observe another's outcome.
 */
function mergeDropSets(baseDice: DieResult[], specs: KeepDropChainEntry[]): DieResult[] {
  const droppedMask = new Uint8Array(baseDice.length);

  for (const spec of specs) {
    markDroppedIndices(baseDice, spec.count, spec.kind, spec.selector, droppedMask);
  }

  for (let index = 0; index < baseDice.length; index++) {
    const die = baseDice[index];
    if (die == null) continue;

    const marker = droppedMask[index] === 1 ? 'dropped' : 'kept';
    const { modifiers } = die;

    // Already exactly this slot flag — `rewriteFlags` would rebuild an
    // identical single-element array. Fresh pool dice hit this every time.
    if (modifiers.length === 1 && modifiers[0] === marker) continue;

    die.modifiers = rewriteFlags(modifiers, SELECTION_FLAGS, marker);
  }

  return baseDice;
}

//
// * Explode and reroll
//

/** Notation marker for each explode variant. */
const EXPLODE_MARKERS: Record<ExplodeNode['variant'], string> = {
  standard: '!',
  compound: '!!',
  penetrating: '!p',
};

/** Pool transform for each explode variant. */
const EXPLODE_APPLIERS: Record<ExplodeNode['variant'], typeof applyStandardExplode> = {
  standard: applyStandardExplode,
  compound: applyCompoundExplode,
  penetrating: applyPenetratingExplode,
};

/**
 * Builds the notation string for an explode modifier, e.g. `!`, `!!>=3`, `!p>5`.
 */
function formatExplodeCode(
  variant: ExplodeNode['variant'],
  threshold: ComparePoint | undefined,
  thresholdValue: number | undefined,
): string {
  const marker = EXPLODE_MARKERS[variant];
  if (threshold == null || thresholdValue == null) return marker;
  return `${marker}${threshold.operator}${thresholdValue}`;
}

function evalExplode(node: ExplodeNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);
  const targetExpr = targetCtx.expressionParts.join('');

  let thresholdValue: number | undefined;
  if (node.threshold != null) {
    thresholdValue = evalMetaOperand(node.threshold.value, rng, ctx, env);
  }

  const code = formatExplodeCode(node.variant, node.threshold, thresholdValue);

  const buildPart = (total: number): RollPart => {
    const part: RollPart = {
      type: 'explode',
      variant: node.variant,
      target: target.part,
      total,
      ...partSpan(node),
    };
    if (node.threshold != null && thresholdValue != null) {
      part.threshold = { operator: node.threshold.operator, value: thresholdValue };
    }
    return part;
  };

  // No-op when the target produced no dice (e.g., `(1+2)!`).
  if (targetCtx.rolls.length === 0) {
    ctx.expressionParts.push(`${targetExpr}${code}`);
    ctx.renderedParts.push(`${targetExpr}${code}`);
    return { total: target.total, part: buildPart(target.total) };
  }

  const shouldExplode = buildShouldExplode(node.threshold?.operator, thresholdValue);

  const expanded = EXPLODE_APPLIERS[node.variant](targetCtx.rolls, shouldExplode, rng, env);

  appendAll(ctx.rolls, expanded);
  ctx.expressionParts.push(`${targetExpr}${code}`);
  // Rendered form carries the explode code — unlike kh/dl, whose dropped dice
  // are self-evident, explosion origin is otherwise invisible.
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(expanded)}`);

  const total = sumKeptDice(expanded);
  return { total, part: buildPart(total) };
}

function evalReroll(node: RerollNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);
  const targetExpr = targetCtx.expressionParts.join('');

  const thresholdValue = evalMetaOperand(node.condition.value, rng, ctx, env);

  const code = `${node.once ? 'ro' : 'r'}${node.condition.operator}${thresholdValue}`;
  const condition: ResolvedComparePoint = {
    operator: node.condition.operator,
    value: thresholdValue,
  };

  // No-op when the target produced no dice (e.g., `(1+2)r<5`).
  if (targetCtx.rolls.length === 0) {
    ctx.expressionParts.push(`${targetExpr}${code}`);
    ctx.renderedParts.push(`${targetExpr}${code}`);
    const total = sumKeptDice(targetCtx.rolls);
    return {
      total,
      part: {
        type: 'reroll',
        once: node.once,
        condition,
        target: target.part,
        total,
        ...partSpan(node),
      },
    };
  }

  const pool = node.once
    ? applyRerollOnce(targetCtx.rolls, node.condition.operator, thresholdValue, rng, env)
    : applyRecursiveReroll(targetCtx.rolls, node.condition.operator, thresholdValue, rng, env);

  appendAll(ctx.rolls, pool);
  ctx.expressionParts.push(`${targetExpr}${code}`);
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(pool)}`);

  const total = sumKeptDice(pool);
  return {
    total,
    part: {
      type: 'reroll',
      once: node.once,
      condition,
      target: target.part,
      total,
      ...partSpan(node),
    },
  };
}

/**
 * Evaluates a per-die clamp (`minN` / `maxN`). The bound expression draws
 * *after* the target pool, like other threshold arguments (see README,
 * Randomness → Draw order). Dice are clamped in place by `applyDieBound`
 * and the total re-summed, since clamping changes kept-die values.
 */
function evalDieBound(node: DieBoundNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);

  const boundValue = evalMetaOperand(node.value, rng, ctx, env);
  if (!Number.isFinite(boundValue)) {
    throw new EvaluatorError(
      `Invalid ${node.bound} bound: ${boundValue}`,
      'INVALID_THRESHOLD',
      'DieBound',
    );
  }

  applyDieBound(targetCtx.rolls, node.bound, boundValue);

  appendAll(ctx.rolls, targetCtx.rolls);
  // ! No `propagateMetadata` here: clamping re-sums, so a propagated `degree`
  // ! would have been resolved against a total this node just replaced.
  // ! See the rule on `propagateMetadata`.

  const targetExpr = targetCtx.expressionParts.join('');
  // Negative bounds render parenthesized so `result.expression` re-parses
  // (`4d6min-2` is a syntax error; `4d6min(-2)` is not).
  const code = boundValue < 0 ? `${node.bound}(${boundValue})` : `${node.bound}${boundValue}`;

  ctx.expressionParts.push(`${targetExpr}${code}`);
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(targetCtx.rolls)}`);

  const total = sumKeptDice(targetCtx.rolls);
  return {
    total,
    part: {
      type: 'dieBound',
      bound: node.bound,
      value: boundValue,
      target: target.part,
      total,
      ...partSpan(node),
    },
  };
}

//
// * Sort and crit thresholds
//

/**
 * Evaluates a sort modifier. Purely visual — sorts the dice produced by
 * `node.target` in ascending or descending order of `result` without
 * changing the total or any die-level flag. Dropped dice participate in
 * the sort alongside kept dice, preserving their `'dropped'` marker.
 *
 * Rendering mirrors `evalExplode` / `evalKeepDrop`: emits
 * `<targetExpr><code>[<sortedDice>]`, replacing any inline dice brackets
 * the target itself rendered. Multi-sub-roll Group targets (`{4d6, 3d6}s`)
 * are rejected at parse time with `INVALID_SORT_TARGET` until hierarchical
 * per-sub-roll sorting (Stage 3 spec §3 "Group interaction") is implemented.
 */
function evalSort(node: SortNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);

  const sortedRolls = sortDice(targetCtx.rolls, node.order);

  appendAll(ctx.rolls, sortedRolls);
  propagateMetadata(ctx, targetCtx.versusMetadata);

  const code = node.order === 'ascending' ? 's' : 'sd';
  const targetExpr = targetCtx.expressionParts.join('');

  ctx.expressionParts.push(`${targetExpr}${code}`);
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(sortedRolls)}`);

  return {
    total: target.total,
    part: {
      type: 'sort',
      order: node.order,
      rolls: sortedRolls,
      target: target.part,
      total: target.total,
      ...partSpan(node),
    },
  };
}

/**
 * Evaluates a critical/fumble threshold modifier. Pure post-processing:
 * evaluates the target in an isolated context, resolves each threshold's
 * ComparePoint value (including meta-expressions, which consume RNG draws
 * AFTER the target pool), then overrides `critical`/`fumble` flags on the
 * produced dice in place.
 *
 * Independent overrides (Roll20 semantics): `cs` thresholds replace only the
 * crit criteria and `cf` thresholds replace only the fumble criteria. When a
 * side has no explicit threshold, the `'default'` rule applies — so
 * `1d20cf<3` keeps the default nat-20 crit. Bare `cs`/`cf` uses the
 * `'default'` sentinel resolved per-die to `result === sides` or
 * `result === 1`.
 *
 * Renders `<targetExpr><codes>[<dice>]`, mirroring `evalSort`/`evalExplode`.
 */
function evalCritThreshold(
  node: CritThresholdNode,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): EvalResult {
  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);

  const successResolved = node.successThresholds.map((t) => resolveCritThreshold(t, rng, ctx, env));
  const failResolved = node.failThresholds.map((t) => resolveCritThreshold(t, rng, ctx, env));

  // A side with no explicit threshold falls back to the default rule rather
  // than being wiped by the other side's override.
  const successApplied: ResolvedCritThreshold[] =
    successResolved.length > 0 ? successResolved : ['default'];
  const failApplied: ResolvedCritThreshold[] = failResolved.length > 0 ? failResolved : ['default'];

  applyCritThresholds(targetCtx.rolls, successApplied, failApplied);

  appendAll(ctx.rolls, targetCtx.rolls);
  propagateMetadata(ctx, targetCtx.versusMetadata);

  const targetExpr = targetCtx.expressionParts.join('');
  const codes = [
    ...successResolved.map((t) => (t === 'default' ? 'cs' : `cs${t.operator}${t.value}`)),
    ...failResolved.map((t) => (t === 'default' ? 'cf' : `cf${t.operator}${t.value}`)),
  ].join('');

  ctx.expressionParts.push(`${targetExpr}${codes}`);
  ctx.renderedParts.push(`${targetExpr}${codes}${renderDice(targetCtx.rolls)}`);

  return {
    total: target.total,
    part: {
      type: 'critThreshold',
      successThresholds: successResolved,
      failThresholds: failResolved,
      target: target.part,
      total: target.total,
      ...partSpan(node),
    },
  };
}

function resolveCritThreshold(
  threshold: CritThreshold,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): ResolvedCritThreshold {
  if (threshold === 'default') return 'default';

  const resolved = evalMetaOperand(threshold.value, rng, ctx, env);
  if (!Number.isFinite(resolved)) {
    throw new EvaluatorError(
      `Invalid crit threshold: ${resolved}`,
      'INVALID_THRESHOLD',
      'CritThreshold',
    );
  }
  return { operator: threshold.operator, value: resolved };
}

//
// * Keep/drop evaluation
//

function evalKeepDrop(node: KeepDropNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  const { specs, baseTarget } = flattenKeepDropChain(node, rng, ctx, env);

  // Multi-sub-roll group: keep/drop treats each sub-roll subtotal as a compound
  // die. Single-sub groups fall through to the flat-pool path, where
  // `mergeDropSets` selects individual dice.
  if (baseTarget.type === 'Group' && baseTarget.expressions.length >= 2) {
    return evalGroupKeepDrop(node, baseTarget, specs, rng, ctx, env);
  }

  const targetCtx = createContext();
  const target = evalNode(baseTarget, rng, targetCtx, env);

  const mergedDice = mergeDropSets(targetCtx.rolls, specs);

  appendAll(ctx.rolls, mergedDice);

  const total = sumKeptDice(mergedDice);

  const targetExpr = targetCtx.expressionParts.join('');
  const keepDropCodes = specs.map((s) => `${s.code}${s.count}`).join('');

  ctx.expressionParts.push(`${targetExpr}${keepDropCodes}`);
  ctx.renderedParts.push(`${targetExpr}${renderDice(mergedDice)}`);

  return {
    total,
    part: {
      type: 'keepDrop',
      specs: toPublicSpecs(specs),
      target: target.part,
      total,
      ...partSpan(node),
    },
  };
}

/**
 * Strips per-die markdown markers from an already-rendered sub-roll string.
 * Used when a whole group sub-roll is dropped: the outer `~~...~~` wrap
 * supersedes inner success (`**`), failure (`__`), and dropped (`~~`)
 * markers, and leaving them in place would nest strikethroughs or show
 * success highlights inside a dropped span.
 */
function stripInnerMarkers(rendered: string): string {
  return rendered
    .replace(/\*\*(-?\d+)\*\*/g, '$1')
    .replace(/__(-?\d+)__/g, '$1')
    .replace(/~~(-?\d+)~~/g, '$1');
}

/**
 * Evaluates a keep/drop modifier chain whose base target is a multi
 * sub-roll group. Each sub-roll is evaluated in isolation so its subtotal
 * and dice are captured separately. Synthetic dice — one per sub-roll,
 * `result = subtotal` — feed `mergeDropSets` to pick kept/dropped indices.
 * Dropped sub-rolls' inner dice are re-flagged `'dropped'` so `sumKeptDice`
 * on the propagated rolls still agrees with the group total, and the
 * rendered form wraps them in strikethrough `~~...~~`.
 */
function evalGroupKeepDrop(
  node: KeepDropNode,
  group: GroupNode,
  specs: KeepDropChainEntry[],
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): EvalResult {
  type SubRoll = {
    subtotal: number;
    part: RollPart;
    rolls: DieResult[];
    expr: string;
    rendered: string;
    versusMetadata: EvalContext['versusMetadata'];
  };

  const subRolls: SubRoll[] = group.expressions.map((expr) => {
    const subCtx = createContext();
    const sub = evalNode(expr, rng, subCtx, env);
    return {
      subtotal: sub.total,
      part: sub.part,
      rolls: subCtx.rolls,
      expr: subCtx.expressionParts.join(''),
      rendered: subCtx.renderedParts.join(''),
      versusMetadata: subCtx.versusMetadata,
    };
  });

  // `sides = 0` sentinel: synthetic dice only feed `mergeDropSets`, never reach
  // `ctx.rolls`, and crit/fumble is meaningless for a subtotal.
  const syntheticDice: DieResult[] = subRolls.map((sub) => ({
    sides: 0,
    result: sub.subtotal,
    modifiers: [],
    critical: false,
    fumble: false,
  }));

  const mergedSynthetic = mergeDropSets(syntheticDice, specs);

  const outerRendered: string[] = [];
  const keptIndices: number[] = [];
  let total = 0;

  for (let i = 0; i < subRolls.length; i++) {
    const sub = subRolls[i] as SubRoll;
    const synth = mergedSynthetic[i] as DieResult;
    const isDropped = synth.modifiers.includes('dropped');

    if (isDropped) {
      // Flag every inner die dropped so propagated rolls still sum to the
      // total, stripping `'success'`/`'failure'` too so the top-level tally
      // cannot count a dropped sub-roll. Mutated in place — the same objects
      // live in the sub-roll's `RollPart`.
      for (const die of sub.rolls) {
        die.modifiers = rewriteFlags(die.modifiers, SELECTION_AND_TALLY_FLAGS, 'dropped');
      }
      appendAll(ctx.rolls, sub.rolls);
      outerRendered.push(`~~${stripInnerMarkers(sub.rendered)}~~`);
    } else {
      keptIndices.push(i);
      appendAll(ctx.rolls, sub.rolls);
      outerRendered.push(sub.rendered);
      total += sub.subtotal;
    }

    // Only kept sub-rolls propagate versus metadata — `degree` must reflect
    // dice that contributed to the total. Two kept versus sub-rolls still
    // collide via `propagateMetadata`'s `NESTED_VERSUS` guard.
    if (!isDropped) {
      propagateMetadata(ctx, sub.versusMetadata);
    }
  }

  const subExprStrs = subRolls.map((s) => s.expr);
  const keepDropCodes = specs.map((s) => `${s.code}${s.count}`).join('');

  ctx.expressionParts.push(`{${subExprStrs.join(', ')}}${keepDropCodes}`);
  // Keep/drop codes live in `expressionParts` only — the per-sub strikethrough
  // already shows which sub-rolls were kept.
  ctx.renderedParts.push(`{${outerRendered.join(', ')}}`);

  // `keptIndices` sits on the inner `group` part even though the outer modifier
  // computed it — it describes sub-roll selection. Dropped sub-rolls keep their
  // complete parts; consumers filter by `keptIndices`.
  const groupPart: RollPart = {
    type: 'group',
    parts: subRolls.map((s) => s.part),
    keptIndices,
    total,
    ...partSpan(group),
  };

  return {
    total,
    part: {
      type: 'keepDrop',
      specs: toPublicSpecs(specs),
      target: groupPart,
      total,
      ...partSpan(node),
    },
  };
}

//
// * Success counting
//

function resolveThreshold(
  value: ASTNode,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
  role: 'threshold' | 'fail threshold',
): number {
  const resolved = evalMetaOperand(value, rng, ctx, env);

  if (!Number.isFinite(resolved)) {
    throw new EvaluatorError(`Invalid ${role}: ${resolved}`, 'INVALID_THRESHOLD', 'SuccessCount');
  }

  return resolved;
}

/**
 * Builds the failure-threshold suffix of a success-count expression, e.g.
 * `f3`, `f<3`, `f>=3`.
 *
 * `'='` is elided because bare `fN` parses back to `{ operator: '=' }`, so
 * `f3` is the canonical spelling. Every other operator must be emitted —
 * dropping it silently rewrites `f<3` into `f3`, which counts a different
 * set of dice as failures.
 */
function formatFailCode(operator: CompareOp, value: number): string {
  return operator === '=' ? `f${value}` : `f${operator}${value}`;
}

function evalSuccessCount(
  node: SuccessCountNode,
  rng: RNG,
  ctx: EvalContext,
  env: EvalEnv,
): EvalResult {
  // Flag tracks syntactic presence of success-count notation, not pool size —
  // set before any early return so empty pools still populate successes/failures.
  env.hasSuccessCount = true;

  const targetCtx = createContext();
  const target = evalNode(node.target, rng, targetCtx, env);
  const targetExpr = targetCtx.expressionParts.join('');

  const thresholdValue = resolveThreshold(node.threshold.value, rng, ctx, env, 'threshold');
  const failValue =
    node.failThreshold != null
      ? resolveThreshold(node.failThreshold.value, rng, ctx, env, 'fail threshold')
      : undefined;

  const failCode =
    failValue != null && node.failThreshold != null
      ? formatFailCode(node.failThreshold.operator, failValue)
      : '';

  const code = `${node.threshold.operator}${thresholdValue}${failCode}`;

  const buildPart = (total: number, successes: number, failures: number): RollPart => {
    const part: RollPart = {
      type: 'successCount',
      threshold: { operator: node.threshold.operator, value: thresholdValue },
      target: target.part,
      successes,
      failures,
      total,
      ...partSpan(node),
    };
    if (failValue != null && node.failThreshold != null) {
      part.failThreshold = { operator: node.failThreshold.operator, value: failValue };
    }
    return part;
  };

  // No-op when the target produced no dice (`0d6>=4`); `containsDicePool`
  // should already reject dice-less targets at parse time. `target.total` is 0
  // for an empty pool, so `total === successes - failures` still holds.
  if (targetCtx.rolls.length === 0) {
    ctx.expressionParts.push(`${targetExpr}${code}`);
    ctx.renderedParts.push(`${targetExpr}${code}`);
    return { total: target.total, part: buildPart(target.total, 0, 0) };
  }

  const result = countSuccesses(
    targetCtx.rolls,
    { operator: node.threshold.operator, value: thresholdValue },
    failValue != null && node.failThreshold != null
      ? { operator: node.failThreshold.operator, value: failValue }
      : undefined,
  );

  appendAll(ctx.rolls, targetCtx.rolls);
  ctx.expressionParts.push(`${targetExpr}${code}`);
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(targetCtx.rolls)}`);

  return {
    total: result.total,
    part: buildPart(result.total, result.successes, result.failures),
  };
}

//
// * Versus
//

/**
 * Extracts the "natural" d20 value from a roll-side dice pool. Returns the
 * single value when exactly one primary kept d20 is present; otherwise
 * `undefined`.
 *
 * Excludes dropped (`kh`/`kl`/`dh`/`dl`/`r`/`ro`) dice — these aren't the
 * final kept result. Explosion continuation dice (appended by standard/
 * penetrating explode, tagged `'exploded'` with no `initialResult`) are not
 * primaries either — `1d20! vs DC` keeps the natural from the original d20.
 * Compound explode accumulates into the original die and sets
 * `initialResult`, so it stays a primary and the raw first face is used.
 * Multiple primary kept d20s (e.g., `1d20+1d20`) yield `undefined` so no
 * ambiguous upgrade/downgrade is applied.
 */
function extractNatural(rolls: DieResult[]): number | undefined {
  // Rerolled intermediates are always stamped `['rerolled', 'dropped']`
  // (see `modifiers/reroll.ts`), so filtering by `'dropped'` covers them.
  const primaries = rolls.filter(
    (d) =>
      d.sides === 20 &&
      !d.modifiers.includes('dropped') &&
      !(d.modifiers.includes('exploded') && d.initialResult == null),
  );
  if (primaries.length !== 1) return undefined;
  const die = primaries[0];
  return die?.initialResult ?? die?.result;
}

/**
 * PF2e degree of success: compares `total` to `dc` at three thresholds and
 * applies natural 20 upgrade / natural 1 downgrade with clamping.
 */
function calculateDegree(total: number, dc: number, natural: number | undefined): DegreeOfSuccess {
  let degree: DegreeOfSuccess;
  if (total >= dc + 10) degree = DegreeOfSuccess.CriticalSuccess;
  else if (total >= dc) degree = DegreeOfSuccess.Success;
  else if (total > dc - 10) degree = DegreeOfSuccess.Failure;
  else degree = DegreeOfSuccess.CriticalFailure;

  if (natural === 20 && degree < DegreeOfSuccess.CriticalSuccess) degree++;
  if (natural === 1 && degree > DegreeOfSuccess.CriticalFailure) degree--;

  return degree;
}

function degreeLabel(degree: DegreeOfSuccess): string {
  switch (degree) {
    case DegreeOfSuccess.CriticalFailure:
      return 'Critical Failure';
    case DegreeOfSuccess.Failure:
      return 'Failure';
    case DegreeOfSuccess.Success:
      return 'Success';
    case DegreeOfSuccess.CriticalSuccess:
      return 'Critical Success';
  }
}

function evalVersus(node: VersusNode, rng: RNG, ctx: EvalContext, env: EvalEnv): EvalResult {
  if (env.insideVersus) {
    throw new EvaluatorError('Cannot nest versus operators', 'NESTED_VERSUS', 'Versus');
  }

  env.insideVersus = true;
  try {
    const rollCtx = createContext();
    const rollResult = evalNode(node.roll, rng, rollCtx, env);
    const natural = extractNatural(rollCtx.rolls);

    const dcCtx = createContext();
    const dcResult = evalNode(node.dc, rng, dcCtx, env);

    const degree = calculateDegree(rollResult.total, dcResult.total, natural);

    appendAll(ctx.rolls, rollCtx.rolls);
    // ! Tag before merging: past this point the DC dice are indistinguishable
    // ! from the roll side, and every pool modifier walks the merged array.
    for (const die of dcCtx.rolls) {
      die.modifiers.push('dc');
    }
    appendAll(ctx.rolls, dcCtx.rolls);

    const rollExpr = rollCtx.expressionParts.join('');
    const dcExpr = dcCtx.expressionParts.join('');
    const rollRendered = rollCtx.renderedParts.join('');
    const dcRendered = dcCtx.renderedParts.join('');

    ctx.expressionParts.push(`${rollExpr} vs ${dcExpr}`);
    ctx.renderedParts.push(`${rollRendered} vs ${dcRendered}`);
    ctx.versusMetadata = { degree, natural, dcTotal: dcResult.total };

    return {
      total: rollResult.total,
      part: {
        type: 'versus',
        roll: rollResult.part,
        dc: dcResult.part,
        degree,
        total: rollResult.total,
        ...partSpan(node),
      },
    };
  } finally {
    env.insideVersus = false;
  }
}

//
// * Entry point
//

/**
 * Evaluates a parsed AST against an {@link RNG} and returns the roll result.
 *
 * The second half of the pipeline — {@link roll} is `evaluate(parse(...))`.
 * Call it directly to reuse one AST across many rolls, or to drive a
 * hand-built AST.
 *
 * Unlike `roll`, the RNG is required: `evaluate` never invents a randomness
 * source, so a caller can never accidentally get an unseeded roll.
 *
 * @param ast - The AST to evaluate, from {@link parse} or hand-built
 * @param rng - Randomness source; one `nextInt` call per die
 * @param options - Evaluation limits plus the original `notation` string,
 *   which the AST cannot supply
 * @returns Complete {@link RollResult}
 * @throws {EvaluatorError} On a limit breach, division by zero, an undefined
 *   variable, or a non-finite total
 * @throws {RollParserError} `INVALID_EVALUATION_LIMIT` when a supplied limit is
 *   not an integer in range — raised before any die is rolled
 *
 * @example
 * ```typescript
 * import { evaluate, parse } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const ast = parse('2d6+3');
 * const result = evaluate(ast, createMockRng([4, 2]), { notation: '2d6+3' });
 * result.total; // 9
 * result.rendered; // '2d6[4, 2] + 3 = 9'
 * ```
 *
 * Omitting `notation` falls back to the normalized `expression`, which is
 * reconstructed from the AST — so `RollResult.notation` is always a string,
 * just not necessarily the one the user typed.
 *
 * @category Core
 */
export function evaluate(ast: ASTNode, rng: RNG, options: EvaluateOptions = {}): RollResult {
  const maxDice = resolveLimit(options.maxDice, 'maxDice', DEFAULT_MAX_DICE, 1);
  const maxExplodeIterations = resolveLimit(
    options.maxExplodeIterations,
    'maxExplodeIterations',
    DEFAULT_MAX_EXPLODE_ITERATIONS,
    0,
  );
  const maxRerollIterations = resolveLimit(
    options.maxRerollIterations,
    'maxRerollIterations',
    DEFAULT_MAX_REROLL_ITERATIONS,
    0,
  );

  const context = options.context ?? {};
  const onMissingVariable = options.onMissingVariable ?? 'throw';

  const env: EvalEnv = {
    maxDice,
    maxExplodeIterations,
    maxRerollIterations,
    totalDiceRolled: 0,
    hasSuccessCount: false,
    insideVersus: false,
    context,
    onMissingVariable,
  };
  const ctx = createContext();

  const { total, part } = evalNode(ast, rng, ctx, env);

  if (!Number.isFinite(total)) {
    throw new EvaluatorError(
      `Result is not a finite number: ${total}`,
      'NON_FINITE_RESULT',
      ast.type,
    );
  }

  const expression = ctx.expressionParts.join('');
  // Versus replaces the numeric total with the degree label in the rendered
  // form; `RollResult.total` remains the numeric roll total.
  const trailing = ctx.versusMetadata ? degreeLabel(ctx.versusMetadata.degree) : String(total);
  const rendered = `${ctx.renderedParts.join('')} = ${trailing}`;

  // `RollResult` is `Readonly` — optional fields fold in via conditional spreads.
  const versus = ctx.versusMetadata;

  return {
    total,
    notation: options.notation ?? expression,
    expression,
    rendered,
    rolls: ctx.rolls,
    parts: part,
    ...(env.hasSuccessCount ? countTaggedDice(ctx.rolls) : {}),
    ...(versus ? { degree: versus.degree } : {}),
    ...(versus?.natural != null ? { natural: versus.natural } : {}),
  };
}

/** Tallies the `'success'` / `'failure'` tags across a whole roll. */
function countTaggedDice(rolls: DieResult[]): { successes: number; failures: number } {
  let successes = 0;
  let failures = 0;

  for (const die of rolls) {
    // A success-count inside the DC sub-expression tags its own dice before
    // `evalVersus` marks them `'dc'`, so they arrive here already tagged.
    if (isVersusDc(die)) continue;
    if (die.modifiers.includes('success')) successes += 1;
    else if (die.modifiers.includes('failure')) failures += 1;
  }

  return { successes, failures };
}
