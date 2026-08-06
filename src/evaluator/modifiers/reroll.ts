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

import { EvaluatorError } from '../../errors.js';
import type { RNG } from '../../rng/types.js';
import type { CompareOp, DieResult } from '../../types.js';
import { createDieResult, createFateDieResult } from '../die.js';
import { chargeDie, type EvalEnv } from '../env.js';
import { matchesCondition } from './compare.js';
import { isVersusDc, REROLL_SLOT_FLAGS, rewriteFlags } from './flags.js';

/**
 * Default value of `EvaluationOptions.maxRerollIterations`: how many times a
 * single die may be re-rolled by `r` before `REROLL_LIMIT_EXCEEDED` is
 * thrown.
 *
 * Per die, not per pool — it bounds notations like `1d1r<2`, whose reroll
 * condition can never stop matching. `ro` re-rolls exactly once and is
 * unaffected.
 *
 * @category Limits
 */
export const DEFAULT_MAX_REROLL_ITERATIONS = 1_000;

/**
 * Rolls a replacement die for the given sides, charging it against the global
 * dice limit. Fate dice (sides === 0) re-roll on the {-1, 0, +1} range.
 */
function rollReplacement(sides: number, rng: RNG, env: EvalEnv): DieResult {
  chargeDie(env, 'Reroll');

  if (sides === 0) return createFateDieResult(rng.nextInt(-1, 1), []);

  return createDieResult(sides, rng.nextInt(1, sides), []);
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
function canReroll(die: DieResult, hasVersusDc: boolean): boolean {
  if (hasVersusDc && isVersusDc(die)) return false;
  return !die.modifiers.includes('dropped');
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
    if (!canReroll(original, env.hasVersusDc)) {
      result.push(original);
      continue;
    }

    let current = original;
    let iterations = 0;

    // Mutate flags in place — the same DieResult objects are shared with
    // the RollPart tree, and both views must reflect reroll state.
    while (matchesCondition(current.result, operator, value)) {
      if (iterations >= env.maxRerollIterations) {
        throw rerollLimitError(env.maxRerollIterations);
      }

      current.modifiers = rewriteFlags(current.modifiers, REROLL_SLOT_FLAGS, 'rerolled', 'dropped');
      result.push(current);

      current = rollReplacement(current.sides, rng, env);
      iterations += 1;
    }

    current.modifiers = rewriteFlags(current.modifiers, REROLL_SLOT_FLAGS, 'kept');
    result.push(current);
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
    if (!canReroll(original, env.hasVersusDc)) {
      result.push(original);
      continue;
    }

    // Mutate flags in place — see `applyRecursiveReroll`.
    if (!matchesCondition(original.result, operator, value)) {
      original.modifiers = rewriteFlags(original.modifiers, REROLL_SLOT_FLAGS, 'kept');
      result.push(original);
      continue;
    }

    original.modifiers = rewriteFlags(original.modifiers, REROLL_SLOT_FLAGS, 'rerolled', 'dropped');
    result.push(original);

    const replacement = rollReplacement(original.sides, rng, env);
    replacement.modifiers = rewriteFlags(replacement.modifiers, REROLL_SLOT_FLAGS, 'kept');
    result.push(replacement);
  }

  return result;
}
