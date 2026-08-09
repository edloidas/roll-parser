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
 * ! inside a per-die loop it cost 11-38% on notation that cannot carry the
 * ! tag; the flag is `false` until a `vs` has actually tagged something.
 */
export function isVersusDc(die: DieResult): boolean {
  return die.modifiers.includes('dc');
}

/** Kept/dropped selection flags — rebuilt by every keep/drop pass. */
export const SELECTION_FLAGS: readonly DieModifier[] = ['kept', 'dropped'];

/**
 * Success-count tally flags — rebuilt by every counting pass. A group lets a
 * second count reach a pool the first one already tagged (`{4d6>=5}<=2f5`);
 * stripping these first is what keeps the outermost count the only one the
 * tags describe.
 */
export const TALLY_FLAGS: readonly DieModifier[] = ['success', 'failure'];

/**
 * Selection flags plus the success-count tally flags. Stripped when a die
 * leaves the pool that tagged it (meta sub-expressions, dropped group
 * sub-rolls) so the top-level successes/failures scan cannot count it.
 */
export const SELECTION_AND_TALLY_FLAGS: readonly DieModifier[] = [
  ...SELECTION_FLAGS,
  ...TALLY_FLAGS,
];

/**
 * {@link SELECTION_AND_TALLY_FLAGS} plus `'meta'`, for a meta context merging
 * into a parent. Meta operands nest (`((1d2)d4)d6`), so a die passes through
 * the merge once per level and the tag must be rebuilt, not appended.
 */
export const META_MERGE_FLAGS: readonly DieModifier[] = [...SELECTION_AND_TALLY_FLAGS, 'meta'];

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
