/**
 * Roll Parser - Dice notation parser for tabletop RPGs.
 *
 * @module roll-parser
 */

import { version } from './version.js';

export type { ErrorSpan, RollParserErrorCode } from './errors.js';
export { getErrorSpan, isRollParserError, RollParserError } from './errors.js';
export {
  DEFAULT_MAX_DICE,
  DEFAULT_MAX_EXPLODE_ITERATIONS,
  DEFAULT_MAX_REROLL_ITERATIONS,
  EvaluatorError,
  evaluate,
} from './evaluator/evaluator.js';
export { LexerError, lex } from './lexer/lexer.js';
export type { Token } from './lexer/tokens.js';
export { TokenType } from './lexer/tokens.js';
export type {
  ASTNode,
  BinaryOpNode,
  CritThreshold,
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
export { MAX_PARSE_DEPTH, ParseError, parse } from './parser/parser.js';
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
  EvaluationLimits,
  ModifierSpec,
  ResolvedComparePoint,
  ResolvedCritThreshold,
  RollPart,
  RollPartType,
  RollResult,
} from './types.js';
export { DegreeOfSuccess } from './types.js';

/**
 * Installed roll-parser version — the exact string in `package.json`, so
 * pre-releases keep their suffix (`'3.0.0-beta.0'`). Sourced from the
 * generated `src/version.ts`, kept in sync with the manifest by
 * `bun run generate:version` and gated by `check:version` and CI.
 *
 * Useful in bug reports and for feature-gating against a minimum version. The
 * CLI prints it for `--version` and in the `--help` header.
 *
 * @example
 * ```typescript
 * import { VERSION } from 'roll-parser';
 *
 * VERSION; // e.g. '3.0.0', or '3.1.0-beta.0' on a pre-release
 * VERSION.startsWith('3.'); // true
 * ```
 *
 * @category Core
 */
export const VERSION: string = version;
