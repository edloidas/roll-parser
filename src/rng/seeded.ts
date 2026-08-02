/**
 * Seedable RNG using the xoshiro128** algorithm.
 *
 * @module rng/seeded
 */

import type { RNG } from './types.js';

/**
 * A snapshot of {@link SeededRNG}'s four internal state words, as unsigned
 * 32-bit integers. Pass one back to the constructor to resume the exact
 * sequence it was taken from.
 *
 * Opaque and bound to the major version, the same contract seeds carry: the
 * words mean nothing outside the engine that produced them, and a major
 * release may change that engine. Safe to hold in memory or serialize for a
 * save file; not safe to persist across a major upgrade.
 *
 * @category RNG
 */
export type RngState = readonly [number, number, number, number];

/**
 * Rotates the low 32 bits of `value` left by `bits`, returning a signed int32.
 * Callers that need the unsigned reading apply `>>> 0` themselves.
 */
const rotl = (value: number, bits: number): number => (value << bits) | (value >>> (32 - bits));

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

/** xoshiro128** output-scrambler multipliers and rotations. */
const SCRAMBLE_MULTIPLIER_1 = 5;
const SCRAMBLE_ROTATION = 7;
const SCRAMBLE_MULTIPLIER_2 = 9;

/** xoshiro128** state-transition shift and rotation. */
const STATE_SHIFT = 9;
const STATE_ROTATION = 11;

/** cyrb128 mixing multipliers — one per output word. */
const CYRB128_MULTIPLIER_1 = 597399067;
const CYRB128_MULTIPLIER_2 = 2869860233;
const CYRB128_MULTIPLIER_3 = 951274213;
const CYRB128_MULTIPLIER_4 = 2716044179;

/**
 * Seedable pseudo-random number generator using xoshiro128**. The default
 * randomness source — `roll(notation)` builds one per call, and
 * `roll(notation, { seed })` builds one from your seed.
 *
 * Period 2^128 - 1. Every seed is stringified and hashed with cyrb128 into
 * the full 128-bit state, so numeric seeds keep all 53 bits and distinct
 * strings stay distinct; an omitted seed hashes `Date.now()` together with two
 * `Math.random()` draws, roughly 100 bits of width rather than 32 — enough that
 * auto-seeded generators do not collide, though unpredictability stays bounded
 * by the host engine's `Math.random()` seeding. The first 8 draws are discarded
 * as a run-in.
 *
 * Stringifying means `42` and `'42'` are the same seed — the two forms share
 * one namespace, which matters when seeds arrive from a CLI flag or JSON.
 *
 * {@link state} snapshots the four state words as an {@link RngState}, and
 * passing one to the constructor resumes that exact sequence — restore copies
 * the words verbatim, skipping both the hash and the run-in. The type is the
 * contract: a hand-built tuple is coerced to 32 bits per word, not rejected.
 *
 * Reproducibility guarantee: within one released version, the same seed and
 * the same notation always produce the same dice. The same version binding
 * covers `RngState`. The sequence is *not* cryptographically secure and is not
 * guaranteed stable across major versions — do not persist rolls by
 * re-deriving them from a seed, persist the {@link RollResult}.
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
 * roll('1d20', { rng }).total; // 1
 * roll('1d20', { rng }).total; // 20 — the stream moved on
 * roll('1d20', { seed: 'demo' }).total; // 1, every single time
 * ```
 *
 * @category RNG
 */
export class SeededRNG implements RNG {
  // ! Signed int32 on purpose. Every read below is bitwise, so the sequence is
  // ! identical to uint32 words — but normalizing with `>>> 0` on write costs
  // ! ~2x per draw, since a word above 2^31 leaves V8's Smi representation.
  // ! Exposing a word to a caller needs `>>> 0` at that boundary.
  private s0: number;
  private s1: number;
  private s2: number;
  private s3: number;

