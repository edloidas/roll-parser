/**
 * Tests for the AST evaluator.
 *
 * @module evaluator/evaluator.test
 */

import { describe, expect, test } from 'bun:test';
import { parse } from '../parser/parser';
import { createMockRng } from '../rng/mock';
import type { DieResult } from '../types';
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
});
