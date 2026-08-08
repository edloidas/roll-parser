import { describe, expect, test } from 'bun:test';
import { joinModifierCode } from './notation.js';

describe('joinModifierCode', () => {
  test.each([
    ['1d20cs', 'cf', '1d20cs cf'],
    ['4d6s', 'kh2', '4d6s kh2'],
    ['4d6sd', 'kh2', '4d6sd kh2'],
    ['4d6cf', 'sd', '4d6cf sd'],
    ['4dFs', 'dh1', '4dFs dh1'],
  ])('separates %s from %s', (expression, code, expected) => {
    expect(joinModifierCode(expression, code)).toBe(expected);
  });

  test.each([
    // A threshold ends the code with a digit, so nothing can merge into it.
    ['1d20cs>4', 'cf<2', '1d20cs>4cf<2'],
    ['4d6kh2', 's', '4d6kh2s'],
    // `dF` and `!p` end in letters but lex as their own tokens.
    ['4dF', 'cs', '4dFcs'],
    ['4d6!p', 'kh2', '4d6!pkh2'],
    // Codes that open with a symbol are unambiguous wherever they land.
    ['4d6s', '>=4', '4d6s>=4'],
    ['4d6cs', '!', '4d6cs!'],
  ])('leaves %s and %s joined', (expression, code, expected) => {
    expect(joinModifierCode(expression, code)).toBe(expected);
  });
});

describe('folding a code list', () => {
  test('separates only where needed', () => {
    expect(['cs', 'cs=10', 'cf<3'].reduce(joinModifierCode, '')).toBe('cs cs=10cf<3');
  });

  test('yields an empty string for no codes', () => {
    expect([].reduce(joinModifierCode, '')).toBe('');
  });
});
