import { describe, expect, it } from 'bun:test';
import { ParseError } from './parser/parser.js';
import { expectRollError } from './test-helpers.js';

describe('expectRollError', () => {
  const throwParseError = () => {
    throw new ParseError('boom', 'UNEXPECTED_TOKEN', 0);
  };

  it('returns the caught error for further assertions', () => {
    const error = expectRollError(throwParseError, ParseError, 'UNEXPECTED_TOKEN');

    expect(error.message).toBe('boom');
  });

  it('fails when nothing is thrown', () => {
    expect(() => expectRollError(() => 42, ParseError, 'UNEXPECTED_TOKEN')).toThrow(
      'nothing was thrown',
    );
  });

  it('fails when a different error type is thrown', () => {
    expect(() =>
      expectRollError(
        () => {
          throw new TypeError('wrong');
        },
        ParseError,
        'UNEXPECTED_TOKEN',
      ),
    ).toThrow('Expected ParseError');
  });
});
