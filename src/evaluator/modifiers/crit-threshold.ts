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
 * The two threshold kinds deliberately read different values. `'default'`
 * reads `initialResult ?? result`, the same source as the versus `natural`,
 * so "rolled the maximum face" survives the two modifiers that overwrite
 * `result` while recording the face they replaced — compound explode and
 * `minN`/`maxN`. An explicit threshold (`cs>4`, `cf<=2`) reads the die's
 * current `result`: it is a predicate over the die's value, and postfix
 * modifiers are order-sensitive by design, so `4d6min5cs>4` is meant to
 * see the clamped faces. The two can therefore disagree on one die —
 * `4d6min5cs>4` flags a clamped natural 1 as both critical and fumble.
 *
 * ! Penetrating explode is not covered: it stores `raw - 1` in `result`
 * ! without recording `initialResult`, so `1d6!pcs` still judges a natural
 * ! 6 by its decremented 5.
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
import { isVersusDc } from './flags.js';

/**
 * Applies success/fail threshold arrays to a dice pool, overriding each
 * die's `critical` and `fumble` flags in place. Writing `natural` for
 * `initialResult ?? result`, a die matches `'default'` on the success side
 * when `natural === sides && sides > 1`, and on the fail side when
 * `natural === 1 && sides > 1`. Meta dice are skipped.
 */
export function applyCritThresholds(
  dice: DieResult[],
  successThresholds: ResolvedCritThreshold[],
  failThresholds: ResolvedCritThreshold[],
  hasVersusDc: boolean,
): void {
  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;
    if (hasVersusDc && isVersusDc(die)) continue;

    die.critical = successThresholds.some((t) => matchesCrit(t, die));
    die.fumble = failThresholds.some((t) => matchesFumble(t, die));
  }
}

function matchesCrit(threshold: ResolvedCritThreshold, die: DieResult): boolean {
  if (threshold === 'default') {
    return (die.initialResult ?? die.result) === die.sides && die.sides > 1;
  }
  return matchesCondition(die.result, threshold.operator, threshold.value);
}

function matchesFumble(threshold: ResolvedCritThreshold, die: DieResult): boolean {
  if (threshold === 'default') {
    // Mirrors `createDieResult` — a d1 always rolls 1, never a fumble.
    return (die.initialResult ?? die.result) === 1 && die.sides > 1;
  }
  return matchesCondition(die.result, threshold.operator, threshold.value);
}
