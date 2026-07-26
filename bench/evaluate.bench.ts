/**
 * Stage 3 — evaluation of a pre-parsed AST. The dominant cost in the pipeline
 * (55% of end-to-end on `1d20`, 85-95% on realistic notations), so this is the
 * group worth watching.
 *
 * A fresh `SeededRNG` is constructed inside every iteration. That charges each
 * sample a constant ~205 ns (isolated by the `roll` group's injected-RNG
 * variant), but it is the only way to give explode and reroll cases the same
 * RNG stream every iteration — a shared RNG lets them do different amounts of
 * work per sample and the distribution goes multi-modal.
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
  warmUpPipeline,
} from './_cases.js';

export function registerEvaluateBenches(): void {
  warmUpPipeline();

  group('evaluate', () => {
    summary(() => {
      for (const benchCase of BENCH_CASES) {
        const ast = parse(benchCase.notation);
        const options = getEvaluateOptions(benchCase);

        bench(benchCase.id, () => {
          do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), options));
        })
          .gc('inner')
          .baseline(benchCase.id === BASELINE_ID);
      }
    });
  });

  // ? Tripwire for accidental O(n²) work in pool handling — keep/drop sorts the
  //   pool, so `kh(n/2)` is the shape most likely to regress super-linearly.
  group('evaluate — pool scaling', () => {
    bench('$nd6', function* (state: { get(name: string): number }) {
      const size = state.get('n');
      const ast = parse(`${size}d6`);

      yield () => {
        do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), {}));
      };
    })
      .range('n', 1, 1000, 10)
      .gc('inner');

    bench('$nd6kh(n/2)', function* (state: { get(name: string): number }) {
      const size = state.get('n');
      const ast = parse(`${size}d6kh${Math.max(1, Math.floor(size / 2))}`);

      yield () => {
        do_not_optimize(evaluate(ast, new SeededRNG(BENCH_SEED), {}));
      };
    })
      .range('n', 1, 1000, 10)
      .gc('inner');
  });
}

if (import.meta.main) {
  registerEvaluateBenches();
  await run();
}
