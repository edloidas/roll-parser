import { describe, expect, it, spyOn } from 'bun:test';
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

  describe('auto-seeding', () => {
    it('should draw in range when constructed without a seed', () => {
      const rng = new SeededRNG();

      for (const value of draws(rng)) {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(100);
      }
    });

    it('separates instances built in the same millisecond (#204)', () => {
      // A frozen clock leaves the `Math.random()` draws as the only thing
      // separating the streams — a clock-only auto-seed makes all 20 identical.
      const clock = spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

      try {
        const sequences = Array.from({ length: 20 }, () => draws(new SeededRNG()).join(','));

        expect(new Set(sequences).size).toBe(sequences.length);
      } finally {
        clock.mockRestore();
      }
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

  describe('state()', () => {
    it('should resume the exact sequence from a captured state', () => {
      const source = new SeededRNG('replay');
      source.nextInt(1, 6);

      const restored = new SeededRNG(source.state());

      expect(draws(restored)).toEqual(draws(source));
    });

    it('should skip the warm-up so a restored state round-trips unchanged', () => {
      const snapshot = new SeededRNG('roundtrip').state();

      expect(new SeededRNG(snapshot).state()).toEqual(snapshot);
    });

    it('should return unsigned words', () => {
      const rng = new SeededRNG('unsigned');

      for (const word of rng.state()) {
        expect(word).toBeGreaterThanOrEqual(0);
        expect(word).toBeLessThan(0x100000000);
      }
    });

    it('should not advance the source instance', () => {
      const rng = new SeededRNG('untouched');
      const before = rng.state();
      rng.state();

      expect(rng.state()).toEqual(before);
    });

    it('should leave the source unaffected when the restored clone advances', () => {
      const source = new SeededRNG('independence');
      const reference = new SeededRNG('independence');
      const restored = new SeededRNG(source.state());

      restored.nextInt(1, 6);

      expect(draws(source)).toEqual(draws(reference));
    });

    it('should leave the restored clone unaffected when the source advances', () => {
      const source = new SeededRNG('reverse-independence');
      const snapshot = source.state();
      const restored = new SeededRNG(snapshot);

      source.nextInt(1, 6);

      expect(restored.state()).toEqual(snapshot);
    });

    it('should guard an all-zero state', () => {
      const rng = new SeededRNG([0, 0, 0, 0]);

      expect(rng.state()).toEqual([1, 0, 0, 0]);
    });

    it('should truncate out-of-range words to 32 bits', () => {
      const rng = new SeededRNG([0x1_0000_0007, -1, 0, 0]);

      expect(rng.state()).toEqual([7, 0xffffffff, 0, 0]);
    });

    it('replays the parent stream at an offset rather than forking it (#205)', () => {
      const parent = new SeededRNG('world');
      const first = new SeededRNG(parent.state());
      parent.next();
      const second = new SeededRNG(parent.state());

      const firstDraws = Array.from({ length: 32 }, () => first.nextInt(1, 20));
      const secondDraws = Array.from({ length: 32 }, () => second.nextInt(1, 20));

      expect(secondDraws.slice(0, 31)).toEqual(firstDraws.slice(1));
    });

    it('gives derived seeds unrelated streams (#205)', () => {
      const goblin = new SeededRNG('world:goblin');
      const orc = new SeededRNG('world:orc');

      const goblinDraws = Array.from({ length: 32 }, () => goblin.nextInt(1, 20));
      const orcDraws = Array.from({ length: 32 }, () => orc.nextInt(1, 20));

      for (let offset = 0; offset < 8; offset++) {
        expect(orcDraws.slice(0, 24)).not.toEqual(goblinDraws.slice(offset, offset + 24));
      }
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
      d6: [1, 5, 6, 2, 5, 1],
      d20: [13, 13, 2, 18],
      next: [0.9135238481685519, 0.7332067685201764, 0.6697211556602269, 0.21874707587994635],
      reject: [1776071403, 1001615443, 728946812, 774275377, 1443915171, 281048998],
      wide: [645815301743, 391104626682],
      safe: [8228291325949551, 6032311894605818],
      wideReject: [
        319923283957774, 3821402028087495, 3845077587152601, 4285844723985961, 1592643997944440,
        1128968162707337,
      ],
    },
    'negative seed -1': {
      seed: -1,
      d6: [3, 6, 6, 2, 4, 5],
      d20: [5, 6, 18, 16],
      next: [0.8064836831763387, 0.9192837087903172, 0.7631883670110255, 0.8107851247768849],
      reject: [1316337395, 1800809816, 1130385428, 1334811946, 55153857, 2105148078],
      wide: [785418906310, 42995413492],
      safe: [7264159231994566, 6874189692269044],
      wideReject: [
        793419562549652, 1091687547686774, 4306007527265668, 50111819936563, 3656218595716917,
        1240365544838422,
      ],
    },
    'floating-point seed 1.9': {
      seed: 1.9,
      d6: [2, 2, 4, 3, 4, 6],
      d20: [8, 8, 14, 13],
      next: [0.5628743737470359, 0.06835653143934906, 0.8233375505078584, 0.05066901724785566],
      reject: [270043378, 1388724204, 55350309, 1585699091, 1611015748, 207706089],
      wide: [73524195323, 858953719573],
      safe: [5069921639870459, 7415965371440917],
      wideReject: [
        60658211654139, 4042839777446954, 122558794310723, 1494506192181132, 517549805712307,
        2788730450232140,
      ],
    },
    // `0`, `NaN`, and `Infinity` stringify to `'0'`, `'NaN'`, and `'Infinity'` —
    // three distinct seeds, so this vector covers only the literal zero.
    'zero seed': {
      seed: 0,
      d6: [3, 6, 6, 4, 6, 5],
      d20: [19, 8, 16, 14],
      next: [0.5474341749213636, 0.8443695229943842, 0.25922391447238624, 0.5706146482843906],
      reject: [203728229, 1479055838, 303287604, 1094488082, 1182371455, 382189457],
      wide: [638555194644, 618264674938],
      safe: [4930848694142228, 2334881450443386],
      wideReject: [
        2334881450443385, 2554597113531656, 1385972681143632, 1003059585222100, 1402531215429986,
        3071835534617060,
      ],
    },
    'numeric seed above 2^32': {
      seed: 2 ** 32 + 5,
      d6: [4, 6, 1, 2, 5, 6],
      d20: [2, 12, 11, 4],
      next: [0.7962174250278622, 0.3500723678153008, 0.819042872171849, 0.8393006639089435],
      reject: [1272244152, 1370278701, 1457285254, 1195573675, 864857216, 960827919],
      wide: [674161701835, 658838838158],
      safe: [7171688998056907, 7377282349587342],
      wideReject: [
        2008819333644592, 1399334167281884, 1532104578535729, 2687890109073263, 4409447430210946,
        450190526185473,
      ],
    },
    'string seed': {
      seed: 'test-seed',
      d6: [5, 3, 4, 6, 5, 6],
      d20: [17, 19, 6, 14],
      next: [0.8511151457205415, 0.36603429773822427, 0.03053837106563151, 0.07359545514918864],
      reject: [1508028067, 128581880, 1201093130, 786833457, 1376819787, 455048051],
      wide: [368638146190, 187286313701],
      safe: [7666163707000462, 275065193257701],
      wideReject: [
        275065193257700, 3340209837110592, 541466108304829, 700573060642042, 3457636759176076,
        4164822950036561,
      ],
    },
    'empty string seed': {
      seed: '',
      d6: [1, 3, 4, 4, 1, 1],
      d20: [19, 5, 10, 20],
      next: [0.1366707351990044, 0.7386155389249325, 0.7622170981485397, 0.6286252706777304],
      reject: [1024845935, 1126213860, 552441330, 944472651, 1165992645, 423693974],
      wide: [667034297022, 90675879347],
      safe: [1231020545778366, 6865441279712691],
      wideReject: [
        1231020545778365, 135371070835056, 3486202225252842, 4437568987078677, 3588137375743196,
        1639319610804901,
      ],
    },
    'unicode string seed': {
      seed: '🎲✨',
      d6: [4, 1, 1, 3, 5, 3],
      d20: [10, 19, 3, 17],
      next: [0.11257752520032227, 0.8830940765328705, 0.3794874348677695, 0.6912141749635339],
      reject: [1645376529, 821258627, 396743035, 1271492135, 422543846, 1151927522],
      wide: [258482127439, 836802846318],
      safe: [1014008202936911, 3418118941974126],
      wideReject: [
        1014008202936910, 3418118941974125, 2094687110932893, 3459761737078048, 1929147255733874,
        780827534882717,
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

describe('SeededRNG cyrb128 conformance', () => {
  // ! Pins the seed → state derivation to reference cyrb128. "Correcting" it to
  // ! the withdrawn 2023 variant rewrites every seeded sequence while the
  // ! determinism-only suites stay green — this is what fails instead.
  const referenceCyrb128 = (str: string): [number, number, number, number] => {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;

    for (let i = 0; i < str.length; i++) {
      const k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }

    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);

    // The reference writes these as one comma sequence; split for Biome, order
    // intact. `h1` folds first, so the other three read the folded value.
    h1 ^= h2 ^ h3 ^ h4;
    h2 ^= h1;
    h3 ^= h1;
    h4 ^= h1;

    return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
  };

  // The hash output is never observable directly — the run-in has already moved
  // the state by the time `state()` can be read. Restoring skips the run-in, so
  // replay it: `next()` is one draw, and `WARMUP_DRAWS` in `seeded.ts` is 8.
  const seedFromReference = (seed: string): SeededRNG => {
    const rng = new SeededRNG(referenceCyrb128(seed));
    for (let i = 0; i < 8; i++) {
      rng.next();
    }
    return rng;
  };

  const seeds = ['demo', 'test-seed', '12345', '-1', '1.9', '', '🎲✨', 'world:goblin'];

  for (const seed of seeds) {
    it(`derives its state from reference cyrb128 for ${seed === '' ? 'the empty seed' : `'${seed}'`} (#210)`, () => {
      const seeded = new SeededRNG(seed);
      const fromReference = seedFromReference(seed);

      expect(Array.from({ length: 8 }, () => seeded.nextInt(1, 1_000_000))).toEqual(
        Array.from({ length: 8 }, () => fromReference.nextInt(1, 1_000_000)),
      );
    });
  }
});
