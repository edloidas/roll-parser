/**
 * Evaluator module - AST to roll result transformation.
 *
 * @module evaluator
 */

export { evaluate, EvaluatorError } from './evaluator';
export {
  applyDropHighest,
  applyDropLowest,
  applyKeepHighest,
  applyKeepLowest,
  sumKeptDice,
} from './modifiers/keep-drop';
