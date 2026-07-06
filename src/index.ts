/**
 * Roll Parser - Dice notation parser for tabletop RPGs.
 *
 * @module roll-parser
 */

// * Error hierarchy
export { RollParserError, isRollParserError } from './errors.js';
export type { RollParserErrorCode } from './errors.js';

// * Lexer exports
export { LexerError } from './lexer/lexer.js';

// * Parser exports
export { parse, ParseError } from './parser/parser.js';
export type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  NodeSpan,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  LiteralNode,
  ModifierNode,
  RerollNode,
  SuccessCountNode,
  SortNode,
  CritThresholdNode,
  GroupNode,
  UnaryOpNode,
  VariableNode,
  VersusNode,
} from './parser/ast.js';
export {
  isBinaryOp,
  isCritThreshold,
  isDice,
  isExplode,
  isFateDice,
  isFunctionCall,
  isGroup,
  isGrouped,
  isLiteral,
  isModifier,
  isReroll,
  isSort,
  isSuccessCount,
  isUnaryOp,
  isVariable,
  isVersus,
} from './parser/ast.js';

// * RNG exports
export type { RNG } from './rng/types.js';
export { SeededRNG } from './rng/seeded.js';

// * Evaluator exports
export {
  DEFAULT_MAX_DICE,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
  DEFAULT_MAX_REROLL_ITERATIONS,
  evaluate,
  EvaluatorError,
} from './evaluator/evaluator.js';
export type {
  CompareOp,
  ComparePoint,
  DieModifier,
  DieResult,
  EvaluateOptions,
  RollResult,
} from './types.js';
export { DegreeOfSuccess } from './types.js';

// * Public API
export { roll } from './roll.js';
export type { RollOptions } from './roll.js';

// ? Named import — Bun's bundler tree-shakes the JSON module down to the
//   single used property, so the full manifest is not embedded in dist.
import { version } from '../package.json';

export const VERSION: string = version;
