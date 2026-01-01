/**
 * Mock RNG for deterministic testing.
 *
 * @module rng/mock
 */

import type { RNG } from './types';

/**
 * Error thrown when MockRNG exhausts its predefined values.
 *
 * This is intentional behavior to catch incorrect roll counts in tests.
 * If you see this error, your test is consuming more random values than expected.
 */
export class MockRNGExhaustedError extends Error {
  readonly consumed: number;

  constructor(consumed: number) {
    super(`MockRNG exhausted: consumed ${consumed} values, no more available`);
    this.name = 'MockRNGExhaustedError';
    this.consumed = consumed;
  }
}

/**
 * Creates a mock RNG that returns predefined values in sequence.
 *
 * IMPORTANT: Throws MockRNGExhaustedError when all values are consumed.
 * This behavior catches incorrect roll counts in tests - it never wraps around.
 *
 * @param values - Array of values to return (dice results for nextInt, floats for next)
 * @returns RNG instance returning predefined values
 *
 * @example
 * ```typescript
 * const rng = createMockRng([4, 2, 6]);
 * rng.nextInt(1, 6);  // Returns 4
 * rng.nextInt(1, 6);  // Returns 2
 * rng.nextInt(1, 6);  // Returns 6
 * rng.nextInt(1, 6);  // Throws MockRNGExhaustedError
 * ```
 */
export function createMockRng(values: number[]): RNG {
  let index = 0;

  const getNext = (): number => {
    const value = values[index];
    if (value === undefined) {
      throw new MockRNGExhaustedError(index);
    }
    index++;
    return value;
  };

  return {
    next: getNext,
    nextInt: (_min: number, _max: number): number => getNext(),
  };
}
