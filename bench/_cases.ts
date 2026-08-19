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
   *
   * ? Only `roll (injected RNG)` shares one; every other group reseeds per
   *   iteration, so this flag is not why those cases used to read multi-modal
   *   there — see {@link primeBenchFn}.
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
  { id: '{1d6+1d8}kh1', notation: '{1d6+1d8}kh1', tier: 'common' },
  { id: '2d20kh1 vs 15', notation: '2d20kh1 vs 15', tier: 'common' },
  { id: '10d10>=6f1', notation: '10d10>=6f1', tier: 'common' },
  { id: '4d6sd', notation: '4d6sd', tier: 'common' },
  { id: '10d10sd', notation: '10d10sd', tier: 'common' },
  // Sort composed with a success pool — the two pool passes that cost the most
  // per die, so the shape most exposed to a per-die regression in either (#281).
  { id: '10d10sd>=6f1', notation: '10d10sd>=6f1', tier: 'common' },
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
  { id: '100d6kh1', notation: '100d6kh1', tier: 'heavy' },
  { id: '100d6sa', notation: '100d6sa', tier: 'heavy' },

  // Reroll and stacked modifiers at pool scale. Every other reroll case is 4
  // dice, and nothing else here runs more than two pool passes over one pool.
  { id: '100d10ro<3', notation: '100d10ro<3', tier: 'heavy', variableWork: true },
  { id: '100d10kh50sd cs>8', notation: '100d10kh50sd cs>8', tier: 'heavy' },

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

/**
 * Bounds on the per-bench priming loop. The minimum is what buys JIT tier-up;
 * the budget stops heavy cases (`1000d6kh500` at ~420 µs/iter) from spending
 * minutes on it.
 */
const PRIME_MIN_ITERATIONS = 64;
const PRIME_MAX_ITERATIONS = 4096;
const PRIME_BUDGET_MS = 25;

/** Warm-up calls mitata makes before it commits to a sampling mode. */
const MITATA_WARMUP_CALLS = 3;

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

/** Runs `benchFn` until the JIT has tiered it up, bounded by time and count. */
function tierUp(benchFn: () => void): void {
  const deadline = performance.now() + PRIME_BUDGET_MS;

  for (let iteration = 0; iteration < PRIME_MAX_ITERATIONS; iteration++) {
    benchFn();

    if (iteration >= PRIME_MIN_ITERATIONS && performance.now() >= deadline) break;
  }
}

/**
 * Tiers a bench body up and pins mitata to batch sampling for it. Every bench
 * in this suite must go through this.
 *
 * mitata picks one of two sampling modes from its first three calls of the
 * body: if any comes in at or under 65,536 ns it batches 4096 calls per sample,
 * otherwise it times a single call per sample taken right after a full GC. The
 * two are not comparable — a single post-GC call on a sub-10 µs body reads
 * 10-30x its steady-state cost — and those three calls are *cold*, so a body
 * reads 5-135 µs regardless of what it really costs. Mid-weight cases therefore
 * picked a mode at random per process: `evaluate('4d6kh3')` reported 42-82 µs
 * against a true 2.3 µs (below end-to-end `roll('4d6kh3')`, which is
 * impossible), and `{2d20kh1+5, 3d8!}kh1` swung 1075% across five runs (#143).
 *
 * Two things fix that. The body is tiered up first — inside a generator body,
 * which mitata runs immediately before those calls; {@link warmUpPipeline}
 * cannot do it, because it warms the *library*, not the per-bench closure
 * mitata actually times. Then the three warm-up calls are swallowed, so the
 * mode is always batch, for every case, on every machine. That is the mode the
 * whole suite was already reporting in but for a handful of heavy cases, and
 * it is the stabler one even for those: `1000d6kh500` holds a 6% p50 spread
 * batched against 8-12% single.
 *
 * ! Do not "simplify" this to `bench(id, () => …)` or drop the warm-up counter.
 *   Either change hands the mode decision back to a cold measurement, and the
 *   multi-modal p50s come back with it.
 */
export function primeBenchFn(benchFn: () => void): () => void {
  tierUp(benchFn);

  let warmUpCallsLeft = MITATA_WARMUP_CALLS;

  return () => {
    if (warmUpCallsLeft > 0) {
      warmUpCallsLeft--;
      return;
    }

    benchFn();
  };
}
