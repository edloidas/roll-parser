/**
 * AST evaluator - transforms parsed AST into roll results.
 *
 * @module evaluator/evaluator
 */

import type { ASTNode, BinaryOpNode, DiceNode, ModifierNode, UnaryOpNode } from '../parser/ast';
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

function evalModifier(node: ModifierNode, rng: RNG, ctx: EvalContext): number {
  // LIMITATION: Chained modifiers (e.g., 4d6dl1kh3) evaluate sequentially, not per industry standard.
  // Current: Inner modifier is fully evaluated, outer sees final result.
  // Roll20/RPG Dice Roller: Each modifier sees ALL original dice and can override previous modifiers.
  // See: https://dice-roller.github.io/documentation/guide/notation/modifiers.html
  // TODO: Refactor to pass dice pools through modifier chain (Stage 2/3 enhancement)

  const countCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  const modCount = evalNode(node.count, rng, countCtx);

  if (!Number.isInteger(modCount) || modCount < 0) {
    throw new EvaluatorError(`Invalid modifier count: ${modCount}`);
  }

  const targetCtx: EvalContext = { rolls: [], expressionParts: [], renderedParts: [] };
  evalNode(node.target, rng, targetCtx);

  let modifiedDice: DieResult[];

  if (node.modifier === 'keep') {
    if (node.selector === 'highest') {
      modifiedDice = applyKeepHighest(targetCtx.rolls, modCount);
    } else {
      modifiedDice = applyKeepLowest(targetCtx.rolls, modCount);
    }
  } else {
    if (node.selector === 'highest') {
      modifiedDice = applyDropHighest(targetCtx.rolls, modCount);
    } else {
      modifiedDice = applyDropLowest(targetCtx.rolls, modCount);
    }
  }

  ctx.rolls.push(...modifiedDice);

  const total = sumKeptDice(modifiedDice);

  const targetExpr = targetCtx.expressionParts.join('');
  const modifierCode =
    node.modifier === 'keep'
      ? node.selector === 'highest'
        ? 'kh'
        : 'kl'
      : node.selector === 'highest'
        ? 'dh'
        : 'dl';

  ctx.expressionParts.push(`${targetExpr}${modifierCode}${modCount}`);
  ctx.renderedParts.push(`${targetExpr}${renderDice(modifiedDice)}`);

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
