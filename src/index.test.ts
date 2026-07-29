/**
 * Public export-surface tests (#134).
 *
 * Every other suite imports the implementation modules directly, so nothing
 * used to fail when a barrel export was dropped or misspelled. This file is
 * the only one that consumes `src/index.ts` the way an npm consumer does.
 *
 * @module index.test
 */

import { describe, expect, test } from 'bun:test';
import pkg from '../package.json' with { type: 'json' };
import * as api from './index.js';

/** Runtime values the package promises to export. */
const VALUE_EXPORTS = [
  'DEFAULT_MAX_DICE',
  'DEFAULT_MAX_EXPLODE_ITERATIONS',
  'DEFAULT_MAX_REROLL_ITERATIONS',
  'DegreeOfSuccess',
  'EvaluatorError',
  'LexerError',
  'MAX_PARSE_DEPTH',
  'ParseError',
  'RollParserError',
  'SeededRNG',
  'TokenType',
  'VERSION',
  'evaluate',
  'getErrorSpan',
  'isBinaryOp',
  'isCritThreshold',
  'isDice',
  'isExplode',
  'isFateDice',
  'isFunctionCall',
  'isGroup',
  'isGrouped',
  'isLiteral',
  'isModifier',
  'isReroll',
  'isRollParserError',
  'isSort',
  'isSuccessCount',
  'isUnaryOp',
  'isVariable',
  'isVersus',
  'lex',
  'parse',
  'roll',
] as const;

// ? Re-bound through a plain record so the loop below reads properties off an
//   ordinary object — indexing a namespace import directly defeats tree shaking
//   and trips `noDynamicNamespaceImportAccess`.
const surface: Record<string, unknown> = api;

describe('public API surface', () => {
  test('every promised export is defined', () => {
    for (const name of VALUE_EXPORTS) {
      expect(surface[name]).toBeDefined();
    }
  });

  test('the barrel exports nothing beyond the promised set', () => {
    expect(Object.keys(api).sort()).toEqual([...VALUE_EXPORTS].sort());
  });

  // ! Drift guard for the generated `src/version.ts` — a package.json bump
  //   without `bun run generate:version` must fail here, in CI, not at release.
  test('VERSION matches the package manifest', () => {
    expect(api.VERSION).toBe(pkg.version);
    expect(api.VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('the barrel wires the full pipeline together', () => {
    const result = api.roll('2d6+3', { rng: new api.SeededRNG('surface') });

    expect(result.total).toBeGreaterThanOrEqual(5);
    expect(result.total).toBeLessThanOrEqual(15);
    expect(api.isDice(api.parse('2d6'))).toBe(true);
    expect(api.lex('2d6')[1]?.type).toBe(api.TokenType.DICE);
  });

  test('error helpers re-exported from the barrel behave like the internals', () => {
    let caught: unknown;
    try {
      api.roll('2d6+&');
    } catch (error) {
      caught = error;
    }

    expect(api.isRollParserError(caught)).toBe(true);
    expect(caught).toBeInstanceOf(api.LexerError);
    expect(caught).toBeInstanceOf(api.RollParserError);
    expect(api.getErrorSpan(caught)).toEqual({ start: 4 });
  });

  test('limit constants are the documented defaults', () => {
    expect(api.DEFAULT_MAX_DICE).toBe(10_000);
    expect(api.DEFAULT_MAX_EXPLODE_ITERATIONS).toBe(1_000);
    expect(api.DEFAULT_MAX_REROLL_ITERATIONS).toBe(1_000);
  });
});
