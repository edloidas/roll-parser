/**
 * Roll Parser - Dice notation parser for tabletop RPGs.
 *
 * @module roll-parser
 */

// * Lexer exports
export { lex, Lexer, LexerError } from './lexer/lexer';
export { TokenType, type Token } from './lexer/tokens';

// * Parser exports
export { parse, Parser, ParseError } from './parser/parser';
export type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  LiteralNode,
  ModifierNode,
  UnaryOpNode,
} from './parser/ast';
export {
  isBinaryOp,
  isDice,
  isLiteral,
  isModifier,
  isUnaryOp,
} from './parser/ast';

// * RNG exports
export type { RNG } from './rng/types';
export { SeededRNG } from './rng/seeded';
export { createMockRng, MockRNGExhaustedError } from './rng/mock';

// * Evaluator exports
export { evaluate, EvaluatorError } from './evaluator/evaluator';
export type { DieModifier, DieResult, EvaluateOptions, RollResult } from './types';

// TODO: [Phase 5] Export public API (roll function)

export const VERSION = '3.0.0-alpha.0';
