/**
 * Stage 2 — lex + Pratt parse into an AST.
 *
 * Run with `bun run bench:parse`, or as part of `bun run bench`.
 */

import { bench, do_not_optimize, group, run, summary } from 'mitata';
import { parse } from '../src/index.js';
import { BASELINE_ID, BENCH_CASES, warmUpPipeline } from './_cases.js';

export function registerParseBenches(): void {
  warmUpPipeline();

  group('parse', () => {
    summary(() => {
      for (const { id, notation } of BENCH_CASES) {
        bench(id, () => {
          do_not_optimize(parse(notation));
        })
          .gc('inner')
          .baseline(id === BASELINE_ID);
      }
    });
  });
}

if (import.meta.main) {
  registerParseBenches();
  await run();
}
