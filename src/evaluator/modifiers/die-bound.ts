/**
 * Per-die clamp modifier (`minN` / `maxN`).
 *
 * Rewrites each die's `result` toward the bound: `min` raises results below
 * the bound, `max` lowers results above it. The raw face is preserved in
 * `initialResult` (first writer wins, so a compound-explode accumulation
 * that was clamped afterwards still reports its original first roll), and
 * the die is tagged `'min'` / `'max'` so parts consumers can tell a clamped
 * value from a natural one.
 *
 * `critical` / `fumble` keep reflecting the natural face — a clamped 1 is
 * still a fumble, matching the raw-face crit semantics used everywhere else.
 * Meta dice (rolled to compute counts/sides/modifier args) are skipped.
 * Dropped dice are clamped too — they are excluded from totals anyway, and
 * clamping them keeps the rendered pool consistent.
 *
 * @module evaluator/modifiers/die-bound
 */

import type { DieResult } from '../../types.js';

/**
 * Clamps every non-meta die in `dice` against `value`, in place.
 * `bound: 'min'` lifts lower results up to `value`; `'max'` caps higher
 * results down to it. Untouched dice keep their tags.
 */
export function applyDieBound(dice: DieResult[], bound: 'min' | 'max', value: number): void {
  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;

    const clamped = bound === 'min' ? Math.max(die.result, value) : Math.min(die.result, value);
    if (clamped === die.result) continue;

    die.initialResult ??= die.result;
    die.result = clamped;
    die.modifiers.push(bound);
  }
}
