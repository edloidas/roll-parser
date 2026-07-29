/**
 * Test utilities for roll-parser consumers.
 *
 * Import from `roll-parser/testing` for deterministic dice testing. The full
 * TSDoc lives on the implementations in `./rng/mock.ts`; this entry point is
 * a plain re-export barrel.
 *
 * @module testing
 */

export { createMockRng, MockRNGExhaustedError } from './rng/mock.js';
export type { RNG } from './rng/types.js';
