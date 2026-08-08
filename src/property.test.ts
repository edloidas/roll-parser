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

import { describe, expect, test } from 'bun:test';
import fc from 'fast-check';
import { isRollParserError } from './errors.js';
import { parse } from './parser/parser.js';
import { renderBreakdown } from './render.js';
import { roll } from './roll.js';
import type { RollResult } from './types.js';

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

    // `0dX` and `Nd1` belong in `evaluator.test.ts`: both collapse the
    // `[N, N*X]` bound above to a point, and their pools are pinned there.
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
    // `+`/`*` commutativity and the `+0`/`*1` identities are out of scope: over
    // literal operands they restate IEEE-754, not this library. Signed literals
    // in either operand position are pinned in `parser.test.ts`.
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
      // Shapes cover BinaryOp, UnaryOp, dice count/sides, and call-argument
      // sites, each with parentheses somewhere in the tree.
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
            // The last shape reuses `{L}` as its `kh` selector, so bound it by
            // the dice count instead of letting it degenerate to keep-all.
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

  describe('rendered breakdown round-trip', () => {
    /**
     * `renderBreakdown` is a second implementation of the same output as
     * `RollResult.rendered`, so the two can drift apart silently. This is the
     * gate that turns that drift into a CI failure — it is the reason two
     * implementations are acceptable at all.
     */
    const notationCount = fc.integer({ min: 0, max: 4 });

    // Slot order is the order the parser accepts a chain in.
    const EXPLODE = ['!', '!!', '!p', '!>4'];
    const REROLL = ['r<2', 'ro<2', 'r=1'];
    const BOUND = ['min2', 'max5', 'min(-2)'];
    const CRIT = ['cs>4', 'cf<2', 'cs', 'cf', 'cs>5cf<2'];
    const SORT = ['s', 'sd'];
    const KEEP_DROP = ['kh2', 'kl1', 'dh1', 'dl1', 'kh(1d2)'];

    /**
     * Joins modifiers with spaces. Several adjacent pairs are otherwise
     * unlexable — `sd` followed by `kl1` reads as one identifier — and the
     * evaluator keeps a space exactly where one is needed, so the emitted
     * form differs from the input only in the redundant separators.
     */
    function chainModifiers(pool: string, modifiers: string[]): string {
      return [pool, ...modifiers.filter((modifier) => modifier !== '')].join(' ');
    }

    function withModifiers(pool: fc.Arbitrary<string>, slots: string[][]): fc.Arbitrary<string> {
      const slotArbs = slots.map((slot) => fc.option(fc.constantFrom(...slot), { nil: '' }));
      return fc
        .tuple(pool, fc.tuple(...slotArbs))
        .map(([base, modifiers]) => chainModifiers(base, [...modifiers]));
    }

    /**
     * A pool carrying exactly one modifier.
     *
     * ! Do not fold this into `withModifiers`. Only the outermost modifier of
     * ! a chain renders its own pool — every inner one is re-rendered by its
     * ! wrapper — so a generator that always stacks five optional slots leaves
     * ! each individual modifier outermost about 0.03% of the time, and the
     * ! explode and reroll pools go effectively untested.
     */
    function withOneModifier(pool: fc.Arbitrary<string>, slots: string[][]): fc.Arbitrary<string> {
      return fc
        .tuple(pool, fc.constantFrom(...slots.flat()))
        .map(([base, modifier]) => chainModifiers(base, [modifier]));
    }

    const numericPool = fc
      .tuple(notationCount, fc.constantFrom('4', '6', '8', '10', '20', '%'))
      .map(([count, sides]) => `${count}d${sides}`);
    const fatePool = notationCount.map((count) => `${count}dF`);

    const NUMERIC_SLOTS = [EXPLODE, REROLL, BOUND, CRIT, SORT, KEEP_DROP];
    // Fate dice reject explode, reroll and clamping, so they get a smaller
    // slot list rather than generating notation that can only be discarded.
    const FATE_SLOTS = [CRIT, SORT, KEEP_DROP];

    const modifiedPool = fc.oneof(
      { weight: 4, arbitrary: withOneModifier(numericPool, NUMERIC_SLOTS) },
      { weight: 4, arbitrary: withModifiers(numericPool, NUMERIC_SLOTS) },
      { weight: 1, arbitrary: withOneModifier(fatePool, FATE_SLOTS) },
      { weight: 1, arbitrary: withModifiers(fatePool, FATE_SLOTS) },
    );

    const termArb = fc.letrec((tie) => ({
      term: fc.oneof(
        { maxDepth: 2, withCrossShrink: true },
        modifiedPool,
        fc.integer({ min: 0, max: 9 }).map(String),
        fc.constantFrom('@str', '@{my stat}'),
        tie('term').map((inner) => `(${inner})`),
        fc
          .tuple(fc.constantFrom('floor', 'ceil', 'round', 'abs', 'sqrt'), tie('term'))
          .map(([name, inner]) => `${name}(${inner})`),
        fc
          .tuple(fc.constantFrom('min', 'max'), tie('term'), tie('term'))
          .map(([name, left, right]) => `${name}(${left}, ${right})`),
        fc.array(tie('term'), { minLength: 1, maxLength: 3 }).map((subs) => `{${subs.join(', ')}}`),
        // Sub-roll selection — the only notation that produces a group part
        // with `keptIndices`, and so the only one that strikes a whole
        // sub-roll instead of a die. Two or more sub-rolls, or the evaluator
        // takes the flat-pool path and no selection happens.
        fc
          .tuple(
            fc.array(tie('term'), { minLength: 2, maxLength: 3 }),
            fc.constantFrom('kh', 'kl', 'dh', 'dl'),
            fc.integer({ min: 1, max: 2 }),
          )
          .map(([subs, code, count]) => `{${subs.join(', ')}}${code}${count}`),
        fc
          .tuple(tie('term'), fc.constantFrom('+', '-', '*', '/', '%', '**'), tie('term'))
          .map(([left, operator, right]) => `${left} ${operator} ${right}`),
      ),
    })).term;

    // Success counting is terminal, so it is generated at the top level (or
    // braced) rather than as a term the arithmetic layer can wrap.
    const successArb = fc
      .tuple(
        modifiedPool,
        fc.constantFrom('>=4', '>3', '<3', '=4'),
        fc.option(fc.constantFrom('f1', 'f<2', 'f>=5'), { nil: '' }),
      )
      .map(([pool, threshold, fail]) => `${pool}${threshold}${fail}`);

    const notationArb = fc.oneof(
      { weight: 6, arbitrary: termArb },
      { weight: 2, arbitrary: successArb },
      { weight: 2, arbitrary: successArb.map((counted) => `{${counted}} + 1`) },
      { weight: 2, arbitrary: fc.tuple(termArb, termArb).map(([a, b]) => `${a} vs ${b}`) },
    );

    test('renderBreakdown with default marks reproduces result.rendered', () => {
      const NUM_RUNS = 1000;
      let evaluated = 0;

      fc.assert(
        fc.property(notationArb, seedArb, (notation, seed) => {
          let result: RollResult;
          try {
            result = roll(notation, {
              seed,
              context: { str: 3, 'my stat': 4 },
              maxDice: 200,
            });
          } catch (error) {
            // Notation the grammar produced but the parser or evaluator
            // rejects proves nothing about rendering — only an untyped
            // escape would be a failure, and that is pinned separately.
            return isRollParserError(error);
          }

          evaluated += 1;
          return renderBreakdown(result) === result.rendered;
        }),
        { numRuns: NUM_RUNS },
      );

      // Without this the property would still pass if the grammar drifted
      // into emitting notation nothing can evaluate.
      expect(evaluated).toBeGreaterThan(NUM_RUNS / 2);
    });

    /**
     * Reuses the breakdown grammar above — it is the one generator that covers
     * every modifier adjacency the serializer can emit.
     */
    test('result.expression parses (#299)', () => {
      const NUM_RUNS = 1000;
      let evaluated = 0;

      fc.assert(
        fc.property(notationArb, seedArb, (notation, seed) => {
          const options = { seed, context: { str: 3, 'my stat': 4 }, maxDice: 200 };

          let result: RollResult;
          try {
            result = roll(notation, options);
          } catch (error) {
            return isRollParserError(error);
          }

          evaluated += 1;
          // Meta-expressions are substituted with their resolved values, so
          // only re-parseability holds — not an identical total.
          parse(result.expression);
          return true;
        }),
        { numRuns: NUM_RUNS },
      );

      expect(evaluated).toBeGreaterThan(NUM_RUNS / 2);
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

    // No property pins non-negativity of a chained keep/drop total: faces are
    // >= 1 and the modifiers only remove dice, so a kept subset cannot sum < 0.
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

    // Pool length under chained keep/drop needs no property: keep/drop only
    // sets the `dropped` flag, it never adds or removes pool entries.
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
            // Same seed → both runs draw the same first N dice; `!` only appends.
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
      // `ro` guarantees termination — the invariant here is flags, not termination.
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

    test('die bound: every non-meta die respects the bound', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          fc.constantFrom('min', 'max'),
          (seed, count, sides, bound, kind) => {
            const result = roll(`${count}d${sides}${kind}${bound}`, { seed });
            const pool = result.rolls.filter((d) => !d.modifiers.includes('meta'));
            return (
              pool.length === count &&
              pool.every((d) => (kind === 'min' ? d.result >= bound : d.result <= bound))
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    test('die bound: total equals the sum of kept dice and clamps never change count', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 2, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (seed, count, sides, bound) => {
            const result = roll(`${count}d${sides}min${bound}`, { seed });
            const keptSum = result.rolls
              .filter((d) => !d.modifiers.includes('dropped'))
              .reduce((sum, d) => sum + d.result, 0);
            return result.total === keptSum && result.rolls.length === count;
          },
        ),
        { numRuns: 100 },
      );
    });

    test('die bound: clamped dice keep their natural face in initialResult', () => {
      fc.assert(
        fc.property(
          seedArb,
          fc.integer({ min: 1, max: 8 }),
          fc.integer({ min: 2, max: 10 }),
          (seed, count, sides) => {
            // A bound of sides+1 clamps every die, so each must carry its face.
            const result = roll(`${count}d${sides}min${sides + 1}`, { seed });
            return result.rolls.every(
              (d) =>
                d.result === sides + 1 &&
                d.initialResult !== undefined &&
                d.initialResult >= 1 &&
                d.initialResult <= sides &&
                d.modifiers.includes('min'),
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    test('seeded reroll is reproducible', () => {
      // Recursive reroll only terminates while the threshold stays below
      // `sides`, so some results can exceed it.
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
    // A math wrapper draws nothing extra from the RNG, so a same-seed pair shares
    // its dice exactly — the unwrapped roll is an exact oracle, not just a bound.
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

            // Dice must match pairwise: a wrapper that draws extra values or
            // swaps argument order still reports extrema, but diverges here.
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

    // The notation alphabet reaches far deeper lexer/parser states than arbitrary
    // Unicode: near-valid modifiers, dangling comparators, unbalanced groups.
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

    // ! Separate from the two properties above because they cap input at 64
    // ! characters — reaching the stack limit takes thousands of terms.
    test('roll() on long operator chains never escapes the typed-error contract', () => {
      const chainArb = fc
        .tuple(
          fc.constantFrom('1', '1d6', '2d6kh1', '(1+1)'),
          fc.constantFrom('+', '-', '*', '/', '%', '**'),
          fc.integer({ min: 2_000, max: 40_000 }),
        )
        .map(([term, operator, count]) => `${term}${operator}`.repeat(count) + term);

      fc.assert(fc.property(chainArb, seedArb, rollsOrThrowsTyped), { numRuns: 40 });
    });
  });
});
