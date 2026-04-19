/**
 * Success counting modifier.
 *
 * Transforms a dice pool into a signed success count: each die matching the
 * success `threshold` contributes +1, each die matching the optional
 * `failThreshold` contributes -1. When a single die matches both thresholds,
 * success wins (checked first).
 *
 * Dropped dice (from a preceding keep/drop or intermediate reroll) are
 * excluded from counting and are never tagged.
 *
 * Mutates the input pool in place to add `'success'` / `'failure'` modifier
 * flags — mirrors the mutation pattern of explode and reroll modifiers.
 *
 * @module evaluator/modifiers/success-count
 */

import type { CompareOp, DieResult } from '../../types';
import { matchesCondition } from './compare';

export type ResolvedThreshold = {
  operator: CompareOp;
  value: number;
};

export type SuccessCountResult = {
  total: number;
  successes: number;
  failures: number;
};

export function countSuccesses(
  dice: DieResult[],
  threshold: ResolvedThreshold,
  failThreshold?: ResolvedThreshold,
): SuccessCountResult {
  let successes = 0;
  let failures = 0;

  for (const die of dice) {
    if (die.modifiers.includes('dropped')) continue;

    if (matchesCondition(die.result, threshold.operator, threshold.value)) {
      die.modifiers.push('success');
      successes += 1;
      continue;
    }

    if (
      failThreshold != null &&
      matchesCondition(die.result, failThreshold.operator, failThreshold.value)
    ) {
      die.modifiers.push('failure');
      failures += 1;
    }
  }

  return { total: successes - failures, successes, failures };
}
