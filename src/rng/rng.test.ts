import { describe, expect, it } from 'bun:test';
import { createMockRng, MockRNGExhaustedError } from './mock.js';
import { SeededRNG } from './seeded.js';
import type { RNG } from './types.js';

describe('SeededRNG', () => {
  /** First ten `nextInt(1, 100)` draws — enough to separate two distinct streams. */
  const draws = (rng: SeededRNG): number[] => Array.from({ length: 10 }, () => rng.nextInt(1, 100));

  describe('reproducibility', () => {
    it('should produce identical sequences from identical numeric seeds', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);

      for (let i = 0; i < 100; i++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });

    it('should produce identical sequences from identical string seeds', () => {
      const rng1 = new SeededRNG('test-seed');
      const rng2 = new SeededRNG('test-seed');

      for (let i = 0; i < 100; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should produce different sequences from different numeric seeds', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(54321);

      const seq1 = Array.from({ length: 10 }, () => rng1.next());
      const seq2 = Array.from({ length: 10 }, () => rng2.next());

      expect(seq1).not.toEqual(seq2);
    });

    it('should produce different sequences from different string seeds', () => {
      const rng1 = new SeededRNG('seed-a');
      const rng2 = new SeededRNG('seed-b');

      const seq1 = Array.from({ length: 10 }, () => rng1.nextInt(1, 100));
      const seq2 = Array.from({ length: 10 }, () => rng2.nextInt(1, 100));

      expect(seq1).not.toEqual(seq2);
    });

    it('should handle empty string seed', () => {
      const rng1 = new SeededRNG('');
      const rng2 = new SeededRNG('');

      expect(rng1.nextInt(1, 6)).toBe(rng2.nextInt(1, 6));
    });

    it('should handle zero seed', () => {
      const rng1 = new SeededRNG(0);
      const rng2 = new SeededRNG(0);

      expect(rng1.nextInt(1, 6)).toBe(rng2.nextInt(1, 6));
    });

    it('should handle large numeric seed', () => {
      const rng1 = new SeededRNG(0xffffffff);
      const rng2 = new SeededRNG(0xffffffff);

      expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
    });

    it('should handle negative numeric seeds', () => {
      const rng1 = new SeededRNG(-12345);
      const rng2 = new SeededRNG(-12345);

      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should keep the fraction of floating-point seeds', () => {
      // Seeds are hashed as `String(seed)`, so '42.999' and '42' are distinct.
      const fractional = draws(new SeededRNG(42.999));
      const whole = draws(new SeededRNG(42));

      expect(fractional).not.toEqual(whole);
      expect(draws(new SeededRNG(42.999))).toEqual(fractional);
    });

    it('should treat NaN as a seed distinct from 0', () => {
      // 'NaN' and '0' are different strings — the old `NaN >>> 0` collapse is gone.
      expect(draws(new SeededRNG(Number.NaN))).not.toEqual(draws(new SeededRNG(0)));
      expect(draws(new SeededRNG(Number.NaN))).toEqual(draws(new SeededRNG(Number.NaN)));
    });

    it('should treat Infinity as a seed distinct from 0', () => {
      const infinite = new SeededRNG(Number.POSITIVE_INFINITY);

      expect(draws(infinite)).not.toEqual(draws(new SeededRNG(0)));
      expect(draws(new SeededRNG(Number.POSITIVE_INFINITY))).toEqual(
        draws(new SeededRNG(Number.POSITIVE_INFINITY)),
      );
    });

    it('should treat a number and its string form as one seed', () => {
      // Every seed is stringified, so `42` and '42' share a namespace.
      expect(draws(new SeededRNG(42))).toEqual(draws(new SeededRNG('42')));
    });

    it('separates two-character string seeds that collided under djb2 (#201)', () => {
      // djb2 is linear for short strings: Δc₀ = +1, Δc₁ = −33 collided.
      expect(draws(new SeededRNG('ab'))).not.toEqual(draws(new SeededRNG('bA')));
    });

    it('separates numeric seeds that aliased under uint32 truncation (#201)', () => {
      expect(draws(new SeededRNG(0))).not.toEqual(draws(new SeededRNG(2 ** 40)));
      expect(draws(new SeededRNG(-1))).not.toEqual(draws(new SeededRNG(2 ** 53 - 1)));
    });

    it('should handle unicode string seeds', () => {
      const rng1 = new SeededRNG('🎲🎮テスト');
      const rng2 = new SeededRNG('🎲🎮テスト');

      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should produce different results for similar string seeds', () => {
      const rng1 = new SeededRNG('seed');
      const rng2 = new SeededRNG('seed1');

      let allSame = true;
      for (let i = 0; i < 10; i++) {
        if (rng1.nextInt(1, 100) !== rng2.nextInt(1, 100)) {
          allSame = false;
          break;
        }
      }
      expect(allSame).toBe(false);
    });
  });

  describe('next()', () => {
    it('should return values in [0, 1) range', () => {
      const rng = new SeededRNG(42);

      for (let i = 0; i < 10000; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should return floating-point numbers', () => {
      const rng = new SeededRNG(42);
      let hasDecimal = false;

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        if (value !== Math.floor(value)) {
          hasDecimal = true;
          break;
        }
      }

      expect(hasDecimal).toBe(true);
    });
  });

  describe('nextInt() bounds', () => {
    it('should return values in [min, max] inclusive (10,000 iterations)', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 6;

      for (let i = 0; i < 10000; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should handle min === max without consuming RNG state', () => {
      const rng = new SeededRNG(42);
      const reference = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        expect(rng.nextInt(5, 5)).toBe(5);
      }

      // Trivial-range early-return must not advance state — the next
      // non-trivial draw must match a fresh RNG with the same seed.
      expect(rng.nextInt(1, 6)).toBe(reference.nextInt(1, 6));
    });

    it('should handle inverted bounds (swap min/max)', () => {
      // nextInt(10, 1) must produce the same sequence as nextInt(1, 10) on the
      // same seed — bounds normalization, not just clamping to range.
      const inverted = new SeededRNG(42);
      const normal = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        expect(inverted.nextInt(10, 1)).toBe(normal.nextInt(1, 10));
      }
    });

    it('should cover ranges wider than 2^32', () => {
      // A single uint32 draw caps out below 2^32 — the wide path must reach
      // the upper part of the range. P(all 1,000 draws < 2^32) ≈ (1/256)^1000.
      const rng = new SeededRNG(42);
      const max = 2 ** 40;
      let sawAbove32Bits = false;

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(1, max);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(max);
        expect(Number.isInteger(value)).toBe(true);
        if (value > 0x100000000) sawAbove32Bits = true;
      }

      expect(sawAbove32Bits).toBe(true);
    });

    it('should support the full safe-integer range', () => {
      const rng = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(1, Number.MAX_SAFE_INTEGER);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should throw RangeError for ranges beyond 2^53', () => {
      const rng = new SeededRNG(42);
      expect(() => rng.nextInt(-(2 ** 53), 2 ** 53)).toThrow(RangeError);
    });

    it('should hit both min and max values (d6)', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 6;
      let hitMin = false;
      let hitMax = false;

      for (let i = 0; i < 10000 && !(hitMin && hitMax); i++) {
        const value = rng.nextInt(min, max);
        if (value === min) hitMin = true;
        if (value === max) hitMax = true;
      }

      expect(hitMin).toBe(true);
      expect(hitMax).toBe(true);
    });

    it('should hit both min and max values (d20)', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 20;
      let hitMin = false;
      let hitMax = false;

      for (let i = 0; i < 10000 && !(hitMin && hitMax); i++) {
        const value = rng.nextInt(min, max);
        if (value === min) hitMin = true;
        if (value === max) hitMax = true;
      }

      expect(hitMin).toBe(true);
      expect(hitMax).toBe(true);
    });

    it('should handle large ranges', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 1000000;

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('should handle negative ranges', () => {
      const rng = new SeededRNG(42);
      const min = -10;
      const max = -1;

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('should handle ranges spanning zero', () => {
      const rng = new SeededRNG(42);
      const min = -5;
      const max = 5;

      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });

    it('should hit both min and max values (d100)', () => {
      const rng = new SeededRNG(42);
      const min = 1;
      const max = 100;
      let hitMin = false;
      let hitMax = false;

      for (let i = 0; i < 50000 && !(hitMin && hitMax); i++) {
        const value = rng.nextInt(min, max);
        if (value === min) hitMin = true;
        if (value === max) hitMax = true;
      }

      expect(hitMin).toBe(true);
      expect(hitMax).toBe(true);
    });

    it('should handle single value range (min === max)', () => {
      const rng = new SeededRNG(42);

      expect(rng.nextInt(7, 7)).toBe(7);
      expect(rng.nextInt(0, 0)).toBe(0);
      expect(rng.nextInt(-5, -5)).toBe(-5);
      expect(rng.nextInt(1000000, 1000000)).toBe(1000000);
    });

    it('should handle range of 2 correctly', () => {
      const rng = new SeededRNG(42);
      let hit0 = false;
      let hit1 = false;

      for (let i = 0; i < 1000 && !(hit0 && hit1); i++) {
        const value = rng.nextInt(0, 1);
        if (value === 0) hit0 = true;
        if (value === 1) hit1 = true;
        expect(value === 0 || value === 1).toBe(true);
      }

      expect(hit0).toBe(true);
      expect(hit1).toBe(true);
    });
  });

  describe('distribution uniformity', () => {
    it('should produce roughly uniform distribution for d6', () => {
      const rng = new SeededRNG(42);
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      const iterations = 60000;

      for (let i = 0; i < iterations; i++) {
        const value = rng.nextInt(1, 6);
        counts[value] = (counts[value] ?? 0) + 1;
      }

      const expected = iterations / 6;
      const tolerance = expected * 0.05;

      for (let i = 1; i <= 6; i++) {
        expect(counts[i]).toBeGreaterThan(expected - tolerance);
        expect(counts[i]).toBeLessThan(expected + tolerance);
      }
    });

    it('should produce roughly uniform distribution for d20', () => {
      const rng = new SeededRNG(42);
      const counts: Record<number, number> = {};
      for (let i = 1; i <= 20; i++) counts[i] = 0;
      const iterations = 100000;

      for (let i = 0; i < iterations; i++) {
        const value = rng.nextInt(1, 20);
        counts[value] = (counts[value] ?? 0) + 1;
      }

      const expected = iterations / 20;
      const tolerance = expected * 0.1; // Looser than d6 — fewer samples per bucket.

      for (let i = 1; i <= 20; i++) {
        expect(counts[i]).toBeGreaterThan(expected - tolerance);
        expect(counts[i]).toBeLessThan(expected + tolerance);
      }
    });

    it('should produce roughly uniform distribution for next()', () => {
      const rng = new SeededRNG(42);
      const buckets = 10;
      const counts: Record<number, number> = {};
      for (let i = 0; i < buckets; i++) counts[i] = 0;
      const iterations = 100000;

      for (let i = 0; i < iterations; i++) {
        const value = rng.next();
        const bucket = Math.floor(value * buckets);
        counts[bucket] = (counts[bucket] ?? 0) + 1;
      }

      const expected = iterations / buckets;
      const tolerance = expected * 0.05;

      for (let i = 0; i < buckets; i++) {
        expect(counts[i]).toBeGreaterThan(expected - tolerance);
        expect(counts[i]).toBeLessThan(expected + tolerance);
      }
    });
  });

  describe('sequence consistency', () => {
    it('should produce identical long sequences from same seed', () => {
      const rng1 = new SeededRNG('consistency-test');
      const rng2 = new SeededRNG('consistency-test');

      for (let i = 0; i < 1000; i++) {
        expect(rng1.nextInt(1, 1000)).toBe(rng2.nextInt(1, 1000));
      }
    });

    it('should produce different sequences after diverging', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      rng1.nextInt(1, 6);

      const seq1 = Array.from({ length: 5 }, () => rng1.nextInt(1, 6));
      const seq2 = Array.from({ length: 5 }, () => rng2.nextInt(1, 6));

      // Same seed, offset by one draw — the streams overlap but the windows differ.
      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('table-driven invariants', () => {
    it('nextInt always returns value in valid range across fixed seeds', () => {
      const testCases = [
        { seed: 1, min: 1, max: 100 },
        { seed: 42, min: 1, max: 6 },
        { seed: 999, min: 10, max: 20 },
        { seed: 12345, min: 1, max: 1000 },
        { seed: 0, min: 50, max: 100 },
      ];

      for (const { seed, min, max } of testCases) {
        const rng = new SeededRNG(seed);
        for (let i = 0; i < 100; i++) {
          const value = rng.nextInt(min, max);
          expect(value).toBeGreaterThanOrEqual(min);
          expect(value).toBeLessThanOrEqual(max);
          expect(Number.isInteger(value)).toBe(true);
        }
      }
    });

    it('next always returns value in [0, 1) across fixed seeds', () => {
      const seeds = [1, 42, 999, 12345, 0, 0xffffffff];

      for (const seed of seeds) {
        const rng = new SeededRNG(seed);
        for (let i = 0; i < 100; i++) {
          const value = rng.next();
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThan(1);
        }
      }
    });

    it('same seed always produces same first value across many seeds', () => {
      const seeds = [0, 1, 42, 999, 12345, 54321, 0xffffffff];

      for (const seed of seeds) {
        const rng1 = new SeededRNG(seed);
        const rng2 = new SeededRNG(seed);
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });
  });
});

describe('MockRNG', () => {
  describe('determinism', () => {
    it('should return predefined values in sequence via nextInt', () => {
      const rng = createMockRng([3, 5, 1, 6]);

      expect(rng.nextInt(1, 6)).toBe(3);
      expect(rng.nextInt(1, 6)).toBe(5);
      expect(rng.nextInt(1, 6)).toBe(1);
      expect(rng.nextInt(1, 6)).toBe(6);
    });

    it('should return predefined values in sequence via next', () => {
      const rng = createMockRng([0.5, 0.25, 0.75]);

      expect(rng.next()).toBe(0.5);
      expect(rng.next()).toBe(0.25);
      expect(rng.next()).toBe(0.75);
    });

    it('should accept values within bounds', () => {
      const rng = createMockRng([4, 15, 20]);

      expect(rng.nextInt(1, 6)).toBe(4);
      expect(rng.nextInt(1, 20)).toBe(15);
      expect(rng.nextInt(1, 100)).toBe(20);
    });

    it('should throw RangeError when value is out of bounds', () => {
      const rng = createMockRng([100]);

      expect(() => rng.nextInt(1, 6)).toThrow(RangeError);

      const rng2 = createMockRng([0]);

      expect(() => rng2.nextInt(1, 6)).toThrow('out of bounds');
    });

    it('should allow mixing next and nextInt calls', () => {
      const rng = createMockRng([0.5, 4, 0.75, 6]);

      expect(rng.next()).toBe(0.5);
      expect(rng.nextInt(1, 6)).toBe(4);
      expect(rng.next()).toBe(0.75);
      expect(rng.nextInt(1, 6)).toBe(6);
    });
  });

  describe('exhaustion', () => {
    it('should throw MockRNGExhaustedError when values exhausted via nextInt', () => {
      const rng = createMockRng([1, 2]);

      rng.nextInt(1, 6);
      rng.nextInt(1, 6);

      expect(() => rng.nextInt(1, 6)).toThrow(MockRNGExhaustedError);
    });

    it('should throw MockRNGExhaustedError when values exhausted via next', () => {
      const rng = createMockRng([0.5]);

      rng.next();

      expect(() => rng.next()).toThrow(MockRNGExhaustedError);
    });

    it('should include consumed count in error', () => {
      const rng = createMockRng([1, 2, 3]);

      rng.nextInt(1, 6);
      rng.nextInt(1, 6);
      rng.nextInt(1, 6);

      try {
        rng.nextInt(1, 6);
        expect.unreachable('expected MockRNGExhaustedError');
      } catch (e) {
        expect(e).toBeInstanceOf(MockRNGExhaustedError);
        expect((e as MockRNGExhaustedError).consumed).toBe(3);
        expect((e as Error).message).toContain('3');
      }
    });

    it('should throw on first call with empty array', () => {
      const rng = createMockRng([]);

      expect(() => rng.nextInt(1, 6)).toThrow(MockRNGExhaustedError);
    });

    it('should have consumed count of 0 for empty array exhaustion', () => {
      const rng = createMockRng([]);

      try {
        rng.nextInt(1, 6);
        expect.unreachable('expected MockRNGExhaustedError');
      } catch (e) {
        expect((e as MockRNGExhaustedError).consumed).toBe(0);
      }
    });
  });

  describe('error properties', () => {
    it('MockRNGExhaustedError should have correct name', () => {
      const error = new MockRNGExhaustedError(5);

      expect(error.name).toBe('MockRNGExhaustedError');
    });

    it('MockRNGExhaustedError should be instanceof Error', () => {
      const error = new MockRNGExhaustedError(5);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(MockRNGExhaustedError);
    });
  });
});

//
// * Conformance
//

/**
 * One implementation under test. `create` receives the values a scripted RNG
 * should hand back; `SeededRNG` ignores them and generates its own, which is
 * exactly why every assertion below is stated as a range or an identity rather
 * than an expected value.
 */
type RngImplementation = {
  name: string;
  create: (values: number[]) => RNG;
  /** How `nextInt` handles `min > max` — see the `RNG` TSDoc in `types.ts`. */
  invertedBounds: 'swap' | 'throw';
};

const IMPLEMENTATIONS: RngImplementation[] = [
  { name: 'SeededRNG', create: () => new SeededRNG('conformance'), invertedBounds: 'swap' },
  { name: 'MockRNG', create: (values) => createMockRng(values), invertedBounds: 'throw' },
];

describe.each(IMPLEMENTATIONS)('RNG conformance — $name', (impl: RngImplementation) => {
  it('next() stays in [0, 1)', () => {
    const rng = impl.create([0, 0.25, 0.5, 0.75, 0.999]);

    for (let i = 0; i < 5; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('nextInt returns integers inside the requested range', () => {
    const rng = impl.create([1, 6, 3, 4, 2]);

    for (let i = 0; i < 5; i++) {
      const value = rng.nextInt(1, 6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
    }
  });

  it('nextInt(n, n) returns n', () => {
    const rng = impl.create([7, 0, -3]);

    expect(rng.nextInt(7, 7)).toBe(7);
    expect(rng.nextInt(0, 0)).toBe(0);
    expect(rng.nextInt(-3, -3)).toBe(-3);
  });

  it('handles inverted bounds per its documented contract', () => {
    // The divergence is deliberate — assert each side, do not paper over it.
    const rng = impl.create([3]);

    if (impl.invertedBounds === 'throw') {
      expect(() => rng.nextInt(6, 1)).toThrow(RangeError);
      return;
    }

    const reference = impl.create([3]);
    expect(rng.nextInt(6, 1)).toBe(reference.nextInt(1, 6));
  });
});

describe('SeededRNG golden sequences', () => {
  // ! Committed output of the shipped algorithm, not a self-comparison. A failure
  // ! means the seed → sequence mapping changed, which breaks the README's
  // ! within-version reproducibility promise even if the new sequence is
  // ! internally consistent — revert, or regenerate as part of a major release.
  //
  // Every field draws from a fresh instance, so the vectors are independent.
  // `safe` is the widest exactly-representable range; `next` pins the raw float
  // derivation rather than any bounded path.
  //
  // `d6` never crosses the single-draw resample loop — 2^32 % 6 = 4, so it resamples
  // with probability ~9.3e-10. `reject` uses range 2^31 + 1 instead, where ~50% of
  // draws reject, so every vector below crosses that loop at least once.
  //
  // Neither `wide` (2^40) nor `safe` (2^53 - 1) can cross the two-draw resample loop:
  // at 2^40 the limit lands on exactly 2^53 while a composed value tops out at
  // 2^53 - 1, and at 2^53 - 1 only that single value is rejected. `wideReject` uses
  // range 2^52 + 1, where half of all composed values reject; accepted values sit
  // below the range, so `value % range` is the identity — those vectors pin the
  // composed 53-bit value itself, shift and floor included.
  type GoldenVector = {
    seed: string | number;
    d6: number[];
    d20: number[];
    next: number[];
    reject: number[];
    wide: number[];
    safe: number[];
    wideReject: number[];
  };

  const GOLDEN: Record<string, GoldenVector> = {
    'numeric seed 12345': {
      seed: 12345,
      d6: [2, 4, 5, 1, 3, 1],
      d20: [2, 8, 1, 19],
      next: [0.4479906384367496, 0.5974347952287644, 0.007031909190118313, 0.3210541089065373],
      reject: [418479258, 2124976628, 1113035778, 1482526477, 896688628, 1274744019],
      wide: [1032783601200, 665645106708],
      safe: [4035140945911344, 63337807889940],
      wideReject: [
        4035140945911343, 63337807889939, 3256209042436438, 1429364744901906, 560681549475404,
        2225681085449454,
      ],
    },
    'negative seed -1': {
      seed: -1,
      d6: [2, 4, 4, 1, 2, 2],
      d20: [2, 18, 6, 15],
      next: [0.4707090745214373, 0.6534489516634494, 0.9265401971060783, 0.7591639864258468],
      reject: [659058228, 1831976196, 1113100845, 968752990, 1194137536, 894062146],
      wide: [53589895438, 238919633683],
      safe: [4239770426599694, 8345532174453523],
      wideReject: [
        4239770426599693, 2176114250703567, 3836090796871876, 979901828255448, 2140336246902645,
        1136808588825309,
      ],
    },
    'floating-point seed 1.9': {
      seed: 1.9,
      d6: [2, 5, 2, 6, 3, 5],
      d20: [4, 1, 6, 8],
      next: [0.616662256186828, 0.09898694697767496, 0.1944535376969725, 0.8023717037867755],
      reject: [501060574, 1298676578, 1012533881, 475707375, 1883207642, 1538670503],
      wide: [766582663911, 1059250089224],
      safe: [5554399814560487, 1751481761508616],
      wideReject: [
        1751481761508615, 576851547491158, 759418142369521, 2801247183752824, 1994091230147050,
        2617127969707440,
      ],
    },
    // `0`, `NaN`, and `Infinity` stringify to `'0'`, `'NaN'`, and `'Infinity'` —
    // three distinct seeds, so this vector covers only the literal zero.
    'zero seed': {
      seed: 0,
      d6: [3, 2, 1, 4, 4, 4],
      d20: [3, 20, 9, 4],
      next: [0.8609040039591491, 0.38567725545726717, 0.01992121059447527, 0.4534191645216197],
      reject: [1550070893, 153733866, 2138738837, 1443108650, 2078823149, 182837578],
      wide: [577904596856, 213918843497],
      safe: [7754333903673208, 179434314170985],
      wideReject: [
        179434314170984, 189248051313930, 479902448049340, 1183407171214599, 2810153088972912,
        2148180504288519,
      ],
    },
    'numeric seed above 2^32': {
      seed: 2 ** 32 + 5,
      d6: [3, 5, 4, 5, 5, 2],
      d20: [15, 15, 18, 11],
      next: [0.7637226288206875, 0.4796606474556029, 0.7504447402898222, 0.3817982622422278],
      reject: [1132680065, 1075651968, 947640091, 448791298, 869797110, 1110471765],
      wide: [457150781794, 707330324401],
      safe: [6879001894148450, 6759405306263473],
      wideReject: [
        3111993852053006, 2144140805665133, 3174427365900718, 2612560540375104, 631115177210596,
        1086805445691721,
      ],
    },
    'string seed': {
      seed: 'test-seed',
      d6: [1, 2, 5, 6, 1, 1],
      d20: [5, 18, 5, 4],
      next: [0.518652755767107, 0.14328040112741292, 0.51605817489326, 0.5407768168952316],
      reject: [80112975, 68969335, 175135094, 469711968, 1022497826, 1586244583],
      wide: [883320722881, 603158826508],
      safe: [4671608715515329, 4648238809435660],
      wideReject: [
        2160957774967823, 519084422778481, 3490057793118351, 52287067357159, 4089120463510994,
        3663748401745273,
      ],
    },
    'empty string seed': {
      seed: '',
      d6: [3, 4, 5, 1, 6, 5],
      d20: [1, 14, 11, 19],
      next: [0.045783258974552155, 0.6647939637769014, 0.857977548148483, 0.8286249632947147],
      reject: [707784684, 1537501861, 1411433469, 1229478745, 1672274793, 325879920],
      wide: [62077093374, 607013995545],
      safe: [412378937509374, 7727974734005273],
      wideReject: [
        412378937509373, 1013414532557067, 1733093157008796, 1346642363305635, 3014470015921749,
        3575842773797126,
      ],
    },
    'unicode string seed': {
      seed: '🎲✨',
      d6: [2, 2, 3, 5, 5, 1],
      d20: [2, 18, 3, 3],
      next: [0.8799945844803005, 0.41250299592502415, 0.1196330045349896, 0.09156419476494193],
      reject: [1632064312, 1282770697, 1718364616, 104968152, 1263265638, 352828756],
      wide: [1006753362746, 36914261529],
      safe: [7926286566372154, 1077558309482009],
      wideReject: [
        1077558309482008, 4206682932301189, 2706815801977212, 2286936236952533, 66393117729015,
        1422804226191567,
      ],
    },
  };

  const draws = (rng: SeededRNG, count: number, fn: (rng: SeededRNG) => number): number[] =>
    Array.from({ length: count }, () => fn(rng));

  for (const [label, v] of Object.entries(GOLDEN)) {
    it(`replays the committed sequence for ${label}`, () => {
      expect(draws(new SeededRNG(v.seed), v.d6.length, (r) => r.nextInt(1, 6))).toEqual(v.d6);
      expect(draws(new SeededRNG(v.seed), v.d20.length, (r) => r.nextInt(1, 20))).toEqual(v.d20);
      expect(draws(new SeededRNG(v.seed), v.next.length, (r) => r.next())).toEqual(v.next);
      expect(draws(new SeededRNG(v.seed), v.reject.length, (r) => r.nextInt(0, 2 ** 31))).toEqual(
        v.reject,
      );
      expect(draws(new SeededRNG(v.seed), v.wide.length, (r) => r.nextInt(1, 2 ** 40))).toEqual(
        v.wide,
      );
      expect(
        draws(new SeededRNG(v.seed), v.safe.length, (r) => r.nextInt(1, Number.MAX_SAFE_INTEGER)),
      ).toEqual(v.safe);
      expect(
        draws(new SeededRNG(v.seed), v.wideReject.length, (r) => r.nextInt(0, 2 ** 52)),
      ).toEqual(v.wideReject);
    });
  }
});
