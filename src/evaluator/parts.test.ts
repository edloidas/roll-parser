/**
 * Tests for the structured `RollResult.parts` output (#84).
 *
 * Deep-equal "snapshot" tests pin exact part trees for representative
 * notations under deterministic mock RNGs; the rest assert the contractual
 * invariants from STAGE3.md §5.
 */

import { describe, expect, test } from 'bun:test';
import fc from 'fast-check';
import { createMockRng } from '../rng/mock.js';
import { roll } from '../roll.js';
import type { RollPart } from '../types.js';
import { DegreeOfSuccess } from '../types.js';

/** Walks a part tree depth-first, returning every part. */
function flattenParts(part: RollPart): RollPart[] {
  const out: RollPart[] = [part];
  switch (part.type) {
    case 'grouped':
      out.push(...flattenParts(part.inner));
      break;
    case 'binaryOp':
      out.push(...flattenParts(part.left), ...flattenParts(part.right));
      break;
    case 'unaryOp':
      out.push(...flattenParts(part.operand));
      break;
    case 'modifier':
    case 'explode':
    case 'reroll':
    case 'successCount':
    case 'sort':
    case 'critThreshold':
      out.push(...flattenParts(part.target));
      break;
    case 'versus':
      out.push(...flattenParts(part.roll), ...flattenParts(part.dc));
      break;
    case 'functionCall':
      for (const arg of part.args) out.push(...flattenParts(arg));
      break;
    case 'group':
      for (const sub of part.parts) out.push(...flattenParts(sub));
      break;
    default:
      break;
  }
  return out;
}

