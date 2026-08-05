/**
 * Tests for the shared error contract: codes, span extraction, and the
 * position-out-of-message convention.
 *
 * @module errors.test
 */

import { describe, expect, test } from 'bun:test';
import type { NotationErrorCode, RollParserErrorCode } from './errors.js';
import {
  EvaluatorError,
  getErrorSpan,
  isNotationError,
  isRollParserError,
  NOTATION_ERROR_CODES,
  ROLL_PARSER_ERROR_CODES,
  RollParserError,
  stampEvaluatorSpan,
} from './errors.js';
import { evaluate } from './evaluator/evaluator.js';
import { LexerError, lex } from './lexer/lexer.js';
import type { ASTNode } from './parser/ast.js';
import { MAX_PARSE_DEPTH, ParseError, parse } from './parser/parser.js';
import { createMockRng, MockRNGExhaustedError } from './rng/mock.js';
import { SeededRNG } from './rng/seeded.js';
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

/**
 * A library error as another realm — iframe, `vm` context, second copy — hands
 * it over: a real error there, over a foreign prototype chain carrying the
 * registered brand, which resolves here because the registry is shared.
 *
 * A real `node:vm` context behaves identically, but `noNodejsModules` is an
 * error everywhere under `src/` outside `src/cli/`.
 */
function foreignError(code: string): unknown {
  const foreignErrorPrototype = Object.create(null) as object;
  const prototype = Object.create(foreignErrorPrototype) as object;
  Object.defineProperty(prototype, Symbol.for('roll-parser.error'), { value: true });
  return Object.assign(Object.create(prototype) as object, {
    name: 'EvaluatorError',
    message: 'boom',
    stack: 'EvaluatorError: boom\n    at <other realm>',
    code,
  });
}

describe('isRollParserError', () => {
  test('accepts library errors', () => {
    expect(isRollParserError(new RollParserError('boom', 'UNKNOWN_FUNCTION'))).toBe(true);
    expect(isRollParserError(captureError(() => lex('2d6+&')))).toBe(true);
    expect(isRollParserError(captureError(() => parse('1+')))).toBe(true);
  });

  test('accepts a branded error from another realm', () => {
    const foreign = foreignError('DIVISION_BY_ZERO');

    // The whole point: a realm crossing breaks `instanceof`, brands survive it.
    expect(foreign instanceof Error).toBe(false);
    expect(isRollParserError(foreign)).toBe(true);
  });

  // `RollParserErrorCode` is a deliberately open union, so a copy from a newer
  // minor may carry a code this build has never heard of. The brand is what says
  // it is ours; the code list no longer gates acceptance.
  test('accepts a branded error carrying a code this build does not know', () => {
    expect(isRollParserError(foreignError('SOME_FUTURE_CODE'))).toBe(true);
  });

  // A copy predating the brand has nothing to recognize it by.
  test('rejects a library error from a copy older than the brand (#230)', () => {
    const legacy = Object.assign(new Error('boom'), {
      name: 'LexerError',
      code: 'UNEXPECTED_CHARACTER',
    });

    expect(isRollParserError(legacy)).toBe(false);
  });

  test('rejects a foreign error whose code collides with ours (#230)', () => {
    const foreign = Object.assign(new Error('boom'), { code: 'DIVISION_BY_ZERO' });

    expect(isRollParserError(foreign)).toBe(false);
  });

  test('rejects unrelated values', () => {
    expect(isRollParserError(new Error('boom'))).toBe(false);
    expect(isRollParserError(Object.assign(new Error('boom'), { code: 'ENOENT' }))).toBe(false);
    expect(isRollParserError({ code: 'DIVISION_BY_ZERO' })).toBe(false);
    expect(isRollParserError(undefined)).toBe(false);
  });

  // The documented worker limitation. `structuredClone` keeps `message` and
  // `stack` only, so nothing is left to recognize.
  test('cannot match an error that went through structuredClone (#230)', () => {
    const clone = structuredClone(new RollParserError('boom', 'DIVISION_BY_ZERO'));

    expect('code' in clone).toBe(false);
    expect(isRollParserError(clone)).toBe(false);
  });

  // The hand-built prototypes above never reach the class's own accessor, and a
  // second copy of the library reads exactly this to recognize ours.
  test('every library error carries the brand', () => {
    const brand = Symbol.for('roll-parser.error');
    const errors = [
      new RollParserError('boom', 'DIVISION_BY_ZERO'),
      new LexerError('bad', 'UNEXPECTED_CHARACTER', 0, '&'),
      new ParseError('bad', 'UNEXPECTED_TOKEN', 0),
      new EvaluatorError('bad', 'DIVISION_BY_ZERO', 'Dice'),
    ];

    for (const error of errors) {
      expect((error as unknown as Record<symbol, unknown>)[brand]).toBe(true);
      expect(Object.hasOwn(error, brand)).toBe(false);
    }
  });

  test('the brand stays out of spread and JSON', () => {
    const error = new RollParserError('boom', 'DIVISION_BY_ZERO');

    expect(Object.getOwnPropertySymbols({ ...error })).toEqual([]);
    expect(JSON.parse(JSON.stringify(error))).toEqual({
      name: 'RollParserError',
      code: 'DIVISION_BY_ZERO',
    });
  });
});

