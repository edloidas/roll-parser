/**
 * AST evaluator - transforms parsed AST into roll results.
 *
 * @module evaluator/evaluator
 */

import type { ASTNode, BinaryOpNode, DiceNode, ModifierNode, UnaryOpNode } from '../parser/ast';
import { isModifier } from '../parser/ast';
import type { RNG } from '../rng/types';
import type { DieResult, EvaluateOptions, RollResult } from '../types';
import {
  applyDropHighest,
  applyDropLowest,
  applyKeepHighest,
  applyKeepLowest,
  markAllKept,
  sumKeptDice,
} from './modifiers/keep-drop';

/**
 * Error thrown during AST evaluation.
 */
export class EvaluatorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvaluatorError';
  }
}

/**
 * Internal evaluation context for tracking state during recursion.
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
    critical: result === sides,
    fumble: result === 1,
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
function evalNode(node: ASTNode, rng: RNG, ctx: EvalContext): number {
  switch (node.type) {
    case 'Literal':
      return evalLiteral(node.value, ctx);

    case 'Dice':
      return evalDice(node, rng, ctx);

    case 'BinaryOp':
      return evalBinaryOp(node, rng, ctx);

    case 'UnaryOp':
      return evalUnaryOp(node, rng, ctx);

    case 'Modifier':
      return evalModifier(node, rng, ctx);

    default: {
      const exhaustive: never = node;
      throw new EvaluatorError(`Unknown node type: ${(exhaustive as ASTNode).type}`);
    }
  }
}

function evalLiteral(value: number, ctx: EvalContext): number {
  ctx.expressionParts.push(String(value));
  ctx.renderedParts.push(String(value));
  return value;
}

function evalDice(node: DiceNode, rng: RNG, ctx: EvalContext): number {
  const count = evalNode(node.count, rng, { rolls: [], expressionParts: [], renderedParts: [] });
  const sides = evalNode(node.sides, rng, { rolls: [], expressionParts: [], renderedParts: [] });

  if (!Number.isInteger(count) || count < 0) {
    throw new EvaluatorError(`Invalid dice count: ${count}`);
  }
  if (!Number.isInteger(sides) || sides < 1) {
    throw new EvaluatorError(`Invalid dice sides: ${sides}`);
  }

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

function evalBinaryOp(node: BinaryOpNode, rng: RNG, ctx: EvalContext): number {
  const leftCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const rightCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };

  const left = evalNode(node.left, rng, leftCtx);
  const right = evalNode(node.right, rng, rightCtx);

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
        throw new EvaluatorError('Division by zero');
      }
      return left / right;
    case '%':
      if (right === 0) {
        throw new EvaluatorError('Modulo by zero');
      }
      return left % right;
    case '**':
      return left ** right;
    default: {
      const exhaustive: never = node.operator;
      throw new EvaluatorError(`Unknown operator: ${exhaustive}`);
    }
  }
}

function evalUnaryOp(node: UnaryOpNode, rng: RNG, ctx: EvalContext): number {
  const innerCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const value = evalNode(node.operand, rng, innerCtx);

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
): { specs: ModifierSpec[]; baseTarget: ASTNode } {
  const specs: ModifierSpec[] = [];
  let current: ASTNode = node;

  while (isModifier(current)) {
    const countCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
    const modCount = evalNode(current.count, rng, countCtx);

    if (!Number.isInteger(modCount) || modCount < 0) {
      throw new EvaluatorError(`Invalid modifier count: ${modCount}`);
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
      ? [...die.modifiers.filter((m) => m !== 'kept'), 'dropped']
      : [...die.modifiers.filter((m) => m !== 'dropped'), 'kept'],
  }));
}

function evalModifier(node: ModifierNode, rng: RNG, ctx: EvalContext): number {
  const { specs, baseTarget } = flattenModifierChain(node, rng);

  const targetCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  evalNode(baseTarget, rng, targetCtx);

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
  const ctx: EvalContext = {
    rolls: [],
    expressionParts: [],
    renderedParts: [],
  };

  const total = evalNode(ast, rng, ctx);

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
