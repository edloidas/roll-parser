/**
 * Random Number Generator interface.
 *
 * All dice rolling MUST use this interface - never use Math.random() directly.
 *
 * @module rng/types
 */

/**
 * Random Number Generator interface for dice rolling.
 */
export type RNG = {
  /**
   * Returns a random floating-point number in the range [0, 1).
   */
  next(): number;

  /**
   * Returns a random integer in the inclusive range [min, max].
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  nextInt(min: number, max: number): number;
};
