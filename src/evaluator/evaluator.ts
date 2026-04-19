/**
 * AST evaluator - transforms parsed AST into roll results.
 *
 * @module evaluator/evaluator
 */

import type { RollParserErrorCode } from '../errors';
import { RollParserError } from '../errors';
import type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  ExplodeNode,
  FateDiceNode,
  ModifierNode,
  RerollNode,
  UnaryOpNode,
} from '../parser/ast';
import { isModifier } from '../parser/ast';
import type { RNG } from '../rng/types';
import type { ComparePoint, DieResult, EvaluateOptions, RollResult } from '../types';
import {
  applyCompoundExplode,
  applyPenetratingExplode,
  applyStandardExplode,
  buildShouldExplode,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
} from './modifiers/explode';
import {
  applyDropHighest,
  applyDropLowest,
  applyKeepHighest,
  applyKeepLowest,
  markAllKept,
  sumKeptDice,
} from './modifiers/keep-drop';
import {
  applyRecursiveReroll,
  applyRerollOnce,
  DEFAULT_MAX_REROLL_ITERATIONS,
} from './modifiers/reroll';

/**
 * Error thrown during AST evaluation.
 */
export class EvaluatorError extends RollParserError {
  readonly nodeType: string | undefined;

  constructor(message: string, code: RollParserErrorCode, nodeType?: string) {
    super(message, code);
    this.name = 'EvaluatorError';
    this.nodeType = nodeType ?? undefined;
  }
}

/** Default maximum total dice allowed per evaluation. */
export const DEFAULT_MAX_DICE = 10_000;

export { DEFAULT_MAX_EXPLODE_ITERATIONS, DEFAULT_MAX_REROLL_ITERATIONS };

/**
 * Per-evaluation shared environment (created once, shared across all branches).
 *
 * Exported for use by modifier implementations under `./modifiers/*`. Not part
 * of the public library API.
 */
export type EvalEnv = {
  readonly maxDice: number;
  readonly maxExplodeIterations: number;
  readonly maxRerollIterations: number;
  totalDiceRolled: number;
};

/**
 * Per-branch mutable accumulator for tracking rolls and output during recursion.
 */
type EvalContext = {
  rolls: DieResult[];
  expressionParts: string[];
  renderedParts: string[];
};

/**
 * Flattened representation of a keep/drop modifier for chain evaluation.
 */
type ModifierSpec = {
  modifier: 'keep' | 'drop';
  selector: 'highest' | 'lowest';
  count: number;
  code: string;
};

/**
 * Creates a new die result with critical/fumble detection.
 */
function createDieResult(sides: number, result: number): DieResult {
  return {
    sides,
    result,
    modifiers: [],
    critical: result === sides && sides > 1,
    fumble: result === 1,
  };
}

/**
 * Creates a Fate/Fudge die result. Uses `sides = 0` as a sentinel — Fate dice
 * have no max-face concept, so `critical` and `fumble` are always `false`.
 */
function createFateDieResult(result: number): DieResult {
  return {
    sides: 0,
    result,
    modifiers: [],
    critical: false,
    fumble: false,
  };
}

/**
 * Renders dice results for display (e.g., "[3, 5, 2]" or "[~~3~~, 5, ~~2~~]").
 */
function renderDice(dice: DieResult[]): string {
  const parts = dice.map((die) => {
    if (die.modifiers.includes('dropped')) {
      return `~~${die.result}~~`;
    }
    return String(die.result);
  });
  return `[${parts.join(', ')}]`;
}

/**
 * Evaluates an AST node, returning value and updating context.
 */
