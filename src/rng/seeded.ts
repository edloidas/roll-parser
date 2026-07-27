/**
 * Seedable RNG using xorshift128 algorithm.
 *
 * @module rng/seeded
 */

import type { RNG } from './types.js';

/**
 * Draws discarded after seeding. xorshift128 needs a short run-in before its
 * low bits decorrelate from the splitmix32 state expansion.
 */
const WARMUP_DRAWS = 20;

/** 2^32 — the size of the uint32 output space. */
const UINT32_SPACE = 0x100000000;

/** 2^53 — the widest integer JavaScript numbers represent exactly. */
const MAX_EXACT_INT = 2 ** 53;

/** 2^21 — shift applied to the high draw when composing a 53-bit value. */
const HIGH_DRAW_SCALE = 0x200000;

/** Bits discarded from the low draw so the two draws total 53 bits. */
const LOW_DRAW_SHIFT = 11;

/** splitmix32 increment (32-bit golden ratio). */
const GOLDEN_RATIO_32 = 0x9e3779b9;

/** splitmix32 mixing multipliers. */
const SPLITMIX_MULTIPLIER_1 = 0x85ebca6b;
const SPLITMIX_MULTIPLIER_2 = 0xc2b2ae35;

/** djb2 hash offset basis. */
const DJB2_SEED = 5381;

/**
 * Seedable pseudo-random number generator using xorshift128. The default
 * randomness source — `roll(notation)` builds one per call, and
 * `roll(notation, { seed })` builds one from your seed.
 *
 * Period 2^128 - 1. String seeds are hashed (djb2), numeric seeds are
 * coerced to uint32, and an omitted seed mixes `Date.now()` with
 * `Math.random()`. The first 20 draws are discarded so low bits decorrelate
 * from the seed expansion.
 *
 * Reproducibility guarantee: within one released version, the same seed and
 * the same notation always produce the same dice. The sequence is *not*
 * cryptographically secure and is not guaranteed stable across major
 * versions — do not persist rolls by re-deriving them from a seed, persist
 * the {@link RollResult}.
 *
 * @example
 * ```typescript
 * import { SeededRNG, roll } from 'roll-parser';
 *
 * // Same seed = same sequence
 * const a = new SeededRNG('test-seed');
 * const b = new SeededRNG('test-seed');
 * a.nextInt(1, 6) === b.nextInt(1, 6); // true
 *
 * // An injected instance keeps advancing across rolls; `{ seed }` restarts
 * // the stream on every call.
 * const rng = new SeededRNG('demo');
 * roll('1d20', { rng }).total; // 12
 * roll('1d20', { rng }).total; // 14 — the stream moved on
 * roll('1d20', { seed: 'demo' }).total; // 12, every single time
 * ```
 *
 * @category RNG
 */
export class SeededRNG implements RNG {
  private s0: number;
  private s1: number;
  private s2: number;
  private s3: number;

  constructor(seed?: string | number) {
    // Initialize state to zero, will be set by initState
    this.s0 = 0;
    this.s1 = 0;
    this.s2 = 0;
    this.s3 = 0;

    this.initState(seed);

    // Warm-up: discard the first draws for better initial distribution
    for (let i = 0; i < WARMUP_DRAWS; i++) {
      this.nextUint32();
    }
  }

