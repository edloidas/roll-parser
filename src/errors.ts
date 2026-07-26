/**
 * Common error base class, error codes, and span extraction for roll-parser.
 *
 * @module errors
 */

import type { ASTNode } from './parser/ast.js';

/**
 * All known roll-parser error codes. Single source of truth — the
 * `RollParserErrorCode` type and the runtime `VALID_CODES` set are
 * both derived from this array.
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
  'INVALID_MODIFIER_TARGET',
  'EXPLODE_LIMIT_EXCEEDED',
  'INVALID_EXPLODE_TARGET',
  'REROLL_LIMIT_EXCEEDED',
  'INVALID_REROLL_TARGET',
  'INVALID_SUCCESS_COUNT_TARGET',
  'INVALID_SORT_TARGET',
  'INVALID_CRIT_THRESHOLD_TARGET',
  'INVALID_THRESHOLD',
  'NESTED_VERSUS',
  'INVALID_FUNCTION_ARITY',
  'UNKNOWN_FUNCTION',
  'UNDEFINED_VARIABLE',
  'INVALID_VARIABLE_VALUE',
  'AMBIGUOUS_DICE_CHAIN',
  'MAX_DEPTH_EXCEEDED',
  'NON_FINITE_RESULT',
] as const;

/**
 * Programmatic identifier carried by every roll-parser error, grouped by the
 * stage that raises it.
 *
 * Lexer: `UNEXPECTED_CHARACTER`, `UNEXPECTED_IDENTIFIER`
 *
 * Parser: `UNEXPECTED_TOKEN`, `UNEXPECTED_END`, `EXPECTED_TOKEN`,
 * `INVALID_MODIFIER_TARGET`, `INVALID_EXPLODE_TARGET`, `INVALID_REROLL_TARGET`,
 * `INVALID_SUCCESS_COUNT_TARGET`, `INVALID_SORT_TARGET`,
 * `INVALID_CRIT_THRESHOLD_TARGET`, `NESTED_VERSUS`, `INVALID_FUNCTION_ARITY`,
 * `AMBIGUOUS_DICE_CHAIN`, `MAX_DEPTH_EXCEEDED`
 *
 * Evaluator: `INVALID_DICE_COUNT`, `INVALID_DICE_SIDES`, `DICE_LIMIT_EXCEEDED`,
 * `DIVISION_BY_ZERO`, `MODULO_BY_ZERO`, `UNKNOWN_OPERATOR`, `UNKNOWN_NODE_TYPE`,
 * `INVALID_MODIFIER_COUNT`, `EXPLODE_LIMIT_EXCEEDED`, `REROLL_LIMIT_EXCEEDED`,
 * `INVALID_THRESHOLD`, `NESTED_VERSUS`, `UNKNOWN_FUNCTION`, `UNDEFINED_VARIABLE`,
 * `INVALID_VARIABLE_VALUE`, `NON_FINITE_RESULT`
 */
export type RollParserErrorCode = (typeof ROLL_PARSER_ERROR_CODES)[number];

/**
 * Base error class for all roll-parser errors.
 *
 * Provides a typed `code` field for programmatic error handling.
 * All library errors (`LexerError`, `ParseError`, `EvaluatorError`)
 * extend this class.
 *
 * Error messages never embed the source position — every subclass reports it
 * through structured fields instead, readable uniformly via `getErrorSpan`.
 */
export class RollParserError extends Error {
  readonly code: RollParserErrorCode;

  constructor(message: string, code: RollParserErrorCode, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RollParserError';
    this.code = code;
  }
}

/**
 * Error thrown during AST evaluation.
 *
 * Lives here rather than in `evaluator/evaluator.ts` so the modifier
 * implementations can throw it without importing back into the evaluator —
 * that value-level round trip was a genuine ESM cycle. `evaluator.ts`
 * re-exports the class for existing importers.
 */
export class EvaluatorError extends RollParserError {
  readonly nodeType: ASTNode['type'] | undefined;

  #start: number | undefined;
  #end: number | undefined;

  constructor(
    message: string,
    code: RollParserErrorCode,
    nodeType?: ASTNode['type'],
    options?: ErrorOptions,
  ) {
    super(message, code, options);
    this.name = 'EvaluatorError';
    this.nodeType = nodeType ?? undefined;
  }

  /**
   * Start offset of the tightest AST node that was being evaluated when the
   * error was thrown. `undefined` when the AST was built without parser spans.
   */
  get start(): number | undefined {
    return this.#start;
  }

  /** Exclusive end offset of the span described by `start`. */
  get end(): number | undefined {
    return this.#end;
  }

  /**
   * Records the source span of the node being evaluated. Idempotent — the
   * first stamp wins, so the innermost `evalNode` frame keeps the tightest
   * span as the error bubbles up.
   *
   * @internal Called only by `evalNode`; not part of the public API.
   */
  stampSpan(start: number, end: number | undefined): void {
    if (this.#start !== undefined) return;
    this.#start = start;
    this.#end = end;
  }
}

/**
 * Source span of an error, in UTF-16 code units into the original notation.
 * `start` is inclusive; `end` is exclusive and present only when the error
 * carries a full span (evaluator errors) rather than a single offset.
 */
export type ErrorSpan = {
  start: number;
  end?: number;
};

const VALID_CODES: Set<string> = new Set<string>(ROLL_PARSER_ERROR_CODES);

/**
 * Type guard for roll-parser errors. Checks `instanceof` first, then
 * falls back to duck-typing for cross-realm safety.
 */
export function isRollParserError(value: unknown): value is RollParserError {
  if (value instanceof RollParserError) return true;
  if (!(value instanceof Error) || !('code' in value)) return false;
  const { code } = value;
  return typeof code === 'string' && VALID_CODES.has(code);
}

/** True for finite, non-negative integer offsets. */
function isOffset(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Normalizes the three error position shapes into one span.
 *
 * `LexerError` and `ParseError` expose a single `position`; `EvaluatorError`
 * exposes `start`/`end`. Returns `undefined` for errors that are not
 * roll-parser errors, or that carry no usable offset (an `EvaluatorError`
 * raised on a hand-built AST, for instance).
 *
 * @example
 * ```typescript
 * try {
 *   roll('2d6+&');
 * } catch (error) {
 *   const span = getErrorSpan(error); // { start: 4 }
 * }
 * ```
 */
export function getErrorSpan(error: unknown): ErrorSpan | undefined {
  if (!isRollParserError(error)) return undefined;

  if ('position' in error && isOffset(error.position)) {
    return { start: error.position };
  }

  if ('start' in error && isOffset(error.start)) {
    const span: ErrorSpan = { start: error.start };
    if ('end' in error && isOffset(error.end)) span.end = error.end;
    return span;
  }

  return undefined;
}
