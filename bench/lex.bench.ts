/**
 * Stage 1 — tokenization only.
 *
 * Run with `bun run bench:lex`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { lex } from '../src/lexer/lexer.js';
import { BASELINE_ID, BENCH_CASES, primeBenchFn, warmUpPipeline } from './_cases.js';

export function registerLexBenches(): void {
  warmUpPipeline();

  group('lex', () => {
    summary(() => {
      for (const { id, notation } of BENCH_CASES) {
        // ? Generator form so `primeBenchFn` runs right before mitata's
        //   warm-up — see its doc comment for why that is load-bearing.
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
}

if (import.meta.main) {
  registerLexBenches();
  await run();
}
