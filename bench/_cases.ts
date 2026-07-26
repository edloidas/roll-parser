/**
 * Shared benchmark case table.
 *
 * Every stage bench (`lex`, `parse`, `evaluate`, `roll`) walks this one list so
 * a case added here shows up at every stage and the per-stage numbers stay
 * directly comparable. Case ids are stable — they are the series names pushed
 * to the CI trend chart by `scripts/bench-json.ts`, so renaming an id breaks
 * that series' history.
 */

import type { EvaluateOptions, RollOptions } from '../src/index.js';
import { evaluate, parse, SeededRNG } from '../src/index.js';
import { lex } from '../src/lexer/lexer.js';

/**
 * Rough cost class of a case. Purely descriptive — nothing branches on it — but
 * it keeps the table honest about why each notation earns its slot.
 */
export type BenchTier = 'simple' | 'common' | 'heavy' | 'pathological';

export type BenchCase = {
  /** Stable series name. Usually the notation itself. */
  id: string;
  notation: string;
  tier: BenchTier;
  /** Bindings for `@name` references in `notation`. */
  context?: Record<string, number>;
  /**
   * Marks cases whose dice count depends on rolled values (explode, reroll).
   * Those must never share an RNG across iterations — the work per iteration
   * would drift with the RNG stream and smear the distribution into modes.
   */
  variableWork?: boolean;
};

/** Seed used by every bench so runs are comparable across machines and commits. */
export const BENCH_SEED = 'bench';

/**
 * Baseline case for `summary()` ratios. `1d20` is the cheapest real notation,
 * so every other case reads as "N times a single d20".
 */
export const BASELINE_ID = '1d20';

/** Deep-but-diceless AST: 20 literals joined by `+`, exercising parser recursion. */
export const FLAT_SUM_NOTATION: string = Array.from({ length: 20 }, (_, i) => i + 1).join('+');

export const BENCH_CASES: BenchCase[] = [
  { id: '1d20', notation: '1d20', tier: 'simple' },
  { id: '1d20+5', notation: '1d20+5', tier: 'simple' },
  { id: '3d6', notation: '3d6', tier: 'simple' },
  { id: '2d6+3', notation: '2d6+3', tier: 'simple' },
  { id: '4dF', notation: '4dF', tier: 'simple' },

  { id: '4d6kh3', notation: '4d6kh3', tier: 'common' },
  { id: '2d20kh1 vs 15', notation: '2d20kh1 vs 15', tier: 'common' },
  { id: '10d10>=6f1', notation: '10d10>=6f1', tier: 'common' },
  { id: '4d6r<2', notation: '4d6r<2', tier: 'common', variableWork: true },
  { id: 'floor((1d4+1)*2/3)', notation: 'floor((1d4+1)*2/3)', tier: 'common' },
  { id: '@atk+1d20', notation: '@atk+1d20', tier: 'common', context: { atk: 7 } },

  { id: '10d6!kh3', notation: '10d6!kh3', tier: 'heavy', variableWork: true },
  {
    id: '{2d20kh1+5, 3d8!}kh1',
    notation: '{2d20kh1+5, 3d8!}kh1',
    tier: 'heavy',
    variableWork: true,
  },
  { id: 'sum-20-terms', notation: FLAT_SUM_NOTATION, tier: 'heavy' },
  { id: '100d6', notation: '100d6', tier: 'heavy' },

  { id: '1000d6', notation: '1000d6', tier: 'pathological' },
];

/** Cases safe to run against a long-lived RNG — their work is value-independent. */
export const FIXED_WORK_CASES: BenchCase[] = BENCH_CASES.filter(
  (benchCase) => benchCase.variableWork !== true,
);

export function getEvaluateOptions(benchCase: BenchCase): EvaluateOptions {
  const options: EvaluateOptions = { notation: benchCase.notation };
  if (benchCase.context != null) options.context = benchCase.context;
  return options;
}

export function getRollOptions(benchCase: BenchCase): RollOptions {
  const options: RollOptions = {};
  if (benchCase.context != null) options.context = benchCase.context;
  return options;
}

const WARMUP_ITERATIONS = 100;

let hasWarmedUp = false;

/**
 * Drives the full pipeline over every case before measurement starts.
 *
 * mitata's per-benchmark warmup is not enough to cover first-touch JIT tier-up
 * of the library itself: without this the first benchmark registered in a
 * process reads ~45x slow (32 µs vs 715 ns for `parse('1d20')`) and, since that
 * first benchmark is the baseline, every `summary()` ratio comes out inverted.
 */
export function warmUpPipeline(): void {
  if (hasWarmedUp) return;
  hasWarmedUp = true;

  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration++) {
    for (const benchCase of BENCH_CASES) {
      lex(benchCase.notation);
      const ast = parse(benchCase.notation);
      evaluate(ast, new SeededRNG(BENCH_SEED), getEvaluateOptions(benchCase));
    }
  }
}
