/**
 * Common error base class, error codes, and span extraction for roll-parser.
 *
 * @module errors
 */

import type { ASTNode } from './parser/ast.js';

/**
 * Every roll-parser error code, as a readonly tuple. Single source of truth —
 * the {@link RollParserErrorCode} union is derived from it, and it is the
 * runtime counterpart for the type: validating an untrusted string, driving an
 * exhaustive UI (a message-catalog completeness check, a settings list), or
 * iterating the codes in tests.
 *
 * @example
 * ```typescript
 * import { ROLL_PARSER_ERROR_CODES, type RollParserErrorCode } from 'roll-parser';
 *
 * function isKnownCode(value: string): value is RollParserErrorCode {
 *   return (ROLL_PARSER_ERROR_CODES as readonly string[]).includes(value);
 * }
 * ```
 *
 * @category Errors
 */
export const ROLL_PARSER_ERROR_CODES = [
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
  'INVALID_KEEP_DROP_COUNT',
  'INVALID_KEEP_DROP_TARGET',
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
  'INCOMPATIBLE_RNG_STATE',
  'INVALID_EVALUATION_LIMIT',
  'INVALID_NOTATION_TYPE',
] as const;

/**
 * Programmatic identifier carried by every roll-parser error, grouped by the
 * stage that raises it. The runtime list behind this union is exported as
 * {@link ROLL_PARSER_ERROR_CODES}.
 *
 * Lexer: `UNEXPECTED_CHARACTER`, `UNEXPECTED_IDENTIFIER`
 *
 * Parser: `UNEXPECTED_TOKEN`, `UNEXPECTED_END`, `EXPECTED_TOKEN`,
 * `INVALID_KEEP_DROP_TARGET`, `INVALID_EXPLODE_TARGET`, `INVALID_REROLL_TARGET`,
 * `INVALID_SUCCESS_COUNT_TARGET`, `INVALID_SORT_TARGET`,
 * `INVALID_CRIT_THRESHOLD_TARGET`, `NESTED_VERSUS`, `INVALID_FUNCTION_ARITY`,
 * `AMBIGUOUS_DICE_CHAIN`, `MAX_DEPTH_EXCEEDED`
 *
 * Evaluator: `INVALID_DICE_COUNT`, `INVALID_DICE_SIDES`, `DICE_LIMIT_EXCEEDED`,
 * `DIVISION_BY_ZERO`, `MODULO_BY_ZERO`, `UNKNOWN_OPERATOR`, `UNKNOWN_NODE_TYPE`,
 * `INVALID_KEEP_DROP_COUNT`, `EXPLODE_LIMIT_EXCEEDED`, `REROLL_LIMIT_EXCEEDED`,
 * `INVALID_THRESHOLD`, `NESTED_VERSUS`, `UNKNOWN_FUNCTION`, `UNDEFINED_VARIABLE`,
 * `INVALID_VARIABLE_VALUE`, `NON_FINITE_RESULT`
 *
 * RNG: `INCOMPATIBLE_RNG_STATE`
 *
 * Options: `INVALID_EVALUATION_LIMIT` — raised before evaluation begins, from
 * the options object rather than from the notation, so it carries no span.
 *
 * Input: `INVALID_NOTATION_TYPE` — raised before lexing, when `notation` is not
 * a string, so it carries no span either.
 *
 * New codes are only ever introduced in a minor release, never a patch. Treat
 * the union as open when you switch over it: give the switch a `default` arm
 * rather than relying on exhaustiveness, or a minor upgrade turns a new code
 * into a silent fall-through.
 *
 * @example
 * ```typescript
 * import { isRollParserError, roll, type RollParserErrorCode } from 'roll-parser';
 *
 * const MESSAGES: Partial<Record<RollParserErrorCode, string>> = {
 *   DICE_LIMIT_EXCEEDED: 'That is too many dice.',
 *   DIVISION_BY_ZERO: 'Cannot divide by zero.',
 *   UNEXPECTED_CHARACTER: 'That is not valid dice notation.',
 * };
 *
 * try {
 *   roll(userInput);
 * } catch (error) {
 *   if (isRollParserError(error)) {
 *     reply(MESSAGES[error.code] ?? error.message);
 *   }
 * }
 * ```
 *
 * @category Errors
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
 * through structured fields instead, readable uniformly via
 * {@link getErrorSpan}. Prefer {@link isRollParserError} over `instanceof`:
 * it also matches errors that crossed a realm boundary.
 *
 * @example
 * ```typescript
 * import { roll, RollParserError } from 'roll-parser';
 *
 * try {
 *   roll('1d6/0');
 * } catch (error) {
 *   const typed = error as RollParserError;
 *   typed.name; // 'EvaluatorError'
 *   typed.code; // 'DIVISION_BY_ZERO'
 *   typed.message; // 'Division by zero'
 * }
 * ```
 *
 * @category Errors
 */
