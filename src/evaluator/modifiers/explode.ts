/**
 * Exploding dice modifier implementations.
 *
 * Standard (`!`): re-roll on match, append each new die to the pool.
 * Compound (`!!`): re-roll on match, accumulate into the original die's `result`.
 * Penetrating (`!p`): re-roll on match, append with `result = rawRoll - 1`.
 *
 * @module evaluator/modifiers/explode
 */

import type { RNG } from '../../rng/types';
import type { CompareOp } from '../../types';
import type { DieResult } from '../../types';
import { EvaluatorError, type EvalEnv } from '../evaluator';

/** Default maximum explosion iterations per die. */
export const DEFAULT_MAX_EXPLODE_ITERATIONS = 1_000;

/**
 * Predicate deciding whether a die with the given latest raw roll continues
 * to explode. `sides` is passed separately because the default predicate
 * ("explode on max face") uses `result === sides`.
 */
export type ShouldExplode = (rawResult: number, sides: number) => boolean;

/**
 * Builds an explosion predicate from an optional ComparePoint. When no
 * threshold is given, explode when the raw result equals the die's max face.
 */
export function buildShouldExplode(
  operator: CompareOp | undefined,
  thresholdValue: number | undefined,
): ShouldExplode {
  if (operator == null || thresholdValue == null) {
    return (result, sides) => result === sides;
  }
  switch (operator) {
    case '>':
      return (result) => result > thresholdValue;
    case '>=':
      return (result) => result >= thresholdValue;
    case '<':
      return (result) => result < thresholdValue;
    case '<=':
      return (result) => result <= thresholdValue;
    case '=':
      return (result) => result === thresholdValue;
  }
}

/**
 * Rolls one explosion die, charging it against the global dice limit.
 */
function rollExplosion(sides: number, rng: RNG, env: EvalEnv): number {
  if (env.totalDiceRolled + 1 > env.maxDice) {
    throw new EvaluatorError(
      `Total dice count ${env.totalDiceRolled + 1} exceeds limit of ${env.maxDice}`,
      'DICE_LIMIT_EXCEEDED',
      'Explode',
    );
  }
  env.totalDiceRolled += 1;
  return rng.nextInt(1, sides);
}

function explodeLimitError(maxIterations: number): EvaluatorError {
  return new EvaluatorError(
    `Explode iteration limit of ${maxIterations} exceeded`,
    'EXPLODE_LIMIT_EXCEEDED',
    'Explode',
  );
}

/**
 * Returns true when the die is eligible to start exploding: it must not
 * already be dropped by a prior modifier, and its `sides` must be rollable.
 *
 * Fate dice (sides = 0) are skipped defensively — `rng.nextInt(1, 0)` is
 * invalid. Fate + explode is out of scope for the current feature set.
 */
function canExplode(die: DieResult): boolean {
  if (die.modifiers.includes('dropped')) return false;
  if (die.sides < 1) return false;
  return true;
}

/**
 * Standard explode: append each new die to the pool. The original die keeps
 * its modifiers untouched; new dice carry `['exploded', 'kept']`.
 */
export function applyStandardExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  const result: DieResult[] = [];

  for (const original of pool) {
    result.push(original);
    if (!canExplode(original)) continue;

    const sides = original.sides;
    let last = original.result;
    let iterations = 0;

    while (shouldExplode(last, sides)) {
      if (iterations >= env.maxExplodeIterations) {
        throw explodeLimitError(env.maxExplodeIterations);
      }
      const next = rollExplosion(sides, rng, env);
      result.push({
        sides,
        result: next,
        modifiers: ['exploded', 'kept'],
        critical: next === sides && sides > 1,
        fumble: next === 1,
      });
      last = next;
      iterations += 1;
    }
  }

  return result;
}

/**
 * Compound explode: pool length stays the same. Each original die's `result`
 * accumulates every explosion roll, and gains the `'exploded'` modifier once
 * it actually exploded at least once.
 */
export function applyCompoundExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  return pool.map((original) => {
    if (!canExplode(original)) return original;

    const sides = original.sides;
    let accumulated = original.result;
    let last = original.result;
    let iterations = 0;
    let exploded = false;

    while (shouldExplode(last, sides)) {
      if (iterations >= env.maxExplodeIterations) {
        throw explodeLimitError(env.maxExplodeIterations);
      }
      const next = rollExplosion(sides, rng, env);
      accumulated += next;
      last = next;
      exploded = true;
      iterations += 1;
    }

    if (!exploded) return original;

    return {
      sides,
      result: accumulated,
      initialResult: original.result,
      modifiers: original.modifiers.includes('exploded')
        ? original.modifiers
        : [...original.modifiers, 'exploded'],
      // ? `critical` and `fumble` refer to the original triggering roll, but
      //   after compounding the `result` is a sum. Mark critical if the
      //   original roll was max; fumble stays as-is (can't accumulate down).
      critical: original.critical,
      fumble: original.fumble,
    };
  });
}

/**
 * Penetrating explode: like standard, but each appended die stores
 * `result = rawRoll - 1`. The explosion predicate runs on the RAW roll
 * (pre-decrement), matching rpg-dice-roller convention.
 */
export function applyPenetratingExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  const result: DieResult[] = [];

  for (const original of pool) {
    result.push(original);
    if (!canExplode(original)) continue;

    const sides = original.sides;
    let lastRaw = original.result;
    let iterations = 0;

    while (shouldExplode(lastRaw, sides)) {
      if (iterations >= env.maxExplodeIterations) {
        throw explodeLimitError(env.maxExplodeIterations);
      }
      const raw = rollExplosion(sides, rng, env);
      const stored = raw - 1;
      result.push({
        sides,
        result: stored,
        modifiers: ['exploded', 'kept'],
        critical: raw === sides && sides > 1,
        fumble: raw === 1,
      });
      lastRaw = raw;
      iterations += 1;
    }
  }

  return result;
}
