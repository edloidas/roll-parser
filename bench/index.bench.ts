/**
 * Full suite — every stage in one process so the groups share a single
 * calibration pass and the printed ratios are comparable across stages.
 *
 * Run with `bun run bench`. Numbers are machine-dependent; treat them as
 * relative weights and as a regression baseline, not as absolute guarantees.
 * Read p50, not avg — avg is dominated by GC pauses.
 */

import { run } from 'mitata';
import { registerEvaluateBenches } from './evaluate.bench.js';
import { registerLexBenches } from './lex.bench.js';
import { registerParseBenches } from './parse.bench.js';
import { registerRollBenches } from './roll.bench.js';

export function registerAllBenches(): void {
  registerLexBenches();
  registerParseBenches();
  registerEvaluateBenches();
  registerRollBenches();
}

if (import.meta.main) {
  registerAllBenches();
  await run();
}
