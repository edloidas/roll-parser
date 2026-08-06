/**
 * Exploding dice modifier implementations.
 *
 * Standard (`!`): re-roll on match, append each new die to the pool.
 * Compound (`!!`): re-roll on match, accumulate into the original die's `result`.
 * Penetrating (`!p`): re-roll on match, append with `result = rawRoll - 1`.
 *
 * @module evaluator/modifiers/explode
 */

import { EvaluatorError } from '../../errors.js';
import type { RNG } from '../../rng/types.js';
import type { CompareOp, DieResult } from '../../types.js';
import { createDieResult } from '../die.js';
import { chargeDie, type EvalEnv } from '../env.js';
import { isVersusDc } from './flags.js';

/**
 * Default value of `EvaluationOptions.maxExplodeIterations`: how many times a
 * single die may explode before `EXPLODE_LIMIT_EXCEEDED` is thrown.
 *
 * Per die, not per pool — it bounds notations like `1d1!`, where the
 * explosion condition can never stop being true.
 *
 * @category Limits
 */
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
  chargeDie(env, 'Explode');
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
 * The `sides < 1` branch is a defense-in-depth fallback — Fate dice
 * (sides = 0) are rejected at parse time via `INVALID_EXPLODE_TARGET`
 * (see `parseExplode` in `src/parser/parser.ts`), so this guard should
 * never fire during normal flow. Keeping it ensures `rng.nextInt(1, 0)`
 * can never be reached if a future AST path slips past the parser gate.
 */
function canExplode(die: DieResult, hasVersusDc: boolean): boolean {
  if (hasVersusDc && isVersusDc(die)) return false;
  if (die.modifiers.includes('dropped')) return false;
  if (die.sides < 1) return false;
  return true;
}

/**
 * Shared implementation of the two appending explode variants. The explosion
 * predicate always runs on the RAW roll; `storeResult` maps that raw roll to
 * the value recorded on the appended die, which is the only thing standard
 * and penetrating explosions disagree about.
 *
 * `critical`/`fumble` are likewise derived from the raw roll — a penetrating
 * die that rolled its max face is still a crit even though it stores one less.
 */
function applyAppendingExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
  storeResult: (raw: number) => number,
): DieResult[] {
  const result: DieResult[] = [];

  for (const original of pool) {
    result.push(original);
    if (!canExplode(original, env.hasVersusDc)) continue;

    const sides = original.sides;
    let lastRaw = original.result;
    let iterations = 0;

    while (shouldExplode(lastRaw, sides)) {
      if (iterations >= env.maxExplodeIterations) {
        throw explodeLimitError(env.maxExplodeIterations);
      }
      const raw = rollExplosion(sides, rng, env);
      const die = createDieResult(sides, raw, ['exploded', 'kept']);
      die.result = storeResult(raw);
      result.push(die);
      lastRaw = raw;
      iterations += 1;
    }
  }

  return result;
}

/** Records the raw roll unchanged — standard explode. */
function keepRaw(raw: number): number {
  return raw;
}

/** Records one less than the raw roll — penetrating explode. */
function penetratingPenalty(raw: number): number {
  return raw - 1;
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
  return applyAppendingExplode(pool, shouldExplode, rng, env, keepRaw);
}

/**
 * Compound explode: pool length stays the same. Each original die's `result`
 * accumulates every explosion roll, and gains the `'exploded'` modifier once
 * it actually exploded at least once.
 *
 * Mutates exploded dice in place — the same `DieResult` objects are shared
 * between `RollResult.rolls` and the `RollPart` tree, and both must reflect
 * post-explosion state.
 */
export function applyCompoundExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  for (const original of pool) {
    if (!canExplode(original, env.hasVersusDc)) continue;

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

    if (!exploded) continue;

    // `critical` and `fumble` keep referring to the original triggering
    // roll — after compounding the `result` is a sum.
    original.initialResult = original.result;
    original.result = accumulated;
    if (!original.modifiers.includes('exploded')) {
      original.modifiers = [...original.modifiers, 'exploded'];
    }
  }

  return pool;
}

/**
 * Penetrating explode: like standard, but each appended die stores
 * `result = rawRoll - 1`. The explosion predicate runs on the RAW roll
 * (pre-decrement), so a max face still chains even though its stored value
 * is one lower.
 */
export function applyPenetratingExplode(
  pool: DieResult[],
  shouldExplode: ShouldExplode,
  rng: RNG,
  env: EvalEnv,
): DieResult[] {
  return applyAppendingExplode(pool, shouldExplode, rng, env, penetratingPenalty);
}
