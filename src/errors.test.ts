/**
 * Tests for the shared error contract: codes, span extraction, and the
 * position-out-of-message convention.
 *
 * @module errors.test
 */

import { describe, expect, test } from 'bun:test';
import type { RollParserErrorCode } from './errors.js';
import { EvaluatorError, getErrorSpan, isRollParserError, RollParserError } from './errors.js';
import { evaluate } from './evaluator/evaluator.js';
import { LexerError, lex } from './lexer/lexer.js';
import type { ASTNode } from './parser/ast.js';
import { MAX_PARSE_DEPTH, ParseError, parse } from './parser/parser.js';
import { createMockRng } from './rng/mock.js';
import type { RollOptions } from './roll.js';
import { roll } from './roll.js';

/** Runs `fn`, returning whatever it threw. Fails when nothing is thrown. */
function captureError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error('Expected the callback to throw');
}

describe('isRollParserError', () => {
  test('accepts library errors', () => {
    expect(isRollParserError(new RollParserError('boom', 'UNKNOWN_FUNCTION'))).toBe(true);
    expect(isRollParserError(captureError(() => lex('2d6+&')))).toBe(true);
    expect(isRollParserError(captureError(() => parse('1+')))).toBe(true);
  });

  test('accepts cross-realm look-alikes by code', () => {
    const foreign = Object.assign(new Error('boom'), { code: 'DIVISION_BY_ZERO' });

    expect(isRollParserError(foreign)).toBe(true);
  });

  test('rejects unrelated values', () => {
    expect(isRollParserError(new Error('boom'))).toBe(false);
    expect(isRollParserError(Object.assign(new Error('boom'), { code: 'ENOENT' }))).toBe(false);
    expect(isRollParserError({ code: 'DIVISION_BY_ZERO' })).toBe(false);
    expect(isRollParserError(undefined)).toBe(false);
  });
});

describe('RollParserError', () => {
  test('forwards ErrorOptions so cause chains survive', () => {
    const cause = new Error('root');
    const error = new RollParserError('wrapped', 'UNKNOWN_FUNCTION', { cause });

    expect(error.cause).toBe(cause);
  });

  test('subclasses forward ErrorOptions too', () => {
    const cause = new Error('root');

    expect(new LexerError('bad', 'UNEXPECTED_CHARACTER', 0, '&', { cause }).cause).toBe(cause);
    expect(new ParseError('bad', 'UNEXPECTED_TOKEN', 0, undefined, { cause }).cause).toBe(cause);
    expect(new EvaluatorError('bad', 'DIVISION_BY_ZERO', 'Dice', { cause }).cause).toBe(cause);
  });
});

describe('error messages', () => {
  // Positions are structured data — duplicating them in prose forced UI
  // consumers to strip the suffix before rendering their own markers.
  test('lexer messages omit the position', () => {
    const error = captureError(() => lex('2d6+&')) as LexerError;

    expect(error.message).toBe(`Unexpected character: '&'`);
    expect(error.position).toBe(4);
  });

  test('parser messages omit the position', () => {
    const error = captureError(() => parse('1+')) as ParseError;

    expect(error.message).not.toContain('position');
    expect(typeof error.position).toBe('number');
  });

  test('evaluator messages omit the position', () => {
    const error = captureError(() =>
      evaluate(parse('2d6+1d0+3'), createMockRng([1, 1])),
    ) as EvaluatorError;

    expect(error.message).toBe('Invalid dice sides: 0');
    expect(error.start).toBe(4);
  });
});

describe('EvaluatorError span', () => {
  test('start and end are not publicly assignable', () => {
    const error = new EvaluatorError('boom', 'DIVISION_BY_ZERO', 'BinaryOp');

    expect(() => {
      (error as unknown as { start: number }).start = 3;
    }).toThrow(TypeError);
    expect(error.start).toBeUndefined();
  });

  test('the innermost stamp wins', () => {
    const error = new EvaluatorError('boom', 'DIVISION_BY_ZERO', 'BinaryOp');

    error.stampSpan(4, 7);
    error.stampSpan(0, 9);

    expect(error.start).toBe(4);
    expect(error.end).toBe(7);
  });
});

describe('getErrorSpan', () => {
  test('normalizes the lexer position', () => {
    expect(getErrorSpan(captureError(() => lex('2d6+&')))).toEqual({ start: 4 });
  });

  test('normalizes the parser position', () => {
    const error = captureError(() => parse('floor 2')) as ParseError;

    expect(getErrorSpan(error)).toEqual({ start: error.position });
  });

  test('normalizes the evaluator span', () => {
    const error = captureError(() => evaluate(parse('2d6+1d0+3'), createMockRng([1, 1])));

    expect(getErrorSpan(error)).toEqual({ start: 4, end: 7 });
  });

  test('returns undefined for evaluator errors on span-less ASTs', () => {
    const error = captureError(() =>
      evaluate(
        {
          type: 'Dice',
          count: { type: 'Literal', value: 1 },
          sides: { type: 'Literal', value: 0 },
        },
        createMockRng([]),
      ),
    );

    expect(getErrorSpan(error)).toBeUndefined();
  });

  test('returns undefined for non-library errors', () => {
    expect(getErrorSpan(new Error('boom'))).toBeUndefined();
    expect(getErrorSpan(Object.assign(new Error('boom'), { position: 3 }))).toBeUndefined();
    expect(getErrorSpan(undefined)).toBeUndefined();
  });

  test('ignores non-integer and negative offsets', () => {
    const fractional = new LexerError('bad', 'UNEXPECTED_CHARACTER', 1.5, '&');
    const negative = new LexerError('bad', 'UNEXPECTED_CHARACTER', -1, '&');

    expect(getErrorSpan(fractional)).toBeUndefined();
    expect(getErrorSpan(negative)).toBeUndefined();
  });
});

