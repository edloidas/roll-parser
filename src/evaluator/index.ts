/**
 * Evaluator module - AST to roll result transformation.
 *
 * @module evaluator
 */

export { DEFAULT_MAX_DICE, EvaluatorError, evaluate } from './evaluator.js';
export {
  applyDropHighest,
  applyDropLowest,
  applyKeepHighest,
  applyKeepLowest,
  sumKeptDice,
} from './modifiers/keep-drop.js';
