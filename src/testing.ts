/**
 * Test utilities for roll-parser consumers.
 *
 * Import from `roll-parser/testing` for deterministic dice testing.
 *
 * @module testing
 */

// ! Bun 1.3.11's bundler emits a bare `export { createMockRng,
//   MockRNGExhaustedError };` with no bindings when this module is a pure
//   `export ... from` re-export, so `dist/testing.js` fails to load under both
//   Bun and Node. Re-binding through local consts forces the implementations to
//   be inlined. Retry the plain re-export after the next Bun bump.
import {
  createMockRng as createMockRngImpl,
  MockRNGExhaustedError as MockRNGExhaustedErrorImpl,
} from './rng/mock.js';

export type { RNG } from './rng/types.js';

/**
 * Creates a mock RNG that returns predefined values in sequence.
 *
 * IMPORTANT: Throws `MockRNGExhaustedError` when all values are consumed.
 * This behavior catches incorrect roll counts in tests — it never wraps around.
 * `nextInt` additionally rejects values outside the requested `[min, max]`.
 *
 * @param values - Values to return (dice results for `nextInt`, floats for `next`)
 * @returns RNG instance returning the predefined values
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
export const createMockRng = createMockRngImpl;

/**
 * Error thrown when a mock RNG exhausts its predefined values.
 *
 * This is intentional behavior to catch incorrect roll counts in tests. Seeing
 * it means the expression consumed more random values than the test supplied —
 * check the draw order documented in `.claude/rules/rng.md`.
 */
export const MockRNGExhaustedError = MockRNGExhaustedErrorImpl;

/** Instance type of {@link MockRNGExhaustedError}. */
export type MockRNGExhaustedError = MockRNGExhaustedErrorImpl;
