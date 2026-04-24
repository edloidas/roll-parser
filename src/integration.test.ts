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
import { DegreeOfSuccess } from './types';

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

  describe('percentile dice (d%)', () => {
    test('basic d%', () => {
      const result = roll('d%', { rng: createMockRng([73]) });
      expect(result.total).toBe(73);
      expect(result.notation).toBe('d%');
      expect(result.expression).toBe('1d100');
    });

    test('2d%', () => {
      const result = roll('2d%', { rng: createMockRng([42, 88]) });
      expect(result.total).toBe(130);
      expect(result.notation).toBe('2d%');
    });

    test('d%+5', () => {
      const result = roll('d%+5', { rng: createMockRng([50]) });
      expect(result.total).toBe(55);
    });

    test('2d%kh1 keeps highest', () => {
      const result = roll('2d%kh1', { rng: createMockRng([30, 90]) });
      expect(result.total).toBe(90);
    });

    test('rendered output shows rolls', () => {
      const result = roll('d%', { rng: createMockRng([73]) });
      expect(result.rendered).toContain('1d100');
      expect(result.rendered).toContain('[73]');
      expect(result.rendered).toContain('= 73');
    });
  });

  describe('fate dice (dF)', () => {
    test('basic 4dF', () => {
      const result = roll('4dF', { rng: createMockRng([-1, 0, 1, 1]) });

      expect(result.total).toBe(1);
      expect(result.notation).toBe('4dF');
      expect(result.expression).toBe('4dF');
      expect(result.rolls).toHaveLength(4);
      for (const die of result.rolls) {
        expect(die.sides).toBe(0);
        expect(die.critical).toBe(false);
        expect(die.fumble).toBe(false);
      }
    });

    test('dF+5 combines fate with arithmetic', () => {
      const result = roll('dF+5', { rng: createMockRng([0]) });
      expect(result.total).toBe(5);
    });

    test('seeded reproducibility for dF', () => {
      const r1 = roll('4dF', { seed: 'fate-seed-xyz' });
      const r2 = roll('4dF', { seed: 'fate-seed-xyz' });

      expect(r1.total).toBe(r2.total);
      expect(r1.rolls.map((r) => r.result)).toEqual(r2.rolls.map((r) => r.result));
      for (const die of r1.rolls) {
        expect([-1, 0, 1]).toContain(die.result);
      }
    });

    test('rendered output shows fate notation and results', () => {
      const result = roll('4dF', { rng: createMockRng([-1, 0, 1, 1]) });
      expect(result.rendered).toBe('4dF[-1, 0, 1, 1] = 1');
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

    test('chained modifiers apply independently to full pool', () => {
      // Each modifier sees the full original pool; drop sets are merged via union
      // dl1 drops {idx1}, kh3 drops {idx1} → union {1} → total 9
      const result = roll('4d6dl1kh3', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.total).toBe(9);
    });

    test('chained kh1dh1 drops all dice when keep and drop target different dice', () => {
      // [1,2,7]: kh1 drops {0,1}, dh1 drops {2} → all dropped → total 0
      const result = roll('3d10kh1dh1', { rng: createMockRng([1, 2, 7]) });
      expect(result.total).toBe(0);
    });

    test('chained modifiers in different order produce same result', () => {
      const r1 = roll('4d6dl1kh3', { rng: createMockRng([3, 1, 4, 2]) });
      const r2 = roll('4d6kh3dl1', { rng: createMockRng([3, 1, 4, 2]) });
      expect(r1.total).toBe(r2.total);
    });

    test('triple chained modifiers', () => {
      // [3,1,4,2]: dl1→{1}, kh3→{1}, dh1→{2} → union {1,2} → total 5
      const result = roll('4d6dl1kh3dh1', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.total).toBe(5);
    });
  });

  describe('dice count safety limit', () => {
    test('roll() passes maxDice to evaluator', () => {
      expect(() => roll('5d6', { maxDice: 4 })).toThrow(EvaluatorError);
      expect(() => roll('5d6', { maxDice: 4 })).toThrow('exceeds limit of 4');
    });

    test('roll() aggregate limit across groups', () => {
      expect(() => roll('3d6+3d6', { maxDice: 5 })).toThrow(EvaluatorError);
    });

    test('roll() respects default limit without maxDice option', () => {
      // 3d6 is well under the default 10,000 limit
      const result = roll('3d6', { rng: createMockRng([1, 2, 3]) });
      expect(result.total).toBe(6);
    });
  });

  describe('exploding dice', () => {
    test('standard explode via roll()', () => {
      const result = roll('1d6!', { rng: createMockRng([6, 2]) });
      expect(result.total).toBe(8);
      expect(result.rolls).toHaveLength(2);
      expect(result.notation).toBe('1d6!');
    });

    test('compound explode via roll()', () => {
      const result = roll('1d6!!', { rng: createMockRng([6, 6, 3]) });
      expect(result.total).toBe(15);
      expect(result.rolls).toHaveLength(1);
    });

    test('penetrating explode via roll()', () => {
      const result = roll('1d6!p', { rng: createMockRng([6, 3]) });
      expect(result.total).toBe(8);
    });

    test('explode with threshold via roll()', () => {
      const result = roll('1d6!>=5', { rng: createMockRng([5, 2]) });
      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('maxExplodeIterations threads through roll()', () => {
      expect(() =>
        roll('1d6!', { rng: createMockRng([6, 6, 6, 6]), maxExplodeIterations: 2 }),
      ).toThrow(EvaluatorError);
    });

    test('seeded explode is reproducible', () => {
      const r1 = roll('2d6!', { seed: 'explode-seed' });
      const r2 = roll('2d6!', { seed: 'explode-seed' });
      expect(r1.total).toBe(r2.total);
      expect(r1.rolls.length).toBe(r2.rolls.length);
    });

    test('explode combined with keep highest', () => {
      // 4d6!kh3 — RNG [6,3,1,4,2]: explode on the 6 → pool [6,2,3,1,4];
      // kh3 keeps {6,4,3} = 13.
      const result = roll('4d6!kh3', { rng: createMockRng([6, 3, 1, 4, 2]) });
      expect(result.total).toBe(13);
    });
  });

  describe('reroll mechanics', () => {
    test('recursive reroll via roll()', () => {
      // 2d6r<2 — die 0: 1 → 3, die 1: 5. Total = 8.
      const result = roll('2d6r<2', { rng: createMockRng([1, 5, 3]) });
      expect(result.total).toBe(8);
      expect(result.rolls).toHaveLength(3);
      expect(result.notation).toBe('2d6r<2');
    });

    test('reroll-once via roll()', () => {
      // 2d6ro<3 — die 0: 2 → 1 (kept), die 1: 5. Total = 6.
      const result = roll('2d6ro<3', { rng: createMockRng([2, 5, 1]) });
      expect(result.total).toBe(6);
      expect(result.rolls).toHaveLength(3);
    });

    test('maxRerollIterations threads through roll()', () => {
      expect(() =>
        roll('1d6r<6', {
          rng: createMockRng([1, 1, 1, 1, 5]),
          maxRerollIterations: 2,
        }),
      ).toThrow(EvaluatorError);
    });

    test('seeded reroll is reproducible', () => {
      const r1 = roll('4d6r<2', { seed: 'reroll-seed' });
      const r2 = roll('4d6r<2', { seed: 'reroll-seed' });
      expect(r1.total).toBe(r2.total);
      expect(r1.rolls.length).toBe(r2.rolls.length);
    });

    test('reroll combined with keep highest (regression for keep/drop pre-drop fix)', () => {
      // 2d6r>4kh1 — die 0 rolls 6 (>4, rerolled → 2), die 1 rolls 3.
      // Final pool is [2, 3]. kh1 must skip the rerolled 6 and pick 3.
      const result = roll('2d6r>4kh1', { rng: createMockRng([6, 3, 2]) });
      expect(result.total).toBe(3);
    });

    test('Fate + reroll with negative compare value', () => {
      // 4dFr=-1 — rerolls each -1. With [-1,0,1,-1,0,0]: two rerolls yield 0.
      const result = roll('4dFr=-1', { rng: createMockRng([-1, 0, 1, -1, 0, 0]) });
      expect(result.total).toBe(1);
    });
  });

  describe('success counting', () => {
    test('WoD pattern — 10d10>=6f1', () => {
      const result = roll('10d10>=6f1', {
        rng: createMockRng([10, 1, 10, 10, 1, 6, 5, 4, 3, 2]),
      });
      // Successes: 10,10,10,6 = 4. Failures: 1,1 = 2. Total: 2.
      expect(result.successes).toBe(4);
      expect(result.failures).toBe(2);
      expect(result.total).toBe(2);
    });

    test('rendered output shows markers', () => {
      const result = roll('3d6>=5f1', { rng: createMockRng([1, 5, 3]) });
      expect(result.rendered).toContain('**5**');
      expect(result.rendered).toContain('__1__');
    });

    test('seeded success counting is reproducible', () => {
      const r1 = roll('10d10>=6f1', { seed: 'sc-seed' });
      const r2 = roll('10d10>=6f1', { seed: 'sc-seed' });
      expect(r1.total).toBe(r2.total);
      expect(r1.successes).toBe(r2.successes);
      expect(r1.failures).toBe(r2.failures);
    });

    test('impossible threshold yields zero successes — 1d6>=7', () => {
      const result = roll('1d6>=7', { rng: createMockRng([6]) });
      expect(result.successes).toBe(0);
      expect(result.total).toBe(0);
    });

    test('rejects modifier after success count', () => {
      expect(() => roll('10d10>=6kh5')).toThrow(ParseError);
      expect(() => roll('10d10>=6!')).toThrow(ParseError);
      expect(() => roll('10d10>=6>=5')).toThrow(ParseError);
    });

    test('rejects non-dice success target', () => {
      expect(() => roll('1>=3')).toThrow(ParseError);
      expect(() => roll('(1+2)>=3')).toThrow(ParseError);
    });
  });

  describe('versus (PF2e degrees of success)', () => {
    test('basic Success: 1d20+10 vs 25 roll=15', () => {
      const result = roll('1d20+10 vs 25', { rng: createMockRng([15]) });
      expect(result.total).toBe(25);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
      expect(result.natural).toBe(15);
      expect(result.rendered).toBe('1d20[15] + 10 vs 25 = Success');
    });

    test('Critical Success by margin: 1d20+10 vs 15 roll=15', () => {
      const result = roll('1d20+10 vs 15', { rng: createMockRng([15]) });
      expect(result.total).toBe(25);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalSuccess);
    });

    test('Nat-20 upgrades Failure to Success', () => {
      const result = roll('1d20-2 vs 25', { rng: createMockRng([20]) });
      expect(result.total).toBe(18);
      expect(result.natural).toBe(20);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
    });

    test('Nat-1 downgrades Success to Failure', () => {
      const result = roll('1d20+15 vs 15', { rng: createMockRng([1]) });
      expect(result.total).toBe(16);
      expect(result.natural).toBe(1);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('seeded versus is reproducible', () => {
      const r1 = roll('1d20+5 vs 18', { seed: 'vs-seed' });
      const r2 = roll('1d20+5 vs 18', { seed: 'vs-seed' });
      expect(r1.total).toBe(r2.total);
      expect(r1.degree).toBe(r2.degree);
      expect(r1.natural).toBe(r2.natural);
    });

    test('non-versus rolls do not set degree or natural', () => {
      const result = roll('1d20+10', { rng: createMockRng([15]) });
      expect(result.degree).toBeUndefined();
      expect(result.natural).toBeUndefined();
    });

    test('rejects chained versus', () => {
      expect(() => roll('1d20 vs 15 vs 20')).toThrow(ParseError);
    });

    test('rejects paren-nested versus at eval time', () => {
      expect(() => roll('1d20 vs (5 vs 3)', { rng: createMockRng([12]) })).toThrow(EvaluatorError);
    });
  });

  describe('math functions', () => {
    test('floor(1d6/3) with roll=5 → integer result', () => {
      const result = roll('floor(1d6/3)', { rng: createMockRng([5]) });
      expect(result.total).toBe(1);
      expect(result.rolls).toHaveLength(1);
    });

    test('ceil(1d6/3) with roll=5 → rounds up', () => {
      const result = roll('ceil(1d6/3)', { rng: createMockRng([5]) });
      expect(result.total).toBe(2);
    });

    test('max(1d6, 1d8) with rolls=[4, 7] → higher', () => {
      const result = roll('max(1d6, 1d8)', { rng: createMockRng([4, 7]) });
      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('min(10, 1d20+5) with roll=3 → cap', () => {
      const result = roll('min(10, 1d20+5)', { rng: createMockRng([3]) });
      expect(result.total).toBe(8);
    });

    test('abs(1d4-5) with roll=1 → 4', () => {
      const result = roll('abs(1d4-5)', { rng: createMockRng([1]) });
      expect(result.total).toBe(4);
    });

    test('case-insensitive: FLOOR(10/3)', () => {
      const result = roll('FLOOR(10/3)');
      expect(result.total).toBe(3);
    });

    test('rendered output includes function name', () => {
      const result = roll('floor(1d6/3)', { rng: createMockRng([5]) });
      expect(result.rendered).toBe('floor(1d6[5] / 3) = 1');
    });

    test('rejects wrong arity', () => {
      expect(() => roll('floor()')).toThrow(ParseError);
      expect(() => roll('floor(1, 2)')).toThrow(ParseError);
      expect(() => roll('max(1d6)', { rng: createMockRng([3]) })).toThrow(ParseError);
    });
  });

  describe('variable injection', () => {
    test('resolves @str in arithmetic', () => {
      const result = roll('1d20+@str', {
        rng: createMockRng([10]),
        context: { str: 5 },
      });

      expect(result.total).toBe(15);
      expect(result.notation).toBe('1d20+@str');
      expect(result.expression).toBe('1d20 + 5');
    });

    test('resolves @{Strength Modifier} braced form', () => {
      const result = roll('1d20+@{Strength Modifier}', {
        rng: createMockRng([8]),
        context: { 'Strength Modifier': 3 },
      });

      expect(result.total).toBe(11);
      expect(result.notation).toBe('1d20+@{Strength Modifier}');
    });

    test('resolves variable as dice count and sides', () => {
      const result = roll('@count d@sides', {
        rng: createMockRng([2, 5, 4, 6]),
        context: { count: 4, sides: 6 },
      });

      expect(result.total).toBe(17);
      expect(result.rolls).toHaveLength(4);
    });

    test('throws on missing variable by default', () => {
      expect(() => roll('1d20+@missing', { rng: createMockRng([10]) })).toThrow(EvaluatorError);
    });

    test('returns 0 for missing variable when onMissingVariable is "zero"', () => {
      const result = roll('1d20+@missing', {
        rng: createMockRng([10]),
        onMissingVariable: 'zero',
      });

      expect(result.total).toBe(10);
    });

    test('case-sensitive lookup (@StrMod ≠ @strmod)', () => {
      expect(() => roll('@StrMod', { rng: createMockRng([]), context: { strmod: 5 } })).toThrow(
        EvaluatorError,
      );
    });
  });

  describe('grouped rolls', () => {
    test('advantage-style: {1d20+5, 1d20+5}kh1 picks highest total', () => {
      // Sub 1: 1d20=8 → 13, Sub 2: 1d20=17 → 22. kh1 picks 22.
      const result = roll('{1d20+5, 1d20+5}kh1', { rng: createMockRng([8, 17]) });

      expect(result.total).toBe(22);
      expect(result.notation).toBe('{1d20+5, 1d20+5}kh1');
    });

    test('flat-pool: {4d6+2d8}kh3 keeps 3 highest across combined pool', () => {
      // 4d6: [6, 6, 6, 1], 2d8: [8, 1]. Combined [6, 6, 6, 1, 8, 1]. kh3 → 8+6+6 = 20
      const result = roll('{4d6+2d8}kh3', { rng: createMockRng([6, 6, 6, 1, 8, 1]) });

      expect(result.total).toBe(20);
    });

    test('literal group: {3, 5, 7}kh1 returns 7', () => {
      const result = roll('{3, 5, 7}kh1', { rng: createMockRng([]) });

      expect(result.total).toBe(7);
    });

    test('group arithmetic combine: 2 * {1d6, 1d8}kh1', () => {
      const result = roll('2 * {1d6, 1d8}kh1', { rng: createMockRng([4, 3]) });

      expect(result.total).toBe(8);
    });

    test('nested: {1d6, {5}} passes inner literal through', () => {
      const result = roll('{1d6, {5}}', { rng: createMockRng([4]) });

      expect(result.total).toBe(9);
    });

    test('rejects empty group at parse time', () => {
      expect(() => roll('{}', { rng: createMockRng([]) })).toThrow(ParseError);
    });

    test('rejects explode on group at parse time', () => {
      expect(() => roll('{4d6}!', { rng: createMockRng([]) })).toThrow(ParseError);
    });

    test('rejects reroll on group at parse time', () => {
      expect(() => roll('{4d6}r<2', { rng: createMockRng([]) })).toThrow(ParseError);
    });

    test('works with seeded RNG for reproducibility', () => {
      const r1 = roll('{1d20+5, 1d20+5}kh1', { seed: 'test-seed' });
      const r2 = roll('{1d20+5, 1d20+5}kh1', { seed: 'test-seed' });

      expect(r1.total).toBe(r2.total);
      expect(r1.rolls).toEqual(r2.rolls);
    });
  });

  describe('sort modifiers', () => {
    test('4d6s sorts dice ascending and round-trips expression', () => {
      const result = roll('4d6s', { rng: createMockRng([5, 2, 6, 3]) });

      expect(result.total).toBe(16);
      expect(result.rolls.map((d) => d.result)).toEqual([2, 3, 5, 6]);
      expect(result.expression).toBe('4d6s');
      expect(result.rendered).toBe('4d6s[2, 3, 5, 6] = 16');
    });

    test('4d6sd sorts dice descending', () => {
      const result = roll('4d6sd', { rng: createMockRng([5, 2, 6, 3]) });

      expect(result.total).toBe(16);
      expect(result.rolls.map((d) => d.result)).toEqual([6, 5, 3, 2]);
      expect(result.rendered).toBe('4d6sd[6, 5, 3, 2] = 16');
    });

    test('4d6dl1s renders dropped die inline in sorted position', () => {
      const result = roll('4d6dl1s', { rng: createMockRng([5, 2, 6, 3]) });

      expect(result.total).toBe(14);
      expect(result.rolls.map((d) => d.result)).toEqual([2, 3, 5, 6]);
      expect(result.rendered).toBe('4d6dl1s[~~2~~, 3, 5, 6] = 14');
    });

    test('rejects sort on a pure literal at parse time', () => {
      expect(() => roll('5s', { rng: createMockRng([]) })).toThrow(ParseError);
    });
  });

  describe('crit threshold modifiers', () => {
    test('4d20cs>=19 flags 19 and 20 as critical via roll()', () => {
      const result = roll('4d20cs>=19', { rng: createMockRng([20, 19, 15, 1]) });

      expect(result.total).toBe(55);
      expect(result.rolls.map((d) => d.critical)).toEqual([true, true, false, false]);
      expect(result.expression).toBe('4d20cs>=19');
      expect(result.rendered).toBe('4d20cs>=19[20, 19, 15, 1] = 55');
    });

    test('4d20cf<3 flags 1 and 2 as fumble via roll()', () => {
      const result = roll('4d20cf<3', { rng: createMockRng([20, 1, 2, 15]) });

      expect(result.total).toBe(38);
      expect(result.rolls.map((d) => d.fumble)).toEqual([false, true, true, false]);
    });

    test('combined cs>=19cf<3 round-trips through notation', () => {
      const result = roll('4d20cs>=19cf<3', { rng: createMockRng([20, 1, 10, 19]) });

      expect(result.rolls.map((d) => d.critical)).toEqual([true, false, false, true]);
      expect(result.rolls.map((d) => d.fumble)).toEqual([false, true, false, false]);
      expect(result.expression).toBe('4d20cs>=19cf<3');
    });

    test('rejects cs on a pure literal at parse time', () => {
      expect(() => roll('5cs', { rng: createMockRng([]) })).toThrow(ParseError);
    });

    test('rejects cs on a group at parse time', () => {
      expect(() => roll('{1d6}cs>5', { rng: createMockRng([]) })).toThrow(ParseError);
    });
  });
});