function evalNode(node: ASTNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  switch (node.type) {
    case 'Literal':
      return evalLiteral(node.value, ctx);

    case 'Dice':
      return evalDice(node, rng, ctx, env);

    case 'FateDice':
      return evalFateDice(node, rng, ctx, env);

    case 'BinaryOp':
      return evalBinaryOp(node, rng, ctx, env);

    case 'UnaryOp':
      return evalUnaryOp(node, rng, ctx, env);

    case 'Modifier':
      return evalModifier(node, rng, ctx, env);

    case 'Explode':
      return evalExplode(node, rng, ctx, env);

    case 'Reroll':
      return evalReroll(node, rng, ctx, env);

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

function evalLiteral(value: number, ctx: EvalContext): number {
  ctx.expressionParts.push(String(value));
  ctx.renderedParts.push(String(value));
  return value;
}

function evalDice(node: DiceNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const count = evalNode(
    node.count,
    rng,
    { rolls: [], expressionParts: [], renderedParts: [] },
    env,
  );
  const sides = evalNode(
    node.sides,
    rng,
    { rolls: [], expressionParts: [], renderedParts: [] },
    env,
  );

  if (!Number.isInteger(count) || count < 0) {
    throw new EvaluatorError(`Invalid dice count: ${count}`, 'INVALID_DICE_COUNT', 'Dice');
  }
  if (!Number.isInteger(sides) || sides < 1) {
    throw new EvaluatorError(`Invalid dice sides: ${sides}`, 'INVALID_DICE_SIDES', 'Dice');
  }

  if (env.totalDiceRolled + count > env.maxDice) {
    throw new EvaluatorError(
      `Total dice count ${env.totalDiceRolled + count} exceeds limit of ${env.maxDice}`,
      'DICE_LIMIT_EXCEEDED',
      'Dice',
    );
  }
  env.totalDiceRolled += count;

  const dice: DieResult[] = [];
  for (let i = 0; i < count; i++) {
    const result = rng.nextInt(1, sides);
    dice.push(createDieResult(sides, result));
  }

  const markedDice = markAllKept(dice);
  ctx.rolls.push(...markedDice);

  const total = sumKeptDice(markedDice);
  const notation = `${count}d${sides}`;

  ctx.expressionParts.push(notation);
  ctx.renderedParts.push(`${notation}${renderDice(markedDice)}`);

  return total;
}

function evalFateDice(node: FateDiceNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const count = evalNode(
    node.count,
    rng,
    { rolls: [], expressionParts: [], renderedParts: [] },
    env,
  );

  if (!Number.isInteger(count) || count < 0) {
    throw new EvaluatorError(`Invalid dice count: ${count}`, 'INVALID_DICE_COUNT', 'FateDice');
  }

  if (env.totalDiceRolled + count > env.maxDice) {
    throw new EvaluatorError(
      `Total dice count ${env.totalDiceRolled + count} exceeds limit of ${env.maxDice}`,
      'DICE_LIMIT_EXCEEDED',
      'FateDice',
    );
  }
  env.totalDiceRolled += count;

  const dice: DieResult[] = [];
  for (let i = 0; i < count; i++) {
    const result = rng.nextInt(-1, 1);
    dice.push(createFateDieResult(result));
  }

  const markedDice = markAllKept(dice);
  ctx.rolls.push(...markedDice);

  const total = sumKeptDice(markedDice);
  const notation = `${count}dF`;

  ctx.expressionParts.push(notation);
  ctx.renderedParts.push(`${notation}${renderDice(markedDice)}`);

  return total;
}

function evalBinaryOp(node: BinaryOpNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const leftCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const rightCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };

  const left = evalNode(node.left, rng, leftCtx, env);
  const right = evalNode(node.right, rng, rightCtx, env);

  ctx.rolls.push(...leftCtx.rolls, ...rightCtx.rolls);

  const leftExpr = leftCtx.expressionParts.join('');
  const rightExpr = rightCtx.expressionParts.join('');
  const leftRendered = leftCtx.renderedParts.join('');
  const rightRendered = rightCtx.renderedParts.join('');

  ctx.expressionParts.push(`${leftExpr} ${node.operator} ${rightExpr}`);
  ctx.renderedParts.push(`${leftRendered} ${node.operator} ${rightRendered}`);

  switch (node.operator) {
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
      const exhaustive: never = node.operator;
      throw new EvaluatorError(`Unknown operator: ${exhaustive}`, 'UNKNOWN_OPERATOR', 'BinaryOp');
    }
  }
}

function evalUnaryOp(node: UnaryOpNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const innerCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const value = evalNode(node.operand, rng, innerCtx, env);

  ctx.rolls.push(...innerCtx.rolls);

  const innerExpr = innerCtx.expressionParts.join('');
  const innerRendered = innerCtx.renderedParts.join('');

  ctx.expressionParts.push(`-${innerExpr}`);
  ctx.renderedParts.push(`-${innerRendered}`);

  return -value;
}

