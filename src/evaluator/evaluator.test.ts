/**
 * Tests for the AST evaluator.
 *
 * @module evaluator/evaluator.test
 */

import { describe, expect, test } from 'bun:test';
import { parse } from '../parser/parser';
import { createMockRng } from '../rng/mock';
import type { DieResult } from '../types';
import { evaluate, EvaluatorError } from './evaluator';

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
});
