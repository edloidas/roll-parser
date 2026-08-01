/**
 * Stage 1 — tokenization only.
 *
 * Run with `bun run bench:lex`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { lex } from '../src/lexer/lexer.js';
import { BASELINE_ID, BENCH_CASES, primeBenchFn, warmUpPipeline } from './_cases.js';

/** Returns the number of runs this group contributes to a mitata dump. */
export function registerLexBenches(): number {
  warmUpPipeline();

  group('lex', () => {
    summary(() => {
      for (const { id, notation } of BENCH_CASES) {
        // Generator form so `primeBenchFn` runs right before mitata's warm-up.
        bench(id, function* () {
          yield primeBenchFn(() => {
            do_not_optimize(lex(notation));
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
  registerLexBenches();
  await run();
}