  private initState(seed?: string | number): void {
    const numSeed = this.toNumericSeed(seed);

    // Split seed into 4 state values using splitmix32
    let s = numSeed;
    const state: number[] = [];

    for (let i = 0; i < 4; i++) {
      s = (s + GOLDEN_RATIO_32) >>> 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), SPLITMIX_MULTIPLIER_1) >>> 0;
      z = Math.imul(z ^ (z >>> 13), SPLITMIX_MULTIPLIER_2) >>> 0;
      state.push((z ^ (z >>> 16)) >>> 0);
    }

    this.s0 = state[0] ?? 0;
    this.s1 = state[1] ?? 0;
    this.s2 = state[2] ?? 0;
    this.s3 = state[3] ?? 0;

    // Ensure non-zero state (xorshift requires at least one non-zero)
    if (this.s0 === 0 && this.s1 === 0 && this.s2 === 0 && this.s3 === 0) {
      this.s0 = 1;
    }
  }

  /** Normalizes the constructor seed into a uint32. */
  private toNumericSeed(seed?: string | number): number {
    if (seed == null) return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
    if (typeof seed === 'string') return this.hashString(seed);
    return seed >>> 0;
  }

  private hashString(str: string): number {
    // djb2 hash algorithm
    let hash = DJB2_SEED;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  private nextUint32(): number {
    // xorshift128 algorithm
    let t = this.s3;
    const s = this.s0;

    this.s3 = this.s2;
    this.s2 = this.s1;
    this.s1 = s;

    t ^= t << 11;
    t ^= t >>> 8;
    this.s0 = (t ^ s ^ (s >>> 19)) >>> 0;

    return this.s0;
  }

  /**
   * Returns a float in `[0, 1)`, derived from one uint32 draw. Resolution is
   * 2^-32, not the full 2^-53 a double can hold.
   *
   * Not used by the evaluator — dice go through {@link nextInt}.
   *
   * @returns A float in `[0, 1)`
   */
  next(): number {
    // Convert uint32 to [0, 1) float
    return this.nextUint32() / UINT32_SPACE;
  }

  /**
   * Returns an integer in the inclusive range `[min, max]`, uniformly
   * distributed — rejection sampling removes the modulo bias a plain
   * `% range` would introduce.
   *
   * Bounds handling, in order:
   * - `min > max` is normalized by swapping, so `nextInt(6, 1)` behaves as
   *   `nextInt(1, 6)`. (The mock RNG throws instead; see {@link RNG.nextInt}.)
   * - `min === max` returns that value without consuming a draw.
   * - Ranges wider than 2^32 use two draws composed into a 53-bit value.
   * - Ranges wider than 2^53 cannot be sampled exactly and throw a
   *   `RangeError` rather than silently skewing.
   *
   * @param min - Lower bound, inclusive
   * @param max - Upper bound, inclusive
   * @returns An integer in `[min, max]`
   * @throws {RangeError} If `max - min + 1` exceeds 2^53
   *
   * @example
   * ```typescript
   * import { SeededRNG } from 'roll-parser';
   *
   * const rng = new SeededRNG('demo');
   * rng.nextInt(1, 6); // 1..6
   * rng.nextInt(3, 3); // 3, always
   * rng.nextInt(1, Number.MAX_SAFE_INTEGER); // fine — two-draw path
   * ```
   */
  nextInt(min: number, max: number): number {
    // Handle inverted bounds
    const lo = min > max ? max : min;
    const hi = min > max ? min : max;

    const range = hi - lo + 1;

    // Single value case
    if (range <= 1) {
      return lo;
    }

    // Ranges wider than 2^32 need two draws — a single uint32 can never
    // produce the upper part of the range and would silently truncate it.
    if (range > UINT32_SPACE) {
      return lo + this.nextBoundedWide(range);
    }

    // Rejection sampling for unbiased distribution
    // Avoids modulo bias by rejecting values that would cause uneven distribution
    const threshold = (UINT32_SPACE - range) % range;
    let value: number;
    do {
      value = this.nextUint32();
    } while (value < threshold);

    return lo + (value % range);
  }

  /**
   * Unbiased sampling in `[0, range)` for ranges above 2^32, built from two
   * uint32 draws combined into a 53-bit integer (the largest width JS numbers
   * represent exactly). Ranges beyond 2^53 cannot be sampled without bias —
   * throw instead of silently degrading.
   */
  private nextBoundedWide(range: number): number {
    if (range > MAX_EXACT_INT) {
      throw new RangeError(`nextInt range ${range} exceeds 2^53 and cannot be sampled exactly`);
    }

    // Largest multiple of `range` below 2^53 — values at or above it are
    // rejected to avoid modulo bias.
    const limit = Math.floor(MAX_EXACT_INT / range) * range;
    let value: number;
    do {
      // 32 high bits shifted up by 21 + top 21 bits of a second draw = 53 bits.
      value = this.nextUint32() * HIGH_DRAW_SCALE + (this.nextUint32() >>> LOW_DRAW_SHIFT);
    } while (value >= limit);

    return value % range;
  }
}
