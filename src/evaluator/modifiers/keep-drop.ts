/**
 * Keep/drop modifier implementations for dice pools.
 *
 * @module evaluator/modifiers/keep-drop
 */

import type { DieResult } from '../../types';

/**
 * Marks all dice as 'kept' initially (for dice without explicit modifiers).
 */
export function markAllKept(dice: DieResult[]): DieResult[] {
  return dice.map((die) => ({
    ...die,
    modifiers: die.modifiers.includes('kept') ? die.modifiers : [...die.modifiers, 'kept'],
  }));
}

/**
 * Applies keep highest modifier - keeps the N highest dice, marks others as dropped.
 *
 * @param dice - Array of die results
 * @param count - Number of dice to keep
 * @returns New array with appropriate modifiers applied
 */
export function applyKeepHighest(dice: DieResult[], count: number): DieResult[] {
  if (count >= dice.length) {
    return markAllKept(dice);
  }
  if (count <= 0) {
    return dice.map((die) => ({
      ...die,
      modifiers: [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
    }));
  }

  const indexed = dice.map((die, index) => ({ die, index }));
  indexed.sort((a, b) => b.die.result - a.die.result);

  const keptIndices = new Set(indexed.slice(0, count).map((item) => item.index));

  return dice.map((die, index) => ({
    ...die,
    modifiers: keptIndices.has(index)
      ? [...die.modifiers.filter((m) => m !== 'dropped'), 'kept']
      : [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
  }));
}

/**
 * Applies keep lowest modifier - keeps the N lowest dice, marks others as dropped.
 *
 * @param dice - Array of die results
 * @param count - Number of dice to keep
 * @returns New array with appropriate modifiers applied
 */
export function applyKeepLowest(dice: DieResult[], count: number): DieResult[] {
  if (count >= dice.length) {
    return markAllKept(dice);
  }
  if (count <= 0) {
    return dice.map((die) => ({
      ...die,
      modifiers: [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
    }));
  }

  const indexed = dice.map((die, index) => ({ die, index }));
  indexed.sort((a, b) => a.die.result - b.die.result);

  const keptIndices = new Set(indexed.slice(0, count).map((item) => item.index));

  return dice.map((die, index) => ({
    ...die,
    modifiers: keptIndices.has(index)
      ? [...die.modifiers.filter((m) => m !== 'dropped'), 'kept']
      : [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
  }));
}

/**
 * Applies drop highest modifier - drops the N highest dice, keeps others.
 *
 * @param dice - Array of die results
 * @param count - Number of dice to drop
 * @returns New array with appropriate modifiers applied
 */
export function applyDropHighest(dice: DieResult[], count: number): DieResult[] {
  if (count <= 0) {
    return markAllKept(dice);
  }
  if (count >= dice.length) {
    return dice.map((die) => ({
      ...die,
      modifiers: [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
    }));
  }

  const indexed = dice.map((die, index) => ({ die, index }));
  indexed.sort((a, b) => b.die.result - a.die.result);

  const droppedIndices = new Set(indexed.slice(0, count).map((item) => item.index));

  return dice.map((die, index) => ({
    ...die,
    modifiers: droppedIndices.has(index)
      ? [...die.modifiers.filter((m) => m !== 'kept'), 'dropped']
      : [...die.modifiers.filter((m) => m !== 'dropped'), 'kept'],
  }));
}

/**
 * Applies drop lowest modifier - drops the N lowest dice, keeps others.
 *
 * @param dice - Array of die results
 * @param count - Number of dice to drop
 * @returns New array with appropriate modifiers applied
 */
export function applyDropLowest(dice: DieResult[], count: number): DieResult[] {
  if (count <= 0) {
    return markAllKept(dice);
  }
  if (count >= dice.length) {
    return dice.map((die) => ({
      ...die,
      modifiers: [...die.modifiers.filter((m) => m !== 'kept'), 'dropped'],
    }));
  }

  const indexed = dice.map((die, index) => ({ die, index }));
  indexed.sort((a, b) => a.die.result - b.die.result);

  const droppedIndices = new Set(indexed.slice(0, count).map((item) => item.index));

  return dice.map((die, index) => ({
    ...die,
    modifiers: droppedIndices.has(index)
      ? [...die.modifiers.filter((m) => m !== 'kept'), 'dropped']
      : [...die.modifiers.filter((m) => m !== 'dropped'), 'kept'],
  }));
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
