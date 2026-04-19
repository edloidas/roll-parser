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

    test('Nd% total is always in valid range [N, N*100]', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          const result = roll(`${count}d%`);
          return (
            result.total >= count &&
            result.total <= count * 100 &&
            result.rolls.length === count &&
            result.rolls.every((r) => r.sides === 100)
          );
        }),
        { numRuns: 200 },
      );
    });

    test('NdF total is always an integer in [-N, +N]', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 20 }), (count) => {
          const result = roll(`${count}dF`);
          return (
            Number.isInteger(result.total) &&
            result.total >= -count &&
            result.total <= count &&
            result.rolls.length === count &&
            result.rolls.every(
              (r) =>
                r.sides === 0 &&
                r.critical === false &&
                r.fumble === false &&
                (r.result === -1 || r.result === 0 || r.result === 1),
            )
          );
        }),
        { numRuns: 300 },
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

    test('success count bounds — NdX>=T f1 satisfies -N <= total <= N', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (count, sides, threshold) => {
            const result = roll(`${count}d${sides}>=${threshold}f1`);
            const successes = result.successes ?? 0;
            const failures = result.failures ?? 0;
            return (
              successes >= 0 &&
              failures >= 0 &&
              successes + failures <= count &&
              result.total >= -count &&
              result.total <= count &&
              result.total === successes - failures
            );
          },
        ),
        { numRuns: 200 },
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

  describe('chained modifier invariants', () => {
    test('chained kh+dl total <= single kh total (adding dl can only remove more)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (count, sides, keep, drop, seed) => {
            const keepN = Math.min(keep, count);
            const dropN = Math.min(drop, count);
            const seedStr = `chain-test-${seed}`;
            const khOnly = roll(`${count}d${sides}kh${keepN}`, { seed: seedStr });
            const khDl = roll(`${count}d${sides}kh${keepN}dl${dropN}`, { seed: seedStr });
            return khDl.total <= khOnly.total;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('chained modifier total is always >= 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 1, max: 4 }),
          (count, sides, keep, drop) => {
            const keepN = Math.min(keep, count);
            const dropN = Math.min(drop, count);
            const result = roll(`${count}d${sides}kh${keepN}dl${dropN}`);
            return result.total >= 0;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('chained modifier order does not affect total (commutativity)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 0, max: 0xffffffff }),
          (count, sides, keep, drop, seed) => {
            const keepN = Math.min(keep, count);
            const dropN = Math.min(drop, count);
            const seedStr = `order-test-${seed}`;
            const r1 = roll(`${count}d${sides}kh${keepN}dl${dropN}`, { seed: seedStr });
            const r2 = roll(`${count}d${sides}dl${dropN}kh${keepN}`, { seed: seedStr });
            return r1.total === r2.total;
          },
        ),
        { numRuns: 300 },
      );
    });

    test('rolls array length equals dice count for chained modifiers', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 1, max: 3 }),
          (count, sides, keep, drop) => {
            const keepN = Math.min(keep, count);
            const dropN = Math.min(drop, count);
            const result = roll(`${count}d${sides}kh${keepN}dl${dropN}`);
            return result.rolls.length === count;
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

  describe('exploding dice invariants', () => {
    test('NdX! total is always >= N (never fewer kept dice than original count)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 2, max: 20 }),
          (count, sides) => {
            const result = roll(`${count}d${sides}!`);
            // Minimum: every original die rolled 1 → total >= count.
            return result.total >= count && result.rolls.length >= count;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('original dice count is preserved (exploded + non-exploded partitioning)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 12 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 2, max: 8 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}!`, { seed });
            const nonExploded = result.rolls.filter((d) => !d.modifiers.includes('exploded'));
            // Every original die stays unmarked; explosions only add to the pool.
            return (
              nonExploded.length === count &&
              result.rolls.every((d) => d.modifiers.includes('kept'))
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    test('compound explode pool size equals original count', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 12 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}!!`, { seed });
            return result.rolls.length === count;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('seeded explode is reproducible', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 2, max: 12 }),
          fc.constantFrom('!', '!!', '!p'),
          (seed, count, sides, variant) => {
            const r1 = roll(`${count}d${sides}${variant}`, { seed });
            const r2 = roll(`${count}d${sides}${variant}`, { seed });
            return r1.total === r2.total && r1.rolls.length === r2.rolls.length;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('NdX! total >= NdX total for same seed (explosions only add value)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 3 }),
          fc.integer({ min: 4, max: 20 }),
          (seed, count, sides) => {
            const base = roll(`${count}d${sides}`, { seed });
            const exploded = roll(`${count}d${sides}!`, { seed });
            // Both runs roll the same first N dice from the seeded RNG, then
            // `!` potentially adds more. So exploded.total >= base.total.
            return exploded.total >= base.total;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('reroll invariants', () => {
    test('recursive reroll: every kept die fails the condition', () => {
      // `r<2` on sides >= 2 terminates: result 1 matches, 2+ does not.
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 4, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}r<2`, { seed });
            const kept = result.rolls.filter((d) => !d.modifiers.includes('dropped'));
            return kept.length === count && kept.every((d) => d.result >= 2);
          },
        ),
        { numRuns: 100 },
      );
    });

    test('reroll-once always produces exactly N kept dice', () => {
      // `ro` terminates regardless of match probability.
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}ro<${sides}`, { seed });
            const kept = result.rolls.filter((d) => !d.modifiers.includes('dropped'));
            return kept.length === count;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('rerolled intermediate dice are always marked rerolled+dropped', () => {
      // Use `ro` so the chain always terminates — the invariant is about
      // modifier flags, not termination behavior.
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}ro<${sides}`, { seed });
            const intermediates = result.rolls.filter((d) => d.modifiers.includes('rerolled'));
            return intermediates.every((d) => d.modifiers.includes('dropped'));
          },
        ),
        { numRuns: 100 },
      );
    });

    test('seeded reroll is reproducible', () => {
      // Constrain to cases where recursive reroll terminates: threshold
      // must be strictly less than `sides` so some results exceed it.
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 4, max: 12 }),
          fc.constantFrom('r', 'ro'),
          (seed, count, sides, variant) => {
            const r1 = roll(`${count}d${sides}${variant}<2`, { seed });
            const r2 = roll(`${count}d${sides}${variant}<2`, { seed });
            return r1.total === r2.total && r1.rolls.length === r2.rolls.length;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('math functions', () => {
    test('floor(NdX/Y) <= NdX/Y for the same seeded roll', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides, divisor) => {
            const raw = roll(`${count}d${sides}/${divisor}`, { seed });
            const floored = roll(`floor(${count}d${sides}/${divisor})`, { seed });
            return floored.total <= raw.total && Number.isInteger(floored.total);
          },
        ),
        { numRuns: 200 },
      );
    });

    test('ceil(NdX/Y) >= NdX/Y for the same seeded roll', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides, divisor) => {
            const raw = roll(`${count}d${sides}/${divisor}`, { seed });
            const ceiled = roll(`ceil(${count}d${sides}/${divisor})`, { seed });
            return ceiled.total >= raw.total && Number.isInteger(ceiled.total);
          },
        ),
        { numRuns: 200 },
      );
    });

    test('abs(expr) is always >= 0', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: -100, max: 100 }),
          (seed, count, sides, shift) => {
            const result = roll(`abs(${count}d${sides}${shift >= 0 ? '+' : ''}${shift})`, {
              seed,
            });
            return result.total >= 0;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('max(a, b) >= min(a, b) for two independent dice', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, sidesA, sidesB) => {
            const maxed = roll(`max(1d${sidesA}, 1d${sidesB})`, { seed });
            const minned = roll(`min(1d${sidesA}, 1d${sidesB})`, { seed });
            return maxed.total >= minned.total;
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
