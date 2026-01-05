/**
 * Main public API for rolling dice expressions.
 *
 * @module roll
 */

import type { RNG } from './rng/types';
import type { RollResult } from './types';
import { evaluate } from './evaluator/evaluator';
import { lex } from './lexer/lexer';
import { Parser } from './parser/parser';
import { SeededRNG } from './rng/seeded';

/**
 * Options for the roll function.
 */
export type RollOptions = {
  /** Custom RNG instance (takes precedence over seed) */
  rng?: RNG;
  /** Seed for deterministic rolls (ignored if rng provided) */
  seed?: string | number;
  /** Safety limit for iterations (default: 1000) - Stage 2 exploding dice */
  maxIterations?: number;
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
  const rng = options.rng ?? new SeededRNG(options.seed);
  const tokens = lex(notation);
  const ast = new Parser(tokens).parse();
  return evaluate(ast, rng, { notation });
}
