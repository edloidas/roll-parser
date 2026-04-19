/**
 * Shared comparison helper for dice-pool modifiers.
 *
 * Both reroll and success-counting modifiers compare a die result against a
 * fixed threshold. Extracting the comparison keeps those modules free of
 * duplicated logic.
 *
 * @module evaluator/modifiers/compare
 */

import type { CompareOp } from '../../types';

/**
 * Compares a die result against a fixed comparison threshold.
 */
export function matchesCondition(result: number, operator: CompareOp, value: number): boolean {
  switch (operator) {
    case '>':
      return result > value;
    case '>=':
      return result >= value;
    case '<':
      return result < value;
    case '<=':
      return result <= value;
    case '=':
      return result === value;
  }
}
