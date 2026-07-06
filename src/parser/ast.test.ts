import { describe, expect, test } from 'bun:test';
import { isRollParserError, RollParserError } from '../errors.js';
import {
  isBinaryOp,
  isCritThreshold,
  isDice,
  isExplode,
  isFateDice,
  isFunctionCall,
  isGroup,
  isGrouped,
  isLiteral,
  isModifier,
  isReroll,
  isSort,
  isSuccessCount,
  isUnaryOp,
  isVariable,
  isVersus,
} from './ast.js';
import type { ASTNode } from './ast.js';
import { parse } from './parser.js';

describe('AST type guards', () => {
  // One representative notation per node type — each guard must accept its
  // own node and reject every other node in the table.
  const nodes: [string, (node: ASTNode) => boolean, ASTNode][] = [
    ['Literal', isLiteral, parse('42')],
    ['Dice', isDice, parse('2d6')],
    ['FateDice', isFateDice, parse('4dF')],
    ['BinaryOp', isBinaryOp, parse('1+2')],
    ['UnaryOp', isUnaryOp, parse('-1d6')],
    ['Modifier', isModifier, parse('4d6kh3')],
    ['Explode', isExplode, parse('1d6!')],
    ['Reroll', isReroll, parse('2d6r<2')],
    ['SuccessCount', isSuccessCount, parse('5d10>=8')],
    ['Versus', isVersus, parse('1d20 vs 15')],
    ['FunctionCall', isFunctionCall, parse('floor(1d6/2)')],
    ['Grouped', isGrouped, parse('(1d6)')],
    ['Variable', isVariable, parse('@str')],
    ['Group', isGroup, parse('{1d6, 1d8}')],
    ['Sort', isSort, parse('4d6s')],
    ['CritThreshold', isCritThreshold, parse('1d20cs>18')],
  ];

  for (const [name, guard, node] of nodes) {
    test(`is${name} accepts only ${name} nodes`, () => {
      expect(guard(node)).toBe(true);
      for (const [otherName, , otherNode] of nodes) {
        if (otherName !== name) {
          expect(guard(otherNode)).toBe(false);
        }
      }
    });
  }
});

describe('AST walkers via parse-level guards', () => {
  test('sort deep-walk accepts unary and versus-embedded dice pools', () => {
    expect(() => parse('(-1d6)s')).not.toThrow();
    expect(() => parse('(1+(1d20 vs 5))s')).not.toThrow();
  });

  test('bare cf rejects Fate pools cloaked by wrappers inside a group', () => {
    // Each notation routes deepContainsFatePool through a different branch:
    // UnaryOp, Modifier target, Grouped, nested Group.
    for (const notation of ['{-4dF}cf', '{4dFkh2}cf', '{(4dF)}cf', '{{4dF}}cf']) {
      expect(() => parse(notation)).toThrow('Bare cs/cf cannot apply to Fate dice');
    }
  });
});

describe('isRollParserError', () => {
  test('accepts direct instances', () => {
    expect(isRollParserError(new RollParserError('boom', 'UNEXPECTED_TOKEN'))).toBe(true);
  });

  test('accepts cross-realm duck-typed errors with a known code', () => {
    const foreign = Object.assign(new Error('boom'), { code: 'DIVISION_BY_ZERO' });
    expect(isRollParserError(foreign)).toBe(true);
  });

  test('rejects errors with unknown codes and non-errors', () => {
    expect(isRollParserError(Object.assign(new Error('x'), { code: 'ENOENT' }))).toBe(false);
    expect(isRollParserError(new Error('plain'))).toBe(false);
    expect(isRollParserError({ code: 'DIVISION_BY_ZERO' })).toBe(false);
    expect(isRollParserError(null)).toBe(false);
  });
});
