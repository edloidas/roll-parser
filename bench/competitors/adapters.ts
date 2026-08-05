/**
 * One adapter per library, normalizing each to "parse a notation" and "roll a
 * notation to a number". Adapters throw on unsupported or invalid input — the
 * matrix counts a throw as non-support, and validates everything that does not
 * throw statistically, so "parses but misinterprets" is never counted as
 * support.
 *
 * roll-parser is imported from `../../src`, so the suite always measures the
 * working tree, not a published version.
 */

import { roll as airRoll, tokenize as airTokenize } from '@airjp73/dice-notation';
import { DiceRoll, Parser as RpgParser } from '@dice-roller/rpg-dice-roller';
import { notationToOptions, roll as randsumRoll } from '@randsum/roller';
import { DiceRoller as Roll20Roller } from 'dice-roller-parser';
import { Dice, DiceParser } from 'dice-typescript';
import { roll as drollRoll } from 'droll';
import { parse, roll } from '../../src/index.js';

export type AdapterName =
  | 'roll-parser'
  | 'rpg-dice-roller'
  | 'randsum/roller'
  | 'dice-roller-parser'
  | 'airjp73/dice-notation'
  | 'dice-typescript'
  | 'droll';

export type Adapter = {
  name: AdapterName;
  /**
   * Full parse to an AST, or the nearest thing the library offers (noted per
   * adapter). Omitted when there is nothing comparable.
   */
  parse?: (notation: string) => unknown;
  /** Rolls and returns the numeric total. Throws on unsupported/invalid input. */
  rollTotal: (notation: string) => number;
  /**
   * Success count for success-pool notations, for libraries that report it
   * separately from `total` (dice-typescript sums the qualifying faces into
   * `total` and exposes the count as `successes`).
   */
  rollSuccesses?: (notation: string) => number;
};

// Long-lived instances mirror each library's documented usage: dice-roller-parser
// and dice-typescript expose stateless roller objects meant to be reused.
const roll20 = new Roll20Roller();
const diceTs = new Dice();

function diceTsRoll(notation: string): { total: number; successes: number } {
  const result = diceTs.roll(notation);
  if (result.errors.length > 0) throw new Error(result.errors[0]?.message ?? 'parse error');
  return result;
}

export const ADAPTERS: Adapter[] = [
  {
    name: 'roll-parser',
    parse: (notation) => parse(notation),
    rollTotal: (notation) => roll(notation).total,
  },
  {
    name: 'rpg-dice-roller',
    parse: (notation) => RpgParser.parse(notation),
    rollTotal: (notation) => new DiceRoll(notation).total,
  },
  {
    name: 'randsum/roller',
    // RDN is its own dialect (`4d6L` drops the lowest, `4d6C{<2}` clamps) — the
    // matrix gives it those spellings via `variants`.
    parse: (notation) => notationToOptions(notation),
    rollTotal: (notation) => randsumRoll(notation).total,
  },
  {
    name: 'dice-roller-parser',
    parse: (notation) => roll20.parse(notation),
    rollTotal: (notation) => roll20.rollValue(notation),
  },
  {
    // ? tokenize() is a lexer pass, not a full parse — the closest it offers.
    name: 'airjp73/dice-notation',
    parse: (notation) => airTokenize(notation),
    rollTotal: (notation) => {
      const result = airRoll(notation).result;
      if (typeof result !== 'number' || Number.isNaN(result)) {
        throw new Error('non-numeric result');
      }
      return result;
    },
  },
  {
    name: 'dice-typescript',
    parse: (notation) => new DiceParser(notation).parse(),
    rollTotal: (notation) => diceTsRoll(notation).total,
    rollSuccesses: (notation) => diceTsRoll(notation).successes,
  },
  {
    name: 'droll',
    rollTotal: (notation) => {
      const result = drollRoll(notation);
      if (result === false) throw new Error('droll rejected the notation');
      return result.total;
    },
  },
];

/** Pinned competitor versions, read from this package's manifest for report headers. */
export async function competitorVersions(): Promise<Record<string, string>> {
  const manifest = (await import('./package.json')) as {
    default: { dependencies: Record<string, string> };
  };
  return manifest.default.dependencies;
}