describe('isNotationError', () => {
  test('accepts failures the notation caused', () => {
    expect(isNotationError(captureError(() => lex('2d6+&')))).toBe(true);
    expect(isNotationError(captureError(() => parse('1+')))).toBe(true);
    expect(isNotationError(captureError(() => roll('1/0')))).toBe(true);
  });

  test('rejects a bad options object and a broken invariant (#231)', () => {
    const badLimit = captureError(() => roll('1d6', { maxDice: 0 }));
    const brokenInvariant = new RollParserError('boom', 'UNKNOWN_NODE_TYPE');

    expect(isRollParserError(badLimit)).toBe(true);
    expect(isNotationError(badLimit)).toBe(false);
    expect(isRollParserError(brokenInvariant)).toBe(true);
    expect(isNotationError(brokenInvariant)).toBe(false);
  });

  test('accepts a branded error from another realm', () => {
    expect(isNotationError(foreignError('DIVISION_BY_ZERO'))).toBe(true);
    expect(isNotationError(foreignError('INVALID_EVALUATION_LIMIT'))).toBe(false);
  });

  // A brand cannot carry attribution, so unlike `isRollParserError` this one
  // does not take an unknown code on trust.
  test('rejects a branded error carrying a code this build does not know', () => {
    const future = foreignError('SOME_FUTURE_CODE');

    expect(isRollParserError(future)).toBe(true);
    expect(isNotationError(future)).toBe(false);
  });

  test('rejects unrelated values', () => {
    expect(isNotationError(new Error('boom'))).toBe(false);
    expect(isNotationError({ code: 'DIVISION_BY_ZERO' })).toBe(false);
    expect(isNotationError(undefined)).toBe(false);
  });

  test('narrows to the notation code union', () => {
    const error = captureError(() => lex('2d6+&'));

    if (!isNotationError(error)) throw new Error('expected a notation error');

    // Assignable only if `code` narrowed; `RollParserErrorCode` would not fit.
    const code: NotationErrorCode = error.code;
    expect(code).toBe('UNEXPECTED_CHARACTER');
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
  // Positions belong to the structured fields; in prose they force UI consumers
  // to strip a suffix before rendering their own markers.
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

    stampEvaluatorSpan(error, 4, 7);
    stampEvaluatorSpan(error, 0, 9);

    expect(error.start).toBe(4);
    expect(error.end).toBe(7);
  });

  test('an undefined end stamps alongside the start', () => {
    const error = new EvaluatorError('boom', 'DIVISION_BY_ZERO', 'BinaryOp');

    stampEvaluatorSpan(error, 4, undefined);

    expect(error.start).toBe(4);
    expect(error.end).toBeUndefined();
  });

  test('a start of 0 still blocks a re-stamp', () => {
    const error = new EvaluatorError('boom', 'DIVISION_BY_ZERO', 'BinaryOp');

    stampEvaluatorSpan(error, 0, 3);
    stampEvaluatorSpan(error, 5, 9);

    expect(error.start).toBe(0);
    expect(error.end).toBe(3);
  });

  test('the stamping method is not on the class (#232)', () => {
    const error = new EvaluatorError('boom', 'DIVISION_BY_ZERO', 'BinaryOp');

    expect('stampSpan' in error).toBe(false);
    expect(Object.getOwnPropertySymbols(EvaluatorError.prototype)).toEqual([]);
  });
});

