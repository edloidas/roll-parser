/**
 * Keep/drop modifier implementations for dice pools.
 *
 * @module evaluator/modifiers/keep-drop
 */

import type { DieResult, ModifierSpec } from '../../types.js';
import { rewriteFlags, SELECTION_FLAGS } from './flags.js';

/**
 * Marks all eligible dice as `'kept'`. Dice that already carry `'dropped'`
 * (e.g., intermediate rerolls, or the loser of a prior modifier) are left
 * untouched so those drops cannot be silently revived.
 */
export function markAllKept(dice: DieResult[]): DieResult[] {
  return dice.map((die) => {
    if (die.modifiers.includes('dropped')) return die;
    return {
      ...die,
      modifiers: die.modifiers.includes('kept') ? die.modifiers : [...die.modifiers, 'kept'],
    };
  });
}

/**
 * Returns indexed dice that are eligible for keep/drop selection — dice that
 * have not already been dropped by a preceding modifier (e.g. reroll's
 * intermediate dice carry `'dropped'` and must be ignored here).
 */
function eligibleIndexed(dice: DieResult[]): { die: DieResult; index: number }[] {
  return dice
    .map((die, index) => ({ die, index }))
    .filter(({ die }) => !die.modifiers.includes('dropped'));
}

/**
 * Rebuilds a die's slot flags (`kept` / `dropped`) from the selection set.
 * Pre-dropped dice are returned unchanged so their state is preserved.
 */
function applySelection(
  dice: DieResult[],
  selectionIndices: Set<number>,
  selectionMarker: 'kept' | 'dropped',
): DieResult[] {
  const otherMarker = selectionMarker === 'kept' ? 'dropped' : 'kept';

  return dice.map((die, index) => {
    if (die.modifiers.includes('dropped')) return die;

    const isSelected = selectionIndices.has(index);
    const marker = isSelected ? selectionMarker : otherMarker;

    return {
      ...die,
      modifiers: rewriteFlags(die.modifiers, SELECTION_FLAGS, marker),
    };
  });
}

/**
 * Drops every non-already-dropped die. Used by keep-N when N <= 0 and by
 * drop-N when N >= eligible.length.
 */
function markAllDropped(dice: DieResult[]): DieResult[] {
  return dice.map((die) => {
    if (die.modifiers.includes('dropped')) return die;
    return {
      ...die,
      modifiers: [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
    };
  });
}

/**
 * Shared keep/drop selection. `count` names how many dice the modifier acts
 * on: the N kept for `keep`, the N dropped for `drop`.
 *
 * Both degenerate cases are checked in the order each variant used to check
 * them — keep-all first for `keep` (`count >= eligible`), keep-all first for
 * `drop` too (`count <= 0`) — so a zero-eligible pool resolves identically
 * either way.
 */
function applyKeepDrop(
  dice: DieResult[],
  count: number,
  kind: ModifierSpec['kind'],
  selector: ModifierSpec['selector'],
): DieResult[] {
  const eligible = eligibleIndexed(dice);
  const isKeep = kind === 'keep';

  if (isKeep ? count >= eligible.length : count <= 0) return markAllKept(dice);
  if (isKeep ? count <= 0 : count >= eligible.length) return markAllDropped(dice);

  const sorted =
    selector === 'highest'
      ? eligible.sort((a, b) => b.die.result - a.die.result)
      : eligible.sort((a, b) => a.die.result - b.die.result);
  const selectedIndices = new Set(sorted.slice(0, count).map((item) => item.index));

  return applySelection(dice, selectedIndices, isKeep ? 'kept' : 'dropped');
}

/**
 * Applies keep highest modifier - keeps the N highest eligible dice, marks
 * others as dropped. Dice already marked `'dropped'` are left unchanged.
 *
 * @param dice - Array of die results
 * @param count - Number of dice to keep
 * @returns New array with appropriate modifiers applied
 */
export function applyKeepHighest(dice: DieResult[], count: number): DieResult[] {
  return applyKeepDrop(dice, count, 'keep', 'highest');
}

/**
 * Applies keep lowest modifier - keeps the N lowest eligible dice, marks
 * others as dropped. Dice already marked `'dropped'` are left unchanged.
 */
export function applyKeepLowest(dice: DieResult[], count: number): DieResult[] {
  return applyKeepDrop(dice, count, 'keep', 'lowest');
}

/**
 * Applies drop highest modifier - drops the N highest eligible dice, keeps
 * the rest. Dice already marked `'dropped'` are left unchanged.
 */
export function applyDropHighest(dice: DieResult[], count: number): DieResult[] {
  return applyKeepDrop(dice, count, 'drop', 'highest');
}

/**
 * Applies drop lowest modifier - drops the N lowest eligible dice, keeps
 * the rest. Dice already marked `'dropped'` are left unchanged.
 */
export function applyDropLowest(dice: DieResult[], count: number): DieResult[] {
  return applyKeepDrop(dice, count, 'drop', 'lowest');
}

/**
 * Calculates total from dice, excluding dropped dice.
 *
 * @param dice - Array of die results
 * @returns Sum of non-dropped dice
 */
export function sumKeptDice(dice: DieResult[]): number {
  return dice
    .filter((die) => !die.modifiers.includes('dropped'))
    .reduce((sum, die) => sum + die.result, 0);
}
