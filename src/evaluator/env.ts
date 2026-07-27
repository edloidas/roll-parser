/**
 * Per-evaluation shared environment.
 *
 * Lives in its own module so the modifier implementations under
 * `./modifiers/*` can type their `env` parameter without importing
 * `./evaluator.js`, which imports them back.
 *
 * @module evaluator/env
 */

import { EvaluatorError } from '../errors.js';
import type { ASTNode } from '../parser/ast.js';

/**
 * Per-evaluation shared environment (created once, shared across all branches).
 *
 * Exported for use by modifier implementations under `./modifiers/*`. Not part
 * of the public library API.
 */
export type EvalEnv = {
  readonly maxDice: number;
  readonly maxExplodeIterations: number;
  readonly maxRerollIterations: number;
  totalDiceRolled: number;
  /**
   * Set to `true` by `evalSuccessCount`. Propagates through the shared env
   * so `evaluate()` can include `successes`/`failures` fields even when no
   * die was tagged (impossible threshold).
   */
  hasSuccessCount: boolean;
  /**
   * `true` while the evaluator is inside a `VersusNode`'s roll or DC
   * sub-evaluation. `evalVersus` rejects nesting via this flag — catches
   * paren-nested versus (`1d20 vs (5 vs 3)`) that slip past the parser's
   * left-chain check.
   */
  insideVersus: boolean;
  /**
   * User-supplied variable map for `@name` / `@{name}` references. Always
   * defined — `evaluate()` defaults to an empty object so lookups can be
   * branch-free on presence.
   */
  readonly context: Readonly<Record<string, number>>;
  /**
   * Behavior when a referenced variable is missing from `context`. Always
   * defined — `evaluate()` defaults to `'throw'`.
   */
  readonly onMissingVariable: 'throw' | 'zero';
};

/**
 * Reserves `count` dice against the global `maxDice` budget, throwing
 * `DICE_LIMIT_EXCEEDED` when the reservation would overshoot.
 *
 * Every path that consumes RNG draws for dice charges through here — initial
 * pools (`evalDice` / `evalFateDice`), explosion continuations, and reroll
 * replacements — so the limit and its message have one definition.
 */
export function chargeDice(env: EvalEnv, count: number, nodeType: ASTNode['type']): void {
  if (env.totalDiceRolled + count > env.maxDice) {
    throw new EvaluatorError(
      `Total dice count ${env.totalDiceRolled + count} exceeds limit of ${env.maxDice}`,
      'DICE_LIMIT_EXCEEDED',
      nodeType,
    );
  }
  env.totalDiceRolled += count;
}

/** Single-die shorthand for {@link chargeDice}. */
export function chargeDie(env: EvalEnv, nodeType: ASTNode['type']): void {
  chargeDice(env, 1, nodeType);
}
