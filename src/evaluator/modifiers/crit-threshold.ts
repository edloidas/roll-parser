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
 * so "rolled the maximum face" survives every modifier that overwrites
 * `result` while recording the face it replaced — compound explode,
 * penetrating explode, and `minN`/`maxN`. An explicit threshold (`cs>4`,
 * `cf<=2`) reads the die's current `result`: it is a predicate over the die's
 * value, and postfix modifiers are order-sensitive by design, so `4d6min5cs>4`
 * is meant to see the clamped faces. The two can therefore disagree on one
 * die — `4d6min5cs>4` flags a clamped natural 1 as both critical and fumble.
 *
 * They also diverge on Fate dice. `'default'` carries a `sides > 1` guard, so
 * it never fires on a `sides = 0` pool; an explicit threshold has none and
 * compares the raw {-1, 0, +1} face, so `4dFcs>0` and `4dFcf=-1` do set the
 * flags. The missing guard is deliberate — the parser rejects the bare
 * `cs`/`cf` forms instead, since they would resolve to `'default'` and
 * silently do nothing.
 *
 * The rule is recorded per die on `env.critRules`, so dice that explode and
 * reroll mint *after* the crit node has run inherit it from the die they
 * descended from. `cs`/`cf` therefore covers the whole pool wherever it sits
 * in the postfix chain — `1d6cs<2!` and `1d6!cs<2` agree. Two things stay
 * outside that: compound explode, which mints no die and so keeps the flags
 * its accumulated `result` had when the crit node ran, and `minN`/`maxN`,
 * which rewrites `result` under an explicit threshold's feet.
 *
 * Display-only: does not alter `total`, explosion triggers, success
 * counting, or any other modifier flag. Dropped dice still participate —
 * their `critical`/`fumble` metadata reflects what they rolled, not
 * whether they contributed to the total.
 *
 * @module evaluator/modifiers/crit-threshold
 */

import type { DieResult, ResolvedCritThreshold } from '../../types.js';
import type { CritRule, EvalEnv } from '../env.js';
import { matchesCondition } from './compare.js';
import { isVersusDc } from './flags.js';

/**
 * Applies success/fail threshold arrays to a dice pool, overriding each die's
 * `critical` and `fumble` flags in place. Meta and DC dice are skipped.
 *
 * Also records the rule against every die it touched, so later explode and
 * reroll dice can inherit it via {@link inheritCritRule}.
 */
export function applyCritThresholds(
  dice: DieResult[],
  successThresholds: ResolvedCritThreshold[],
  failThresholds: ResolvedCritThreshold[],
  env: EvalEnv,
): void {
  const rule: CritRule = { success: successThresholds, fail: failThresholds };
  env.critRules ??= new WeakMap();
  const rules = env.critRules;

  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;
    if (env.hasVersusDc && isVersusDc(die)) continue;

    applyCritRule(die, rule, die.initialResult ?? die.result);
    rules.set(die, rule);
  }
}

/**
 * Judges one die by a recorded rule, overwriting both flags. A side always
 * carries at least `'default'` — `evalCritThreshold` fills the side the user
 * left out — so neither flag is silently left untouched.
 */
function applyCritRule(die: DieResult, rule: CritRule, natural: number): void {
  die.critical = rule.success.some((t) => matchesThreshold(t, die, natural, die.sides));
  die.fumble = rule.fail.some((t) => matchesThreshold(t, die, natural, 1));
}

/**
 * Passes the crit rule recorded for `parent` down to a die minted from it,
 * judging the child by that rule and recording it so a further explode or
 * reroll inherits it in turn. No-op when no `cs`/`cf` governs `parent`, which
 * leaves the `createDieResult` default rule in place.
 *
 * ! Call this only once the child's final `result` and `initialResult` are
 * ! stored — an explicit threshold is a predicate over `result`, so a
 * ! penetrating die is judged by its decremented value, matching `1d6!pcs<2`.
 */
export function inheritCritRule(env: EvalEnv, parent: DieResult, child: DieResult): void {
  const rules = env.critRules;
  if (rules === undefined) return;

  const rule = rules.get(parent);
  if (rule === undefined) return;

  applyCritRule(child, rule, child.initialResult ?? child.result);
  rules.set(child, rule);
}

/**
 * `defaultFace` is the face the `'default'` sentinel looks for — `die.sides`
 * on the success side, `1` on the fail side. The `sides > 1` guard mirrors
 * `createDieResult`: a d1 always rolls 1, so it is neither.
 */
function matchesThreshold(
  threshold: ResolvedCritThreshold,
  die: DieResult,
  natural: number,
  defaultFace: number,
): boolean {
  if (threshold === 'default') {
    return natural === defaultFace && die.sides > 1;
  }
  return matchesCondition(die.result, threshold.operator, threshold.value);
}
