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
 *
 * The evaluator only ever calls `nextInt`, once per die, left to right;
 * `next` exists for implementations that want a float source of their own.
 * Two shipped implementations satisfy the interface — {@link SeededRNG} and
 * the mock from `roll-parser/testing` — and anything structurally compatible
 * works, so a crypto-backed or table-driven generator drops straight in.
 *
 * @example A crypto-backed RNG
 * ```typescript
 * import { roll, type RNG } from 'roll-parser';
 *
 * const cryptoRng: RNG = {
 *   next: () => crypto.getRandomValues(new Uint32Array(1))[0]! / 2 ** 32,
 *   nextInt: (min, max) => min + Math.floor(cryptoRng.next() * (max - min + 1)),
 * };
 *
 * roll('4d6kh3', { rng: cryptoRng }).total; // 3..18
 * ```
 *
 * @example Wrapping an RNG to log every draw
 * ```typescript
 * import { SeededRNG, roll, type RNG } from 'roll-parser';
 *
 * function withLog(inner: RNG, log: number[]): RNG {
 *   return {
 *     next: () => inner.next(),
 *     nextInt: (min, max) => {
 *       const value = inner.nextInt(min, max);
 *       log.push(value);
 *       return value;
 *     },
 *   };
 * }
 *
 * const draws: number[] = [];
 * roll('4d6kh3', { rng: withLog(new SeededRNG('demo'), draws) });
 * draws; // [4, 3, 3, 3] — every face, including the dropped one
 * ```
 *
 * @category RNG
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
