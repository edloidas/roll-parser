/**
 * Roll Parser - Dice notation parser for tabletop RPGs.
 *
 * @module roll-parser
 */

export type { RollParserErrorCode } from './errors.js';
export { isRollParserError, RollParserError } from './errors.js';
export {
  DEFAULT_MAX_DICE,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
  DEFAULT_MAX_REROLL_ITERATIONS,
  EvaluatorError,
  evaluate,
} from './evaluator/evaluator.js';
export { LexerError } from './lexer/lexer.js';
export type {
  ASTNode,
  BinaryOpNode,
  CritThresholdNode,
  DiceNode,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  GroupNode,
  LiteralNode,
  ModifierNode,
  NodeSpan,
  RerollNode,
  SortNode,
  SuccessCountNode,
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
export { ParseError, parse } from './parser/parser.js';
export { SeededRNG } from './rng/seeded.js';
export type { RNG } from './rng/types.js';
export type { RollOptions } from './roll.js';
export { roll } from './roll.js';
export type {
  CompareOp,
  ComparePoint,
  DieModifier,
  DieResult,
  EvaluateOptions,
  ModifierSpec,
  ResolvedComparePoint,
  ResolvedCritThreshold,
  RollPart,
  RollPartType,
  RollResult,
} from './types.js';
export { DegreeOfSuccess } from './types.js';

// ? Named import — Bun's bundler tree-shakes the JSON module down to the
//   single used property, so the full manifest is not embedded in dist.
import { version } from '../package.json';

export const VERSION: string = version;
