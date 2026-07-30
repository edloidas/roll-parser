import { expect } from 'bun:test';
import type { RollParserError, RollParserErrorCode } from './errors.js';

/**
 * Asserts that `fn` throws `ErrorClass` carrying `code`, and returns the error
 * so call sites can go on to assert spans, tokens, or message text.
 *
 * Replaces the `expect(() => …).toThrow(Class)` + `try`/`catch` + code-check
 * trio the suite used to repeat: the failing call runs once instead of twice,
 * and a call that fails to throw reports that here rather than falling off the
 * end of an empty `catch`.
 */
export function expectRollError<E extends RollParserError>(
  fn: () => unknown,
  ErrorClass: new (...args: never[]) => E,
  code: RollParserErrorCode,
): E {
  try {
    fn();
  } catch (caught) {
    if (!(caught instanceof ErrorClass)) {
      throw new Error(`Expected ${ErrorClass.name}, got ${String(caught)}`);
    }

    expect(caught.code).toBe(code);

    return caught;
  }

  throw new Error(`Expected ${ErrorClass.name} with code ${code}, but nothing was thrown`);
}
