/**
 * Sort modifier implementation.
 *
 * Sort is purely cosmetic — it reorders the dice produced by its target in
 * ascending or descending order of `result` without touching any flag
 * (`kept`, `dropped`, `critical`, `fumble`, `rerolled`, `meta`) or the total.
 * Dropped dice stay in the pool and sort alongside kept dice so readers can
 * see where the dropped value landed in the ordered sequence.
 *
 * @module evaluator/modifiers/sort
 */

import type { DieResult } from '../../types';

/**
 * Returns a sorted copy of `dice` in the given order, preserving every die's
 * original flags and metadata. Comparison is on `.result` — the raw face
 * value is what the user sees in rendered output, so ordering by raw value
 * matches the visual intent regardless of any `kept`/`dropped` flagging.
 *
 * Relies on `Array.prototype.sort` being stable — equal-valued dice retain
 * their original insertion order.
 */
export function sortDice(dice: DieResult[], order: 'ascending' | 'descending'): DieResult[] {
  const cmp =
    order === 'ascending'
      ? (a: DieResult, b: DieResult) => a.result - b.result
      : (a: DieResult, b: DieResult) => b.result - a.result;
  return [...dice].sort(cmp);
}
