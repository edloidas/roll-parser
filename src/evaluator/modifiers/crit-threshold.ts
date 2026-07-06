/**
 * Critical / fumble threshold modifier.
 *
 * Overrides the default `critical`/`fumble` flag logic for a dice pool.
 * `cs` and `cf` are independent (Roll20 semantics): the evaluator passes
 * `['default']` for a side with no explicit thresholds, so overriding one
 * side never wipes the other. An empty threshold array (not produced by the
 * evaluator) would force the corresponding flag to `false` on every die.
 * Meta dice (rolled to compute counts/sides/modifier args) are skipped so
 * their bookkeeping stays untouched.
 *
 * Display-only: does not alter `total`, explosion triggers, success
 * counting, or any other modifier flag. Dropped dice still participate —
 * their `critical`/`fumble` metadata reflects what they rolled, not
 * whether they contributed to the total.
 *
 * @module evaluator/modifiers/crit-threshold
 */

import type { DieResult, ResolvedCritThreshold } from '../../types.js';
import { matchesCondition } from './compare.js';

// ? Re-exported for existing importers — the definition moved to types.ts so
//   the public RollPart union can reference it without a circular import.
export type { ResolvedCritThreshold } from '../../types.js';

/**
 * Applies success/fail threshold arrays to a dice pool, overriding each
 * die's `critical` and `fumble` flags in place. A die matches `'default'`
 * on the success side when `result === sides && sides > 1`, and on the
 * fail side when `result === 1`. Meta dice are skipped.
 */
export function applyCritThresholds(
  dice: DieResult[],
  successThresholds: ResolvedCritThreshold[],
  failThresholds: ResolvedCritThreshold[],
): void {
  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;

    die.critical = successThresholds.some((t) => matchesCrit(t, die));
    die.fumble = failThresholds.some((t) => matchesFumble(t, die));
  }
}

function matchesCrit(threshold: ResolvedCritThreshold, die: DieResult): boolean {
  if (threshold === 'default') {
    return die.result === die.sides && die.sides > 1;
  }
  return matchesCondition(die.result, threshold.operator, threshold.value);
}

function matchesFumble(threshold: ResolvedCritThreshold, die: DieResult): boolean {
  if (threshold === 'default') {
    // ? Mirrors `createDieResult` — a d1 always rolls 1, never a fumble.
    return die.result === 1 && die.sides > 1;
  }
  return matchesCondition(die.result, threshold.operator, threshold.value);
}