export class RollParserError extends Error {
  /**
   * Stable programmatic identifier for the failure. Branch on this rather
   * than on `message`, which is free to change between releases.
   */
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
 *
 * Unlike `LexerError` / `ParseError` — which point at a single offset — an
 * `EvaluatorError` carries a full `start`/`end` span covering the failing
 * sub-expression, because by evaluation time the AST knows its own extent.
 *
 * @example
 * ```typescript
 * import { getErrorSpan, roll } from 'roll-parser';
 *
 * try {
 *   roll('2d6+1d0+3');
 * } catch (error) {
 *   (error as Error).name; // 'EvaluatorError'
 *   getErrorSpan(error); // { start: 4, end: 7 } — the '1d0' sub-expression
 * }
 * ```
 *
 * @category Errors
 */
export class EvaluatorError extends RollParserError {
  /**
   * `ASTNode.type` of the node that raised the error (`'Dice'`, `'BinaryOp'`,
   * …). `undefined` for failures raised outside a node context, such as the
   * whole-expression dice budget.
   */
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
    this.nodeType = nodeType;
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
   * @internal Called only by `evalNode`; `stripInternal` drops it from the
   * published `.d.ts`.
   */
  stampSpan(start: number, end: number | undefined): void {
    if (this.#start != null) return;
    this.#start = start;
    this.#end = end;
  }
}

/**
 * Source span of an error, in UTF-16 code units into the original notation.
 * `start` is inclusive; `end` is exclusive and present only when the error
 * carries a full span (evaluator errors) rather than a single offset.
 *
 * @category Errors
 */
export type ErrorSpan = {
  start: number;
  end?: number;
};

const VALID_CODES: Set<string> = new Set<string>(ROLL_PARSER_ERROR_CODES);

/**
 * Type guard for roll-parser errors. Checks `instanceof` first, then falls
 * back to duck-typing — an `Error` whose `code` is a known
 * {@link RollParserErrorCode} passes even if it crossed a realm boundary
 * (worker, iframe, vm context) and so failed `instanceof`.
 *
 * Use it as the outer filter in every `catch`: anything it rejects is a bug
 * in your code or the library, not a bad notation, and should be rethrown.
 *
 * @param value - The caught value, of unknown type
 * @returns `true` when `value` is a roll-parser error
 *
 * @example
 * ```typescript
 * import { isRollParserError, roll } from 'roll-parser';
 *
 * try {
 *   roll('2d6+&');
 * } catch (error) {
 *   if (!isRollParserError(error)) throw error;
 *   error.code; // 'UNEXPECTED_CHARACTER'
 *   error.message; // "Unexpected character: '&'"
 * }
 * ```
 *
 * @category Errors
 */
export function isRollParserError(value: unknown): value is RollParserError {
  if (value instanceof RollParserError) return true;
  if (!(value instanceof Error) || !('code' in value)) return false;
  const { code } = value;
  return typeof code === 'string' && VALID_CODES.has(code);
}

/**
 * Renders a rejected value for an error message, never coercing an object:
 * `String(Object.create(null))` throws, and a hostile `toString` can too —
 * either would replace the typed error with a raw `TypeError`.
 *
 * Module-level export, deliberately absent from `src/index.ts` — the package
 * surface never mentions it.
 */
export function describeValue(value: unknown): string {
  // Quoted, so the message tells `'5'` and `5` apart.
  if (typeof value === 'string') return JSON.stringify(value);
  // Ahead of the `typeof` checks: `typeof null` is `'object'`.
  if (value === null) return 'null';
  if (typeof value === 'object' || typeof value === 'function') return typeof value;
  return String(value);
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
 * @param error - The caught value, of unknown type
 * @returns The span, or `undefined` when none is available
 *
 * @example Rendering a caret, the way the CLI does
 * ```typescript
 * import { getErrorSpan, isRollParserError, roll } from 'roll-parser';
 *
 * function explain(notation: string): string | undefined {
 *   try {
 *     roll(notation);
 *     return undefined;
 *   } catch (error) {
 *     if (!isRollParserError(error)) throw error;
 *     const span = getErrorSpan(error);
 *     if (span == null) return error.message;
 *     const width = (span.end ?? span.start + 1) - span.start;
 *     return [
 *       error.message,
 *       notation,
 *       ' '.repeat(span.start) + '^'.repeat(width),
 *     ].join('\n');
 *   }
 * }
 *
 * explain('2d6+&');
 * // Unexpected character: '&'
 * // 2d6+&
 * //     ^
 *
 * explain('2d6+1d0+3');
 * // Invalid dice sides: 0
 * // 2d6+1d0+3
 * //     ^^^
 * ```
 *
 * @category Errors
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
