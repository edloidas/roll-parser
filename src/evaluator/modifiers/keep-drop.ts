/**
 * Keep/drop modifier implementations for dice pools.
 *
 * @module evaluator/modifiers/keep-drop
 */

import type { DieResult, KeepDropSpec } from '../../types.js';
import { isVersusDc } from './flags.js';

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
  kind: KeepDropSpec['kind'],
  selector: KeepDropSpec['selector'],
  droppedMask: Uint8Array,
  hasVersusDc: boolean,
): void {
  if (count === 1) {
    markSingleExtreme(dice, kind, selector, droppedMask, hasVersusDc);
    return;
  }

  const eligible: EligibleDie[] = [];

  for (let index = 0; index < dice.length; index++) {
    const die = dice[index];
    if (die == null) continue;
    if (hasVersusDc && isVersusDc(die)) continue;

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

  // Stable sort — ties resolve by original pool order.
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
 * `count === 1` fast path: a single linear scan replaces the wrapper array
 * and comparator sort — `2d20kh1` (advantage) and `4d6dl1` are the most
 * common notations. Strict comparison preserves the stable sort's
 * first-occurrence tie-break, and bits are only ever set, never cleared, so
 * a shared mask keeps every previous spec's drops.
 */
function markSingleExtreme(
  dice: DieResult[],
  kind: KeepDropSpec['kind'],
  selector: KeepDropSpec['selector'],
  droppedMask: Uint8Array,
  hasVersusDc: boolean,
): void {
  const isKeep = kind === 'keep';
  const wantHighest = selector === 'highest';

  let extremeIndex = -1;
  let extremeResult = 0;

  for (let index = 0; index < dice.length; index++) {
    const die = dice[index];
    if (die == null) continue;
    if (hasVersusDc && isVersusDc(die)) continue;

    if (die.modifiers.includes('dropped')) {
      droppedMask[index] = 1;
      continue;
    }

    const { result } = die;

    if (extremeIndex === -1) {
      extremeIndex = index;
      extremeResult = result;
      continue;
    }

    if (wantHighest ? result > extremeResult : result < extremeResult) {
      // A keep drops the dethroned extreme; a drop keeps everything else.
      if (isKeep) droppedMask[extremeIndex] = 1;
      extremeIndex = index;
      extremeResult = result;
    } else if (isKeep) {
      droppedMask[index] = 1;
    }
  }

  // Keeping 1 of ≤1 eligible dice drops nothing; dropping 1 of ≥1 drops the
  // extreme — both match the general path's whole-pool guards.
  if (!isKeep && extremeIndex !== -1) droppedMask[extremeIndex] = 1;
}

/**
 * Sums the dice a keep/drop pass left standing.
 *
 * @param hasVersusDc - Shared env flag; skips the DC exclusion when no `vs` has
 *   tagged anything
 */
export function sumKeptDice(dice: DieResult[], hasVersusDc: boolean): number {
  let total = 0;

  for (const die of dice) {
    if (hasVersusDc && isVersusDc(die)) continue;
    if (!die.modifiers.includes('dropped')) total += die.result;
  }

  return total;
}