//
// * Code contract
//

/**
 * How one error code is provoked. `notation` cases go through the public
 * `roll()` pipeline; `ast` cases hand-build a node the parser can never
 * produce, which is the only way to reach the evaluator's exhaustiveness
 * defaults.
 */
type CodeCase = { notation: string; options?: RollOptions } | { ast: ASTNode; why: string };

// ? Deliberately outside the `ASTNode` union. Reaching `evalNode`'s
//   exhaustiveness default is the whole point, and the parser cannot emit it.
const UNKNOWN_NODE = { type: 'Nonesuch' } as unknown as ASTNode;

// ? Same idea one level down: `evalBinary`'s operator switch is exhaustive
//   over `BinaryOpNode['operator']`, so only a forged operator reaches it.
const UNKNOWN_OPERATOR_NODE = {
  type: 'BinaryOp',
  operator: '^^',
  left: { type: 'Literal', value: 1 },
  right: { type: 'Literal', value: 2 },
} as unknown as ASTNode;

/**
 * Every `RollParserErrorCode` mapped to an input that raises it.
 *
 * The `Record<RollParserErrorCode, …>` annotation is the completeness gate:
 * adding a code to `ROLL_PARSER_ERROR_CODES` without adding a case here is a
 * type error, so the contract cannot silently drift.
 */
const CODE_CASES: Record<RollParserErrorCode, CodeCase> = {
  UNEXPECTED_CHARACTER: { notation: '2d6+&' },
  UNEXPECTED_IDENTIFIER: { notation: '4d6zz' },
  UNEXPECTED_TOKEN: { notation: '1 2' },
  UNEXPECTED_END: { notation: '2d6+' },
  EXPECTED_TOKEN: { notation: '(1+2' },
  INVALID_DICE_COUNT: { notation: '(1/2)d6' },
  INVALID_DICE_SIDES: { notation: '1d0' },
  DICE_LIMIT_EXCEEDED: { notation: '20000d6' },
  DIVISION_BY_ZERO: { notation: '1/0' },
  MODULO_BY_ZERO: { notation: '5%0' },
  UNKNOWN_OPERATOR: {
    ast: UNKNOWN_OPERATOR_NODE,
    why: 'the lexer only emits operators the evaluator switch already covers',
  },
  UNKNOWN_NODE_TYPE: {
    ast: UNKNOWN_NODE,
    why: 'the parser only builds node types the evaluator dispatch already covers',
  },
  INVALID_MODIFIER_COUNT: { notation: '4d6kh(0-1)' },
  INVALID_MODIFIER_TARGET: { notation: '(1d6+5)kh1' },
  EXPLODE_LIMIT_EXCEEDED: { notation: '1d1!' },
  INVALID_EXPLODE_TARGET: { notation: '4dF!' },
  REROLL_LIMIT_EXCEEDED: { notation: '1d1r<2' },
  INVALID_REROLL_TARGET: { notation: '(1d6+5)r<2' },
  INVALID_SUCCESS_COUNT_TARGET: { notation: '(1d6+5)>3' },
  INVALID_SORT_TARGET: { notation: '5s' },
  INVALID_CRIT_THRESHOLD_TARGET: { notation: '5cs>3' },
  // `10**400` overflows to Infinity, which no finite threshold may be.
  INVALID_THRESHOLD: { notation: '2d6cs>(10**400)' },
  NESTED_VERSUS: { notation: '1d20 vs (5 vs 3)' },
  INVALID_FUNCTION_ARITY: { notation: 'floor(1, 2)' },
  UNKNOWN_FUNCTION: {
    ast: { type: 'FunctionCall', name: 'sqrt', args: [{ type: 'Literal', value: 4 }] },
    why: 'the lexer only tokenizes function names the evaluator registry knows',
  },
  UNDEFINED_VARIABLE: { notation: '@str' },
  INVALID_VARIABLE_VALUE: { notation: '@str', options: { context: { str: Number.NaN } } },
  AMBIGUOUS_DICE_CHAIN: { notation: '4d6d1' },
  MAX_DEPTH_EXCEEDED: {
    notation: `${'('.repeat(MAX_PARSE_DEPTH + 1)}1${')'.repeat(MAX_PARSE_DEPTH + 1)}`,
  },
  NON_FINITE_RESULT: { notation: '10**400' },
};

describe('error code contract', () => {
  for (const [code, testCase] of Object.entries(CODE_CASES) as [RollParserErrorCode, CodeCase][]) {
    test(`${code} is raised and typed`, () => {
      const error = captureError(() =>
        'ast' in testCase
          ? evaluate(testCase.ast, createMockRng([]))
          : roll(testCase.notation, { seed: 'code-contract', ...testCase.options }),
      );

      expect(isRollParserError(error)).toBe(true);
      expect((error as RollParserError).code).toBe(code);
      expect((error as Error).message).not.toBe('');
    });
  }
});
