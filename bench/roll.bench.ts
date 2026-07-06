/**
 * Benchmark suite backing the "high-performance" claim.
 *
 * Run with `bun bench`. Numbers are machine-dependent — treat them as
 * relative weights between notations and as a regression baseline, not as
 * absolute guarantees.
 */

import { bench, group, run } from 'mitata';
import { evaluate, parse, roll, SeededRNG } from '../src/index.js';

group('parse (lex + Pratt parse)', () => {
  bench('2d6+3', () => parse('2d6+3'));
  bench('4d6kh3', () => parse('4d6kh3'));
  bench('10d10>=6f1', () => parse('10d10>=6f1'));
  bench('{2d20kh1+5, 3d8!}kh1', () => parse('{2d20kh1+5, 3d8!}kh1'));
  bench('floor((1d4+1)*2/3)', () => parse('floor((1d4+1)*2/3)'));
});

group('evaluate (pre-parsed AST, shared RNG)', () => {
  const simple = parse('2d6+3');
  const keep = parse('4d6kh3');
  const pool = parse('10d10>=6f1');
  const big = parse('100d6');
  const rng = new SeededRNG('bench');

  bench('2d6+3', () => evaluate(simple, rng));
  bench('4d6kh3', () => evaluate(keep, rng));
  bench('10d10>=6f1', () => evaluate(pool, rng));
  bench('100d6', () => evaluate(big, rng));
});

group('roll (end-to-end, fresh seeded RNG per call)', () => {
  bench('1d20+5', () => roll('1d20+5', { seed: 'bench' }));
  bench('4d6kh3', () => roll('4d6kh3', { seed: 'bench' }));
  bench('8d6!', () => roll('8d6!', { seed: 'bench' }));
  bench('1d20+10 vs 25', () => roll('1d20+10 vs 25', { seed: 'bench' }));
  bench('{2d20kh1+5, 3d8!}kh1', () => roll('{2d20kh1+5, 3d8!}kh1', { seed: 'bench' }));
});

await run();
