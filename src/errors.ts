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
  'INVALID_DIE_BOUND_TARGET',
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
 * `INVALID_CRIT_THRESHOLD_TARGET`, `INVALID_DIE_BOUND_TARGET`, `NESTED_VERSUS`,
 * `INVALID_FUNCTION_ARITY`, `AMBIGUOUS_DICE_CHAIN`, `MAX_DEPTH_EXCEEDED`
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
 * The subset of {@link ROLL_PARSER_ERROR_CODES} the *input* is answerable for,
 * as a readonly tuple. Runtime counterpart of {@link NotationErrorCode} and the
 * list {@link isNotationError} matches against.
 *
 * A code is in when `roll(notation)` can raise it for some notation string,
 * given valid options and a valid `context` — so the right response is to tell
 * whoever supplied the notation that it was rejected. Six codes are out, because
 * for each of them the notation is innocent:
 *
 * Calling code: `INVALID_EVALUATION_LIMIT` (a bad `maxDice`,
 * `maxExplodeIterations`, or `maxRerollIterations`), `INVALID_VARIABLE_VALUE` (a
 * non-finite entry in `context`), `INCOMPATIBLE_RNG_STATE` (a snapshot from
 * another version)
 *
 * Library invariant: `UNKNOWN_NODE_TYPE`, `UNKNOWN_OPERATOR`,
 * `UNKNOWN_FUNCTION` — the lexer and parser only ever hand the evaluator shapes
 * it already covers, so reaching one means a hand-built AST or a bug in here.
 *
 * Two boundaries are worth knowing. `DIVISION_BY_ZERO`, `MODULO_BY_ZERO`, and
 * `NON_FINITE_RESULT` are in because notation alone reaches them (`1d6/0`,
 * `10**400`), but a `context` variable reaches them too, so a `true` is not
 * proof the notation was at fault. `INVALID_NOTATION_TYPE` is in even though no
 * user can type a non-string: it means the `notation` you were handed was
 * `null` or `undefined` — an absent slash-command option, a missing JSON field —
 * and "give me a dice expression" is the reply that fits.
 *
 * @example
 * ```typescript
 * import { NOTATION_ERROR_CODES } from 'roll-parser';
 *
 * // Prompt copy is only worth writing for the codes a user can actually cause.
 * const needsCopy = new Set(NOTATION_ERROR_CODES);
 * ```
 *
 * @category Errors
 */
export const NOTATION_ERROR_CODES = [
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
  'INVALID_KEEP_DROP_COUNT',
  'INVALID_KEEP_DROP_TARGET',
  'EXPLODE_LIMIT_EXCEEDED',
  'INVALID_EXPLODE_TARGET',
  'REROLL_LIMIT_EXCEEDED',
  'INVALID_REROLL_TARGET',
  'INVALID_SUCCESS_COUNT_TARGET',
  'INVALID_SORT_TARGET',
  'INVALID_CRIT_THRESHOLD_TARGET',
  'INVALID_DIE_BOUND_TARGET',
  'INVALID_THRESHOLD',
  'NESTED_VERSUS',
  'INVALID_FUNCTION_ARITY',
  'UNDEFINED_VARIABLE',
  'AMBIGUOUS_DICE_CHAIN',
  'MAX_DEPTH_EXCEEDED',
  'NON_FINITE_RESULT',
  'INVALID_NOTATION_TYPE',
] as const;

/**
 * A {@link RollParserErrorCode} the input is answerable for. The runtime list
 * behind this union is exported as {@link NOTATION_ERROR_CODES}, which documents
 * where the line falls.
 *
 * @category Errors
 */
export type NotationErrorCode = (typeof NOTATION_ERROR_CODES)[number];

/**
 * Key of the brand {@link isRollParserError} matches on. A *registered* symbol,
 * because the global symbol registry is shared by every realm in an agent — so
 * the same key resolves from an iframe or a `vm` context, and from a second copy
 * of the library in `node_modules`, provided that copy is new enough to carry
 * the brand at all.
 */
// ! The string is wire format between library copies. Changing it severs
// ! recognition across versions, so it is fixed for the lifetime of the package.
const ERROR_BRAND = Symbol.for('roll-parser.error');

