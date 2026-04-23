/**
 * Roll Parser - Dice notation parser for tabletop RPGs.
 *
 * @module roll-parser
 */

// * Error hierarchy
export { RollParserError, isRollParserError } from './errors';
export type { RollParserErrorCode } from './errors';

// * Lexer exports
export { LexerError } from './lexer/lexer';

// * Parser exports
export { parse, ParseError } from './parser/parser';
export type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  LiteralNode,
  ModifierNode,
  RerollNode,
  SuccessCountNode,
  UnaryOpNode,
  VariableNode,
  VersusNode,
} from './parser/ast';
export {
  isBinaryOp,
  isDice,
  isExplode,
  isFateDice,
  isFunctionCall,
  isGrouped,
  isLiteral,
  isModifier,
  isReroll,
  isSuccessCount,
  isUnaryOp,
  isVariable,
  isVersus,
} from './parser/ast';

// * RNG exports
export type { RNG } from './rng/types';
export { SeededRNG } from './rng/seeded';

// * Evaluator exports
export {
  DEFAULT_MAX_DICE,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
  DEFAULT_MAX_REROLL_ITERATIONS,
  evaluate,
  EvaluatorError,
} from './evaluator/evaluator';
export type {
  CompareOp,
  ComparePoint,
  DieModifier,
  DieResult,
  EvaluateOptions,
  RollResult,
} from './types';
export { DegreeOfSuccess } from './types';

// * Public API
export { roll } from './roll';
export type { RollOptions } from './roll';

import pkg from '../package.json';

export const VERSION: string = pkg.version;
