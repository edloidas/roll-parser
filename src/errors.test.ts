/**
 * Tests for the shared error contract: codes, span extraction, and the
 * position-out-of-message convention.
 *
 * @module errors.test
 */

import { describe, expect, test } from 'bun:test';
import { EvaluatorError, getErrorSpan, isRollParserError, RollParserError } from './errors.js';
import { evaluate } from './evaluator/evaluator.js';
import { LexerError, lex } from './lexer/lexer.js';
import { ParseError, parse } from './parser/parser.js';
import { createMockRng } from './rng/mock.js';

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
