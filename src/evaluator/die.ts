/**
 * Die-result construction shared by the evaluator and the modifier
 * implementations.
 *
 * Lives in its own module so the crit/fumble rule has exactly one definition —
 * pool rolling (`evaluator.ts`), explosion continuation dice (`modifiers/
 * explode.ts`), and reroll replacements (`modifiers/reroll.ts`) all build dice
 * through here.
 *
 * @module evaluator/die
 */

import type { DieModifier, DieResult } from '../types.js';

/**
 * Creates a die result with critical/fumble detection.
 *
 * `modifiers` is taken by the caller because the flags depend on how the die
 * entered the pool (a fresh pool die starts bare, an explosion continuation
 * die starts `['exploded', 'kept']`).
 */
export function createDieResult(
  sides: number,
  result: number,
  modifiers: DieModifier[],
): DieResult {
  // ? `sides > 1` guards both flags — a d1 always rolls 1, so it is neither
  //   an exceptional max (critical) nor an exceptional min (fumble).
  return {
    sides,
    result,
    modifiers,
    critical: result === sides && sides > 1,
    fumble: result === 1 && sides > 1,
  };
}

/**
 * Creates a Fate/Fudge die result. Uses `sides = 0` as a sentinel — Fate dice
 * have no max-face concept, so `critical` and `fumble` are always `false`.
 */
export function createFateDieResult(result: number, modifiers: DieModifier[]): DieResult {
  return {
    sides: 0,
    result,
    modifiers,
    critical: false,
    fumble: false,
  };
}
