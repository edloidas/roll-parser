/**
 * Tests for the AST evaluator.
 *
 * @module evaluator/evaluator.test
 */

import { describe, expect, test } from 'bun:test';
import { parse } from '../parser/parser';
import { createMockRng } from '../rng/mock';
import type { DieResult } from '../types';
import { DegreeOfSuccess } from '../types';
import { DEFAULT_MAX_DICE, evaluate, EvaluatorError } from './evaluator';

/**
 * Helper to safely get a die result at index, throwing if not present.
 */
function getDie(rolls: DieResult[], index: number): DieResult {
  const die = rolls[index];
  if (!die) {
    throw new Error(`Expected die at index ${index}, but only ${rolls.length} dice found`);
  }
  return die;
}

describe('evaluate', () => {
  describe('literals', () => {
    test('evaluates integer literal', () => {
      const ast = parse('42');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(42);
      expect(result.rolls).toHaveLength(0);
    });

    test('evaluates decimal literal', () => {
      const ast = parse('3.14');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(3.14);
    });
  });

  describe('basic dice', () => {
    test('evaluates single die roll', () => {
      const ast = parse('1d6');
      const rng = createMockRng([4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(4);
      expect(result.rolls).toHaveLength(1);
      expect(getDie(result.rolls, 0).sides).toBe(6);
      expect(getDie(result.rolls, 0).result).toBe(4);
    });

    test('evaluates multiple dice', () => {
      const ast = parse('3d6');
      const rng = createMockRng([3, 4, 5]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(12);
      expect(result.rolls).toHaveLength(3);
    });

    test('evaluates implicit count d20', () => {
      const ast = parse('d20');
      const rng = createMockRng([15]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(15);
      expect(result.rolls).toHaveLength(1);
      expect(getDie(result.rolls, 0).sides).toBe(20);
    });
  });

  describe('percentile dice (d%)', () => {
    test('d% rolls a d100', () => {
      const ast = parse('d%');
      const rng = createMockRng([73]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(73);
      expect(result.rolls).toHaveLength(1);
      expect(getDie(result.rolls, 0).sides).toBe(100);
    });

    test('2d% sums two d100 rolls', () => {
      const ast = parse('2d%');
      const rng = createMockRng([42, 88]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(130);
      expect(result.rolls).toHaveLength(2);
    });

    test('expression shows canonical 1d100', () => {
      const ast = parse('d%');
      const rng = createMockRng([50]);
      const result = evaluate(ast, rng);

      expect(result.expression).toBe('1d100');
    });

    test('critical on 100', () => {
      const ast = parse('d%');
      const rng = createMockRng([100]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).critical).toBe(true);
    });

    test('fumble on 1', () => {
      const ast = parse('d%');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).fumble).toBe(true);
    });

    test('2d%kh1 keeps highest', () => {
      const ast = parse('2d%kh1');
      const rng = createMockRng([42, 88]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(88);
    });

    test('notation preserved when passed via options', () => {
      const ast = parse('d%');
      const rng = createMockRng([50]);
      const result = evaluate(ast, rng, { notation: 'd%' });

      expect(result.notation).toBe('d%');
    });
  });

  describe('fate dice (dF)', () => {
    test('dF rolls a single fate die', () => {
      const ast = parse('dF');
      const rng = createMockRng([-1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-1);
      expect(result.rolls).toHaveLength(1);
      const die = getDie(result.rolls, 0);
      expect(die.sides).toBe(0);
      expect(die.result).toBe(-1);
      expect(die.critical).toBe(false);
      expect(die.fumble).toBe(false);
      expect(die.modifiers).toEqual(['kept']);
    });

    test('dF with zero result produces exact 0 total', () => {
      const ast = parse('dF');
      const rng = createMockRng([0]);
      const result = evaluate(ast, rng);

      expect(Object.is(result.total, 0)).toBe(true);
    });

    test('dF with +1 is not flagged as fumble', () => {
      const ast = parse('dF');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).fumble).toBe(false);
      expect(getDie(result.rolls, 0).critical).toBe(false);
    });

    test('4dF sums all four fate results', () => {
      const ast = parse('4dF');
      const rng = createMockRng([-1, 0, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(1);
      expect(result.rolls).toHaveLength(4);
      for (const die of result.rolls) {
        expect(die.sides).toBe(0);
      }
    });

    test('expression is canonical "1dF" / "4dF" (not d0)', () => {
      const single = evaluate(parse('dF'), createMockRng([0]));
      const four = evaluate(parse('4dF'), createMockRng([0, 0, 0, 0]));

      expect(single.expression).toBe('1dF');
      expect(four.expression).toBe('4dF');
    });

    test('rendered shows negative values', () => {
      const ast = parse('4dF');
      const rng = createMockRng([-1, 0, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toBe('4dF[-1, 0, 1, 1] = 1');
    });

    test('4dFkh2 keeps the two highest fate results', () => {
      const ast = parse('4dFkh2');
      const rng = createMockRng([-1, 0, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(2);
      const dropped = result.rolls.filter((d) => d.modifiers.includes('dropped'));
      expect(dropped).toHaveLength(2);
      expect(dropped.map((d) => d.result).sort()).toEqual([-1, 0]);
    });

    test('4dFdl1 drops the lowest fate result', () => {
      const ast = parse('4dFdl1');
      const rng = createMockRng([-1, 0, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(2);
      const dropped = result.rolls.filter((d) => d.modifiers.includes('dropped'));
      expect(dropped).toHaveLength(1);
      expect(dropped[0]?.result).toBe(-1);
    });

    test('0dF produces total 0 and no rolls', () => {
      const ast = parse('0dF');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls).toHaveLength(0);
    });

    test('dF+5 adds modifier to fate result', () => {
      const ast = parse('dF+5');
      const rng = createMockRng([0]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(5);
    });

    test('-dF negates the fate result', () => {
      const ast = parse('-dF');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-1);
    });

    test('(-1)dF throws INVALID_DICE_COUNT', () => {
      const ast = parse('(-1)dF');
      const rng = createMockRng([]);

      expect(() => evaluate(ast, rng)).toThrow(EvaluatorError);
      try {
        evaluate(ast, rng);
      } catch (err) {
        expect(err).toBeInstanceOf(EvaluatorError);
        if (err instanceof EvaluatorError) {
          expect(err.code).toBe('INVALID_DICE_COUNT');
          expect(err.nodeType).toBe('FateDice');
        }
      }
    });

    test('5dF with maxDice=4 throws DICE_LIMIT_EXCEEDED', () => {
      const ast = parse('5dF');
      const rng = createMockRng([0, 0, 0, 0, 0]);

      try {
        evaluate(ast, rng, { maxDice: 4 });
        throw new Error('expected DICE_LIMIT_EXCEEDED');
      } catch (err) {
        expect(err).toBeInstanceOf(EvaluatorError);
        if (err instanceof EvaluatorError) {
          expect(err.code).toBe('DICE_LIMIT_EXCEEDED');
          expect(err.nodeType).toBe('FateDice');
        }
      }
    });

    test('(2+2)dF evaluates count expression', () => {
      const ast = parse('(2+2)dF');
      const rng = createMockRng([1, 1, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(4);
      expect(result.rolls).toHaveLength(4);
    });
  });

  describe('arithmetic operations', () => {
    test('addition', () => {
      const ast = parse('1d6 + 3');
      const rng = createMockRng([4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(7);
    });

    test('subtraction', () => {
      const ast = parse('1d6 - 2');
      const rng = createMockRng([5]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(3);
    });

    test('multiplication', () => {
      const ast = parse('1d6 * 2');
      const rng = createMockRng([3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(6);
    });

    test('division', () => {
      const ast = parse('1d6 / 2');
      const rng = createMockRng([6]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(3);
    });

    test('modulo', () => {
      const ast = parse('1d10 % 3');
      const rng = createMockRng([7]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(1);
    });

    test('exponentiation', () => {
      const ast = parse('2 ** 3');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(8);
    });

    test('complex expression with precedence', () => {
      const ast = parse('1d6 + 2 * 3');
      const rng = createMockRng([4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(10); // 4 + (2 * 3) = 10
    });

    test('parenthesized expression', () => {
      const ast = parse('(1d4 + 1) * 2');
      const rng = createMockRng([3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(8); // (3 + 1) * 2 = 8
    });
  });

  describe('negative numbers - CRITICAL', () => {
    test('negative result is NOT clamped to zero', () => {
      const ast = parse('1d4 - 5');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-4); // 1 - 5 = -4, NOT 0!
    });

    test('unary minus on dice', () => {
      const ast = parse('-1d4');
      const rng = createMockRng([3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-3);
    });

    test('binary minus equivalent to unary', () => {
      const ast1 = parse('-1d4');
      const ast2 = parse('0 - 1d4');
      const rng1 = createMockRng([3]);
      const rng2 = createMockRng([3]);

      expect(evaluate(ast1, rng1).total).toBe(-3);
      expect(evaluate(ast2, rng2).total).toBe(-3);
    });

    test('negative literal', () => {
      const ast = parse('-5');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-5);
    });
  });

  describe('keep highest modifier', () => {
    test('keeps highest die from pool', () => {
      const ast = parse('2d20kh1');
      const rng = createMockRng([7, 15]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(15);
      expect(result.rolls).toHaveLength(2);
      expect(getDie(result.rolls, 0).modifiers).toContain('dropped');
      expect(getDie(result.rolls, 1).modifiers).toContain('kept');
    });

    test('advantage roll (2d20kh1)', () => {
      const ast = parse('2d20kh1');
      const rng = createMockRng([12, 18]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(18);
    });

    test('keep multiple highest', () => {
      const ast = parse('4d6kh3');
      const rng = createMockRng([3, 5, 2, 6]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(14); // 5 + 3 + 6 = 14
      expect(result.rolls.filter((r) => r.modifiers.includes('dropped'))).toHaveLength(1);
    });
  });

  describe('keep lowest modifier', () => {
    test('keeps lowest die from pool', () => {
      const ast = parse('2d20kl1');
      const rng = createMockRng([15, 7]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(7);
      expect(getDie(result.rolls, 0).modifiers).toContain('dropped');
      expect(getDie(result.rolls, 1).modifiers).toContain('kept');
    });

    test('disadvantage roll (2d20kl1)', () => {
      const ast = parse('2d20kl1');
      const rng = createMockRng([18, 12]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(12);
    });
  });

  describe('drop lowest modifier', () => {
    test('drops lowest die from pool', () => {
      const ast = parse('4d6dl1');
      const rng = createMockRng([4, 2, 5, 3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(12); // 4 + 5 + 3 = 12
      expect(getDie(result.rolls, 1).modifiers).toContain('dropped');
    });

    test('stat generation (4d6dl1)', () => {
      const ast = parse('4d6dl1');
      const rng = createMockRng([3, 5, 6, 2]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(14); // 3 + 5 + 6 = 14, drop 2
    });
  });

  describe('drop highest modifier', () => {
    test('drops highest die from pool', () => {
      const ast = parse('4d6dh1');
      const rng = createMockRng([4, 2, 6, 3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(9); // 4 + 2 + 3 = 9
      expect(getDie(result.rolls, 2).modifiers).toContain('dropped');
    });
  });

  describe('chained modifiers', () => {
    test('dl1kh3 drops union of both modifier drop sets', () => {
      // [3,1,4,2]: dl1 drops {idx1}, kh3 drops {idx1} → union {1} → total 9
      const ast = parse('4d6dl1kh3');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(9);
      expect(result.rolls).toHaveLength(4);
      expect(getDie(result.rolls, 0).modifiers).toContain('kept');
      expect(getDie(result.rolls, 1).modifiers).toContain('dropped');
      expect(getDie(result.rolls, 2).modifiers).toContain('kept');
      expect(getDie(result.rolls, 3).modifiers).toContain('kept');
    });

    test('kh1dh1 drops all dice when keep and drop conflict', () => {
      // [1,2,7]: kh1 drops {0,1}, dh1 drops {2} → union {0,1,2} → total 0
      const ast = parse('3d10kh1dh1');
      const rng = createMockRng([1, 2, 7]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls.every((r) => r.modifiers.includes('dropped'))).toBe(true);
    });

    test('dl1kh1 keeps only the intersection of kept sets', () => {
      // [3,1,4,2]: kh1 drops {0,1,3}, dl1 drops {1} → union {0,1,3} → keeps idx2 (4)
      const ast = parse('4d6dl1kh1');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(4);
      expect(result.rolls.filter((r) => r.modifiers.includes('dropped'))).toHaveLength(3);
    });

    test('modifier order does not affect result', () => {
      const ast1 = parse('4d6dl1kh3');
      const ast2 = parse('4d6kh3dl1');
      const rng1 = createMockRng([3, 1, 4, 2]);
      const rng2 = createMockRng([3, 1, 4, 2]);

      expect(evaluate(ast1, rng1).total).toBe(evaluate(ast2, rng2).total);
    });

    test('triple chain applies all three modifiers independently', () => {
      // [3,1,4,2]: dl1→{1}, kh3→{1}, dh1→{2} → union {1,2} → total 5
      const ast = parse('4d6dl1kh3dh1');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(5);
      expect(result.rolls.filter((r) => r.modifiers.includes('dropped'))).toHaveLength(2);
    });

    test('expression string includes all modifier codes', () => {
      const ast = parse('4d6dl1kh3');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      expect(result.expression).toBe('4d6dl1kh3');
    });

    test('rendered shows dropped dice with strikethrough', () => {
      const ast = parse('3d10kh1dh1');
      const rng = createMockRng([1, 2, 7]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toContain('~~1~~');
      expect(result.rendered).toContain('~~2~~');
      expect(result.rendered).toContain('~~7~~');
    });

    test('same modifier twice does not stack (dl1dl1 ≠ dl2)', () => {
      // Each dl1 independently drops the same lowest die
      const ast = parse('4d6dl1dl1');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      // Both dl1s drop idx1 (value 1), union = {1}, total = 9
      expect(result.total).toBe(9);
      expect(result.rolls.filter((r) => r.modifiers.includes('dropped'))).toHaveLength(1);
    });

    test('all tied values with conflicting modifiers drops all', () => {
      // [3,3,3]: kh1 keeps idx0, drops {1,2}; dl1 drops idx0 → union {0,1,2}
      const ast = parse('3d6kh1dl1');
      const rng = createMockRng([3, 3, 3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls.every((r) => r.modifiers.includes('dropped'))).toBe(true);
    });

    test('kh0 in chain drops all dice', () => {
      // kh0 drops all → {0,1,2,3}; dl1 drops {1} → union = all
      const ast = parse('4d6kh0dl1');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls.every((r) => r.modifiers.includes('dropped'))).toBe(true);
    });
  });

  describe('critical and fumble detection', () => {
    test('detects critical (max value)', () => {
      const ast = parse('1d20');
      const rng = createMockRng([20]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).critical).toBe(true);
      expect(getDie(result.rolls, 0).fumble).toBe(false);
    });

    test('detects fumble (rolled 1)', () => {
      const ast = parse('1d20');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).fumble).toBe(true);
      expect(getDie(result.rolls, 0).critical).toBe(false);
    });

    test('1d1 is fumble but not critical', () => {
      const ast = parse('1d1');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).critical).toBe(false);
      expect(getDie(result.rolls, 0).fumble).toBe(true);
    });

    test('normal roll has no critical or fumble', () => {
      const ast = parse('1d20');
      const rng = createMockRng([10]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).critical).toBe(false);
      expect(getDie(result.rolls, 0).fumble).toBe(false);
    });

    test('critical on d6', () => {
      const ast = parse('1d6');
      const rng = createMockRng([6]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).critical).toBe(true);
    });
  });

  describe('result metadata', () => {
    test('includes notation in result', () => {
      const ast = parse('2d6+3');
      const rng = createMockRng([4, 5]);
      const result = evaluate(ast, rng, { notation: '2d6+3' });

      expect(result.notation).toBe('2d6+3');
    });

    test('includes expression', () => {
      const ast = parse('2d6 + 3');
      const rng = createMockRng([4, 5]);
      const result = evaluate(ast, rng);

      expect(result.expression).toContain('2d6');
      expect(result.expression).toContain('+');
      expect(result.expression).toContain('3');
    });

    test('includes rendered output with individual rolls', () => {
      const ast = parse('2d6');
      const rng = createMockRng([4, 5]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toContain('[4, 5]');
      expect(result.rendered).toContain('= 9');
    });

    test('rendered output shows dropped dice with strikethrough', () => {
      const ast = parse('2d20kh1');
      const rng = createMockRng([7, 15]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toContain('~~7~~');
      expect(result.rendered).toContain('15');
    });
  });

  describe('edge cases', () => {
    test('zero dice count', () => {
      const ast = parse('0d6');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls).toHaveLength(0);
    });

    test('computed dice count', () => {
      const ast = parse('(1+1)d6');
      const rng = createMockRng([3, 4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('computed dice sides', () => {
      const ast = parse('1d(2*3)');
      const rng = createMockRng([5]);
      const result = evaluate(ast, rng);

      expect(getDie(result.rolls, 0).sides).toBe(6);
    });

    test('division by zero throws', () => {
      const ast = parse('1d6 / 0');
      const rng1 = createMockRng([3]);
      const rng2 = createMockRng([3]);

      expect(() => evaluate(ast, rng1)).toThrow(EvaluatorError);
      expect(() => evaluate(ast, rng2)).toThrow('Division by zero');
    });

    test('modulo by zero throws', () => {
      const ast = parse('1d6 % 0');
      const rng = createMockRng([3]);

      expect(() => evaluate(ast, rng)).toThrow('Modulo by zero');
    });

    test('chained modifiers produce exactly one kept or dropped per die', () => {
      const ast = parse('4d6dl1kh3');
      const rng = createMockRng([3, 1, 4, 2]);
      const result = evaluate(ast, rng);

      for (const die of result.rolls) {
        const kept = die.modifiers.filter((m) => m === 'kept');
        const dropped = die.modifiers.filter((m) => m === 'dropped');
        const total = kept.length + dropped.length;
        expect(total).toBe(1);
      }
    });

    test('implicit modifier count (4d6kh) keeps highest 1', () => {
      const ast = parse('4d6kh');
      const rng = createMockRng([3, 5, 2, 6]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(6);
      expect(result.expression).toBe('4d6kh1');
    });

    test('keeps all dice when keep count exceeds pool', () => {
      const ast = parse('2d6kh5');
      const rng = createMockRng([3, 4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(7);
      expect(result.rolls.every((r) => r.modifiers.includes('kept'))).toBe(true);
    });

    test('drops all dice when drop count equals pool', () => {
      const ast = parse('2d6dl2');
      const rng = createMockRng([3, 4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(0);
      expect(result.rolls.every((r) => r.modifiers.includes('dropped'))).toBe(true);
    });
  });

  describe('dice count safety limit', () => {
    test('DEFAULT_MAX_DICE is 10,000', () => {
      expect(DEFAULT_MAX_DICE).toBe(10_000);
    });

    test('allows dice count at the limit', () => {
      const ast = parse('3d6');
      const rng = createMockRng([1, 2, 3]);
      const result = evaluate(ast, rng, { maxDice: 3 });

      expect(result.total).toBe(6);
      expect(result.rolls).toHaveLength(3);
    });

    test('throws when single group exceeds limit', () => {
      const ast = parse('5d6');
      const rng = createMockRng([1, 2, 3, 4, 5]);

      expect(() => evaluate(ast, rng, { maxDice: 4 })).toThrow(EvaluatorError);
      expect(() => evaluate(ast, rng, { maxDice: 4 })).toThrow(
        'Total dice count 5 exceeds limit of 4',
      );
    });

    test('throws when aggregate across groups exceeds limit', () => {
      const ast = parse('3d6+3d6');
      const rng = createMockRng([1, 2, 3, 4, 5, 6]);

      expect(() => evaluate(ast, rng, { maxDice: 5 })).toThrow(EvaluatorError);
      expect(() => evaluate(ast, rng, { maxDice: 5 })).toThrow(
        'Total dice count 6 exceeds limit of 5',
      );
    });

    test('aggregate limit allows exact total', () => {
      const ast = parse('3d6+2d6');
      const rng = createMockRng([1, 2, 3, 4, 5]);
      const result = evaluate(ast, rng, { maxDice: 5 });

      expect(result.total).toBe(15);
      expect(result.rolls).toHaveLength(5);
    });

    test('consumer can raise the limit', () => {
      const ast = parse('3d6');
      const rng = createMockRng([1, 2, 3]);
      const result = evaluate(ast, rng, { maxDice: 100_000 });

      expect(result.total).toBe(6);
    });

    test('zero dice count passes without incrementing counter', () => {
      const ast = parse('0d6');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng, { maxDice: 1 });

      expect(result.total).toBe(0);
      expect(result.rolls).toHaveLength(0);
    });

    test('invalid maxDice falls back to default', () => {
      const ast = parse('3d6');
      const vals = [1, 2, 3];

      // NaN, negative, Infinity, zero — all fall back to DEFAULT_MAX_DICE
      expect(() => evaluate(ast, createMockRng(vals), { maxDice: Number.NaN })).not.toThrow();
      expect(() => evaluate(ast, createMockRng(vals), { maxDice: -1 })).not.toThrow();
      expect(() =>
        evaluate(ast, createMockRng(vals), { maxDice: Number.POSITIVE_INFINITY }),
      ).not.toThrow();
      expect(() => evaluate(ast, createMockRng(vals), { maxDice: 0 })).not.toThrow();
    });

    test('float maxDice is floored', () => {
      const ast = parse('3d6');
      const rng = createMockRng([1, 2, 3]);

      // maxDice: 2.9 → floor → 2, so 3d6 should throw
      expect(() => evaluate(ast, rng, { maxDice: 2.9 })).toThrow(EvaluatorError);
    });

    test('error message includes actual count and limit', () => {
      const ast = parse('10d6');
      const rng = createMockRng(Array.from({ length: 10 }, () => 1));

      try {
        evaluate(ast, rng, { maxDice: 5 });
        expect.unreachable('should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EvaluatorError);
        expect((error as EvaluatorError).message).toBe('Total dice count 10 exceeds limit of 5');
      }
    });
  });

  describe('exploding dice', () => {
    describe('standard explode (!)', () => {
      test('no explosion when roll does not match', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(3);
        expect(result.rolls).toHaveLength(1);
        expect(getDie(result.rolls, 0).modifiers).toContain('kept');
        expect(getDie(result.rolls, 0).modifiers).not.toContain('exploded');
      });

      test('one explosion appends new die', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([6, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(9);
        expect(result.rolls).toHaveLength(2);
        expect(getDie(result.rolls, 0).modifiers).not.toContain('exploded');
        expect(getDie(result.rolls, 1).modifiers).toEqual(['exploded', 'kept']);
      });

      test('chained explosions keep appending', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([6, 6, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(14);
        expect(result.rolls).toHaveLength(3);
      });

      test('multi-die pool explodes independently (explosion interleaved with originals)', () => {
        // RNG [6, 3, 2]: initial pool [6, 3]. Die 0 (=6) explodes → 2.
        // Final pool order: [6, 2, 3] — explosions appended right after their
        // triggering die.
        const ast = parse('2d6!');
        const rng = createMockRng([6, 3, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(11);
        expect(result.rolls).toHaveLength(3);
        expect(getDie(result.rolls, 0).result).toBe(6);
        expect(getDie(result.rolls, 1).result).toBe(2);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['exploded', 'kept']);
        expect(getDie(result.rolls, 2).result).toBe(3);
      });

      test('infinite-explode d1 throws EXPLODE_LIMIT_EXCEEDED', () => {
        const ast = parse('1d1!');
        const rng = createMockRng(Array.from({ length: 2000 }, () => 1));

        expect(() => evaluate(ast, rng)).toThrow(EvaluatorError);
        try {
          evaluate(parse('1d1!'), createMockRng(Array.from({ length: 2000 }, () => 1)));
        } catch (err) {
          expect((err as EvaluatorError).code).toBe('EXPLODE_LIMIT_EXCEEDED');
        }
      });

      test('maxExplodeIterations option caps per-die chain', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([6, 6, 6, 6, 6, 6]);

        expect(() => evaluate(ast, rng, { maxExplodeIterations: 2 })).toThrow(EvaluatorError);
      });

      test('maxExplodeIterations of 0 rejects any explosion', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([6, 2]);

        expect(() => evaluate(ast, rng, { maxExplodeIterations: 0 })).toThrow(EvaluatorError);
      });
    });

    describe('compound explode (!!)', () => {
      test('accumulates into single die result', () => {
        const ast = parse('1d6!!');
        const rng = createMockRng([6, 6, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(15);
        expect(result.rolls).toHaveLength(1);
        expect(getDie(result.rolls, 0).result).toBe(15);
        expect(getDie(result.rolls, 0).sides).toBe(6);
        expect(getDie(result.rolls, 0).modifiers).toContain('exploded');
        expect(getDie(result.rolls, 0).modifiers).toContain('kept');
      });

      test('no-op without explosion preserves single-kept die', () => {
        const ast = parse('1d6!!');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(3);
        expect(result.rolls).toHaveLength(1);
        expect(getDie(result.rolls, 0).result).toBe(3);
        expect(getDie(result.rolls, 0).modifiers).toContain('kept');
        expect(getDie(result.rolls, 0).modifiers).not.toContain('exploded');
      });

      test('threshold compound: 1d6!!>=5', () => {
        const ast = parse('1d6!!>=5');
        const rng = createMockRng([5, 6, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(13);
        expect(result.rolls).toHaveLength(1);
        expect(getDie(result.rolls, 0).result).toBe(13);
      });
    });

    describe('penetrating explode (!p)', () => {
      test('explosion result decremented by 1', () => {
        const ast = parse('1d6!p');
        const rng = createMockRng([6, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
        expect(result.rolls).toHaveLength(2);
        expect(getDie(result.rolls, 1).result).toBe(2);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['exploded', 'kept']);
      });

      test('penetrating can produce 0', () => {
        const ast = parse('1d6!p');
        const rng = createMockRng([6, 1]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(6);
        expect(getDie(result.rolls, 1).result).toBe(0);
      });

      test('explosion predicate uses raw roll', () => {
        // RNG = [6, 6, 2]: raw 6 triggers, raw 6 triggers again, raw 2 stops.
        // Stored results: [6, 5, 1] → total 12.
        const ast = parse('1d6!p');
        const rng = createMockRng([6, 6, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(12);
        expect(result.rolls).toHaveLength(3);
        expect(getDie(result.rolls, 1).result).toBe(5);
        expect(getDie(result.rolls, 2).result).toBe(1);
      });
    });

    describe('thresholds', () => {
      test('explode when >4', () => {
        const ast = parse('1d6!>4');
        const rng = createMockRng([5, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
        expect(result.rolls).toHaveLength(2);
      });

      test('explode when >=5', () => {
        const ast = parse('1d6!>=5');
        const rng = createMockRng([5, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
      });

      test('explode when =6', () => {
        const ast = parse('1d6!=6');
        const rng = createMockRng([6, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(9);
      });

      test('explode when <2 (low exploder)', () => {
        const ast = parse('1d6!<2');
        const rng = createMockRng([1, 4]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(5);
        expect(result.rolls).toHaveLength(2);
      });
    });

    describe('modifier chain interaction', () => {
      test('4d6!kh3 explodes first, then keeps highest 3', () => {
        // RNG: 4 dice then one explosion. [6, 3, 1, 4, 2]:
        //   initial pool [6, 3, 1, 4]; 6 triggers explosion → [6, 3, 1, 4, 2]
        //   kh3 keeps top 3 by result: 6, 4, 3 → total 13
        const ast = parse('4d6!kh3');
        const rng = createMockRng([6, 3, 1, 4, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(13);
        expect(result.rolls).toHaveLength(5);
      });

      test('4d6kh3! keeps highest 3 first, then explodes only kept dice', () => {
        // RNG: 4 dice. Initial [6, 3, 1, 4]. kh3 keeps 6,4,3 and drops 1.
        // Explode only kept dice with max = 6 → kept die rolling 6 explodes.
        // Next RNG value consumed is the explosion roll.
        const ast = parse('4d6kh3!');
        const rng = createMockRng([6, 3, 1, 4, 2]);
        const result = evaluate(ast, rng);

        // Kept dice: 6 (then +2 exploded), 4, 3 = 6 + 2 + 4 + 3 = 15
        // Dropped: 1
        expect(result.total).toBe(15);
        // Pool: 4 original + 1 explosion = 5, but 1 is marked dropped.
        expect(result.rolls).toHaveLength(5);
      });

      test('explosion counts against global maxDice', () => {
        // 2d6! with all sixes would grow unboundedly. maxDice=4 lets the
        // initial 2 rolls plus 2 explosions occur before the next explosion
        // would exceed the cap.
        const ast = parse('2d6!');
        const rng = createMockRng([6, 6, 6, 6, 6, 6]);

        expect(() => evaluate(ast, rng, { maxDice: 4 })).toThrow(EvaluatorError);
      });
    });

    describe('edge cases', () => {
      test('0d6! empty pool explodes nothing', () => {
        const ast = parse('0d6!');
        const rng = createMockRng([]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(0);
        expect(result.rolls).toHaveLength(0);
      });

      test('Fate dice + explode: defensive skip (sides=0 never explodes)', () => {
        const ast = parse('1dF!');
        const rng = createMockRng([0]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(0);
        expect(result.rolls).toHaveLength(1);
        expect(getDie(result.rolls, 0).modifiers).not.toContain('exploded');
      });

      test('expression string includes explode notation', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.expression).toContain('1d6!');
      });

      test('expression string includes threshold', () => {
        const ast = parse('1d6!>4');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.expression).toContain('1d6!>4');
      });

      test('compound explode expression string uses !!', () => {
        const ast = parse('1d6!!');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.expression).toContain('1d6!!');
      });

      test('penetrating explode expression string uses !p', () => {
        const ast = parse('1d6!p');
        const rng = createMockRng([3]);
        const result = evaluate(ast, rng);

        expect(result.expression).toContain('1d6!p');
      });

      test('rendered string contains expanded pool', () => {
        const ast = parse('1d6!');
        const rng = createMockRng([6, 3]);
        const result = evaluate(ast, rng);

        expect(result.rendered).toContain('[6, 3]');
      });
    });
  });

  describe('reroll mechanics', () => {
    describe('recursive reroll (r)', () => {
      test('single match re-rolls until condition fails', () => {
        const ast = parse('2d6r<2');
        // RNG: die 0 rolls 1, die 1 rolls 5, die 0 re-rolls 3.
        // Pool ordering: intermediate + final for die 0 first, then die 1.
        const rng = createMockRng([1, 5, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
        expect(result.rolls).toHaveLength(3);
        expect(getDie(result.rolls, 0).result).toBe(1);
        expect(getDie(result.rolls, 0).modifiers).toContain('rerolled');
        expect(getDie(result.rolls, 0).modifiers).toContain('dropped');
        expect(getDie(result.rolls, 1).result).toBe(3);
        expect(getDie(result.rolls, 1).modifiers).toContain('kept');
        expect(getDie(result.rolls, 2).result).toBe(5);
        expect(getDie(result.rolls, 2).modifiers).toContain('kept');
      });

      test('multiple matches on same die keep re-rolling', () => {
        const ast = parse('1d6r<3');
        // 1 (match) → 2 (match) → 5 (stop).
        const rng = createMockRng([1, 2, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(5);
        expect(result.rolls).toHaveLength(3);
        expect(getDie(result.rolls, 0).modifiers).toEqual(['rerolled', 'dropped']);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['rerolled', 'dropped']);
        expect(getDie(result.rolls, 2).modifiers).toEqual(['kept']);
      });

      test('always-matching condition throws REROLL_LIMIT_EXCEEDED', () => {
        // `1d6r<7` — all d6 results are < 7 → infinite.
        expect(() =>
          evaluate(parse('1d6r<7'), createMockRng(Array.from({ length: 2000 }, () => 1))),
        ).toThrow(EvaluatorError);

        try {
          evaluate(parse('1d6r<7'), createMockRng(Array.from({ length: 2000 }, () => 1)));
        } catch (err) {
          expect((err as EvaluatorError).code).toBe('REROLL_LIMIT_EXCEEDED');
        }
      });

      test('maxRerollIterations caps the chain', () => {
        expect(() =>
          evaluate(parse('1d6r<6'), createMockRng([1, 1, 1, 1, 5]), { maxRerollIterations: 2 }),
        ).toThrow(EvaluatorError);
      });

      test('maxRerollIterations of 0 rejects any reroll', () => {
        expect(() =>
          evaluate(parse('1d6r<3'), createMockRng([1, 5]), { maxRerollIterations: 0 }),
        ).toThrow(EvaluatorError);
      });

      test('non-matching dice pass through untouched', () => {
        const ast = parse('2d6r<2');
        const rng = createMockRng([3, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
        expect(result.rolls).toHaveLength(2);
        expect(getDie(result.rolls, 0).modifiers).toEqual(['kept']);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['kept']);
      });

      test('negative compare value with Fate dice (4dFr=-1)', () => {
        const ast = parse('4dFr=-1');
        // Dice: -1 (match) → 0, 0, 1, -1 (match) → 0.
        const rng = createMockRng([-1, 0, 1, -1, 0, 0]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(1); // 0 + 0 + 1 + 0

        // Two intermediate rerolled -1s should appear in rolls.
        const rerolled = result.rolls.filter((d) => d.modifiers.includes('rerolled'));
        expect(rerolled).toHaveLength(2);
        expect(rerolled.every((d) => d.result === -1)).toBe(true);
        expect(rerolled.every((d) => d.modifiers.includes('dropped'))).toBe(true);
      });

      test('rendered output marks intermediate dice with strikethrough', () => {
        const ast = parse('2d6r<2');
        const rng = createMockRng([1, 5, 3]);
        const result = evaluate(ast, rng);

        expect(result.rendered).toContain('~~1~~');
        expect(result.rendered).toContain('5');
        expect(result.rendered).toContain('3');
      });

      test('expression string retains the reroll code', () => {
        const ast = parse('2d6r<2');
        const rng = createMockRng([3, 4]);
        const result = evaluate(ast, rng);

        expect(result.expression).toContain('r<2');
      });
    });

    describe('reroll-once (ro)', () => {
      test('keeps second result regardless of match', () => {
        const ast = parse('2d6ro<3');
        // Die 0: 2 (match) → 1 (still matches, but kept). Die 1: 5.
        const rng = createMockRng([2, 5, 1]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(6); // 1 + 5
        expect(result.rolls).toHaveLength(3);
        expect(getDie(result.rolls, 0).result).toBe(2);
        expect(getDie(result.rolls, 0).modifiers).toEqual(['rerolled', 'dropped']);
        expect(getDie(result.rolls, 1).result).toBe(1);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['kept']);
        expect(getDie(result.rolls, 2).result).toBe(5);
      });

      test('always terminates even when condition remains satisfiable', () => {
        const ast = parse('1d6ro<7');
        const rng = createMockRng([3, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(5);
        expect(result.rolls).toHaveLength(2);
      });

      test('no-op when condition does not match', () => {
        const ast = parse('2d6ro<3');
        const rng = createMockRng([4, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(9);
        expect(result.rolls).toHaveLength(2);
        expect(getDie(result.rolls, 0).modifiers).toEqual(['kept']);
        expect(getDie(result.rolls, 1).modifiers).toEqual(['kept']);
      });
    });

    describe('modifier chain interactions', () => {
      test('reroll then keep highest: intermediate high roll does not win kh', () => {
        // `2d6r>4kh1` — die 0 rolls 6 (>4, rerolled → 2), die 1 rolls 3.
        // Final pool is [2, 3]. kh1 should pick 3, not the rerolled 6.
        const ast = parse('2d6r>4kh1');
        const rng = createMockRng([6, 3, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(3);
      });

      test('reroll then keep highest: 2d6r<2kh1', () => {
        // Die 0: 1 (match) → 4. Die 1: 2. kh1 picks 4.
        const ast = parse('2d6r<2kh1');
        const rng = createMockRng([1, 2, 4]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(4);
      });

      test('keep highest then reroll only runs on the survivor', () => {
        // Parse: Reroll(r<2, Modifier(kh1, Dice)). kh1 keeps higher, reroll
        // only touches the kept die.
        const ast = parse('2d6kh1r<2');
        // Rolls: 5, 1. kh1 keeps 5 (index 0); 1 is dropped. Reroll on 5 — no match.
        const rng = createMockRng([5, 1]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(5);
      });

      test('chained reroll-once then recursive: 2d6ro<2r<3', () => {
        // Parse: Reroll(r<3, Reroll(ro<2, Dice)).
        // Die 0: 1 (ro<2 matches) → 2. Then outer r<3: 2 matches → 5 (stop).
        // Die 1: 4. ro<2 no match (kept → 4). Outer r<3: 4 no match.
        const ast = parse('2d6ro<2r<3');
        const rng = createMockRng([1, 4, 2, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(9); // 5 + 4
      });

      test('dropped target: pre-dropped die is not rerolled', () => {
        // `2d6dl1r<5` — dl1 drops the lowest; reroll leaves it alone.
        // Rolls: 3, 5. dl1 drops 3. Reroll(r<5) on [3(dropped), 5(kept)] —
        // only 5 is eligible, 5 is not <5 → no reroll.
        const ast = parse('2d6dl1r<5');
        const rng = createMockRng([3, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(5);
      });

      test('reroll then explode preserves modifier semantics', () => {
        // `2d6r<2!` — reroll first, then explode.
        const ast = parse('2d6r<2!');
        // Die 0: 1 → 3. Die 1: 6 (triggers explode) → 2.
        const rng = createMockRng([1, 6, 3, 2]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(11); // 3 + 6 + 2
      });
    });

    describe('edge cases', () => {
      test('zero-count dice: 0d6r<2 is a no-op', () => {
        const ast = parse('0d6r<2');
        const rng = createMockRng([]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(0);
        expect(result.rolls).toHaveLength(0);
      });

      test('impossible condition never matches', () => {
        const ast = parse('2d6r<1');
        const rng = createMockRng([3, 5]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(8);
        expect(result.rolls).toHaveLength(2);
        expect(result.rolls.every((d) => !d.modifiers.includes('rerolled'))).toBe(true);
      });

      test('reroll in binary op: 2d6r<2+5', () => {
        const ast = parse('2d6r<2+5');
        const rng = createMockRng([1, 4, 3]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(12); // 3 + 4 + 5
      });

      test('reroll Fate dice without negative: 4dFr=1', () => {
        const ast = parse('4dFr=1');
        // Rolls: 1 (match) → 0, -1, 0, 1 (match) → -1.
        const rng = createMockRng([1, -1, 0, 1, 0, -1]);
        const result = evaluate(ast, rng);

        expect(result.total).toBe(-2); // 0 + -1 + 0 + -1
      });
    });
  });

  describe('success counting', () => {
    test('basic count — 10d10>=6 with [1..10]', () => {
      const ast = parse('10d10>=6');
      const rng = createMockRng([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(5);
      expect(result.successes).toBe(5);
      expect(result.failures).toBe(0);
      expect(result.expression).toBe('10d10>=6');
    });

    test('fail threshold subtracts — 10d10>=6f1', () => {
      const ast = parse('10d10>=6f1');
      const rng = createMockRng([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(4); // 5 successes - 1 failure
      expect(result.successes).toBe(5);
      expect(result.failures).toBe(1);
    });

    test('success wins on overlap — 3d6>=3f3 with [3,5,1]', () => {
      const ast = parse('3d6>=3f3');
      const rng = createMockRng([3, 5, 1]);
      const result = evaluate(ast, rng);

      // The 3 matches both >=3 and =3, but success wins.
      expect(result.successes).toBe(2); // 3, 5
      expect(result.failures).toBe(0);
      expect(result.total).toBe(2);
      expect(getDie(result.rolls, 0).modifiers).toContain('success');
      expect(getDie(result.rolls, 0).modifiers).not.toContain('failure');
    });

    test('negative total is allowed', () => {
      const ast = parse('3d6>=6f1');
      const rng = createMockRng([1, 1, 1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-3);
      expect(result.successes).toBe(0);
      expect(result.failures).toBe(3);
    });

    test('strict greater: 5d6>5 with [1,5,6,6,3]', () => {
      const ast = parse('5d6>5');
      const rng = createMockRng([1, 5, 6, 6, 3]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2); // two 6s
      expect(result.total).toBe(2);
    });

    test('equals: 5d6=6 with [1,6,6,3,2]', () => {
      const ast = parse('5d6=6');
      const rng = createMockRng([1, 6, 6, 3, 2]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2);
    });

    test('keep-then-count skips dropped dice — 4d6kh3>=5', () => {
      const ast = parse('4d6kh3>=5');
      const rng = createMockRng([1, 5, 6, 3]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2); // 5 and 6 among kept {5,6,3}
      expect(result.total).toBe(2);
      expect(result.rolls).toHaveLength(4);
      // The dropped die must not be tagged with success/failure.
      const dropped = result.rolls.find((d) => d.modifiers.includes('dropped'));
      expect(dropped).toBeDefined();
      expect(dropped?.modifiers.includes('success')).toBe(false);
      expect(dropped?.modifiers.includes('failure')).toBe(false);
    });

    test('reroll-then-count excludes rerolled intermediates — 4d6r<3>=5', () => {
      // First 4 rolls: [1, 5, 2, 6]. `1` rerolls → 3 (kept). `2` rerolls → 4 (kept).
      // Final kept pool: [3, 5, 4, 6]. >=5 count: 2.
      const ast = parse('4d6r<3>=5');
      const rng = createMockRng([1, 5, 2, 6, 3, 4]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2);
      expect(result.total).toBe(2);

      // Intermediate rerolls are 'dropped' and must not carry success/failure.
      const intermediates = result.rolls.filter((d) => d.modifiers.includes('rerolled'));
      expect(intermediates.length).toBe(2);
      for (const d of intermediates) {
        expect(d.modifiers.includes('success')).toBe(false);
        expect(d.modifiers.includes('failure')).toBe(false);
      }
    });

    test('rendered output uses ** and __ markers', () => {
      const ast = parse('3d6>=5f1');
      const rng = createMockRng([1, 5, 3]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toContain('**5**'); // success
      expect(result.rendered).toContain('__1__'); // failure
      expect(result.rendered).toContain(', 3'); // unmarked
    });

    test('Fate dice + success count with negative fail — 4dF>=1f-1', () => {
      const ast = parse('4dF>=1f-1');
      // Rolls: [1, 0, -1, 1]
      const rng = createMockRng([1, 0, -1, 1]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2); // two +1s
      expect(result.failures).toBe(1); // one -1
      expect(result.total).toBe(1);
    });

    test('computed threshold — 3d6>=(1+4)', () => {
      const ast = parse('3d6>=(1+4)');
      const rng = createMockRng([4, 5, 6]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2); // 5, 6
    });

    test('success/failure fields absent when no success count used', () => {
      const ast = parse('3d6+1');
      const rng = createMockRng([1, 2, 3]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBeUndefined();
      expect(result.failures).toBeUndefined();
    });

    test('failures absent when only threshold used, no fail', () => {
      const ast = parse('3d6>=5');
      const rng = createMockRng([5, 6, 1]);
      const result = evaluate(ast, rng);

      expect(result.successes).toBe(2);
      expect(result.failures).toBe(0);
    });
  });

  describe('versus (PF2e degrees of success)', () => {
    test('Failure: 1d20 vs 15 roll=12', () => {
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([12]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(12);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
      expect(result.natural).toBe(12);
    });

    test('Success: 1d20 vs 15 roll=15', () => {
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([15]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(15);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
    });

    test('CriticalSuccess: 1d20+10 vs 15 roll=15 (total=25 ≥ 25)', () => {
      const ast = parse('1d20+10 vs 15');
      const rng = createMockRng([15]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(25);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalSuccess);
    });

    test('CriticalFailure: 1d20 vs 15 roll=4 (total=4 ≤ 5)', () => {
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([4]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(4);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalFailure);
    });

    test('Failure boundary: 1d20 vs 15 roll=5 (total=5 > dc-10=5 is false)', () => {
      // total > dc-10 → 5 > 5 is false → CriticalFailure
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([5]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(5);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalFailure);
    });

    test('Failure boundary: 1d20 vs 15 roll=6 (total=6 > 5)', () => {
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([6]);
      const result = evaluate(ast, rng);

      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('Nat-20 upgrade: 1d20-2 vs 25 roll=20 (total=18, base=Failure → Success)', () => {
      const ast = parse('1d20-2 vs 25');
      const rng = createMockRng([20]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(18);
      expect(result.natural).toBe(20);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
    });

    test('Nat-1 downgrade: 1d20+15 vs 15 roll=1 (total=16, base=Success → Failure)', () => {
      const ast = parse('1d20+15 vs 15');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(16);
      expect(result.natural).toBe(1);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('Nat-20 does not double-crit: 1d20+20 vs 15 roll=20 already CriticalSuccess', () => {
      const ast = parse('1d20+20 vs 15');
      const rng = createMockRng([20]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(40);
      expect(result.natural).toBe(20);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalSuccess);
    });

    test('Nat-1 does not double-fumble: 1d20-20 vs 15 roll=1 already CriticalFailure', () => {
      const ast = parse('1d20-20 vs 15');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(-19);
      expect(result.natural).toBe(1);
      expect(result.degree).toBe(DegreeOfSuccess.CriticalFailure);
    });

    test('Advantage: 2d20kh1+5 vs 20 rolls=[7,18] → natural=18, Success', () => {
      const ast = parse('2d20kh1+5 vs 20');
      const rng = createMockRng([7, 18]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(23);
      expect(result.natural).toBe(18);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
    });

    test('Disadvantage: 2d20kl1+5 vs 20 rolls=[7,18] → natural=7, Failure', () => {
      const ast = parse('2d20kl1+5 vs 20');
      const rng = createMockRng([7, 18]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(12);
      expect(result.natural).toBe(7);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('No d20: 1d6+10 vs 15 roll=3 → natural undefined, Failure', () => {
      const ast = parse('1d6+10 vs 15');
      const rng = createMockRng([3]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(13);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
      expect(result.natural).toBeUndefined();
    });

    test('No d20, roll=1: no downgrade applies because no natural d20', () => {
      // 1d6 roll=1 is a natural 1 on a d6, not a d20 — no downgrade
      const ast = parse('1d6+14 vs 15');
      const rng = createMockRng([1]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(15);
      expect(result.degree).toBe(DegreeOfSuccess.Success);
      expect(result.natural).toBeUndefined();
    });

    test('Two kept d20s: 1d20+1d20 vs 25 → natural undefined', () => {
      const ast = parse('1d20+1d20 vs 25');
      const rng = createMockRng([6, 10]);
      const result = evaluate(ast, rng);

      // total=16, dc=25: 16 < 25 and 16 > 15 → Failure
      expect(result.total).toBe(16);
      expect(result.natural).toBeUndefined();
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('Two kept d20s with nat-20 present: natural still undefined (ambiguous)', () => {
      const ast = parse('1d20+1d20 vs 25');
      const rng = createMockRng([20, 10]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(30);
      expect(result.natural).toBeUndefined();
      // Base: 30 ≥ 25+10=35? no; 30 ≥ 25? yes → Success (no upgrade, natural undefined)
      expect(result.degree).toBe(DegreeOfSuccess.Success);
    });

    test('Contested check: 1d20 vs 1d20+10 — dc dice on DC side', () => {
      const ast = parse('1d20 vs 1d20+10');
      const rng = createMockRng([15, 10]);
      const result = evaluate(ast, rng);

      // roll total = 15, dc total = 10 + 10 = 20 → 15 < 20 → Failure
      expect(result.total).toBe(15);
      expect(result.natural).toBe(15);
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('Contested check: DC dice do not count as natural d20 source', () => {
      // Roll-side has no d20; DC-side has a d20 that rolls 20 — must not
      // influence natural extraction.
      const ast = parse('1d6+10 vs 1d20');
      const rng = createMockRng([3, 20]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(13);
      expect(result.natural).toBeUndefined();
      // total=13, dc=20 → 13 < 20 but 13 > 10 → Failure
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('No rolls at all: 10 vs 15 → natural undefined, Failure', () => {
      const ast = parse('10 vs 15');
      const rng = createMockRng([]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(10);
      expect(result.natural).toBeUndefined();
      expect(result.degree).toBe(DegreeOfSuccess.Failure);
    });

    test('Rendered output replaces total with degree label', () => {
      const ast = parse('1d20+10 vs 25');
      const rng = createMockRng([15]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toBe('1d20[15] + 10 vs 25 = Success');
    });

    test('Rendered output: Critical Success label', () => {
      const ast = parse('1d20+20 vs 15');
      const rng = createMockRng([20]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toBe('1d20[20] + 20 vs 15 = Critical Success');
    });

    test('Rendered output: Critical Failure label', () => {
      const ast = parse('1d20 vs 15');
      const rng = createMockRng([2]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toBe('1d20[2] vs 15 = Critical Failure');
    });

    test('Rendered output: advantage with dropped die shown', () => {
      const ast = parse('2d20kh1+5 vs 20');
      const rng = createMockRng([7, 18]);
      const result = evaluate(ast, rng);

      expect(result.rendered).toBe('2d20[~~7~~, 18] + 5 vs 20 = Success');
    });

    test('Paren-nested versus throws NESTED_VERSUS at eval time', () => {
      // Parser allows this (left of `vs` is a literal, not Versus); evaluator
      // rejects during dc-side evaluation.
      const ast = parse('1d20 vs (5 vs 3)');

      try {
        evaluate(ast, createMockRng([15]));
        throw new Error('expected evaluate to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(EvaluatorError);
        expect((err as EvaluatorError).code).toBe('NESTED_VERSUS');
      }
    });

    test('Sibling versus in arithmetic do not falsely throw NESTED_VERSUS', () => {
      // `(a vs b) + (c vs d)` — two independent checks under arithmetic.
      // insideVersus must reset between siblings via try/finally.
      const ast = parse('(1d20 vs 15) + (1d20 vs 20)');
      const rng = createMockRng([12, 18]);

      expect(() => evaluate(ast, rng)).not.toThrow();
    });

    test('degree/natural undefined when vs is not the root expression', () => {
      // `(1d20 vs 15) + 5` — versus is a sub-expression, so versusMetadata
      // lives on a sub-ctx and does not populate RollResult. Documented
      // v1 limitation.
      const ast = parse('(1d20 vs 15) + 5');
      const rng = createMockRng([18]);
      const result = evaluate(ast, rng);

      expect(result.total).toBe(23);
      expect(result.degree).toBeUndefined();
      expect(result.natural).toBeUndefined();
    });

    test('RollResult.total is the numeric roll total, not the degree enum', () => {
      const ast = parse('1d20+10 vs 25');
      const rng = createMockRng([15]);
      const result = evaluate(ast, rng);

      expect(typeof result.total).toBe('number');
      expect(result.total).toBe(25);
      expect(result.total).not.toBe(DegreeOfSuccess.Success);
    });

    test('All rolls from both sides present on RollResult.rolls', () => {
      const ast = parse('1d20 vs 1d20+10');
      const rng = createMockRng([15, 8]);
      const result = evaluate(ast, rng);

      expect(result.rolls).toHaveLength(2);
      expect(getDie(result.rolls, 0).result).toBe(15);
      expect(getDie(result.rolls, 1).result).toBe(8);
    });
  });

  describe('math functions', () => {
    test('floor rounds down: floor(10/3)', () => {
      const ast = parse('floor(10/3)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(3);
      expect(result.rolls).toHaveLength(0);
    });

    test('ceil rounds up: ceil(10/3)', () => {
      const ast = parse('ceil(10/3)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(4);
    });

    test('round returns nearest: round(10/3) = 3', () => {
      const ast = parse('round(10/3)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(3);
    });

    test('round uses half-up: round(2.5) = 3', () => {
      const ast = parse('round(2.5)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(3);
    });

    test('abs of negative literal: abs(-5)', () => {
      const ast = parse('abs(-5)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(5);
    });

    test('abs of dice expression: abs(1d4-5) with roll=1', () => {
      const ast = parse('abs(1d4-5)');
      const result = evaluate(ast, createMockRng([1]));

      expect(result.total).toBe(4);
      expect(result.rolls).toHaveLength(1);
    });

    test('floor with dice: floor(1d6/3) with roll=5', () => {
      const ast = parse('floor(1d6/3)');
      const result = evaluate(ast, createMockRng([5]));

      expect(result.total).toBe(1);
      expect(result.rolls).toHaveLength(1);
      expect(getDie(result.rolls, 0).result).toBe(5);
    });

    test('max returns higher: max(1d6, 1d8) with rolls=[3, 7]', () => {
      const ast = parse('max(1d6, 1d8)');
      const result = evaluate(ast, createMockRng([3, 7]));

      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('min returns lower: min(10, 1d20+5) with roll=3', () => {
      const ast = parse('min(10, 1d20+5)');
      const result = evaluate(ast, createMockRng([3]));

      expect(result.total).toBe(8);
      expect(result.rolls).toHaveLength(1);
    });

    test('max variadic 3 args: max(1, 2, 3)', () => {
      const ast = parse('max(1, 2, 3)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(3);
    });

    test('nested functions: floor(floor(10/3)/2)', () => {
      const ast = parse('floor(floor(10/3)/2)');
      const result = evaluate(ast, createMockRng([]));

      expect(result.total).toBe(1);
    });

    test('nested with dice: floor(max(1d6, 1d8)) with rolls=[3, 7]', () => {
      const ast = parse('floor(max(1d6, 1d8))');
      const result = evaluate(ast, createMockRng([3, 7]));

      expect(result.total).toBe(7);
      expect(result.rolls).toHaveLength(2);
    });

    test('rendered output shows dice inside function: floor(1d6/3)', () => {
      const ast = parse('floor(1d6/3)');
      const result = evaluate(ast, createMockRng([5]));

      expect(result.rendered).toBe('floor(1d6[5] / 3) = 1');
      expect(result.expression).toBe('floor(1d6 / 3)');
    });

    test('rendered output shows both dice in max: max(1d6, 1d8)', () => {
      const ast = parse('max(1d6, 1d8)');
      const result = evaluate(ast, createMockRng([3, 7]));

      expect(result.rendered).toBe('max(1d6[3], 1d8[7]) = 7');
    });

    test('function in arithmetic: 2*floor(1d6/2) with roll=5', () => {
      const ast = parse('2*floor(1d6/2)');
      const result = evaluate(ast, createMockRng([5]));

      expect(result.total).toBe(4);
    });

    test('evaluator throws UNKNOWN_FUNCTION for unregistered name (defensive)', () => {
      // Build an AST directly — bypass the parser so we can test the defensive branch.
      const ast = {
        type: 'FunctionCall' as const,
        name: 'sqrt',
        args: [{ type: 'Literal' as const, value: 4 }],
      };
      expect(() => evaluate(ast, createMockRng([]))).toThrow(EvaluatorError);
      try {
        evaluate(ast, createMockRng([]));
      } catch (err) {
        expect((err as EvaluatorError).code).toBe('UNKNOWN_FUNCTION');
      }
    });
  });
});
