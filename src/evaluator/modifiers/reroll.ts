/**
 * Reroll modifier implementations.
 *
 * Recursive (`r`): re-roll matching dice until the condition no longer holds,
 *   or the per-die iteration limit is reached.
 * Reroll-once (`ro`): re-roll matching dice exactly once, keeping the second
 *   result regardless of whether it matches.
 *
 * @module evaluator/modifiers/reroll
 */

import type { RNG } from '../../rng/types';
import type { CompareOp, DieResult } from '../../types';
import { EvaluatorError, type EvalEnv } from '../evaluator';

/** Default maximum reroll iterations per die. */
export const DEFAULT_MAX_REROLL_ITERATIONS = 1_000;

/**
 * Compares a die result against a fixed comparison threshold. Reusable across
 * reroll and success-counting modifiers (the only difference is who calls it).
 */
export function matchesCondition(result: number, operator: CompareOp, value: number): boolean {
  switch (operator) {
    case '>':
      return result > value;
    case '>=':
      return result >= value;
    case '<':
      return result < value;
    case '<=':
      return result <= value;
    case '=':
      return result === value;
  }
}

/**
 * Rolls a replacement die for the given sides, charging it against the global
 * dice limit. Fate dice (sides === 0) re-roll on the {-1, 0, +1} range.
 */
function rollReplacement(sides: number, rng: RNG, env: EvalEnv): DieResult {
  if (env.totalDiceRolled + 1 > env.maxDice) {
    throw new EvaluatorError(
      `Total dice count ${env.totalDiceRolled + 1} exceeds limit of ${env.maxDice}`,
      'DICE_LIMIT_EXCEEDED',
      'Reroll',
    );
  }
  env.totalDiceRolled += 1;

  if (sides === 0) {
    const result = rng.nextInt(-1, 1);
    return {
      sides: 0,
      result,
      modifiers: [],
      critical: false,
      fumble: false,
    };
  }

  const result = rng.nextInt(1, sides);
  return {
    sides,
    result,
    modifiers: [],
    critical: result === sides && sides > 1,
    fumble: result === 1,
  };
}

function rerollLimitError(maxIterations: number): EvaluatorError {
  return new EvaluatorError(
    `Reroll iteration limit of ${maxIterations} exceeded`,
    'REROLL_LIMIT_EXCEEDED',
    'Reroll',
  );
}

/**
 * True for dice eligible to start rerolling. Dropped dice (from a preceding
 * keep/drop modifier) are left alone.
 */
function canReroll(die: DieResult): boolean {
  return !die.modifiers.includes('dropped');
}

/**
 * Returns the die's modifiers with any "slot" flags removed. Slot flags
 * (`kept`, `dropped`, `rerolled`) are controlled by the surrounding logic
 * and should be reassigned each pass.
 */
function stripSlotFlags(modifiers: DieResult['modifiers']): DieResult['modifiers'] {
  return modifiers.filter((m) => m !== 'kept' && m !== 'dropped' && m !== 'rerolled');
}

/**
 * Applies recursive reroll: re-roll each matching die until it no longer
 * matches or the per-die iteration limit is reached. Intermediate dice are
 * appended to the output pool with `['rerolled', 'dropped']` so they:
 * 1. Render as strikethrough (via `renderDice`'s `'dropped'` check).
 * 2. Are excluded from `sumKeptDice`.
 * 3. Are ignored by subsequent keep/drop modifiers.
 */
export function applyRecursiveReroll(
  pool: DieResult[],
  operator: CompareOp,
  value: number,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  const result: DieResult[] = [];

  for (const original of pool) {
    if (!canReroll(original)) {
      result.push(original);
      continue;
    }

    let current = original;
    let iterations = 0;

    while (matchesCondition(current.result, operator, value)) {
      if (iterations >= env.maxRerollIterations) {
        throw rerollLimitError(env.maxRerollIterations);
      }

      result.push({
        ...current,
        modifiers: [...stripSlotFlags(current.modifiers), 'rerolled', 'dropped'],
      });

      current = rollReplacement(current.sides, rng, env);
      iterations += 1;
    }

    result.push({
      ...current,
      modifiers: [...stripSlotFlags(current.modifiers), 'kept'],
    });
  }

  return result;
}

/**
 * Applies reroll-once: re-roll each matching die exactly once, keeping the
 * second result regardless of whether it matches. Non-matching dice pass
 * through with the `'kept'` slot flag.
 */
export function applyRerollOnce(
  pool: DieResult[],
  operator: CompareOp,
  value: number,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  const result: DieResult[] = [];

  for (const original of pool) {
    if (!canReroll(original)) {
      result.push(original);
      continue;
    }

    if (!matchesCondition(original.result, operator, value)) {
      result.push({
        ...original,
        modifiers: [...stripSlotFlags(original.modifiers), 'kept'],
      });
      continue;
    }

    result.push({
      ...original,
      modifiers: [...stripSlotFlags(original.modifiers), 'rerolled', 'dropped'],
    });

    const replacement = rollReplacement(original.sides, rng, env);
    result.push({
      ...replacement,
      modifiers: [...stripSlotFlags(replacement.modifiers), 'kept'],
    });
  }

  return result;
}
