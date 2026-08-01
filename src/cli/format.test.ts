import { describe, expect, test } from 'bun:test';
import { createMockRng } from '../rng/mock.js';
import { roll } from '../roll.js';
import { formatResult } from './format.js';

describe('formatResult', () => {
  describe('normal mode', () => {
    test('returns just the total as a string', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 5]) });
      expect(formatResult(result, {})).toBe('11');
    });

    test('handles negative totals', () => {
      const result = roll('1d4-5', { rng: createMockRng([1]) });
      expect(formatResult(result, {})).toBe('-4');
    });

    test('handles zero total', () => {
      const result = roll('0d6');
      expect(formatResult(result, {})).toBe('0');
    });
  });

  describe('verbose mode', () => {
    test('returns rendered breakdown for simple rolls', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 5]) });
      expect(formatResult(result, { verbose: true })).toBe('2d6[3, 5] + 3 = 11');
    });

    test('replaces markdown strikethrough with parentheses for dropped dice', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 1, 5, 4]) });
      expect(formatResult(result, { verbose: true })).toContain('(1)');
      expect(formatResult(result, { verbose: true })).not.toContain('~~');
    });

    test('renders keep highest correctly', () => {
      const result = roll('4d6kh3', { rng: createMockRng([6, 2, 5, 4]) });
      const output = formatResult(result, { verbose: true });
      expect(output).toContain('(2)');
      expect(output).toContain('= 15');
    });

    test('handles single die roll', () => {
      const result = roll('1d20', { rng: createMockRng([15]) });
      expect(formatResult(result, { verbose: true })).toBe('1d20[15] = 15');
    });

    test('replaces strikethrough around negative values (dropped fate dice)', () => {
      const result = roll('4dFkh2', { rng: createMockRng([-1, 0, 1, 1]) });
      const output = formatResult(result, { verbose: true });

      expect(output).toContain('(-1)');
      expect(output).toContain('(0)');
      expect(output).not.toContain('~~');
      expect(output).toBe('4dF[(-1), (0), 1, 1] = 2');
    });

    test('converts intermediate rerolled dice to terminal-friendly parentheses', () => {
      // 2d6r<2 with RNG [1, 5, 3] — die 0 rerolls 1 → 3.
      const result = roll('2d6r<2', { rng: createMockRng([1, 5, 3]) });
      const output = formatResult(result, { verbose: true });

      expect(output).toContain('(1)');
      expect(output).not.toContain('~~');
      expect(output).toContain('= 8');
    });

    test('converts success/failure markers to brackets and braces', () => {
      const result = roll('3d6>=5f1', { rng: createMockRng([1, 5, 3]) });
      const output = formatResult(result, { verbose: true });

      expect(output).toContain('[5]');
      expect(output).toContain('{1}');
      expect(output).not.toContain('**');
      expect(output).not.toContain('__');
    });

    test('converts compound dropped sub-roll spans from group keep', () => {
      // The dropped sub-roll strikethrough wraps notation (`~~1d8[2]~~`), not just a number.
      const result = roll('{1d8, 1d10}kh1', { rng: createMockRng([2, 7]) });
      const output = formatResult(result, { verbose: true });

      expect(output).toBe('{(1d8[2]), 1d10[7]} = 7');
      expect(output).not.toContain('~~');
    });
  });

  describe('json mode', () => {
    test('emits the whole result on a single line', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 5]) });
      const output = formatResult(result, { json: true });

      expect(output).not.toContain('\n');
      expect(JSON.parse(output)).toEqual({
        total: 11,
        notation: '2d6+3',
        expression: '2d6 + 3',
        rendered: '2d6[3, 5] + 3 = 11',
        rolls: result.rolls,
        parts: result.parts,
      });
    });

    test('keeps the structured parts tree', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 1, 5, 4]) });
      const parsed = JSON.parse(formatResult(result, { json: true }));

      expect(parsed.parts.type).toBe('modifier');
      expect(parsed.parts.total).toBe(parsed.total);
      expect(parsed.parts.specs).toEqual([{ kind: 'keep', selector: 'highest', count: 3 }]);
      expect(parsed.parts.target.rolls).toHaveLength(4);
    });

    test('serializes DegreeOfSuccess as a number', () => {
      const result = roll('1d20+10 vs 25', { rng: createMockRng([15]) });
      const parsed = JSON.parse(formatResult(result, { json: true }));

      expect(parsed.degree).toBe(2);
      expect(parsed.parts.degree).toBe(2);
    });

    test('json wins over verbose', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 1, 5, 4]) });

      expect(formatResult(result, { json: true, verbose: true })).toBe(
        formatResult(result, { json: true }),
      );
    });
  });
});