describe('RollResult.parts', () => {
  describe('exact part trees (deterministic snapshots)', () => {
    test('1d20+5', () => {
      const result = roll('1d20+5', { rng: createMockRng([15]) });
      expect(result.parts).toEqual({
        type: 'binaryOp',
        operator: '+',
        left: {
          type: 'dice',
          count: 1,
          sides: 20,
          rolls: [{ sides: 20, result: 15, modifiers: ['kept'], critical: false, fumble: false }],
          total: 15,
          start: 0,
          end: 4,
        },
        right: { type: 'literal', value: 5, total: 5, start: 5, end: 6 },
        total: 20,
        start: 0,
        end: 6,
      });
    });

    test('4d6kh3 — flattened modifier chain with resolved specs', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
      expect(result.parts).toEqual({
        type: 'modifier',
        specs: [{ kind: 'keep', selector: 'highest', count: 3 }],
        target: {
          type: 'dice',
          count: 4,
          sides: 6,
          // ? Dice part total (16) is the pre-modifier pool sum; the flags
          //   reflect post-modifier state via shared references. Recursive
          //   total consistency is deliberately not contractual.
          rolls: [
            { sides: 6, result: 3, modifiers: ['kept'], critical: false, fumble: false },
            { sides: 6, result: 6, modifiers: ['kept'], critical: true, fumble: false },
            { sides: 6, result: 2, modifiers: ['dropped'], critical: false, fumble: false },
            { sides: 6, result: 5, modifiers: ['kept'], critical: false, fumble: false },
          ],
          total: 16,
          start: 0,
          end: 3,
        },
        total: 14,
        start: 0,
        end: 6,
      });
    });

    test('{1d6, 1d8}kh1 — group under keep with keptIndices', () => {
      const result = roll('{1d6, 1d8}kh1', { rng: createMockRng([2, 7]) });
      expect(result.parts).toEqual({
        type: 'modifier',
        specs: [{ kind: 'keep', selector: 'highest', count: 1 }],
        target: {
          type: 'group',
          parts: [
            {
              type: 'dice',
              count: 1,
              sides: 6,
              rolls: [
                { sides: 6, result: 2, modifiers: ['dropped'], critical: false, fumble: false },
              ],
              total: 2,
              start: 1,
              end: 4,
            },
            {
              type: 'dice',
              count: 1,
              sides: 8,
              rolls: [{ sides: 8, result: 7, modifiers: ['kept'], critical: false, fumble: false }],
              total: 7,
              start: 6,
              end: 9,
            },
          ],
          keptIndices: [1],
          total: 7,
          start: 0,
          end: 10,
        },
        total: 7,
        start: 0,
        end: 13,
      });
    });

    test('floor(1d10/2)', () => {
      const result = roll('floor(1d10/2)', { rng: createMockRng([7]) });
      expect(result.parts).toEqual({
        type: 'functionCall',
        name: 'floor',
        args: [
          {
            type: 'binaryOp',
            operator: '/',
            left: {
              type: 'dice',
              count: 1,
              sides: 10,
              rolls: [
                { sides: 10, result: 7, modifiers: ['kept'], critical: false, fumble: false },
              ],
              total: 7,
              start: 6,
              end: 10,
            },
            right: { type: 'literal', value: 2, total: 2, start: 11, end: 12 },
            total: 3.5,
            start: 6,
            end: 12,
          },
        ],
        total: 3,
        start: 0,
        end: 13,
      });
    });

    test('1d20 vs 15', () => {
      const result = roll('1d20 vs 15', { rng: createMockRng([18]) });
      expect(result.parts).toEqual({
        type: 'versus',
        roll: {
          type: 'dice',
          count: 1,
          sides: 20,
          rolls: [{ sides: 20, result: 18, modifiers: ['kept'], critical: false, fumble: false }],
          total: 18,
          start: 0,
          end: 4,
        },
        dc: { type: 'literal', value: 15, total: 15, start: 8, end: 10 },
        degree: DegreeOfSuccess.Success,
        total: 18,
        start: 0,
        end: 10,
      });
    });

    test('1d6!! — compound explode mutation visible through shared refs', () => {
      const result = roll('1d6!!', { rng: createMockRng([6, 3]) });
      expect(result.parts).toEqual({
        type: 'explode',
        variant: 'compound',
        target: {
          type: 'dice',
          count: 1,
          sides: 6,
          rolls: [
            {
              sides: 6,
              result: 9,
              initialResult: 6,
              modifiers: ['kept', 'exploded'],
              critical: true,
              fumble: false,
            },
          ],
          total: 6,
          start: 0,
          end: 3,
        },
        total: 9,
        start: 0,
        end: 5,
      });
    });
  });

  describe('per-variant structure', () => {
    test('literal', () => {
      expect(roll('5').parts).toMatchObject({ type: 'literal', value: 5, total: 5 });
    });

    test('variable', () => {
      const result = roll('@str', { context: { str: 4 } });
      expect(result.parts).toMatchObject({ type: 'variable', name: 'str', value: 4, total: 4 });
    });

    test('dice', () => {
      const result = roll('2d6', { rng: createMockRng([4, 2]) });
      expect(result.parts).toMatchObject({ type: 'dice', count: 2, sides: 6, total: 6 });
    });

    test('fateDice', () => {
      const result = roll('4dF', { rng: createMockRng([1, -1, 0, 1]) });
      expect(result.parts).toMatchObject({ type: 'fateDice', count: 4, total: 1 });
      expect(result.parts).toHaveProperty('rolls');
    });

    test('grouped and binaryOp', () => {
      const result = roll('(1+2)*3');
      expect(result.parts).toMatchObject({
        type: 'binaryOp',
        operator: '*',
        left: { type: 'grouped', inner: { type: 'binaryOp', total: 3 }, total: 3 },
        right: { type: 'literal', value: 3 },
        total: 9,
      });
    });

    test('unaryOp', () => {
      const result = roll('-1d4', { rng: createMockRng([3]) });
      expect(result.parts).toMatchObject({
        type: 'unaryOp',
        operator: '-',
        operand: { type: 'dice', total: 3 },
        total: -3,
      });
    });

    test('modifier chain flattens into one specs[] array', () => {
      const result = roll('4d6kh3kl1', { rng: createMockRng([3, 6, 2, 5]) });
      expect(result.parts).toMatchObject({
        type: 'modifier',
        specs: [
          { kind: 'keep', selector: 'highest', count: 3 },
          { kind: 'keep', selector: 'lowest', count: 1 },
        ],
      });
    });

    test('explode without threshold omits the key', () => {
      const result = roll('1d6!', { rng: createMockRng([6, 3]) });
      expect(result.parts).toMatchObject({ type: 'explode', variant: 'standard', total: 9 });
      expect('threshold' in result.parts).toBe(false);
    });

    test('explode with threshold resolves it', () => {
      const result = roll('1d6!>=5', { rng: createMockRng([5, 2]) });
      expect(result.parts).toMatchObject({
        type: 'explode',
        variant: 'standard',
        threshold: { operator: '>=', value: 5 },
        total: 7,
      });
    });

    test('reroll carries the resolved condition', () => {
      const result = roll('2d6r<2', { rng: createMockRng([1, 5, 3]) });
      expect(result.parts).toMatchObject({
        type: 'reroll',
        once: false,
        condition: { operator: '<', value: 2 },
        total: 8,
      });
    });

    test('successCount tracks successes/failures locally', () => {
      const result = roll('5d6>=5f<=2', { rng: createMockRng([5, 3, 6, 2, 5]) });
      expect(result.parts).toMatchObject({
        type: 'successCount',
        threshold: { operator: '>=', value: 5 },
        failThreshold: { operator: '<=', value: 2 },
        successes: 3,
        failures: 1,
        total: 2,
      });
    });

    test('successCount without fail threshold omits the key', () => {
      const result = roll('5d6>=5', { rng: createMockRng([5, 3, 6, 2, 5]) });
      expect(result.parts).toMatchObject({ type: 'successCount', successes: 3, failures: 0 });
      expect('failThreshold' in result.parts).toBe(false);
    });

    test('sort', () => {
      const result = roll('4d6s', { rng: createMockRng([3, 1, 4, 2]) });
      expect(result.parts).toMatchObject({
        type: 'sort',
        order: 'ascending',
        target: { type: 'dice' },
        total: 10,
      });
    });

    test('critThreshold chain surfaces resolved threshold arrays', () => {
      const result = roll('1d20cs=20cs=1cf>18', { rng: createMockRng([20]) });
      expect(result.parts).toMatchObject({
        type: 'critThreshold',
        successThresholds: [
          { operator: '=', value: 20 },
          { operator: '=', value: 1 },
        ],
        failThresholds: [{ operator: '>', value: 18 }],
      });
    });

    test('bare cs uses the default sentinel', () => {
      const result = roll('1d20cs', { rng: createMockRng([20]) });
      expect(result.parts).toMatchObject({ type: 'critThreshold', successThresholds: ['default'] });
    });

    test('functionCall with multiple args', () => {
      const result = roll('max(1d6, 3)', { rng: createMockRng([2]) });
      expect(result.parts).toMatchObject({
        type: 'functionCall',
        name: 'max',
        args: [{ type: 'dice' }, { type: 'literal', value: 3 }],
        total: 3,
      });
    });
  });

  describe('invariants', () => {
    const NOTATIONS = [
      '1d20+5',
      '(1d6+2)*3',
      '4d6kh3',
      '4d6kh3kl1',
      '{1d6,1d8}kh1',
      'floor(1d10/2)',
      '1d20 vs 15',
      '1d20cs>18',
      '5d6>=5',
      '4d6r<3!',
      '2d%',
      '4dFs',
      '10d10>=6f1',
    ];

    test('parts.total === result.total across representative notations', () => {
      for (const notation of NOTATIONS) {
        const result = roll(notation, { seed: `parts-${notation}` });
        expect(result.parts.total).toBe(result.total);
      }
    });

    test('parts.total === result.total holds under fast-check', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...NOTATIONS),
          fc.integer({ min: 0, max: 0xffffffff }),
          (notation, seed) => {
            const result = roll(notation, { seed });
            return result.parts.total === result.total;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('cross-field consistency: successes/failures match the successCount part', () => {
      const result = roll('10d10>=6f1', { seed: 'cross-field' });
      const successCount = flattenParts(result.parts).find((p) => p.type === 'successCount');
      expect(successCount).toBeDefined();
      if (successCount?.type !== 'successCount') throw new Error('unreachable');
      expect(result.successes).toBe(successCount.successes);
      expect(result.failures).toBe(successCount.failures);
    });

    test('cross-field consistency: degree matches the root versus part', () => {
      const result = roll('1d20+10 vs 25', { seed: 'degree' });
      if (result.parts.type !== 'versus') throw new Error('expected versus root');
      expect(result.degree).toBe(result.parts.degree);
    });

    test('JSON round-trip preserves the whole tree', () => {
      for (const notation of [...NOTATIONS, '1d6!>=5', '1d20cs', '{1d6, 1d8, 1d10}dl1']) {
        const result = roll(notation, { seed: `json-${notation}` });
        expect(JSON.parse(JSON.stringify(result.parts))).toEqual(result.parts);
      }
    });
  });

  describe('reference sharing', () => {
    test('dice part rolls are the same objects as result.rolls', () => {
      const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
      if (result.parts.type !== 'modifier' || result.parts.target.type !== 'dice') {
        throw new Error('unexpected parts shape');
      }
      const partRolls = result.parts.target.rolls;
      for (let i = 0; i < partRolls.length; i++) {
        expect(partRolls[i]).toBe(result.rolls[i] as NonNullable<(typeof result.rolls)[number]>);
      }
    });

    test('reroll flags are visible through the dice part', () => {
      const result = roll('2d6r<2', { rng: createMockRng([1, 5, 3]) });
      if (result.parts.type !== 'reroll' || result.parts.target.type !== 'dice') {
        throw new Error('unexpected parts shape');
      }
      // The original die 1 was rerolled — its shared object carries the flags.
      expect(result.parts.target.rolls[0]?.modifiers).toEqual(['rerolled', 'dropped']);
      expect(result.rolls[0]).toBe(
        result.parts.target.rolls[0] as NonNullable<(typeof result.rolls)[number]>,
      );
    });
  });

  describe('group keptIndices', () => {
    test('accurate for kh/kl/dh/dl', () => {
      const cases: [string, number[], number[]][] = [
        // notation, mock draws, expected keptIndices
        ['{1d6, 1d8, 1d10}kh1', [2, 7, 5], [1]],
        ['{1d6, 1d8, 1d10}kl1', [2, 7, 5], [0]],
        ['{1d6, 1d8, 1d10}dh1', [2, 7, 5], [0, 2]],
        ['{1d6, 1d8, 1d10}dl1', [2, 7, 5], [1, 2]],
      ];
      for (const [notation, draws, expected] of cases) {
        const result = roll(notation, { rng: createMockRng(draws) });
        if (result.parts.type !== 'modifier' || result.parts.target.type !== 'group') {
          throw new Error('unexpected parts shape');
        }
        expect(result.parts.target.keptIndices).toEqual(expected);
      }
    });

    test('absent on bare groups', () => {
      const result = roll('{1d6, 1d8}', { rng: createMockRng([3, 5]) });
      if (result.parts.type !== 'group') throw new Error('expected group root');
      expect('keptIndices' in result.parts).toBe(false);
    });

    test('dropped sub-rolls keep their complete parts', () => {
      const result = roll('{1d20+5 vs 15, 1d8}kh1', { rng: createMockRng([1, 7]) });
      if (result.parts.type !== 'modifier' || result.parts.target.type !== 'group') {
        throw new Error('unexpected parts shape');
      }
      const droppedVersus = result.parts.target.parts[0];
      expect(droppedVersus).toMatchObject({ type: 'versus', total: 6 });
      expect(result.parts.target.keptIndices).toEqual([1]);
      // The dropped versus does not surface on the RollResult.
      expect(result.degree).toBeUndefined();
    });
  });

  describe('variable resolution', () => {
    test('defined variable produces value and total', () => {
      const result = roll('1d20+@str', { context: { str: 4 }, rng: createMockRng([10]) });
      const variable = flattenParts(result.parts).find((p) => p.type === 'variable');
      expect(variable).toMatchObject({ type: 'variable', name: 'str', value: 4, total: 4 });
    });

    test('missing variable with onMissingVariable: zero produces zeros', () => {
      const result = roll('1d20+@str', { onMissingVariable: 'zero', rng: createMockRng([10]) });
      const variable = flattenParts(result.parts).find((p) => p.type === 'variable');
      expect(variable).toMatchObject({ type: 'variable', name: 'str', value: 0, total: 0 });
    });
  });

  describe('meta-expressions', () => {
    test('resolved numbers appear in the part; meta dice stay out of the tree', () => {
      // (1d4)d6 — meta d4 rolls 2, then 2d6.
      const result = roll('(1d4)d6', { rng: createMockRng([2, 3, 4]) });
      if (result.parts.type !== 'dice') throw new Error('expected dice root');
      expect(result.parts.count).toBe(2);
      expect(result.parts.rolls).toHaveLength(2);
      // The meta d4 is in the flat audit trail only.
      expect(result.rolls.filter((d) => d.modifiers.includes('meta'))).toHaveLength(1);
    });
  });
});
