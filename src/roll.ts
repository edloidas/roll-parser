/**
 * Main public API for rolling dice expressions.
 *
 * @module roll
 */

import { evaluate } from './evaluator/evaluator.js';
import { parse } from './parser/parser.js';
import { SeededRNG } from './rng/seeded.js';
import type { RNG } from './rng/types.js';
import type { EvaluationLimits, RollResult } from './types.js';

/**
 * Options for the roll function.
 */
export type RollOptions = EvaluationLimits & {
  /** Custom RNG instance (takes precedence over seed) */
  rng?: RNG;
  /** Seed for deterministic rolls (ignored if rng provided) */
  seed?: string | number;
};

/**
 * Parses and evaluates a dice notation string.
 *
 * @param notation - Dice notation (e.g., "2d6+3", "4d6kh3")
 * @param options - Optional configuration (RNG or seed)
 * @returns Complete roll result with total and metadata
 *
 * @example
 * ```typescript
 * // Random roll
 * const result = roll('2d6+3');
 * console.log(result.total); // 5-15
 *
 * // Seeded for reproducibility
 * const r1 = roll('4d6', { seed: 'test' });
 * const r2 = roll('4d6', { seed: 'test' });
 * r1.total === r2.total; // true
 *
 * // Custom RNG for testing
 * const result = roll('1d20', { rng: createMockRng([15]) });
 * result.total; // 15
 * ```
 */
export function roll(notation: string, options: RollOptions = {}): RollResult {
  // ? `limits` is exactly `EvaluationLimits`, so it forwards wholesale — an
  //   explicitly-undefined key is harmless, `evaluate` nullish-checks each one.
  const { rng, seed, ...limits } = options;

  return evaluate(parse(notation), rng ?? new SeededRNG(seed), { ...limits, notation });
}
