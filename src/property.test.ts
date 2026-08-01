/**
 * Property-based tests using fast-check.
 *
 * Tests invariants that should hold for all valid inputs. Properties earn
 * their place here only when they are not re-derivable from the deterministic
 * suites — arithmetic identities over literals and exact-value re-checks of
 * `evaluator.test.ts` belong there, pinned, not here, resampled.
 *
 * ## Reproducing a failure
 *
 * The global seed is deliberately not pinned: a fixed seed turns these into
 * 100–500 fixed cases and quietly stops exploring. On failure, fast-check
 * prints the counterexample plus a line of the form `seed=<n>, path="<p>"` —
 * paste both into the failing `fc.assert` call's options
 * (`{ numRuns: …, seed: <n>, path: '<p>' }`) to replay it deterministically.
 * Every property threads a generated roll seed into `roll()`, so the replay
 * reproduces the dice, not just the notation. (Bun's own `--seed` flag
 * shuffles test order; it does not configure fast-check.)
 */

import { describe, test } from 'bun:test';
import fc from 'fast-check';
import { isRollParserError } from './errors.js';
import { roll } from './roll.js';

/**
 * Seed generator for properties that compare two rolls on the same random
 * sequence. Integers, not strings: `SeededRNG` accepts both, the value is
 * opaque to the property, and integer shrinking reports a readable
 * counterexample instead of a random glyph soup.
 */
const seedArb = fc.integer();

