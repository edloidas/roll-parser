/**
 * Keep/drop modifier implementations for dice pools.
 *
 * @module evaluator/modifiers/keep-drop
 */

import type { DieResult, ModifierSpec } from '../../types.js';

/** One selectable die: its rolled value and its slot in the original pool. */
type EligibleDie = { result: number; index: number };

/**
 * Records into `droppedMask` every pool slot that `kind` / `selector` /
 * `count` drops.
 *
 * Nothing is cloned and no flag is written. The caller owns the merge, so a
 * chain like `4d6kh3dl1` runs one pass per spec over the same mask and then
 * rewrites each die's slot flags exactly once — where the previous
 * clone-per-spec appliers rebuilt the whole pool for every spec only to have
 * their flags read back and discarded.
 *
 * Dice already carrying `'dropped'` (reroll intermediates, meta dice, a
 * preceding chain's losers) are ineligible for selection and stay dropped.
 */
export function markDroppedIndices(
  dice: DieResult[],
  count: number,
  kind: ModifierSpec['kind'],
  selector: ModifierSpec['selector'],
  droppedMask: Uint8Array,
): void {
  const eligible: EligibleDie[] = [];

  for (let index = 0; index < dice.length; index++) {
    const die = dice[index];
    if (die == null) continue;

    if (die.modifiers.includes('dropped')) {
      droppedMask[index] = 1;
      continue;
    }

    eligible.push({ result: die.result, index });
  }

  const isKeep = kind === 'keep';

  // Keep-everything: a keep covering the whole eligible pool, or a zero drop.
  if (isKeep ? count >= eligible.length : count <= 0) return;

  // Drop-everything: a zero keep, or a drop covering the whole eligible pool.
  if (isKeep ? count <= 0 : count >= eligible.length) {
    for (const item of eligible) {
      droppedMask[item.index] = 1;
    }
    return;
  }

  // Stable sort — ties resolve by original pool order, matching the
  // `slice(0, count)` selection this replaced.
  eligible.sort(
    selector === 'highest' ? (a, b) => b.result - a.result : (a, b) => a.result - b.result,
  );

  // The sort puts the acted-on dice first: `keep` drops everything past
  // `count`, `drop` drops the selection itself.
  const start = isKeep ? count : 0;
  const end = isKeep ? eligible.length : count;

  for (let i = start; i < end; i++) {
    const item = eligible[i];
    if (item != null) droppedMask[item.index] = 1;
  }
}

/**
 * Calculates total from dice, excluding dropped dice.
 *
 * @param dice - Array of die results
 * @returns Sum of non-dropped dice
 */
export function sumKeptDice(dice: DieResult[]): number {
  let total = 0;

  for (const die of dice) {
    if (!die.modifiers.includes('dropped')) total += die.result;
  }

  return total;
}
