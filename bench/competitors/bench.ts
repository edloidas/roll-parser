/**
 * Cross-library performance: parse-only and end-to-end roll.
 *
 * Out-of-the-box comparison — each library runs its default RNG and its
 * documented one-shot API, the way a consumer would call it. Notations are
 * dialect-mapped where spellings differ (see matrix.ts). Numbers are
 * machine-dependent; read p50 and treat results as relative weights.
 *
 * Group membership is fixed by the support matrix: a library appears in a
 * group only when it both parses the notation and passes the statistical
 * check in matrix.ts — benchmarking a misinterpreted roll would reward doing
 * the wrong thing quickly.
 */

import { roll as airRoll, tokenize as airTokenize } from '@airjp73/dice-notation';
import { DiceRoll, Parser as RpgParser } from '@dice-roller/rpg-dice-roller';
import { notationToOptions, roll as randsumRoll } from '@randsum/roller';
import { DiceRoller as Roll20Roller } from 'dice-roller-parser';
import { Dice, DiceParser } from 'dice-typescript';
import { roll as drollRoll, validate as drollValidate } from 'droll';
import { bench, group, run, summary } from 'mitata';
import { parse, roll } from '../../src/index.js';
import { competitorVersions } from './adapters.js';

const roll20 = new Roll20Roller();
const diceTs = new Dice();

type LibraryBench = { library: string; fn: () => unknown };

//
// * Parse-only
//

const PARSE_GROUPS: Record<string, LibraryBench[]> = {
  'parse 1d20+5': [
    { library: 'roll-parser', fn: () => parse('1d20+5') },
    { library: 'rpg-dice-roller', fn: () => RpgParser.parse('1d20+5') },
    { library: 'randsum/roller', fn: () => notationToOptions('1d20+5') },
    { library: 'dice-roller-parser', fn: () => roll20.parse('1d20+5') },
    { library: 'airjp73 (tokenize only)', fn: () => airTokenize('1d20+5') },
    { library: 'dice-typescript', fn: () => new DiceParser('1d20+5').parse() },
    { library: 'droll (regex validate only)', fn: () => drollValidate('1d20+5') },
  ],
  'parse 4d6kh3': [
    { library: 'roll-parser', fn: () => parse('4d6kh3') },
    { library: 'rpg-dice-roller', fn: () => RpgParser.parse('4d6kh3') },
    { library: 'randsum/roller (4d6L)', fn: () => notationToOptions('4d6L') },
    { library: 'dice-roller-parser', fn: () => roll20.parse('4d6kh3') },
    { library: 'dice-typescript', fn: () => new DiceParser('4d6kh3').parse() },
  ],
  'parse {2d20kh1+5, 3d8!}kh1': [
    { library: 'roll-parser', fn: () => parse('{2d20kh1+5, 3d8!}kh1') },
    { library: 'rpg-dice-roller', fn: () => RpgParser.parse('{2d20kh1+5, 3d8!}kh1') },
    { library: 'dice-roller-parser', fn: () => roll20.parse('{2d20kh1+5, 3d8!}kh1') },
  ],
};

//
// * End-to-end roll
//

const ROLL_GROUPS: Record<string, LibraryBench[]> = {
  'roll 1d20': [
    { library: 'roll-parser', fn: () => roll('1d20') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('1d20').total },
    { library: 'randsum/roller', fn: () => randsumRoll('1d20').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('1d20') },
    { library: 'airjp73/dice-notation', fn: () => airRoll('1d20') },
    { library: 'dice-typescript', fn: () => diceTs.roll('1d20') },
    { library: 'droll', fn: () => drollRoll('1d20') },
  ],
  'roll 3d6+2': [
    { library: 'roll-parser', fn: () => roll('3d6+2') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('3d6+2').total },
    { library: 'randsum/roller', fn: () => randsumRoll('3d6+2').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('3d6+2') },
    { library: 'airjp73/dice-notation', fn: () => airRoll('3d6+2') },
    { library: 'dice-typescript', fn: () => diceTs.roll('3d6+2') },
    { library: 'droll', fn: () => drollRoll('3d6+2') },
  ],
  'roll 4d6kh3': [
    { library: 'roll-parser', fn: () => roll('4d6kh3') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('4d6kh3').total },
    { library: 'randsum/roller (4d6L)', fn: () => randsumRoll('4d6L').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('4d6kh3') },
    { library: 'dice-typescript', fn: () => diceTs.roll('4d6kh3') },
  ],
  'roll 3d6! (explode)': [
    { library: 'roll-parser', fn: () => roll('3d6!') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('3d6!').total },
    { library: 'randsum/roller', fn: () => randsumRoll('3d6!').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('3d6!') },
    { library: 'dice-typescript', fn: () => diceTs.roll('3d6!') },
  ],
  // Success counting is dialect-mapped: roll20 comparators are inclusive, so
  // its spelling of ">=8" is ">8". dice-typescript is excluded — its `total`
  // sums the qualifying faces instead of counting them (see matrix.ts) — and
  // randsum/roller has no notation-level success counting at all.
  'roll success-count 10d10': [
    { library: 'roll-parser', fn: () => roll('10d10>=8') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('10d10>=8').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('10d10>8') },
  ],
  'roll 100d6': [
    { library: 'roll-parser', fn: () => roll('100d6') },
    { library: 'rpg-dice-roller', fn: () => new DiceRoll('100d6').total },
    { library: 'randsum/roller', fn: () => randsumRoll('100d6').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('100d6') },
    { library: 'airjp73/dice-notation', fn: () => airRoll('100d6') },
    { library: 'dice-typescript', fn: () => diceTs.roll('100d6') },
    { library: 'droll', fn: () => drollRoll('100d6') },
  ],
  // rpg-dice-roller is excluded: quantity is hard-capped at 999 dice.
  'roll 1000d6': [
    { library: 'roll-parser', fn: () => roll('1000d6') },
    { library: 'randsum/roller', fn: () => randsumRoll('1000d6').total },
    { library: 'dice-roller-parser', fn: () => roll20.rollValue('1000d6') },
    { library: 'airjp73/dice-notation', fn: () => airRoll('1000d6') },
    { library: 'dice-typescript', fn: () => diceTs.roll('1000d6') },
    { library: 'droll', fn: () => drollRoll('1000d6') },
  ],
};

// Warm every bench body before mitata starts, so the first-registered bench
// does not read cold — the same first-touch JIT failure mode the main suite's
// `warmUpPipeline` guards against (see ../_cases.ts).
const WARMUP_ITERATIONS = 200;
for (const groups of [PARSE_GROUPS, ROLL_GROUPS]) {
  for (const benches of Object.values(groups)) {
    for (const libraryBench of benches) {
      for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration++) {
        libraryBench.fn();
      }
    }
  }
}

console.log('competitors:', JSON.stringify(await competitorVersions()));

for (const [name, benches] of Object.entries({ ...PARSE_GROUPS, ...ROLL_GROUPS })) {
  group(name, () => {
    summary(() => {
      for (const libraryBench of benches) bench(libraryBench.library, libraryBench.fn);
    });
  });
}

await run();
