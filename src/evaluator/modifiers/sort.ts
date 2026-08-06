/**
 * Sort modifier implementation.
 *
 * Sort is purely cosmetic — it reorders the dice produced by its target in
 * ascending or descending order of `result` without touching any flag
 * (`kept`, `dropped`, `critical`, `fumble`, `rerolled`, `meta`) or the total.
 * Dropped dice stay in the pool and sort alongside kept dice so readers can
 * see where the dropped value landed in the ordered sequence.
 *
 * DC dice are the exception: they hold their positions rather than sorting,
 * so a `vs` comparison's DC faces never appear shuffled into the roll-side
 * pool they are not a member of.
 *
 * @module evaluator/modifiers/sort
 */

import type { DieResult } from '../../types.js';
import { isVersusDc } from './flags.js';

/**
 * Returns a sorted copy of `dice` in the given order, preserving every die's
 * original flags and metadata. Comparison is on `.result` — the raw face
 * value is what the user sees in rendered output, so ordering by raw value
 * matches the visual intent regardless of any `kept`/`dropped` flagging.
 *
 * Relies on `Array.prototype.sort` being stable — equal-valued dice retain
 * their original insertion order.
 */
export function sortDice(
  dice: DieResult[],
  order: 'ascending' | 'descending',
  hasVersusDc: boolean,
): DieResult[] {
  const cmp =
    order === 'ascending'
      ? (a: DieResult, b: DieResult) => a.result - b.result
      : (a: DieResult, b: DieResult) => b.result - a.result;

  // Scan before allocating: the `filter` this replaced built a throwaway array
  // on every sort to serve a case only a `vs` can produce (#281).
  if (!hasVersusDc || !dice.some(isVersusDc)) return [...dice].sort(cmp);

  // Sort only the pool members, then lay them back into the slots they came
  // from, leaving every DC die exactly where it was.
  const sortable = dice.filter((die) => !isVersusDc(die));
  sortable.sort(cmp);
  let next = 0;
  return dice.map((die) => (isVersusDc(die) ? die : (sortable[next++] as DieResult)));
}
