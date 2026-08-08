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
 * flags — mirrors the mutation pattern of explode and reroll modifiers. Each
 * tag is written at most once per die: a group counted after its members
 * (`{4d6>=5}>=1`) runs this pass twice over the same dice, and the parse-time
 * reject that blocks a direct `4d6>=5>=4` does not reach through a group.
 *
 * @module evaluator/modifiers/success-count
 */

import type { DieResult, ResolvedComparePoint } from '../../types.js';
import { matchesCondition } from './compare.js';
import { isVersusDc } from './flags.js';

export type SuccessCountResult = {
  total: number;
  successes: number;
  failures: number;
};

export function countSuccesses(
  dice: DieResult[],
  threshold: ResolvedComparePoint,
  failThreshold: ResolvedComparePoint | undefined,
  hasVersusDc: boolean,
): SuccessCountResult {
  let successes = 0;
  let failures = 0;

  // ! Excluded up front, never inside the loop below. Even short-circuited on a
  // ! false flag, a `hasVersusDc && isVersusDc(die)` guard in this loop costs
  // ! ~9% on `10d10>=6f1` — measured, not assumed (#281). Filtering keeps the
  // ! hot body identical to the pre-exclusion one and pays an allocation only
  // ! on the `vs` path. The dice are the same objects either way, so the
  // ! `'success'` / `'failure'` tags written below still land on the pool.
  const pool = hasVersusDc ? dice.filter((die) => !isVersusDc(die)) : dice;

  // ! The guards below only stop the *same* tag being written twice. A nested
  // ! count with a different threshold still appends to the first pass's tags,
  // ! so a die can end up both `'success'` and `'failure'`, and the returned
  // ! counts then disagree with the tags in `rolls`.
  for (const die of pool) {
    if (die.modifiers.includes('dropped')) continue;

    if (matchesCondition(die.result, threshold.operator, threshold.value)) {
      if (!die.modifiers.includes('success')) die.modifiers.push('success');
      successes += 1;
      continue;
    }

    if (
      failThreshold != null &&
      matchesCondition(die.result, failThreshold.operator, failThreshold.value)
    ) {
      if (!die.modifiers.includes('failure')) die.modifiers.push('failure');
      failures += 1;
    }
  }

  return { total: successes - failures, successes, failures };
}
