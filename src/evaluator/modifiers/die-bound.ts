/**
 * Per-die clamp modifier (`minN` / `maxN`).
 *
 * Rewrites each die's `result` toward the bound: `min` raises results below
 * the bound, `max` lowers results above it. The raw face is preserved in
 * `initialResult` (first writer wins, so a compound-explode accumulation
 * that was clamped afterwards still reports its original first roll), and
 * the die is tagged `'min'` / `'max'` so parts consumers can tell a clamped
 * value from a natural one. The tag is written at most once, so a chain of
 * same-kind bounds (`4d6min3min4`) leaves a die carrying a single `'min'`.
 *
 * `critical` / `fumble` keep reflecting the natural face — a clamped 1 is
 * still a fumble, matching the raw-face crit semantics used everywhere else.
 * A following bare `cs`/`cf` agrees; a following *explicit* threshold
 * (`4d6min5cs>4`) is a predicate over the clamped value and overrides it.
 * Meta dice (rolled to compute counts/sides/modifier args) are skipped.
 * Dropped dice are clamped too — they are excluded from totals anyway, and
 * clamping them keeps the rendered pool consistent.
 *
 * @module evaluator/modifiers/die-bound
 */

import type { DieResult } from '../../types.js';
import { isVersusDc } from './flags.js';

/**
 * Clamps every non-meta die in `dice` against `value`, in place.
 * `bound: 'min'` lifts lower results up to `value`; `'max'` caps higher
 * results down to it. Untouched dice keep their tags.
 */
export function applyDieBound(
  dice: DieResult[],
  bound: 'min' | 'max',
  value: number,
  hasVersusDc: boolean,
): void {
  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;
    if (hasVersusDc && isVersusDc(die)) continue;

    const clamped = bound === 'min' ? Math.max(die.result, value) : Math.min(die.result, value);
    if (clamped === die.result) continue;

    die.initialResult ??= die.result;
    die.result = clamped;
    if (!die.modifiers.includes(bound)) die.modifiers.push(bound);
  }
}