  constructor(seed?: string | number | RngState) {
    this.s0 = 0;
    this.s1 = 0;
    this.s2 = 0;
    this.s3 = 0;

    if (seed !== null && typeof seed === 'object') {
      // ! No hashing and no warm-up — either would diverge the resumed stream.
      // ! Signed on write to keep the Smi invariant above; `state()` re-widens.
      this.s0 = seed[0] | 0;
      this.s1 = seed[1] | 0;
      this.s2 = seed[2] | 0;
      this.s3 = seed[3] | 0;
      this.guardZeroState();
      return;
    }

    this.initState(seed);

    for (let i = 0; i < WARMUP_DRAWS; i++) {
      this.nextUint32();
    }
  }

  private initState(seed?: string | number): void {
    this.hashSeed(this.toSeedString(seed));
    this.guardZeroState();
  }

  /** All-zero is a fixed point for xoshiro — at least one word must be non-zero. */
  private guardZeroState(): void {
    if (this.s0 === 0 && this.s1 === 0 && this.s2 === 0 && this.s3 === 0) {
      this.s0 = 1;
    }
  }

  /**
   * Returns the current state as four unsigned 32-bit words. Feeding the
   * snapshot back to the constructor resumes this exact sequence; the source
   * instance is untouched, and the two then advance independently.
   *
   * The words are {@link RngState} — opaque, and stable only within a major
   * version.
   *
   * @returns A snapshot of the four state words
   *
   * @example Replay a roll that was never seeded
   * ```typescript
   * import { SeededRNG, roll } from 'roll-parser';
   *
   * const rng = new SeededRNG();
   * const snapshot = rng.state();
   *
   * const first = roll('1d20', { rng });
   * const replay = roll('1d20', { rng: new SeededRNG(snapshot) });
   * first.total === replay.total; // true
   * ```
   *
   * Not a fork primitive. A restored generator replays the parent's stream, so
   * children taken at different points are the same sequence at an offset, not
   * independent substreams — derive a seed per entity instead.
   *
   * @example Per-entity streams — derive seeds, do not fork state
   * ```typescript
   * import { SeededRNG } from 'roll-parser';
   *
   * const goblin = new SeededRNG('world:goblin');
   * const orc = new SeededRNG('world:orc');
   * ```
   */
  state(): RngState {
    return [this.s0 >>> 0, this.s1 >>> 0, this.s2 >>> 0, this.s3 >>> 0];
  }

  /**
   * Normalizes the constructor seed into a string. Numbers are stringified
   * rather than coerced to uint32, so all 53 exact bits reach the hash.
   */
  private toSeedString(seed?: string | number): string {
    // ! The library's one permitted `Math.random()` site — both draws stay here.
    if (seed == null) return `${Date.now()}-${Math.random()}-${Math.random()}`;
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

    // ! Reference cyrb128 derives the trailing three words against `h1`, not
    // ! `mixed`. The map is invertible, so no entropy is lost — but aligning it
    // ! with the reference rewrites every seeded sequence. Not a cleanup.
    const mixed = h1 ^ h2 ^ h3 ^ h4;

    this.s0 = mixed;
    this.s1 = h2 ^ mixed;
    this.s2 = h3 ^ mixed;
    this.s3 = h4 ^ mixed;
  }

  private nextUint32(): number {
    // xoshiro128** 1.1 — these constants are part of the algorithm, not tunables.
    // ! Scrambling `s1`, not `s0`, is what makes this 1.1; 1.0 used `s0` and was
    // ! withdrawn for it.
    const scrambled = rotl(Math.imul(this.s1, SCRAMBLE_MULTIPLIER_1), SCRAMBLE_ROTATION);
    const result = Math.imul(scrambled, SCRAMBLE_MULTIPLIER_2) >>> 0;

    const t = this.s1 << STATE_SHIFT;

    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;
    this.s2 ^= t;
    this.s3 = rotl(this.s3, STATE_ROTATION);

    return result;
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
