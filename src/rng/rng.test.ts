import { describe, expect, it } from 'bun:test';
import { createMockRng, MockRNGExhaustedError } from './mock';
import { SeededRNG } from './seeded';

// Note: Property-based tests with fast-check are available when the package is installed.
// Run `bun install` to enable them.

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

    it('should handle floating-point seeds (truncates to integer)', () => {
      const rng1 = new SeededRNG(42.999);
      const rng2 = new SeededRNG(42.999);

      // Should produce consistent results
      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should handle NaN seed (treated as 0)', () => {
      const rng1 = new SeededRNG(Number.NaN);
      const rng2 = new SeededRNG(Number.NaN);

      // NaN >>> 0 === 0, so both should behave like seed 0
      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
      }
    });

    it('should handle Infinity seed', () => {
      const rng1 = new SeededRNG(Number.POSITIVE_INFINITY);
      const rng2 = new SeededRNG(Number.POSITIVE_INFINITY);

      // Infinity >>> 0 === 0
      for (let i = 0; i < 10; i++) {
        expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
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

    it('should handle min === max', () => {
      const rng = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        expect(rng.nextInt(5, 5)).toBe(5);
      }
    });

    it('should handle inverted bounds (swap min/max)', () => {
      const rng = new SeededRNG(42);

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(10, 1);
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      }
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

  describe('property-based invariants (manual)', () => {
    it('nextInt always returns value in valid range across random seeds', () => {
      // Test with various seed/range combinations
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

    it('next always returns value in [0, 1) across random seeds', () => {
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

    it('should ignore min/max parameters (returns raw values)', () => {
      const rng = createMockRng([4, 15, 20]);

      expect(rng.nextInt(1, 6)).toBe(4);
      expect(rng.nextInt(1, 20)).toBe(15);
      expect(rng.nextInt(1, 100)).toBe(20);
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
        expect(true).toBe(false); // Should not reach here
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
        expect(true).toBe(false);
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
