/**
 * Main public API for rolling dice expressions.
 *
 * @module roll
 */

import { evaluate } from './evaluator/evaluator.js';
import { parse } from './parser/parser.js';
import { SeededRNG } from './rng/seeded.js';
import type { RNG } from './rng/types.js';
import type { EvaluationOptions, RollResult } from './types.js';

/**
 * Everything {@link roll} accepts on top of the shared {@link EvaluationOptions}:
 * a randomness source, given either as a ready-made {@link RNG} or as a seed.
 *
 * @category Core
 *
 * @example
 * ```typescript
 * import { roll, SeededRNG } from 'roll-parser';
 *
 * roll('4d6', { seed: 'character-1' });     // reproducible
 * roll('4d6', { rng: new SeededRNG(42) });  // rng wins over seed
 * roll('1d20+@str', { context: { str: 4 } });
 * ```
 */
export type RollOptions = EvaluationOptions & {
  /**
   * Randomness source. Takes precedence over `seed` — when both are given,
   * `seed` is ignored.
   */
  rng?: RNG;
  /**
   * Seed for a fresh `SeededRNG`. Equal seeds replay the same die sequence for
   * the same notation. Ignored when `rng` is set.
   */
  seed?: string | number;
};

/**
 * Parses and evaluates a dice notation string in one call — the main entry
 * point of the library.
 *
 * Equivalent to `evaluate(parse(notation), rng, { notation })`. Each call
 * builds a fresh `SeededRNG` unless `options.rng` is supplied, so reuse
 * {@link parse} + {@link evaluate} directly when rolling the same notation in
 * a loop.
 *
 * @param notation - Dice notation, e.g. `'2d6+3'` or `'4d6kh3'`
 * @param options - RNG or seed, plus the shared {@link EvaluationOptions}
 * @returns Complete {@link RollResult} with total, per-die results and the
 *   structured `parts` tree
 * @throws {LexerError} On an invalid character
 * @throws {ParseError} On invalid syntax
 * @throws {EvaluatorError} On a limit breach or an impossible expression
 * @throws {RollParserError} `INVALID_EVALUATION_LIMIT` when a supplied limit is
 *   not an integer in range — raised before any die is rolled
 *
 * @example
 * ```typescript
 * import { roll } from 'roll-parser';
 *
 * // Random roll
 * roll('2d6+3').total; // 5..15
 *
 * // Seeded — same seed, same sequence
 * roll('2d6+3', { seed: 'demo' }).rendered; // '2d6[1, 6] + 3 = 10'
 * roll('2d6+3', { seed: 'demo' }).total; // 10
 * ```
 *
 * @example Deterministic tests with the testing mock
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
 * result.total; // 14
 * result.rendered; // '4d6[3, 6, ~~2~~, 5] = 14'
 * ```
 *
 * @category Core
 */
export function roll(notation: string, options: RollOptions = {}): RollResult {
  // Explicitly-undefined limit keys forward harmlessly — `evaluate` nullish-checks each.
  const { rng, seed, ...limits } = options;

  return evaluate(parse(notation), rng ?? new SeededRNG(seed), { ...limits, notation });
}
