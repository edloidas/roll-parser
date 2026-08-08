/**
 * Tests for `roll-parser/render`.
 *
 * The default-marks path is pinned twice: here against a table of concrete
 * notations, chained without the spaces the property-test grammar inserts,
 * and in `property.test.ts` against generated notation. This file also owns
 * the custom-marks contract — composition order, plain slots, and the group
 * wrapper.
 */

import { describe, expect, test } from 'bun:test';
import { evaluate } from './evaluator/evaluator.js';
import type { ASTNode } from './parser/ast.js';
import { type DieMarks, MARKDOWN_MARKS, renderBreakdown } from './render.js';
import { createMockRng } from './rng/mock.js';
import { roll } from './roll.js';
import { DegreeOfSuccess } from './types.js';

/** Every notation in the table is rolled on this seed, not a mock RNG. */
function seeded(notation: string) {
  return roll(notation, {
    seed: `render-${notation}`,
    context: { str: 3, 'my stat': 4 },
  });
}

describe('renderBreakdown', () => {
  describe('default marks reproduce result.rendered', () => {
    const NOTATIONS = [
      '3d6',
      '4d6kh3',
      '4d6kh3dl1',
      '2d6!',
      '2d6!!',
      '2d6!p',
      '2d6!>4',
      '2d6r<3',
      '2d6ro<3',
      '2d6min2',
      '2d6max4',
      '2d6min(-2)',
      '4d6s',
      '4d6sd',
      '4d6>=4',
      '4d6>=4f1',
      '4d6>=4f<2',
      '2d6cs>4',
      '2d6cs',
      '2d6cf<3',
      '2d6cs>5cf<2',
      '4dF',
      '4dFcs>0',
      '1d%',
      '1d20+5 vs 15',
      '1d20 vs 2d10',
      '1d20 vs 2d10kh1',
      '{1d6, 1d8}kh1',
      '{1d6, 1d8, 1d10}kl1',
      '{2d6, 3d6}',
      '{1d6}kh1',
      '{{1d6, 1d8}kh1, 1d10}kh1',
      'floor(1d10/2)',
      'max(1d6, 2)',
      'min(1d6, 1d8)',
      '-1d6',
      '(1d6+2)*3',
      '1d20+@str',
      '1d20+@{my stat}',
      '(1d2)d6',
      '(1d2-1)d6',
      '(1d2-1)d6!',
      '(1d2-1)d6>=4',
      '0d6',
      '0d6!',
      '0d6>=4',
      '0d6min2',
      '4d6kh(1d2)',
      '1d6!>(1d2+3)',
      '2d6!kh1',
      '2d6!!kh1',
      '4d6s dl1',
      '4d6kh3!',
      '4d6kh3 s',
      '(2d6)!',
      '(2d6)kh1',
      '(2d6)min2',
      '{2d6}kh1',
      '{2d6}s',
      '{2d6}>=4',
      '{2d6, 2d6}>=10',
      '{4d6kh3, 1d8}>=10f<=2',
      '{1d20 vs {2d10>=5}, 1d8}>=1',
      '-(2d6)kh1',
      '{4d6kh3, 4d6kh3}kh1',
      '10d20cs>=15',
      '4d6cs>4>=4',
      '2d6 + 3d8kh1 - 1',
    ];

    for (const notation of NOTATIONS) {
      test(notation, () => {
        const result = seeded(notation);
        expect(renderBreakdown(result)).toBe(result.rendered);
      });
    }
  });

  describe('empty pools', () => {
    // The bracket tracks whether the target rolled anything at all, including
    // the meta dice that resolved its count — which never render themselves.
    test('a pool that rolled nothing drops the bracket', () => {
      const result = roll('0d6!', { rng: createMockRng([]) });
      expect(renderBreakdown(result)).toBe('0d6! = 0');
    });

    test('a meta-resolved zero count keeps the empty bracket', () => {
      const result = roll('(1d2-1)d6!', { rng: createMockRng([1]) });
      expect(renderBreakdown(result)).toBe('0d6![] = 0');
    });
  });

  // The parser refuses every one of these targets — `(1+2)!` is an
  // INVALID_EXPLODE_TARGET — but `evaluate` accepts a hand-built AST, and the
  // evaluator has explicit no-dice branches for exactly this. The renderer
  // walks the same shapes, so it needs the same branches.
  describe('dice-less modifier targets on hand-built ASTs', () => {
    const literal: ASTNode = { type: 'Literal', value: 3 };
    const variable: ASTNode = { type: 'Variable', name: 'str' };

    const TARGETS: [label: string, target: ASTNode][] = [
      ['literal', literal],
      ['variable', variable],
      ['binaryOp', { type: 'BinaryOp', operator: '+', left: literal, right: literal }],
      ['unaryOp', { type: 'UnaryOp', operator: '-', operand: literal }],
      ['functionCall', { type: 'FunctionCall', name: 'abs', args: [literal] }],
      ['versus', { type: 'Versus', roll: literal, dc: literal }],
    ];

    const WRAPPERS: [label: string, wrap: (target: ASTNode) => ASTNode][] = [
      ['explode', (target) => ({ type: 'Explode', variant: 'standard', target })],
      [
        'keepDrop',
        (target) => ({
          type: 'KeepDrop',
          kind: 'keep',
          selector: 'highest',
          count: literal,
          target,
        }),
      ],
      ['dieBound', (target) => ({ type: 'DieBound', bound: 'min', value: literal, target })],
      [
        'critThreshold',
        (target) => ({
          type: 'CritThreshold',
          successThresholds: ['default'],
          failThresholds: [],
          target,
        }),
      ],
    ];

    for (const [wrapperLabel, wrap] of WRAPPERS) {
      for (const [targetLabel, target] of TARGETS) {
        test(`${wrapperLabel} over ${targetLabel}`, () => {
          const result = evaluate(wrap(target), createMockRng([]), { context: { str: 3 } });
          expect(renderBreakdown(result)).toBe(result.rendered);
        });
      }
    }
  });

  describe('degree labels', () => {
    const DEGREES: [notation: string, draws: number[], label: string][] = [
      ['1d20 vs 15', [18], 'Success'],
      ['1d20 vs 15', [8], 'Failure'],
      ['1d20+20 vs 15', [18], 'Critical Success'],
      ['1d20 vs 15', [3], 'Critical Failure'],
    ];

    for (const [notation, draws, label] of DEGREES) {
      test(`${notation} on ${draws[0]} renders ${label}`, () => {
        const result = roll(notation, { rng: createMockRng(draws) });
        expect(renderBreakdown(result).endsWith(` = ${label}`)).toBe(true);
        expect(renderBreakdown(result)).toBe(result.rendered);
      });
    }

    test('every DegreeOfSuccess member has a label', () => {
      const labels = DEGREES.map(([, , label]) => label);
      expect(new Set(labels).size).toBe(Object.keys(DegreeOfSuccess).length / 2);
    });
  });

  describe('custom marks', () => {
    const HTML: DieMarks = {
      dropped: (_die, text) => `<s>${text}</s>`,
      success: (_die, text) => `<b>${text}</b>`,
      failure: (_die, text) => `<i>${text}</i>`,
      critical: (_die, text) => `<crit>${text}</crit>`,
      fumble: (_die, text) => `<fumble>${text}</fumble>`,
      droppedGroup: (inner) => `<s>${inner}</s>`,
    };

    test('marks a dropped die', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 4, 2, 5]) });
      expect(renderBreakdown(result, HTML)).toBe('4d6[3, 4, <s>2</s>, 5] = 12');
    });

    test('marks success and failure dice', () => {
      const result = roll('4d6>=5f1', { rng: createMockRng([1, 4, 6, 2]) });
      // The nat 1 and nat 6 also trip the default crit rules, which compose
      // inside the tally marks rather than replacing them.
      expect(renderBreakdown(result, HTML)).toBe(
        '4d6>=5f1[<i><fumble>1</fumble></i>, 4, <b><crit>6</crit></b>, 2] = 0',
      );
    });

    test('marks a critical die', () => {
      const result = roll('2d6', { rng: createMockRng([6, 3]) });
      expect(renderBreakdown(result, HTML)).toBe('2d6[<crit>6</crit>, 3] = 9');
    });

    test('a die that is both critical and fumble gets both, crit innermost', () => {
      const result = roll('1d6cs>0cf<7', { rng: createMockRng([4]) });
      const die = result.rolls[0];

      expect(die?.critical).toBe(true);
      expect(die?.fumble).toBe(true);
      expect(renderBreakdown(result, HTML)).toBe(
        '1d6cs>0cf<7[<fumble><crit>4</crit></fumble>] = 4',
      );
    });

    test('a dropped critical die nests the state mark outermost', () => {
      const result = roll('2d6kh1', { rng: createMockRng([6, 2]) });
      expect(renderBreakdown(result, HTML)).toBe('2d6[<crit>6</crit>, <s>2</s>] = 6');
    });

    test('wraps a group-dropped sub-roll and leaves its dice unmarked', () => {
      const result = roll('{2d6, 1d10}kh1', { rng: createMockRng([3, 4, 9]) });
      expect(renderBreakdown(result, HTML)).toBe('{<s>2d6[3, 4]</s>, 1d10[9]} = 9');
    });

    test('crit and fumble survive inside a dropped sub-roll', () => {
      const result = roll('{2d6, 1d10}kh1', { rng: createMockRng([1, 6, 9]) });
      expect(renderBreakdown(result, HTML)).toBe(
        '{<s>2d6[<fumble>1</fumble>, <crit>6</crit>]</s>, 1d10[9]} = 9',
      );
    });

    test('marks the DC side of a versus roll', () => {
      const result = roll('1d20 vs 2d10kh1', { rng: createMockRng([12, 4, 9]) });
      expect(renderBreakdown(result, HTML)).toBe('1d20[12] vs 2d10[<s>4</s>, 9] = Success');
    });

    test('omitted slots render plain', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
      expect(renderBreakdown(result, {})).toBe('4d6[3, 6, 2, 5] = 14');
    });

    test('MARKDOWN_MARKS spreads to override one slot', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
      const marks: DieMarks = { ...MARKDOWN_MARKS, critical: (_die, text) => `!${text}!` };

      expect(renderBreakdown(result, marks)).toBe('4d6[3, !6!, ~~2~~, 5] = 14');
    });
  });
});