/**
 * Walks a nested ModifierNode chain, collecting specs outermost-first,
 * then reverses to notation order (innermost-first).
 */
function flattenModifierChain(
  node: ModifierNode,
  rng: RNG,
  env: EvalEnv,
): { specs: ModifierSpec[]; baseTarget: ASTNode } {
  const specs: ModifierSpec[] = [];
  let current: ASTNode = node;

  while (isModifier(current)) {
    const countCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
    const modCount = evalNode(current.count, rng, countCtx, env);

    if (!Number.isInteger(modCount) || modCount < 0) {
      throw new EvaluatorError(
        `Invalid modifier count: ${modCount}`,
        'INVALID_MODIFIER_COUNT',
        'Modifier',
      );
    }

    const code =
      current.modifier === 'keep'
        ? current.selector === 'highest'
          ? 'kh'
          : 'kl'
        : current.selector === 'highest'
          ? 'dh'
          : 'dl';

    specs.push({ modifier: current.modifier, selector: current.selector, count: modCount, code });
    current = current.target;
  }

  specs.reverse();
  return { specs, baseTarget: current };
}

/**
 * Applies a single modifier spec to a dice pool.
 */
function applyModifierSpec(dice: DieResult[], spec: ModifierSpec): DieResult[] {
  if (spec.modifier === 'keep') {
    return spec.selector === 'highest'
      ? applyKeepHighest(dice, spec.count)
      : applyKeepLowest(dice, spec.count);
  }
  return spec.selector === 'highest'
    ? applyDropHighest(dice, spec.count)
    : applyDropLowest(dice, spec.count);
}

/**
 * Applies each modifier independently to the full dice pool
 * and merges drop sets via union. A die is dropped if ANY modifier dropped it.
 */
function mergeDropSets(baseDice: DieResult[], specs: ModifierSpec[]): DieResult[] {
  const droppedIndices = new Set<number>();

  for (const spec of specs) {
    const result = applyModifierSpec(baseDice, spec);
    for (let i = 0; i < result.length; i++) {
      if (result[i]?.modifiers.includes('dropped')) {
        droppedIndices.add(i);
      }
    }
  }

  return baseDice.map((die, index) => ({
    ...die,
    modifiers: droppedIndices.has(index)
      ? [...die.modifiers.filter((m) => m !== 'kept' && m !== 'dropped'), 'dropped']
      : [...die.modifiers.filter((m) => m !== 'dropped' && m !== 'kept'), 'kept'],
  }));
}

/**
 * Builds the notation string for an explode modifier, e.g. `!`, `!!>=3`, `!p>5`.
 */
function formatExplodeCode(
  variant: ExplodeNode['variant'],
  threshold: ComparePoint | undefined,
  thresholdValue: number | undefined,
): string {
  const marker = variant === 'standard' ? '!' : variant === 'compound' ? '!!' : '!p';
  if (threshold == null || thresholdValue == null) return marker;
  return `${marker}${threshold.operator}${thresholdValue}`;
}

