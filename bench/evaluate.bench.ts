/**
 * Stage 3 — evaluation of a pre-parsed AST. The dominant cost in the pipeline
 * (55% of end-to-end on `1d20`, 85-95% on realistic notations), so this is the
 * group worth watching.
 *
 * A fresh `SeededRNG` is constructed inside every iteration. That charges each
 * sample a constant ~205 ns (isolated by the `roll` group's injected-RNG
 * variant), but it is what makes every iteration replay the identical RNG
 * stream, so even explode and reroll cases do byte-for-byte the same work per
 * sample.
 *
 * Every bench body is handed to `primeBenchFn` before mitata sees it. Without
 * that this group was the least trustworthy in the suite — `4d6kh3` reported
 * 42-82 µs against a true 2.3 µs, and `{2d20kh1+5, 3d8!}kh1` swung 1075%
 * between processes. See `primeBenchFn` for the mechanism.
 *
 * Run with `bun run bench:evaluate`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { evaluate, parse, SeededRNG } from '../src/index.js';
import {
  BASELINE_ID,
  BENCH_CASES,
  BENCH_SEED,
  getEvaluateOptions,
  primeBenchFn,
  warmUpPipeline,
} from './_cases.js';

/**
 * `.range('n', 1, 1000, 10)` below expands into one run per value — 1, 10, 100,
 * 1000. Keep in sync with those calls; `bench:json` fails loudly on a mismatch.
 */
const POOL_SCALING_RUNS = 2 * 4;

/** Returns the number of runs these groups contribute to a mitata dump. */
export function registerEvaluateBenches(): number {
  warmUpPipeline();

  group('evaluate', () => {
    summary(() => {
      for (const benchCase of BENCH_CASES) {
        const ast = parse(benchCase.notation);
        const options = getEvaluateOptions(benchCase);

        // Charging `SeededRNG` construction per sample matches `roll()`, the shipped
        // hot path; renaming or splitting the series would orphan the trend history.
        bench(benchCase.id, function* () {
          yield primeBenchFn(() => {
            do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), options));
          });
        })
          .gc('inner')
          .baseline(benchCase.id === BASELINE_ID);
      }
    });
  });

  // Tripwire for accidental O(n²) work in pool handling — keep/drop sorts the pool,
  // so `kh(n/2)` is the shape most likely to regress super-linearly.
  group('evaluate — pool scaling', () => {
    bench('$nd6', function* (state: { get(name: string): number }) {
      const size = state.get('n');
      const ast = parse(`${size}d6`);

      yield primeBenchFn(() => {
        do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), {}));
      });
    })
      .range('n', 1, 1000, 10)
      .gc('inner');

    bench('$nd6kh(n/2)', function* (state: { get(name: string): number }) {
      const size = state.get('n');
      const ast = parse(`${size}d6kh${Math.max(1, Math.floor(size / 2))}`);

      yield primeBenchFn(() => {
        do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), {}));
      });
    })
      .range('n', 1, 1000, 10)
      .gc('inner');
  });

  return BENCH_CASES.length + POOL_SCALING_RUNS;
}

if (import.meta.main) {
  registerEvaluateBenches();
  await run();
}
