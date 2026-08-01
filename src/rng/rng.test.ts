import { describe, expect, it } from 'bun:test';
import { createMockRng, MockRNGExhaustedError } from './mock.js';
import { SeededRNG } from './seeded.js';
import type { RNG } from './types.js';

describe('SeededRNG', () => {
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

      // Should produce consistent results
      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should handle floating-point seeds (truncates via uint32 coercion)', () => {
      // `42.999 >>> 0 === 42`, so SeededRNG(42.999) must match SeededRNG(42).
      const fractional = new SeededRNG(42.999);
      const truncated = new SeededRNG(42);

      for (let i = 0; i < 10; i++) {
        expect(fractional.nextInt(1, 100)).toBe(truncated.nextInt(1, 100));
      }
    });

    it('should handle NaN seed (treated as 0)', () => {
      // `NaN >>> 0 === 0`, so SeededRNG(NaN) must match SeededRNG(0).
      const nanSeed = new SeededRNG(Number.NaN);
      const zeroSeed = new SeededRNG(0);

      for (let i = 0; i < 10; i++) {
        expect(nanSeed.nextInt(1, 100)).toBe(zeroSeed.nextInt(1, 100));
      }
    });

    it('should handle Infinity seed (treated as 0)', () => {
      // `Infinity >>> 0 === 0`, so SeededRNG(Infinity) must match SeededRNG(0).
      const infSeed = new SeededRNG(Number.POSITIVE_INFINITY);
      const zeroSeed = new SeededRNG(0);

      for (let i = 0; i < 10; i++) {
        expect(infSeed.nextInt(1, 100)).toBe(zeroSeed.nextInt(1, 100));
      }
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

      // At least one of the first 10 values should differ
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

      // Multiple calls should always return the same value
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
      const tolerance = expected * 0.05; // 5% tolerance

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
      const tolerance = expected * 0.1; // 10% tolerance for smaller sample per bucket

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

      // Generate 1000 values and verify they match
      for (let i = 0; i < 1000; i++) {
        expect(rng1.nextInt(1, 1000)).toBe(rng2.nextInt(1, 1000));
      }
    });

    it('should produce different sequences after diverging', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);

      // Consume one value from rng1
      rng1.nextInt(1, 6);

      // Now they should be out of sync
      const seq1 = Array.from({ length: 5 }, () => rng1.nextInt(1, 6));
      const seq2 = Array.from({ length: 5 }, () => rng2.nextInt(1, 6));

      // First value of seq2 should match what rng1 got initially
      // But the arrays as a whole should differ
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
    // ? The two implementations deliberately diverge here; the shared block
    //   asserts each side of the divergence rather than papering over it.
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
  // ! Committed output of the shipped algorithm, not a self-comparison. A
  // ! failure here means the seed → sequence mapping changed, which breaks
  // ! the README's within-version reproducibility promise even if the new
  // ! sequence is internally consistent. That is a breaking change: revert,
  // ! or regenerate deliberately as part of a major release.
  //
  // Each field draws from a fresh instance: `d6` exercises the single-draw
  // rejection path, `wide` the two-draw path above 2^32, `safe` the widest
  // exactly-representable range, and `next()` the raw float derivation.
  //
  // `d6` only ever reaches that path's accept-on-first-draw case — 2^32 % 6 = 4,
  // so it resamples with probability ~9.3e-10. `reject` draws from range 2^31 + 1
  // instead, where the single acceptance zone rejects ~50% of draws, so every
  // committed vector below crosses the resample loop at least once.
  //
  // The two-draw path has its own resample loop, and neither `wide` nor `safe`
  // can reach it: at range 2^40 the limit lands on exactly 2^53 while a composed
  // value tops out at 2^53 - 1, and at range 2^53 - 1 only that single value is
  // rejected. `wideReject` draws from range 2^52 + 1, where the limit is 2^52 + 1
  // and half of all composed values reject. Accepted values there are below the
  // range, so `value % range` is the identity — these vectors pin the composed
  // 53-bit value itself, shift and floor included.
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
      d6: [1, 1, 4, 5, 2, 5],
      d20: [17, 1, 4, 3],
      next: [0.8679328383877873, 0.8667920529842377, 0.07695949240587652, 0.011353977490216494],
      reject: [1580259507, 1575359871, 937607533, 764651437, 1684383620, 919775968],
      wide: [116343422147, 497157168388],
      safe: [7817644016909507, 693189482667268],
      wideReject: [
        693189482667267, 3176157146446936, 1976673980336290, 452448453243508, 3559839886915177,
        3389932715744099,
      ],
    },
    'negative seed -1': {
      seed: -1,
      d6: [4, 5, 5, 3, 6, 3],
      d20: [6, 19, 13, 17],
      next: [0.750008235918358, 0.5732201267965138, 0.5506118135526776, 0.4993512099608779],
      reject: [1073777196, 314478049, 217376083, 994101032, 1576508477, 1979849872],
      wide: [74183759826, 672876460720],
      safe: [6755473624815570, 4959470317730480],
      wideReject: [
        858771368500583, 3629814480836450, 2927187252872228, 149226975691410, 726649644946738,
        821976373484351,
      ],
    },
    'floating-point seed 1.9': {
      seed: 1.9,
      d6: [1, 5, 2, 6, 2, 3],
      d20: [3, 5, 18, 18],
      next: [0.5212148143909872, 0.4235102152451873, 0.8607655430678278, 0.560251371236518],
      reject: [91116933, 1549476208, 258777668, 580183402, 1882066922, 950266993],
      wide: [870549654886, 430271753621],
      safe: [4694685688630630, 7753086759202197],
      wideReject: [
        4234367612857021, 2533288020562588, 664005297178049, 2995030272424407, 4034260740604407,
        1786175373830498,
      ],
    },
    // NaN and Infinity coerce to the same state; the equivalence is pinned in
    // the reproducibility block above, so one vector covers all three.
    'zero seed': {
      seed: 0,
      d6: [1, 4, 3, 2, 2, 3],
      d20: [11, 8, 1, 2],
      next: [0.07579136872664094, 0.004450056469067931, 0.060825226828455925, 0.9507468438241631],
      reject: [1935942952, 1487510830, 1149919853, 150393330, 187493854, 512190569],
      wide: [970750698613, 308149120133],
      safe: [682667959919733, 547864939752581],
      wideReject: [
        682667959919732, 547864939752580, 3181159321247450, 989889649796509, 3425408250135640,
        313620509887739,
      ],
    },
    'numeric seed above 2^32': {
      seed: 2 ** 32 + 5,
      d6: [1, 1, 2, 6, 2, 1],
      d20: [9, 13, 16, 6],
      next: [0.17120876535773277, 0.5691772727295756, 0.0033915264066308737, 0.3398960374761373],
      reject: [297114123, 1592645242, 1672827471, 1836300427, 605900959, 1596757657],
      wide: [596162786996, 861340885102],
      safe: [1542111464928948, 30548154835054],
      wideReject: [
        1542111464928947, 30548154835053, 623843339908028, 3838626888410514, 2321470321548071,
        380896102335477,
      ],
    },
    'string seed': {
      seed: 'test-seed',
      d6: [5, 3, 2, 6, 4, 6],
      d20: [17, 1, 20, 14],
      next: [0.2511115549132228, 0.21425421815365553, 0.7295500996988267, 0.08448794786818326],
      reject: [985910170, 1877358680, 1380869456, 546779057, 351015751, 1399582936],
      wide: [116392385324, 521626891297],
      safe: [2261811810720556, 6571203114480673],
      wideReject: [
        2261811810720555, 674166147513543, 2669292741643437, 447046198381004, 4098452652892475,
        1452428429935220,
      ],
    },
    'empty string seed': {
      seed: '',
      d6: [4, 6, 6, 5, 1, 4],
      d20: [4, 6, 18, 15],
      next: [0.932455827249214, 0.7405093649867922, 0.48083222401328385, 0.3460868061520159],
      reject: [1857383634, 1032979856, 1977533166, 1348229753, 1402352419, 794292105],
      wide: [745620877889, 1074860331813],
      safe: [8398815433830977, 4330951650513701],
      wideReject: [
        4330951650513700, 1022413303583623, 65650428611467, 2489004198038576, 2696923828270536,
        4263514600660599,
      ],
    },
    'unicode string seed': {
      seed: '🎲✨',
      d6: [5, 6, 2, 3, 1, 4],
      d20: [1, 12, 12, 7],
      next: [0.47865111846476793, 0.677673241822049, 0.28416736773215234, 0.11811965750530362],
      reject: [763100762, 1627261331, 964817632, 690224875, 1399340448, 1339929417],
      wide: [120906428288, 988545271715],
      safe: [4311305998937984, 2559552103106467],
      wideReject: [
        4311305998937983, 2559552103106466, 1249296834506575, 2094143232225342, 4483399072716490,
        3310697982638483,
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
