/**
 * Algorithmic complexity guardrails for the evaluator (#131).
 *
 * Wall-clock benchmarks in `bench/` are too noisy to gate CI — cross-process
 * p50 variance alone is ±5-10%. RNG draw count is not: it is the evaluator's
 * one unbounded resource, it is exactly reproducible, and every algorithmic
 * regression that matters (an extra pass over a pool, a re-rolled meta
 * expression, quadratic keep/drop) shows up as a changed draw count. These
 * assertions are the deterministic half of the regression strategy.
 *
 * Draw order follows `.claude/rules/rng.md`: keep/drop modifier arguments are
 * drawn *before* the base pool, threshold-style modifier arguments *after* it.
 *
 * @module evaluator/complexity.test
 */

import { describe, expect, test } from 'bun:test';
import { parse } from '../parser/parser.js';
import { createMockRng } from '../rng/mock.js';
import type { RNG } from '../rng/types.js';
import { evaluate } from './evaluator.js';

type CountingRng = RNG & { readonly draws: number };

/**
 * Wraps an RNG and tallies every value pulled through it.
 *
 * Counting the decorator rather than the underlying RNG keeps the assertion
 * independent of which RNG implementation backs it, so the same helper works
 * for a fixed mock sequence and for a large generated pool.
 */
function createCountingRng(inner: RNG): CountingRng {
  let draws = 0;

  return {
    get draws(): number {
      return draws;
    },
    next: (): number => {
      draws++;
      return inner.next();
    },
    nextInt: (min: number, max: number): number => {
      draws++;
      return inner.nextInt(min, max);
    },
  };
}

/** Constant-value RNG — for pools too large to spell out as a mock sequence. */
function createConstantRng(value: number): RNG {
  return { next: () => 0, nextInt: () => value };
}

/**
 * Evaluates `notation` against the exact sequence `values` and returns the
 * draw count.
 *
 * `MockRNG` throws on exhaustion, so an over-consuming evaluator fails here
 * before the assertion even runs; the returned count catches under-consumption.
 */
function countDraws(notation: string, values: number[]): { draws: number; rolls: number } {
  const rng = createCountingRng(createMockRng(values));
  const result = evaluate(parse(notation), rng, { notation });

  return { draws: rng.draws, rolls: result.rolls.length };
}

describe('evaluator complexity', () => {
  describe('exact draw counts — fixed pools', () => {
    const cases: [notation: string, values: number[], draws: number][] = [
      ['1d20', [13], 1],
      ['1d20+5', [13], 1],
      ['3d6', [4, 2, 6], 3],
      ['2d6+3', [4, 2], 2],
      ['1d20+2d6+3', [11, 2, 5], 3],
      ['4d6kh3', [1, 5, 3, 4], 4],
      ['4d6kl1', [1, 5, 3, 4], 4],
      ['4d6dl1', [1, 5, 3, 4], 4],
      ['4dF', [1, 0, -1, 1], 4],
      ['10d10>=6f1', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10],
      ['2d20kh1 vs 15', [7, 18], 2],
      ['floor((1d4+1)*2/3)', [3], 1],
      ['3d6sa', [4, 2, 6], 3],
    ];

    for (const [notation, values, draws] of cases) {
      test(`${notation} draws ${draws}`, () => {
        expect(countDraws(notation, values).draws).toBe(draws);
      });
    }

    test('a diceless expression draws nothing', () => {
      const notation = Array.from({ length: 20 }, (_, i) => i + 1).join('+');

      expect(countDraws(notation, []).draws).toBe(0);
    });
  });

  describe('exact draw counts — value-dependent pools', () => {
    test('2d6! draws only the pool when nothing explodes', () => {
      expect(countDraws('2d6!', [3, 4])).toEqual({ draws: 2, rolls: 2 });
    });

    test('2d6! draws one extra die per explosion', () => {
      expect(countDraws('2d6!', [6, 3, 4])).toEqual({ draws: 3, rolls: 3 });
    });

    test('2d6!! compounds the explosion into a single die', () => {
      expect(countDraws('2d6!!', [6, 3, 4])).toEqual({ draws: 3, rolls: 2 });
    });

    test('2d6!p draws like a standard explosion', () => {
      expect(countDraws('2d6!p', [6, 3, 4])).toEqual({ draws: 3, rolls: 3 });
    });

    test('4d6r<2 draws one extra die per reroll', () => {
      expect(countDraws('4d6r<2', [1, 5, 3, 4, 6])).toEqual({ draws: 5, rolls: 5 });
    });

    test('4d6ro<2 rerolls at most once per die', () => {
      expect(countDraws('4d6ro<2', [1, 5, 3, 4, 6])).toEqual({ draws: 5, rolls: 5 });
    });
  });

  describe('meta-expression draws', () => {
    test('(1d2)d6 draws the count expression, then that many dice', () => {
      expect(countDraws('(1d2)d6', [2, 4, 5]).draws).toBe(3);
    });

    test('1d(1d4) draws the sides expression, then the pool', () => {
      expect(countDraws('1d(1d4)', [4, 3]).draws).toBe(2);
    });

    test('4d6kh(1d2) draws the keep count before the pool', () => {
      expect(countDraws('4d6kh(1d2)', [1, 5, 3, 4, 6]).draws).toBe(5);
    });

    test('4d6cs>(1d2) draws the pool before the threshold', () => {
      expect(countDraws('4d6cs>(1d2)', [5, 3, 4, 6, 1]).draws).toBe(5);
    });
  });

  describe('linearity in pool size', () => {
    function measurePool(notation: string): { draws: number; rolls: number } {
      const rng = createCountingRng(createConstantRng(3));
      const result = evaluate(parse(notation), rng, { notation });

      return { draws: rng.draws, rolls: result.rolls.length };
    }

    for (const size of [10, 100, 1000]) {
      test(`${size}d6 draws and records exactly ${size} dice`, () => {
        expect(measurePool(`${size}d6`)).toEqual({ draws: size, rolls: size });
      });

      test(`${size}d6kh${size / 2} draws and records exactly ${size} dice`, () => {
        expect(measurePool(`${size}d6kh${size / 2}`)).toEqual({ draws: size, rolls: size });
      });
    }

    test('draws scale exactly with pool size, never super-linearly', () => {
      const drawsAt10 = measurePool('10d6').draws;
      const drawsAt100 = measurePool('100d6').draws;
      const drawsAt1000 = measurePool('1000d6').draws;

      expect(drawsAt100 / drawsAt10).toBe(10);
      expect(drawsAt1000 / drawsAt100).toBe(10);
    });

    test('keep/drop does not add draws on top of the pool it selects from', () => {
      expect(measurePool('1000d6kh500').draws).toBe(measurePool('1000d6').draws);
    });
  });
});