function evalExplode(node: ExplodeNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const targetCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const targetValue = evalNode(node.target, rng, targetCtx, env);
  const targetExpr = targetCtx.expressionParts.join('');

  let thresholdValue: number | undefined;
  if (node.threshold != null) {
    const thresholdCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
    thresholdValue = evalNode(node.threshold.value, rng, thresholdCtx, env);
  }

  const code = formatExplodeCode(node.variant, node.threshold, thresholdValue);

  // No-op when the target produced no dice (e.g., `(1+2)!`).
  if (targetCtx.rolls.length === 0) {
    ctx.expressionParts.push(`${targetExpr}${code}`);
    ctx.renderedParts.push(`${targetExpr}${code}`);
    return targetValue;
  }

  const shouldExplode = buildShouldExplode(node.threshold?.operator, thresholdValue);

  const expanded =
    node.variant === 'standard'
      ? applyStandardExplode(targetCtx.rolls, shouldExplode, rng, env)
      : node.variant === 'compound'
        ? applyCompoundExplode(targetCtx.rolls, shouldExplode, rng, env)
        : applyPenetratingExplode(targetCtx.rolls, shouldExplode, rng, env);

  ctx.rolls.push(...expanded);
  ctx.expressionParts.push(`${targetExpr}${code}`);
  // ? Include the explode code in rendered output so readers can attribute
  //   the extra dice. Modifier rendering (kh/dl) skips its code because
  //   dropped dice are visible; explosion-origin is otherwise invisible.
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(expanded)}`);

  return sumKeptDice(expanded);
}

function evalReroll(node: RerollNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const targetCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  evalNode(node.target, rng, targetCtx, env);
  const targetExpr = targetCtx.expressionParts.join('');

  const thresholdCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const thresholdValue = evalNode(node.condition.value, rng, thresholdCtx, env);

  const code = `${node.once ? 'ro' : 'r'}${node.condition.operator}${thresholdValue}`;

  // No-op when the target produced no dice (e.g., `(1+2)r<5`).
  if (targetCtx.rolls.length === 0) {
    ctx.expressionParts.push(`${targetExpr}${code}`);
    ctx.renderedParts.push(`${targetExpr}${code}`);
    return sumKeptDice(targetCtx.rolls);
  }

  const pool = node.once
    ? applyRerollOnce(targetCtx.rolls, node.condition.operator, thresholdValue, rng, env)
    : applyRecursiveReroll(targetCtx.rolls, node.condition.operator, thresholdValue, rng, env);

  ctx.rolls.push(...pool);
  ctx.expressionParts.push(`${targetExpr}${code}`);
  ctx.renderedParts.push(`${targetExpr}${code}${renderDice(pool)}`);

  return sumKeptDice(pool);
}

function evalModifier(node: ModifierNode, rng: RNG, ctx: EvalContext, env: EvalEnv): number {
  const { specs, baseTarget } = flattenModifierChain(node, rng, env);

  const targetCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  evalNode(baseTarget, rng, targetCtx, env);

  const mergedDice = mergeDropSets(targetCtx.rolls, specs);

  ctx.rolls.push(...mergedDice);

  const total = sumKeptDice(mergedDice);

  const targetExpr = targetCtx.expressionParts.join('');
  const modifierCodes = specs.map((s) => `${s.code}${s.count}`).join('');

  ctx.expressionParts.push(`${targetExpr}${modifierCodes}`);
  ctx.renderedParts.push(`${targetExpr}${renderDice(mergedDice)}`);

  return total;
}

/**
 * Evaluates a parsed AST and returns the roll result.
 *
 * @param ast - The parsed AST node
 * @param rng - Random number generator to use for dice rolls
 * @param options - Optional evaluation options
 * @returns Complete roll result with total and metadata
 *
 * @example
 * ```typescript
 * const ast = parse('2d6+3');
 * const rng = new SeededRNG('test');
 * const result = evaluate(ast, rng);
 * console.log(result.total); // Sum of dice plus 3
 * ```
 */
export function evaluate(ast: ASTNode, rng: RNG, options: EvaluateOptions = {}): RollResult {
  const maxDice =
    options.maxDice != null && Number.isFinite(options.maxDice) && options.maxDice > 0
      ? Math.floor(options.maxDice)
      : DEFAULT_MAX_DICE;

  const maxExplodeIterations =
    options.maxExplodeIterations != null &&
    Number.isFinite(options.maxExplodeIterations) &&
    options.maxExplodeIterations >= 0
      ? Math.floor(options.maxExplodeIterations)
      : DEFAULT_MAX_EXPLODE_ITERATIONS;

  const maxRerollIterations =
    options.maxRerollIterations != null &&
    Number.isFinite(options.maxRerollIterations) &&
    options.maxRerollIterations >= 0
      ? Math.floor(options.maxRerollIterations)
      : DEFAULT_MAX_REROLL_ITERATIONS;

  const env: EvalEnv = {
    maxDice,
    maxExplodeIterations,
    maxRerollIterations,
    totalDiceRolled: 0,
  };
  const ctx: EvalContext = {
    rolls: [],
    expressionParts: [],
    renderedParts: [],
  };

  const total = evalNode(ast, rng, ctx, env);

  const expression = ctx.expressionParts.join('');
  const rendered = `${ctx.renderedParts.join('')} = ${total}`;

  return {
    total,
    notation: options.notation ?? expression,
    expression,
    rendered,
    rolls: ctx.rolls,
  };
}