describe('property-based invariants', () => {
  describe('dice roll bounds', () => {
    test('NdX total is always in valid range [N, N*X]', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 100 }),
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}`, { seed });
            return result.total >= count && result.total <= count * sides;
          },
        ),
        { numRuns: 500 },
      );
    });

    test('Nd% total is always in valid range [N, N*100]', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), seedArb, (count, seed) => {
          const result = roll(`${count}d%`, { seed });
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
        fc.property(fc.integer({ min: 0, max: 20 }), seedArb, (count, seed) => {
          const result = roll(`${count}dF`, { seed });
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

    // `0dX` and `Nd1` are removed: both are the `[N, N*X]` bound above with
    // the interval collapsed to a point, and `evaluator.test.ts` already
    // pins the degenerate pools exactly.
  });

  describe('modifier invariants', () => {
    test('keep highest keeps exactly min(N, count) dice', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 10 }),
          seedArb,
          (count, sides, keep, seed) => {
            const keepN = Math.min(keep, count);
            const result = roll(`${count}d${sides}kh${keepN}`, { seed });
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
          seedArb,
          (count, sides, keep, seed) => {
            const keepN = Math.min(keep, count);
            const result = roll(`${count}d${sides}kl${keepN}`, { seed });
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
          seedArb,
          (count, sides, drop, seed) => {
            const dropN = Math.min(drop, count);
            const result = roll(`${count}d${sides}dl${dropN}`, { seed });
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
          seedArb,
          (count, sides, threshold, seed) => {
            const result = roll(`${count}d${sides}>=${threshold}f1`, { seed });
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

    test('success count always defines numeric successes/failures, even on empty pools', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 5 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          seedArb,
          (count, sides, rawThreshold, seed) => {
            const threshold = Math.min(sides, rawThreshold);
            const result = roll(`${count}d${sides}>=${threshold}`, { seed: `prop-sc-${seed}` });
            return (
              typeof result.successes === 'number' &&
              typeof result.failures === 'number' &&
              result.successes >= 0 &&
              result.failures >= 0
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    test('keep highest total >= keep lowest total (for same rolls)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 6 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 3 }),
          seedArb,
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
    // Commutativity of `+`/`*` and the `+0`/`*1` identities are removed:
    // over literal operands they restate IEEE-754 arithmetic, not this
    // library's behavior. What they did incidentally exercise — signed
    // literals in either operand position — is pinned exactly by
    // `signed literal operands` in `parser.test.ts`.
    test('unary minus equivalent to subtraction from zero', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 20 }),
          seedArb,
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

  describe('expression round-trip', () => {
    test('reparsing result.expression yields the same total on a replayed seed', () => {
      // Shapes exercise BinaryOp, UnaryOp, dice count/sides, and function
      // call argument sites, with randomly injected parentheses around any
      // subexpression.
      const shapes = [
        '({L})*{C}d{S}',
        '{C}d{S} + ({L}*{L})',
        '-({C}d{S}+{L})',
        '(({C}d{S}+{L}))*{L}',
        'floor(({C}d{S}+{L})/{L})',
        '({L}-{L})*{C}d{S}',
        '(({C})d{S})+{L}',
        'max({C}d{S}, ({L}+{L}))',
        '({C}d{S}kh{L}) * {L}',
      ];

      fc.assert(
        fc.property(
          fc.nat({ max: shapes.length - 1 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 6 }),
          seedArb,
          (shapeIdx, count, sides, lit, seed) => {
            // `kh{L}` needs a selector < count; clamp to keep the notation
            // legal across all shape generators.
            const keep = Math.min(lit, count);
            const notation = (shapes[shapeIdx] ?? '')
              .replaceAll('{C}', String(count))
              .replaceAll('{S}', String(sides))
              .replaceAll('{L}', String(shapeIdx === 8 ? keep : lit));
            const seedStr = `round-trip-${seed}`;

            const original = roll(notation, { seed: seedStr });
            const reparsed = roll(original.expression, { seed: seedStr });

            return original.total === reparsed.total;
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('result structure invariants', () => {
    test('rolls array length matches dice count', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}`, { seed });
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
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}`, { seed });
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
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}`, { seed });
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
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}`, { seed });
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
          seedArb,
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

    // Non-negativity of a chained keep/drop total is removed: every die
    // face is >= 1 and the modifiers only ever remove dice, so the sum of a
    // kept subset cannot be negative regardless of what the evaluator does.
    test('chained modifier order does not affect total (commutativity)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 1, max: 3 }),
          seedArb,
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

    // Pool length under chained keep/drop is removed: `rolls array length
    // matches dice count` above already states it, and keep/drop provably
    // never adds or removes entries — it only sets the `dropped` flag, which
    // `chained kh+dl total <= single kh total` covers.
  });

  describe('seeded reproducibility', () => {
    test('same seed always produces same results', () => {
      fc.assert(
        fc.property(
          seedArb,
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
          seedArb,
          (count, sides, seed) => {
            const result = roll(`${count}d${sides}!`, { seed });
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
          seedArb,
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
    // Wrapping an expression in a math function does not change what it draws
    // from the RNG, so a same-seed pair of rolls shares its dice exactly. That
    // makes the unwrapped roll an exact oracle for the wrapped one, rather than
    // the one-sided bound an inequality would give.
    test('floor(NdX/Y) equals Math.floor of the same seeded NdX/Y', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides, divisor) => {
            const raw = roll(`${count}d${sides}/${divisor}`, { seed });
            const floored = roll(`floor(${count}d${sides}/${divisor})`, { seed });
            return floored.total === Math.floor(raw.total);
          },
        ),
        { numRuns: 200 },
      );
    });

    test('ceil(NdX/Y) equals Math.ceil of the same seeded NdX/Y', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides, divisor) => {
            const raw = roll(`${count}d${sides}/${divisor}`, { seed });
            const ceiled = roll(`ceil(${count}d${sides}/${divisor})`, { seed });
            return ceiled.total === Math.ceil(raw.total);
          },
        ),
        { numRuns: 200 },
      );
    });

    test('abs(NdX+K) equals Math.abs of its own dice plus K', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 20 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: -100, max: 100 }),
          (seed, count, sides, shift) => {
            const result = roll(`abs(${count}d${sides}${shift >= 0 ? '+' : ''}${shift})`, {
              seed,
            });
            const inner = result.rolls.reduce((sum, die) => sum + die.result, shift);

            return result.rolls.length === count && result.total === Math.abs(inner);
          },
        ),
        { numRuns: 200 },
      );
    });

    test('max(a, b) and min(a, b) select the extremes of the same seeded dice', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, sidesA, sidesB) => {
            const maxed = roll(`max(1d${sidesA}, 1d${sidesB})`, { seed });
            const minned = roll(`min(1d${sidesA}, 1d${sidesB})`, { seed });
            const maxDice = maxed.rolls.map((die) => die.result);
            const minDice = minned.rolls.map((die) => die.result);

            // Dice must match pairwise across the two calls — a wrapper that
            // draws extra values or swaps argument order diverges here even if
            // it still reports the extrema of whatever it rolled.
            return (
              maxDice.length === 2 &&
              minDice.length === 2 &&
              maxDice.every((die, i) => die === minDice[i]) &&
              maxed.total === Math.max(...maxDice) &&
              minned.total === Math.min(...minDice)
            );
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('sort invariants', () => {
    test('NdXs total equals NdX total for the same seeded roll', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, count, sides) => {
            const raw = roll(`${count}d${sides}`, { seed });
            const sorted = roll(`${count}d${sides}s`, { seed });
            return raw.total === sorted.total && raw.rolls.length === sorted.rolls.length;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('NdXs produces a monotonically non-decreasing rolls sequence', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 12 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}s`, { seed });
            for (let i = 1; i < result.rolls.length; i++) {
              const prev = result.rolls[i - 1];
              const curr = result.rolls[i];
              if (prev == null || curr == null) return false;
              if (prev.result > curr.result) return false;
            }
            return true;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('NdXsd produces a monotonically non-increasing rolls sequence', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 12 }),
          fc.integer({ min: 2, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}sd`, { seed });
            for (let i = 1; i < result.rolls.length; i++) {
              const prev = result.rolls[i - 1];
              const curr = result.rolls[i];
              if (prev == null || curr == null) return false;
              if (prev.result < curr.result) return false;
            }
            return true;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('sort emits no successes/failures', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 4, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}s`, { seed });
            return result.successes === undefined && result.failures === undefined;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('sort preserves dropped count after keep/drop', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 8 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 3 }),
          (seed, count, sides, drop) => {
            const dropN = Math.min(drop, count - 1);
            const base = roll(`${count}d${sides}dl${dropN}`, { seed });
            const sorted = roll(`${count}d${sides}dl${dropN}s`, { seed });
            const baseDropped = base.rolls.filter((d) => d.modifiers.includes('dropped')).length;
            const sortedDropped = sorted.rolls.filter((d) =>
              d.modifiers.includes('dropped'),
            ).length;
            return base.total === sorted.total && baseDropped === sortedDropped;
          },
        ),
        { numRuns: 200 },
      );
    });
  });

  describe('crit threshold invariants', () => {
    test('cs threshold does not change total or rolls vs. base roll', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 4, max: 20 }),
          fc.integer({ min: 2, max: 19 }),
          (seed, count, sides, threshold) => {
            const base = roll(`${count}d${sides}`, { seed });
            const flagged = roll(`${count}d${sides}cs>=${threshold}`, { seed });
            if (base.total !== flagged.total) return false;
            if (base.rolls.length !== flagged.rolls.length) return false;
            for (let i = 0; i < base.rolls.length; i++) {
              const b = base.rolls[i];
              const f = flagged.rolls[i];
              if (b?.result !== f?.result) return false;
            }
            return true;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('cs>=T marks every die with result >= T as critical', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 4, max: 20 }),
          fc.integer({ min: 2, max: 19 }),
          (seed, count, sides, threshold) => {
            const result = roll(`${count}d${sides}cs>=${threshold}`, { seed });
            for (const die of result.rolls) {
              const expected = die.result >= threshold;
              if (die.critical !== expected) return false;
              // cs does not touch the fumble side — default rule stays.
              if (die.fumble !== (die.result === 1)) return false;
            }
            return true;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('cf<=T marks every die with result <= T as fumble', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 2, max: 10 }),
          fc.integer({ min: 4, max: 20 }),
          fc.integer({ min: 1, max: 5 }),
          (seed, count, sides, threshold) => {
            const result = roll(`${count}d${sides}cf<=${threshold}`, { seed });
            for (const die of result.rolls) {
              const expected = die.result <= threshold;
              if (die.fumble !== expected) return false;
              // cf does not touch the critical side — default rule stays.
              if (die.critical !== (die.result === die.sides)) return false;
            }
            return true;
          },
        ),
        { numRuns: 200 },
      );
    });

    test('crit threshold does not emit successes/failures', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 4, max: 20 }),
          (seed, count, sides) => {
            const result = roll(`${count}d${sides}cs`, { seed });
            return result.successes === undefined && result.failures === undefined;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('malformed input robustness', () => {
    /** Either a successful roll or a typed error — never a raw crash. */
    function rollsOrThrowsTyped(input: string, seed: number): boolean {
      try {
        roll(input, { seed });
        return true;
      } catch (error) {
        return isRollParserError(error);
      }
    }

    // Strings over the notation alphabet reach far deeper lexer/parser states
    // than arbitrary Unicode: near-valid modifiers, dangling comparators,
    // unbalanced groups, huge digit runs.
    const notationChars = fc.constantFrom(...'0123456789dDkKhHlLfFsSrRoOcCpP!<>=%+-*/(){},@ .');

    test('roll() on notation-alphabet strings never escapes the typed-error contract', () => {
      fc.assert(
        fc.property(fc.string({ unit: notationChars, maxLength: 64 }), seedArb, rollsOrThrowsTyped),
        { numRuns: 1000 },
      );
    });

    test('roll() on arbitrary Unicode strings never escapes the typed-error contract', () => {
      fc.assert(
        fc.property(fc.string({ unit: 'binary', maxLength: 64 }), seedArb, rollsOrThrowsTyped),
        { numRuns: 500 },
      );
    });
  });
});
