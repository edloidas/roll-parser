/**
 * Stage 1 — tokenization only.
 *
 * Run with `bun run bench:lex`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { lex } from '../src/lexer/lexer.js';
import { BASELINE_ID, BENCH_CASES, warmUpPipeline } from './_cases.js';

export function registerLexBenches(): void {
  warmUpPipeline();

  group('lex', () => {
    summary(() => {
      for (const { id, notation } of BENCH_CASES) {
        bench(id, () => {
          do_not_optimize(lex(notation));
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
