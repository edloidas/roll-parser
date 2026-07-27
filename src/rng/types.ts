/**
 * Random Number Generator interface.
 *
 * All dice rolling MUST use this interface - never use Math.random() directly.
 *
 * @module rng/types
 */

/**
 * Random Number Generator interface for dice rolling.
 *
 * Guaranteed by every implementation:
 *
 * - `next()` returns a float in `[0, 1)`.
 * - `nextInt(min, max)` returns an integer in `[min, max]` when `min <= max`.
 * - `nextInt(n, n)` returns `n`.
 *
 * Deliberately NOT guaranteed: behavior when `min > max`. The two shipped
 * implementations differ, and each difference is load-bearing — see
 * {@link nextInt}. Evaluator code never inverts its bounds, so callers should
 * treat inverted bounds as a programming error rather than an API.
 */
export type RNG = {
  /**
   * Returns a random floating-point number in the range [0, 1).
   */
  next(): number;

  /**
   * Returns a random integer in the inclusive range [min, max].
   *
   * Inverted bounds (`min > max`) are implementation-defined:
   * `SeededRNG` normalizes by swapping them, so `nextInt(6, 1)` yields the
   * same sequence as `nextInt(1, 6)`; the mock RNG from `roll-parser/testing`
   * raises `RangeError`, because a scripted value can never satisfy an empty
   * range and silently accepting it would hide a miscounted test sequence.
   *
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  nextInt(min: number, max: number): number;
};
