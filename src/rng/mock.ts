/**
 * Mock RNG for deterministic testing.
 *
 * @module rng/mock
 */

import type { RNG } from './types.js';

/**
 * Error thrown when a mock RNG runs out of predefined values.
 *
 * This is intentional behavior, not a limitation: a mock that wrapped around
 * would silently pass a test whose expression rolls more dice than the author
 * thought. Seeing this error means the notation consumed more draws than the
 * sequence supplied — count the dice, including explosions, rerolls, and
 * meta-expressions, and check the draw order in the roll-parser README.
 *
 * @example
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng, MockRNGExhaustedError } from 'roll-parser/testing';
 *
 * try {
 *   roll('4d6', { rng: createMockRng([1, 2, 3]) });
 * } catch (error) {
 *   error instanceof MockRNGExhaustedError; // true
 *   (error as MockRNGExhaustedError).consumed; // 3
 *   (error as Error).message;
 *   // 'MockRNG exhausted: consumed 3 values, no more available'
 * }
 * ```
 *
 * @category Testing
 */
export class MockRNGExhaustedError extends Error {
  /**
   * How many values the sequence handed out before running dry — equivalently,
   * the length of the array that was passed to `createMockRng`. Compare it
   * against the dice you expected to be rolled to find the miscount.
   */
  readonly consumed: number;

  constructor(consumed: number) {
    super(`MockRNG exhausted: consumed ${consumed} values, no more available`);
    this.name = 'MockRNGExhaustedError';
    this.consumed = consumed;
  }
}

/**
 * Creates a mock {@link RNG} that hands out predefined values in order — the
 * way to write dice tests with exact expected totals.
 *
 * Two deliberate strictnesses, both there to surface a miscounted sequence
 * instead of hiding it:
 *
 * - It never wraps around. Running out throws {@link MockRNGExhaustedError}.
 * - `nextInt` rejects a scripted value outside the requested `[min, max]`
 *   with a `RangeError`, so `createMockRng([7])` cannot satisfy a `d6`.
 *
 * @param values - Values to return, in draw order (die faces for `nextInt`,
 *   floats in `[0, 1)` for `next`)
 * @returns An `RNG` that replays `values`
 *
 * @example
 * ```typescript
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const rng = createMockRng([4, 2, 6]);
 * rng.nextInt(1, 6);  // 4
 * rng.nextInt(1, 6);  // 2
 * rng.nextInt(1, 6);  // 6
 * rng.nextInt(1, 6);  // throws MockRNGExhaustedError
 * ```
 *
 * @example Pinning a roll
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
 * result.total; // 14
 * result.rendered; // '4d6[3, 6, ~~2~~, 5] = 14'
 * ```
 *
 * @category Testing
 */
export function createMockRng(values: number[]): RNG {
  let index = 0;

  const getNext = (): number => {
    const value = values[index];
    if (value == null) {
      throw new MockRNGExhaustedError(index);
    }
    index++;
    return value;
  };

  return {
    next: getNext,
    nextInt: (min: number, max: number): number => {
      const value = getNext();
      if (value < min || value > max) {
        throw new RangeError(`MockRNG value ${value} is out of bounds [${min}, ${max}]`);
      }
      return value;
    },
  };
}
