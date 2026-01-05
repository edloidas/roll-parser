/**
 * Property-based tests using fast-check.
 *
 * Tests invariants that should hold for all valid inputs.
 */

import { describe, test } from 'bun:test';
import fc from 'fast-check';
import { roll } from './roll';

describe('property-based invariants', () => {
  describe('dice roll bounds', () => {
    test('NdX total is always in valid range [N, N*X]', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 100 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}`);
            return result.total >= count && result.total <= count * sides;
          },
        ),
        { numRuns: 500 },
      );
    });

    test('0dX always returns 0', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 100 }), (sides) => {
          const result = roll(`0d${sides}`);
          return result.total === 0 && result.rolls.length === 0;
        }),
        { numRuns: 100 },
      );
    });

    test('Nd1 always equals N', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 50 }), (count) => {
          const result = roll(`${count}d1`);
          return result.total === count;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('modifier invariants', () => {
    test('keep highest keeps exactly min(N, count) dice', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          (count, sides, keep) => {
            const keepN = Math.min(keep, count);
            const result = roll(`${count}d${sides}kh${keepN}`);
            const keptCount = result.rolls.filter((r) => !r.modifiers.includes('dropped')).length;
            return keptCount === keepN;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('keep lowest keeps exactly min(N, count) dice', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          (count, sides, keep) => {
            const keepN = Math.min(keep, count);
            const result = roll(`${count}d${sides}kl${keepN}`);
            const keptCount = result.rolls.filter((r) => !r.modifiers.includes('dropped')).length;
            return keptCount === keepN;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('drop lowest drops exactly min(N, count) dice', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          (count, sides, drop) => {
            const dropN = Math.min(drop, count);
            const result = roll(`${count}d${sides}dl${dropN}`);
            const droppedCount = result.rolls.filter((r) => r.modifiers.includes('dropped')).length;
            return droppedCount === dropN;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('keep highest total >= keep lowest total (for same rolls)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (count, sides, keep, seed) => {
            const keepN = Math.min(keep, count);
            const seedStr = `prop-test-${seed}`;
            const khResult = roll(`${count}d${sides}kh${keepN}`, { seed: seedStr });
            const klResult = roll(`${count}d${sides}kl${keepN}`, { seed: seedStr });
            return khResult.total >= klResult.total;
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('arithmetic invariants', () => {
    test('addition is commutative for literals', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 100 }),
          fc.integer({ min: -100, max: 100 }),
          (a, b) => {
            const r1 = roll(`${a}+${b}`);
            const r2 = roll(`${b}+${a}`);
            return r1.total === r2.total;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('multiplication is commutative for literals', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -10, max: 10 }),
          fc.integer({ min: -10, max: 10 }),
          (a, b) => {
            const r1 = roll(`${a}*${b}`);
            const r2 = roll(`${b}*${a}`);
            return r1.total === r2.total;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('adding zero is identity', () => {
      fc.assert(
        fc.property(fc.integer({ min: -100, max: 100 }), (a) => {
          const r1 = roll(`${a}+0`);
          const r2 = roll(`${a}`);
          return r1.total === r2.total;
        }),
        { numRuns: 100 },
      );
    });

    test('multiplying by one is identity', () => {
      fc.assert(
        fc.property(fc.integer({ min: -100, max: 100 }), (a) => {
          const r1 = roll(`${a}*1`);
          const r2 = roll(`${a}`);
          return r1.total === r2.total;
        }),
        { numRuns: 100 },
      );
    });

    test('unary minus equivalent to subtraction from zero', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (count, sides, seed) => {
            const seedStr = `neg-test-${seed}`;
            const r1 = roll(`-${count}d${sides}`, { seed: seedStr });
            const r2 = roll(`0-${count}d${sides}`, { seed: seedStr });
            return r1.total === r2.total;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('result structure invariants', () => {
    test('rolls array length matches dice count', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}`);
            return result.rolls.length === count;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('each die result is within valid range', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 100 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}`);
            return result.rolls.every(
              (r) => r.result >= 1 && r.result <= sides && r.sides === sides,
            );
          },
        ),
        { numRuns: 200 },
      );
    });

    test('critical is only set when result equals sides', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}`);
            return result.rolls.every((r) => r.critical === (r.result === sides));
          },
        ),
        { numRuns: 200 },
      );
    });

    test('fumble is only set when result is 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}`);
            return result.rolls.every((r) => r.fumble === (r.result === 1));
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('seeded reproducibility', () => {
    test('same seed always produces same results', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          (seed, count, sides) => {
            const r1 = roll(`${count}d${sides}`, { seed });
            const r2 = roll(`${count}d${sides}`, { seed });
            if (r1.total !== r2.total || r1.rolls.length !== r2.rolls.length) {
              return false;
            }
            for (let i = 0; i < r1.rolls.length; i++) {
              if (r1.rolls[i]?.result !== r2.rolls[i]?.result) {
                return false;
              }
            }
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
