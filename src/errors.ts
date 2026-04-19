/**
 * Common error base class and error codes for roll-parser.
 *
 * @module errors
 */

/**
 * All known roll-parser error codes. Single source of truth — the
 * `RollParserErrorCode` type and the runtime `VALID_CODES` set are
 * both derived from this array.
 *
 * Lexer: `UNEXPECTED_CHARACTER`, `UNEXPECTED_IDENTIFIER`
 * Parser: `UNEXPECTED_TOKEN`, `UNEXPECTED_END`, `EXPECTED_TOKEN`,
 *   `INVALID_EXPLODE_TARGET`, `INVALID_SUCCESS_COUNT_TARGET`, `NESTED_VERSUS`,
 *   `INVALID_FUNCTION_ARITY`
 * Evaluator: `INVALID_DICE_COUNT`, `INVALID_DICE_SIDES`, `DICE_LIMIT_EXCEEDED`,
 *   `DIVISION_BY_ZERO`, `MODULO_BY_ZERO`, `UNKNOWN_OPERATOR`, `UNKNOWN_NODE_TYPE`,
 *   `INVALID_MODIFIER_COUNT`, `EXPLODE_LIMIT_EXCEEDED`, `REROLL_LIMIT_EXCEEDED`,
 *   `INVALID_THRESHOLD`, `NESTED_VERSUS`, `UNKNOWN_FUNCTION`
 */
const ROLL_PARSER_ERROR_CODES = [
  'UNEXPECTED_CHARACTER',
  'UNEXPECTED_IDENTIFIER',
  'UNEXPECTED_TOKEN',
  'UNEXPECTED_END',
  'EXPECTED_TOKEN',
  'INVALID_DICE_COUNT',
  'INVALID_DICE_SIDES',
  'DICE_LIMIT_EXCEEDED',
  'DIVISION_BY_ZERO',
  'MODULO_BY_ZERO',
  'UNKNOWN_OPERATOR',
  'UNKNOWN_NODE_TYPE',
  'INVALID_MODIFIER_COUNT',
  'EXPLODE_LIMIT_EXCEEDED',
  'INVALID_EXPLODE_TARGET',
  'REROLL_LIMIT_EXCEEDED',
  'INVALID_SUCCESS_COUNT_TARGET',
  'INVALID_THRESHOLD',
  'NESTED_VERSUS',
  'INVALID_FUNCTION_ARITY',
  'UNKNOWN_FUNCTION',
] as const;

export type RollParserErrorCode = (typeof ROLL_PARSER_ERROR_CODES)[number];

/**
 * Base error class for all roll-parser errors.
 *
 * Provides a typed `code` field for programmatic error handling.
 * All library errors (`LexerError`, `ParseError`, `EvaluatorError`)
 * extend this class.
 */
export class RollParserError extends Error {
  readonly code: RollParserErrorCode;

  constructor(message: string, code: RollParserErrorCode) {
    super(message);
    this.name = 'RollParserError';
    this.code = code;
  }
}

const VALID_CODES: Set<string> = new Set<string>(ROLL_PARSER_ERROR_CODES);

/**
 * Type guard for roll-parser errors. Checks `instanceof` first, then
 * falls back to duck-typing for cross-realm safety.
 */
export function isRollParserError(value: unknown): value is RollParserError {
  if (value instanceof RollParserError) return true;
  return (
    value instanceof Error &&
    'code' in value &&
    typeof (value as RollParserError).code === 'string' &&
    VALID_CODES.has((value as RollParserError).code)
  );
}
