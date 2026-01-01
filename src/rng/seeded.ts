/**
 * Seedable RNG using xorshift128 algorithm.
 *
 * @module rng/seeded
 */

import type { RNG } from './types';

/**
 * Seedable pseudo-random number generator using xorshift128.
 *
 * Produces reproducible sequences from identical seeds.
 * Period: 2^128 - 1
 *
 * @example
 * ```typescript
 * // Same seed = same sequence
 * const rng1 = new SeededRNG('test-seed');
 * const rng2 = new SeededRNG('test-seed');
 * rng1.nextInt(1, 6) === rng2.nextInt(1, 6); // true
 * ```
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

    // Warm-up: discard first 20 values for better initial distribution
    for (let i = 0; i < 20; i++) {
      this.nextUint32();
    }
  }

  private initState(seed?: string | number): void {
    const numSeed =
      seed == null
        ? (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0
        : typeof seed === 'string'
          ? this.hashString(seed)
          : seed >>> 0;

    // Split seed into 4 state values using splitmix32
    let s = numSeed;
    const state: number[] = [];

    for (let i = 0; i < 4; i++) {
      s = (s + 0x9e3779b9) >>> 0;
      let z = s;
      z = Math.imul(z ^ (z >>> 16), 0x85ebca6b) >>> 0;
      z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35) >>> 0;
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

  private hashString(str: string): number {
    // djb2 hash algorithm
    let hash = 5381;
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

  next(): number {
    // Convert uint32 to [0, 1) float
    return this.nextUint32() / 0x100000000;
  }

  nextInt(min: number, max: number): number {
    // Handle inverted bounds
    const lo = min > max ? max : min;
    const hi = min > max ? min : max;

    const range = hi - lo + 1;

    // Single value case
    if (range <= 1) {
      return lo;
    }

    // Rejection sampling for unbiased distribution
    // Avoids modulo bias by rejecting values that would cause uneven distribution
    const threshold = (0x100000000 - range) % range;
    let value: number;
    do {
      value = this.nextUint32();
    } while (value < threshold);

    return lo + (value % range);
  }
}