/**
 * Base error class for all roll-parser errors.
 *
 * Provides a typed `code` field for programmatic error handling.
 * All library errors (`LexerError`, `ParseError`, `EvaluatorError`)
 * extend this class.
 *
 * Error messages never embed the source position — every subclass reports it
 * through structured fields instead, readable uniformly via
 * {@link getErrorSpan}. Prefer {@link isRollParserError} over `instanceof`: it
 * also matches errors from another realm or a duplicate copy of the library.
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

  /**
   * Brand {@link isRollParserError} looks for.
   *
   * An accessor, not a field or a module-level `defineProperty`: it lands on the
   * prototype — free per error, inherited by every subclass, invisible to spread
   * and `JSON.stringify` — without a top-level statement, which would contradict
   * the package's side-effect-free declaration.
   *
   * @internal `stripInternal` drops it from the published `.d.ts`.
   */
  get [ERROR_BRAND](): true {
    return true;
  }
}

/**
 * Records the source span of the node being evaluated on an
 * {@link EvaluatorError}. Idempotent — the first stamp wins, so the innermost
 * `evalNode` frame keeps the tightest span as the error bubbles up.
 *
 * @internal Called only by `evalNode`; `stripInternal` drops it from the
 * published `.d.ts`.
 */
// ! A module-scoped function, not a method: `EvaluatorError` is exported, so a
// ! method would let any consumer overwrite a caught error's span. Assigned from
// ! the `static` block below — the only scope `#start` / `#end` are reachable
// ! from — and never re-exported from `index.ts`.
export let stampEvaluatorSpan!: (
  error: EvaluatorError,
  start: number,
  end: number | undefined,
) => void;

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

  static {
    stampEvaluatorSpan = (error, start, end) => {
      if (error.#start != null) return;
      error.#start = start;
      error.#end = end;
    };
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

/**
 * Type guard for roll-parser errors. Checks `instanceof` first, then a brand
 * carried on the error's prototype — so it still matches when `instanceof`
 * cannot, namely an error from an iframe or `vm` context, or from a second copy
 * of the library in `node_modules` at this version or newer.
 *
 * Use it as the outer filter in every `catch`: anything it rejects came from
 * somewhere else and should be rethrown. The brand is what makes that sound — a
 * foreign error is never accepted just for carrying a `code` that happens to
 * collide with one of ours.
 *
 * What it answers is "did this come from us", not "whose fault was it". A `true`
 * covers bad notation, a bad options object, and a broken invariant in here
 * alike, so it is the wrong test to hang a user-facing message on. Reach for
 * {@link isNotationError} for that.
 *
 * Only this library's own error prototype carries the brand, so holding it is
 * proof of origin, and the `code` is trusted rather than re-validated: an error
 * from a newer minor passes with a code this build has never heard of, which is
 * what {@link RollParserErrorCode} being an open union already implies. A value
 * that forges the brand is out of scope, as it is for any brand check.
 *
 * The one boundary it cannot cross is a worker. `postMessage` and
 * `structuredClone` rebuild an `Error` from `message` and `stack` alone,
 * discarding `code`, `name`, and the prototype with it, so the value that
 * arrives is no longer recognizable as anything. Send `error.code` yourself as
 * part of the message payload if the other side needs it.
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
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[ERROR_BRAND] === true
  );
}

const NOTATION_CODES: ReadonlySet<string> = new Set(NOTATION_ERROR_CODES);

/**
 * Type guard for the failures the input is answerable for: a roll-parser error
 * whose `code` is one of {@link NOTATION_ERROR_CODES}. This is the test to hang
 * a user-facing message on — {@link isRollParserError} only establishes origin,
 * and answers `true` for a bad options object and a broken library invariant
 * too, both of which should page you instead.
 *
 * Pair the two: the outer filter rethrows what is not ours, and this one splits
 * what is left into "tell the user" and "report a bug".
 *
 * Unlike {@link isRollParserError}, this one has to read the `code` against the
 * list this build carries — attribution is not something a brand can express. So
 * where the outer filter accepts a code it has never heard of, this one rejects
 * it: an error from a newer minor carrying a notation code added after this build
 * reads as `false` and is misfiled as internal. That is the safe direction — it
 * pages a developer rather than blaming a user — but keep the library and its
 * consumers on one version when the distinction drives more than a message.
 *
 * @param value - The caught value, of unknown type
 * @returns `true` when `value` is a roll-parser error the input caused
 *
 * @example Two channels, one catch
 * ```typescript
 * import { isNotationError, isRollParserError, roll } from 'roll-parser';
 *
 * try {
 *   roll(userInput);
 * } catch (error) {
 *   if (!isRollParserError(error)) throw error;
 *   if (isNotationError(error)) reply(`Bad notation: ${error.message}`);
 *   else report(error); // our bug or yours — never the user's
 * }
 * ```
 *
 * @category Errors
 */
export function isNotationError(
  value: unknown,
): value is RollParserError & { code: NotationErrorCode } {
  return isRollParserError(value) && NOTATION_CODES.has(value.code);
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
