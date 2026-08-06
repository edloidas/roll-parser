/**
 * Shared slot-flag rewriting for `DieResult.modifiers`.
 *
 * "Slot" flags (`kept` / `dropped` / `rerolled`) and tally flags
 * (`success` / `failure`) are owned by whichever pass is currently deciding a
 * die's fate, so each pass rebuilds them rather than appending. Every rewrite
 * site strips its own exclusion list and appends its own markers — the lists
 * differ, the mechanics do not.
 *
 * @module evaluator/modifiers/flags
 */

import type { DieModifier, DieResult } from '../../types.js';

/**
 * True when a die belongs to the DC side of a `vs` comparison.
 *
 * DC dice share the roll side's `rolls` array so they still render
 * (`1d20[3] vs 2d10[5, 6]`), but they are not part of the pool a modifier
 * operates on. Nothing may sum, select, clamp, reroll, explode, or tally them
 * — a `d10` on the DC side must never come back clamped to 20, and
 * `{1d20 vs 2d10, 1d4}>=5` must not count the DC faces as successes.
 *
 * ! Call this behind the shared `hasVersusDc` env flag, never bare. Unguarded
 * ! inside a per-die loop it cost 11-38% on notation that cannot carry the tag
 * ! (#281); the flag is `false` until a `vs` has actually tagged something.
 */
export function isVersusDc(die: DieResult): boolean {
  return die.modifiers.includes('dc');
}

/** Kept/dropped selection flags — rebuilt by every keep/drop pass. */
export const SELECTION_FLAGS: readonly DieModifier[] = ['kept', 'dropped'];

/**
 * Selection flags plus the success-count tally flags. Stripped when a die
 * leaves the pool that tagged it (meta sub-expressions, dropped group
 * sub-rolls) so the top-level successes/failures scan cannot count it.
 */
export const SELECTION_AND_TALLY_FLAGS: readonly DieModifier[] = [
  'kept',
  'dropped',
  'success',
  'failure',
];

/** Selection flags plus `rerolled` — reassigned on every reroll pass. */
export const REROLL_SLOT_FLAGS: readonly DieModifier[] = ['kept', 'dropped', 'rerolled'];

/** Returns `modifiers` with every flag in `excluded` removed. */
export function stripFlags(
  modifiers: readonly DieModifier[],
  excluded: readonly DieModifier[],
): DieModifier[] {
  return modifiers.filter((modifier) => !excluded.includes(modifier));
}

/** Returns `modifiers` with `excluded` removed and `added` appended, in order. */
export function rewriteFlags(
  modifiers: readonly DieModifier[],
  excluded: readonly DieModifier[],
  ...added: DieModifier[]
): DieModifier[] {
  return [...stripFlags(modifiers, excluded), ...added];
}
