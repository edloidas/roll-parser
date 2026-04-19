import { describe, expect, test } from 'bun:test';
import { createMockRng } from '../rng/mock';
import { roll } from '../roll';
import { formatResult } from './format';

describe('formatResult', () => {
  describe('normal mode', () => {
    test('returns just the total as a string', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 5]) });
      expect(formatResult(result, false)).toBe('11');
    });

    test('handles negative totals', () => {
      const result = roll('1d4-5', { rng: createMockRng([1]) });
      expect(formatResult(result, false)).toBe('-4');
    });

    test('handles zero total', () => {
      const result = roll('0d6');
      expect(formatResult(result, false)).toBe('0');
    });
  });

  describe('verbose mode', () => {
    test('returns rendered breakdown for simple rolls', () => {
      const result = roll('2d6+3', { rng: createMockRng([3, 5]) });
      expect(formatResult(result, true)).toBe('2d6[3, 5] + 3 = 11');
    });

    test('replaces markdown strikethrough with parentheses for dropped dice', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 1, 5, 4]) });
      expect(formatResult(result, true)).toContain('(1)');
      expect(formatResult(result, true)).not.toContain('~~');
    });

    test('renders keep highest correctly', () => {
      const result = roll('4d6kh3', { rng: createMockRng([6, 2, 5, 4]) });
      const output = formatResult(result, true);
      expect(output).toContain('(2)');
      expect(output).toContain('= 15');
    });

    test('handles single die roll', () => {
      const result = roll('1d20', { rng: createMockRng([15]) });
      expect(formatResult(result, true)).toBe('1d20[15] = 15');
    });

    test('replaces strikethrough around negative values (dropped fate dice)', () => {
      const result = roll('4dFkh2', { rng: createMockRng([-1, 0, 1, 1]) });
      const output = formatResult(result, true);

      expect(output).toContain('(-1)');
      expect(output).toContain('(0)');
      expect(output).not.toContain('~~');
      expect(output).toBe('4dF[(-1), (0), 1, 1] = 2');
    });
  });
});
