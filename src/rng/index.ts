/**
 * RNG module - Seedable random number generation.
 *
 * @module rng
 */

export type { RNG } from './types';
export { SeededRNG } from './seeded';
export { createMockRng, MockRNGExhaustedError } from './mock';
