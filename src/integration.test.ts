/**
 * Integration tests for the roll() public API.
 *
 * Tests the full pipeline: notation string → RollResult
 */

import { describe, expect, test } from 'bun:test';
import { EvaluatorError } from './evaluator/evaluator';
import { ParseError } from './parser/parser';
import { createMockRng } from './rng/mock';
import { roll } from './roll';

describe('roll() integration', () => {
  describe('full pipeline', () => {
    test('basic dice roll', () => {
      const result = roll('2d6', { rng: createMockRng([3, 5]) });
      expect(result.total).toBe(8);
      expect(result.notation).toBe('2d6');
      expect(result.expression).toBe('2d6');
      expect(result.rolls).toHaveLength(2);
    });

    test('implicit count (d20)', () => {
      const result = roll('d20', { rng: createMockRng([15]) });
      expect(result.total).toBe(15);
      expect(result.rolls).toHaveLength(1);
    });

    test('dice with arithmetic', () => {
      const result = roll('1d20+5', { rng: createMockRng([12]) });
      expect(result.total).toBe(17);
      expect(result.notation).toBe('1d20+5');
    });

    test('complex expression', () => {
      // (1d6+1)*2 with roll of 4 → (4+1)*2 = 10
      const result = roll('(1d6+1)*2', { rng: createMockRng([4]) });
      expect(result.total).toBe(10);
    });

    test('multiple dice groups', () => {
      // 2d6+1d4 with rolls [3, 5] and [2] → 8 + 2 = 10
      const result = roll('2d6+1d4', { rng: createMockRng([3, 5, 2]) });
      expect(result.total).toBe(10);
      expect(result.rolls).toHaveLength(3);
    });
  });

  describe('modifiers', () => {
    test('keep highest (4d6kh3)', () => {
      // Rolls: [3, 1, 4, 2] → keep [3, 4, 2] = 9
      const result = roll('4d6kh3', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.total).toBe(9);
      expect(result.rolls.filter((r) => r.modifiers.includes('dropped'))).toHaveLength(1);
    });

    test('keep lowest (2d20kl1)', () => {
      // Rolls: [15, 8] → keep 8
      const result = roll('2d20kl1', { rng: createMockRng([15, 8]) });
      expect(result.total).toBe(8);
    });

    test('drop lowest (4d6dl1)', () => {
      // Rolls: [3, 1, 4, 2] → drop 1, sum = 9
      const result = roll('4d6dl1', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.total).toBe(9);
    });

    test('drop highest (4d6dh1)', () => {
      // Rolls: [3, 1, 4, 2] → drop 4, sum = 6
      const result = roll('4d6dh1', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.total).toBe(6);
    });

    test('advantage (2d20kh1)', () => {
      const result = roll('2d20kh1', { rng: createMockRng([7, 18]) });
      expect(result.total).toBe(18);
    });

    test('disadvantage (2d20kl1)', () => {
      const result = roll('2d20kl1', { rng: createMockRng([7, 18]) });
      expect(result.total).toBe(7);
    });
  });

  describe('seeded reproducibility', () => {
    test('same seed produces same result', () => {
      const r1 = roll('4d6', { seed: 'test-seed-123' });
      const r2 = roll('4d6', { seed: 'test-seed-123' });
      expect(r1.total).toBe(r2.total);
      expect(r1.rolls.map((r) => r.result)).toEqual(r2.rolls.map((r) => r.result));
    });

    test('different seeds produce different results (statistically)', () => {
      const results = new Set<number>();
      for (let i = 0; i < 10; i++) {
        const result = roll('1d100', { seed: `seed-${i}` });
        results.add(result.total);
      }
      // With 10 different seeds rolling d100, we expect at least 5 unique values
      expect(results.size).toBeGreaterThanOrEqual(5);
    });

    test('string and numeric seeds work', () => {
      const r1 = roll('3d6', { seed: 'hello' });
      const r2 = roll('3d6', { seed: 42 });
      // Both should produce valid results
      expect(r1.total).toBeGreaterThanOrEqual(3);
      expect(r1.total).toBeLessThanOrEqual(18);
      expect(r2.total).toBeGreaterThanOrEqual(3);
      expect(r2.total).toBeLessThanOrEqual(18);
    });
  });

  describe('PRD 3.7 regression: negative numbers', () => {
    test('negative result is NOT clamped to zero', () => {
      // Roll 1 on d4, subtract 5 → -4 (NOT 0)
      const result = roll('1d4-5', { rng: createMockRng([1]) });
      expect(result.total).toBe(-4);
    });

    test('unary minus on dice', () => {
      // -1d4 with roll of 3 → -3
      const result = roll('-1d4', { rng: createMockRng([3]) });
      expect(result.total).toBe(-3);
    });

    test('unary minus equivalent to subtraction from zero', () => {
      const rng1 = createMockRng([3]);
      const rng2 = createMockRng([3]);
      const r1 = roll('-1d4', { rng: rng1 });
      const r2 = roll('0-1d4', { rng: rng2 });
      expect(r1.total).toBe(r2.total);
    });

    test('negative literal', () => {
      const result = roll('-5', {});
      expect(result.total).toBe(-5);
    });
  });

  describe('edge cases', () => {
    test('single-sided die (1d1)', () => {
      const result = roll('1d1', {});
      expect(result.total).toBe(1);
    });

    test('zero dice (0d6)', () => {
      const result = roll('0d6', {});
      expect(result.total).toBe(0);
      expect(result.rolls).toHaveLength(0);
    });

    test('computed dice count', () => {
      // (1+1)d6 → 2d6
      const result = roll('(1+1)d6', { rng: createMockRng([3, 4]) });
      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('computed sides', () => {
      // 2d(3*2) → 2d6
      const result = roll('2d(3*2)', { rng: createMockRng([3, 4]) });
      expect(result.total).toBe(7);
    });

    test('deeply nested expression', () => {
      // ((1+1)d(2*3))kh2 → 2d6kh2
      const result = roll('((1+1)d(2*3))kh2', { rng: createMockRng([3, 5]) });
      expect(result.total).toBe(8);
    });

    test('power operator right-associativity', () => {
      // 2**3**2 = 2^(3^2) = 2^9 = 512
      const result = roll('2**3**2', {});
      expect(result.total).toBe(512);
    });

    test('operator precedence', () => {
      // 1+2*3 = 1 + 6 = 7 (not 9)
      const result = roll('1+2*3', {});
      expect(result.total).toBe(7);
    });
  });

  describe('RollOptions', () => {
    test('custom RNG takes precedence over seed', () => {
      const mockRng = createMockRng([6, 6, 6]);
      const result = roll('3d6', { rng: mockRng, seed: 'ignored' });
      expect(result.total).toBe(18);
    });

    test('no options uses random RNG', () => {
      const result = roll('1d6');
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(6);
    });
  });

  describe('result metadata', () => {
    test('notation is original input', () => {
      const result = roll('  2d6 + 3  ', { rng: createMockRng([3, 4]) });
      expect(result.notation).toBe('  2d6 + 3  ');
    });

    test('expression is normalized', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 4]) });
      expect(result.expression).toBe('2d6 + 3');
    });

    test('rendered shows individual rolls', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 4]) });
      expect(result.rendered).toContain('[3, 4]');
      expect(result.rendered).toContain('= 10');
    });

    test('critical detection', () => {
      const result = roll('1d20', { rng: createMockRng([20]) });
      const die = result.rolls[0];
      expect(die).toBeDefined();
      expect(die?.critical).toBe(true);
      expect(die?.fumble).toBe(false);
    });

    test('fumble detection', () => {
      const result = roll('1d20', { rng: createMockRng([1]) });
      const die = result.rolls[0];
      expect(die).toBeDefined();
      expect(die?.fumble).toBe(true);
      expect(die?.critical).toBe(false);
    });
  });

  describe('error cases', () => {
    test('empty input throws ParseError', () => {
      expect(() => roll('')).toThrow(ParseError);
    });

    test('whitespace-only input throws ParseError', () => {
      expect(() => roll('   ')).toThrow(ParseError);
    });

    test('division by zero throws EvaluatorError', () => {
      expect(() => roll('1/0')).toThrow(EvaluatorError);
    });

    test('modulo by zero throws EvaluatorError', () => {
      expect(() => roll('1%0')).toThrow(EvaluatorError);
    });

    test('negative dice count throws EvaluatorError', () => {
      expect(() => roll('(-1)d6')).toThrow(EvaluatorError);
    });

    test('zero-sided die throws EvaluatorError', () => {
      expect(() => roll('1d0')).toThrow(EvaluatorError);
    });

    test('floating point dice count throws EvaluatorError', () => {
      expect(() => roll('(1.5)d6')).toThrow(EvaluatorError);
    });

    test('floating point dice sides throws EvaluatorError', () => {
      expect(() => roll('1d(6.5)')).toThrow(EvaluatorError);
    });
  });

  describe('syntax variations', () => {
    test('caret is alias for power operator', () => {
      expect(roll('2^3').total).toBe(8);
      expect(roll('2**3').total).toBe(8);
    });

    test('k is shorthand for kh (keep highest)', () => {
      const result = roll('4d6k3', { rng: createMockRng([3, 5, 1, 4]) });
      expect(result.total).toBe(12); // 3 + 5 + 4
    });
  });

  describe('edge case behaviors', () => {
    test('very large power produces Infinity', () => {
      // 2^1024 overflows IEEE 754 double (~1.8e308 max)
      expect(roll('2**1024').total).toBe(Number.POSITIVE_INFINITY);
    });

    test('unary minus on grouped expression', () => {
      expect(roll('-(2+3)').total).toBe(-5);
    });

    test('rendered shows dropped dice with strikethrough', () => {
      const result = roll('4d6dl1', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.rendered).toContain('~~1~~');
    });

    test('chained modifiers evaluate sequentially (current behavior - see issue #12)', () => {
      // Documents current behavior: inner modifier fully evaluates first
      // Note: This differs from Roll20/RPG Dice Roller
      // See issue #12 for planned Stage 2/3 enhancement
      const result = roll('4d6dl1kh3', { rng: createMockRng([3, 1, 4, 2]) });
      // dl1 drops 1, kh3 on remaining [3, 4, 2] keeps all 3
      expect(result.total).toBe(9);
    });
  });
});
