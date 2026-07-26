/**
 * Stage 4 — end-to-end `roll()`: lex + parse + evaluate.
 *
 * Two groups on purpose. `roll (seeded)` is what a caller actually pays,
 * including the per-call `new SeededRNG(seed)`; `roll (injected RNG)` reuses one
 * long-lived RNG so the difference between the two isolates that construction
 * cost. The injected group is restricted to cases whose work does not depend on
 * rolled values — explode and reroll cases would drift with the shared stream.
 *
 * Run with `bun run bench:roll`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { roll, SeededRNG } from '../src/index.js';
import {
  BASELINE_ID,
  BENCH_CASES,
  BENCH_SEED,
  FIXED_WORK_CASES,
  getRollOptions,
  warmUpPipeline,
} from './_cases.js';

export function registerRollBenches(): void {
  warmUpPipeline();

  group('roll (seeded)', () => {
    summary(() => {
      for (const benchCase of BENCH_CASES) {
        const options = { ...getRollOptions(benchCase), seed: BENCH_SEED };

        bench(benchCase.id, () => {
          do_not_optimize(roll(benchCase.notation, options));
        })
          .gc('inner')
          .baseline(benchCase.id === BASELINE_ID);
      }
    });
  });

  group('roll (injected RNG)', () => {
    summary(() => {
      const rng = new SeededRNG(BENCH_SEED);

      for (const benchCase of FIXED_WORK_CASES) {
        const options = { ...getRollOptions(benchCase), rng };

        bench(benchCase.id, () => {
          do_not_optimize(roll(benchCase.notation, options));
        })
          .gc('inner')
          .baseline(benchCase.id === BASELINE_ID);
      }
    });
  });
}

if (import.meta.main) {
  registerRollBenches();
  await run();
}