describe('errors outside the hierarchy (#232)', () => {
  test('MockRNGExhaustedError carries no code and is not ours', () => {
    const error = captureError(() => roll('4d6', { rng: createMockRng([1, 2, 3]) }));

    expect(error).toBeInstanceOf(MockRNGExhaustedError);
    expect(error).not.toBeInstanceOf(RollParserError);
    expect(isRollParserError(error)).toBe(false);
    expect(error).not.toHaveProperty('code');
  });

  test('an out-of-range scripted value escapes as a bare RangeError', () => {
    const error = captureError(() => roll('1d6', { rng: createMockRng([7]) }));

    expect(error).toBeInstanceOf(RangeError);
    expect(isRollParserError(error)).toBe(false);
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
 * defaults; `call` cases reach a code raised outside the notation pipeline
 * altogether.
 */
type CodeCase =
  | { notation: string; options?: RollOptions }
  | { ast: ASTNode; why: string }
  | { call: () => unknown; why: string };

// Forged node type — the parser cannot emit one, so this is the only path to
// `evalNode`'s exhaustiveness default.
const UNKNOWN_NODE = { type: 'Nonesuch' } as unknown as ASTNode;

// Forged operator — same idea one level down, for `evalBinary`'s switch default.
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
  INVALID_KEEP_DROP_COUNT: { notation: '4d6kh(0-1)' },
  INVALID_KEEP_DROP_TARGET: { notation: '(1d6+5)kh1' },
  EXPLODE_LIMIT_EXCEEDED: { notation: '1d1!' },
  INVALID_EXPLODE_TARGET: { notation: '4dF!' },
  REROLL_LIMIT_EXCEEDED: { notation: '1d1r<2' },
  INVALID_REROLL_TARGET: { notation: '(1d6+5)r<2' },
  INVALID_SUCCESS_COUNT_TARGET: { notation: '(1d6+5)>3' },
  INVALID_SORT_TARGET: { notation: '5s' },
  INVALID_CRIT_THRESHOLD_TARGET: { notation: '5cs>3' },
  INVALID_DIE_BOUND_TARGET: { notation: '5min2' },
  // `10**400` overflows to Infinity, which no finite threshold may be.
  INVALID_THRESHOLD: { notation: '2d6cs>(10**400)' },
  NESTED_VERSUS: { notation: '1d20 vs (5 vs 3)' },
  INVALID_FUNCTION_ARITY: { notation: 'floor(1, 2)' },
  UNKNOWN_FUNCTION: {
    ast: { type: 'FunctionCall', name: 'nonesuch', args: [{ type: 'Literal', value: 4 }] },
    why: 'the lexer only tokenizes function names the evaluator registry knows',
  },
  UNDEFINED_VARIABLE: { notation: '@str' },
  INVALID_VARIABLE_VALUE: { notation: '@str', options: { context: { str: Number.NaN } } },
  AMBIGUOUS_DICE_CHAIN: { notation: '4d6d1' },
  MAX_DEPTH_EXCEEDED: {
    notation: `${'('.repeat(MAX_PARSE_DEPTH + 1)}1${')'.repeat(MAX_PARSE_DEPTH + 1)}`,
  },
  NON_FINITE_RESULT: { notation: '10**400' },
  INCOMPATIBLE_RNG_STATE: {
    call: () => new SeededRNG([99, 1, 2, 3, 4]),
    why: 'restoring a snapshot is an RNG operation, not a notation one',
  },
  INVALID_EVALUATION_LIMIT: { notation: '1d6', options: { maxDice: 0 } },
  INVALID_NOTATION_TYPE: {
    call: () => roll(null as unknown as string),
    why: 'the case is a non-string notation, which the `notation` field cannot express',
  },
};

/**
 * Whether each code is attributable to the input rather than to the calling code
 * or to a broken invariant in here.
 *
 * The `Record<RollParserErrorCode, …>` annotation is the second completeness
 * gate, working the same way as `CODE_CASES`: adding a code without classifying
 * it here is a type error, so `NOTATION_ERROR_CODES` cannot silently omit one.
 */
const IS_NOTATION_CODE: Record<RollParserErrorCode, boolean> = {
  UNEXPECTED_CHARACTER: true,
  UNEXPECTED_IDENTIFIER: true,
  UNEXPECTED_TOKEN: true,
  UNEXPECTED_END: true,
  EXPECTED_TOKEN: true,
  INVALID_DICE_COUNT: true,
  INVALID_DICE_SIDES: true,
  DICE_LIMIT_EXCEEDED: true,
  DIVISION_BY_ZERO: true,
  MODULO_BY_ZERO: true,
  UNKNOWN_OPERATOR: false,
  UNKNOWN_NODE_TYPE: false,
  INVALID_KEEP_DROP_COUNT: true,
  INVALID_KEEP_DROP_TARGET: true,
  EXPLODE_LIMIT_EXCEEDED: true,
  INVALID_EXPLODE_TARGET: true,
  REROLL_LIMIT_EXCEEDED: true,
  INVALID_REROLL_TARGET: true,
  INVALID_SUCCESS_COUNT_TARGET: true,
  INVALID_SORT_TARGET: true,
  INVALID_CRIT_THRESHOLD_TARGET: true,
  INVALID_DIE_BOUND_TARGET: true,
  INVALID_THRESHOLD: true,
  NESTED_VERSUS: true,
  INVALID_FUNCTION_ARITY: true,
  UNKNOWN_FUNCTION: false,
  UNDEFINED_VARIABLE: true,
  INVALID_VARIABLE_VALUE: false,
  AMBIGUOUS_DICE_CHAIN: true,
  MAX_DEPTH_EXCEEDED: true,
  NON_FINITE_RESULT: true,
  INCOMPATIBLE_RNG_STATE: false,
  INVALID_EVALUATION_LIMIT: false,
  INVALID_NOTATION_TYPE: true,
};

describe('notation code contract', () => {
  test('the exported tuple matches the classification, in code order', () => {
    const classified = ROLL_PARSER_ERROR_CODES.filter((code) => IS_NOTATION_CODE[code]);
    const exported: RollParserErrorCode[] = [...NOTATION_ERROR_CODES];

    expect(exported).toEqual(classified);
  });

  test('the excluded codes are the three options cases and the three invariants', () => {
    const excluded = ROLL_PARSER_ERROR_CODES.filter((code) => !IS_NOTATION_CODE[code]);

    expect(excluded).toEqual([
      'UNKNOWN_OPERATOR',
      'UNKNOWN_NODE_TYPE',
      'UNKNOWN_FUNCTION',
      'INVALID_VARIABLE_VALUE',
      'INCOMPATIBLE_RNG_STATE',
      'INVALID_EVALUATION_LIMIT',
    ]);
  });

  // Prose, so `readme.test.ts` never executes it — nothing else catches the drift.
  test('README lists exactly the excluded codes', async () => {
    const readme = await Bun.file(new URL('../README.md', import.meta.url)).text();
    const section = readme.slice(
      readme.indexOf('### Notation errors'),
      readme.indexOf('### Error classes'),
    );
    const rows = section.split('\n').filter((line) => line.startsWith('| '));
    const listed = rows
      .flatMap((row) => [...row.matchAll(/`([A-Z][A-Z0-9_]*)`/g)])
      .map((match) => match[1] ?? '');
    const excluded = ROLL_PARSER_ERROR_CODES.filter((code) => !IS_NOTATION_CODE[code]);

    expect(listed.sort()).toEqual([...excluded].sort());
  });

  // `INVALID_NOTATION_TYPE` is the one code with no bare notation case, because a
  // non-string notation is not a string to pass.
  test('every included code but INVALID_NOTATION_TYPE has a bare notation case', () => {
    for (const code of NOTATION_ERROR_CODES) {
      if (code === 'INVALID_NOTATION_TYPE') continue;
      const testCase = CODE_CASES[code];

      expect('notation' in testCase && testCase.options === undefined).toBe(true);
    }
  });
});

describe('error code contract', () => {
  test('README quotes the current code count', async () => {
    // Prose, so `readme.test.ts` never executes it — nothing else catches the drift.
    const readme = await Bun.file(new URL('../README.md', import.meta.url)).text();
    const quoted = readme.match(/union of (\d+) codes/)?.[1];

    expect(quoted).toBe(String(ROLL_PARSER_ERROR_CODES.length));
  });

  for (const [code, testCase] of Object.entries(CODE_CASES) as [RollParserErrorCode, CodeCase][]) {
    test(`${code} is raised and typed`, () => {
      const error = captureError(() => {
        if ('call' in testCase) return testCase.call();
        if ('ast' in testCase) return evaluate(testCase.ast, createMockRng([]));
        return roll(testCase.notation, { seed: 'code-contract', ...testCase.options });
      });

      expect(isRollParserError(error)).toBe(true);
      expect((error as RollParserError).code).toBe(code);
      expect((error as Error).message).not.toBe('');
      expect(isNotationError(error)).toBe(IS_NOTATION_CODE[code]);
    });
  }
});
