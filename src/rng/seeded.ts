/**
 * Seedable RNG using xorshift128 algorithm.
 *
 * @module rng/seeded
 */

import type { RNG } from './types.js';

/**
 * Draws discarded after seeding. cyrb128's four outputs are XOR-derived from
 * one another, so a short run-in is a cheap hedge against that correlation
 * surfacing in the first draws.
 */
const WARMUP_DRAWS = 8;

/** 2^32 — the size of the uint32 output space. */
const UINT32_SPACE = 0x100000000;

/** 2^53 — the widest integer JavaScript numbers represent exactly. */
const MAX_EXACT_INT = 2 ** 53;

/** 2^21 — shift applied to the high draw when composing a 53-bit value. */
const HIGH_DRAW_SCALE = 0x200000;

/** Bits discarded from the low draw so the two draws total 53 bits. */
const LOW_DRAW_SHIFT = 11;

/** cyrb128 offset basis — one per output word. */
const CYRB128_BASIS_1 = 1779033703;
const CYRB128_BASIS_2 = 3144134277;
const CYRB128_BASIS_3 = 1013904242;
const CYRB128_BASIS_4 = 2773480762;

/** cyrb128 mixing multipliers — one per output word. */
const CYRB128_MULTIPLIER_1 = 597399067;
const CYRB128_MULTIPLIER_2 = 2869860233;
const CYRB128_MULTIPLIER_3 = 951274213;
const CYRB128_MULTIPLIER_4 = 2716044179;

/**
 * Seedable pseudo-random number generator using xorshift128. The default
 * randomness source — `roll(notation)` builds one per call, and
 * `roll(notation, { seed })` builds one from your seed.
 *
 * Period 2^128 - 1. Every seed is stringified and hashed with cyrb128 into
 * the full 128-bit state, so numeric seeds keep all 53 bits and distinct
 * strings stay distinct; an omitted seed mixes `Date.now()` with
 * `Math.random()`. The first 8 draws are discarded as a run-in.
 *
 * Stringifying means `42` and `'42'` are the same seed — the two forms share
 * one namespace, which matters when seeds arrive from a CLI flag or JSON.
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
 * roll('1d20', { rng }).total; // 14
 * roll('1d20', { rng }).total; // 19 — the stream moved on
 * roll('1d20', { seed: 'demo' }).total; // 14, every single time
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
    this.s0 = 0;
    this.s1 = 0;
    this.s2 = 0;
    this.s3 = 0;

    this.initState(seed);

    for (let i = 0; i < WARMUP_DRAWS; i++) {
      this.nextUint32();
    }
  }

  private initState(seed?: string | number): void {
    this.hashSeed(this.toSeedString(seed));

    // All-zero is a fixed point for xorshift — at least one word must be non-zero.
    if (this.s0 === 0 && this.s1 === 0 && this.s2 === 0 && this.s3 === 0) {
      this.s0 = 1;
    }
  }

  /**
   * Normalizes the constructor seed into a string. Numbers are stringified
   * rather than coerced to uint32, so all 53 exact bits reach the hash.
   */
  private toSeedString(seed?: string | number): string {
    if (seed == null) return String((Date.now() ^ (Math.random() * 0xffffffff)) >>> 0);
    return String(seed);
  }

  /** cyrb128 — hashes the seed into all four state words at once. */
  private hashSeed(str: string): void {
    let h1 = CYRB128_BASIS_1;
    let h2 = CYRB128_BASIS_2;
    let h3 = CYRB128_BASIS_3;
    let h4 = CYRB128_BASIS_4;

    for (let i = 0; i < str.length; i++) {
      const k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, CYRB128_MULTIPLIER_1);
      h2 = h3 ^ Math.imul(h2 ^ k, CYRB128_MULTIPLIER_2);
      h3 = h4 ^ Math.imul(h3 ^ k, CYRB128_MULTIPLIER_3);
      h4 = h1 ^ Math.imul(h4 ^ k, CYRB128_MULTIPLIER_4);
    }

    h1 = Math.imul(h3 ^ (h1 >>> 18), CYRB128_MULTIPLIER_1);
    h2 = Math.imul(h4 ^ (h2 >>> 22), CYRB128_MULTIPLIER_2);
    h3 = Math.imul(h1 ^ (h3 >>> 17), CYRB128_MULTIPLIER_3);
    h4 = Math.imul(h2 ^ (h4 >>> 19), CYRB128_MULTIPLIER_4);

    const mixed = h1 ^ h2 ^ h3 ^ h4;

    this.s0 = mixed >>> 0;
    this.s1 = (h2 ^ mixed) >>> 0;
    this.s2 = (h3 ^ mixed) >>> 0;
    this.s3 = (h4 ^ mixed) >>> 0;
  }

  private nextUint32(): number {
    // xorshift128 — the 11/8/19 shift triple is part of the algorithm, not a tunable.
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
    const lo = min > max ? max : min;
    const hi = min > max ? min : max;

    const range = hi - lo + 1;

    if (range <= 1) {
      return lo;
    }

    // Ranges wider than 2^32 need two draws — a single uint32 can never
    // produce the upper part of the range and would silently truncate it.
    if (range > UINT32_SPACE) {
      return lo + this.nextBoundedWide(range);
    }

    // Rejection sampling: discard the leading `[0, threshold)` values so the
    // accepted zone `[threshold, 2^32)` is an exact multiple of `range`.
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

    // Largest multiple of `range` below 2^53 — values at or above it would bias the modulo.
    const limit = Math.floor(MAX_EXACT_INT / range) * range;
    let value: number;
    do {
      // 32 high bits shifted up by 21 + top 21 bits of a second draw = 53 bits.
      value = this.nextUint32() * HIGH_DRAW_SCALE + (this.nextUint32() >>> LOW_DRAW_SHIFT);
    } while (value >= limit);

    return value % range;
  }
}
