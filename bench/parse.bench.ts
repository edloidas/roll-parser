/**
 * Stage 2 — lex + Pratt parse into an AST.
 *
 * Run with `bun run bench:parse`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { parse } from '../src/index.js';
import { BASELINE_ID, BENCH_CASES, primeBenchFn, warmUpPipeline } from './_cases.js';

/** Returns the number of runs this group contributes to a mitata dump. */
export function registerParseBenches(): number {
  warmUpPipeline();

  group('parse', () => {
    summary(() => {
      for (const { id, notation } of BENCH_CASES) {
        // Generator form so `primeBenchFn` runs right before mitata's warm-up.
        bench(id, function* () {
          yield primeBenchFn(() => {
            do_not_optimize(parse(notation));
          });
        })
          .gc('inner')
          .baseline(id === BASELINE_ID);
      }
    });
  });

  return BENCH_CASES.length;
}

if (import.meta.main) {
  registerParseBenches();
  await run();
}
