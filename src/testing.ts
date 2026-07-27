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

/**
 * Re-export of the core `RNG` interface, so a test file that only imports
 * from `roll-parser/testing` can still type a hand-written generator.
 *
 * @category Testing
 */
export type { RNG } from './rng/types.js';

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
 * Draw order matters when the notation contains meta-expressions. Keep/drop
 * counts (`4d6kh(1d2)`) are drawn *before* the pool; threshold expressions
 * (`4d6cs>(1d2)`) are drawn *after* it. The README's Randomness section has
 * the full tables.
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
export const createMockRng = createMockRngImpl;

/**
 * Error thrown when a mock RNG runs out of predefined values.
 *
 * This is intentional behavior, not a limitation: a mock that wrapped around
 * would silently pass a test whose expression rolls more dice than the author
 * thought. Seeing it means the expression consumed more draws than the test
 * supplied — count the dice, including explosions, rerolls, and
 * meta-expressions, and check the draw order in the README.
 *
 * Exported as both a value and a type, so `instanceof` narrowing and
 * `catch (error: unknown)` annotations both work.
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
 * }
 * ```
 *
 * @category Testing
 */
export const MockRNGExhaustedError = MockRNGExhaustedErrorImpl;

/**
 * Instance type of {@link MockRNGExhaustedError}.
 *
 * @category Testing
 */
export type MockRNGExhaustedError = MockRNGExhaustedErrorImpl;
