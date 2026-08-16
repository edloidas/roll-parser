import { describe, expect, it } from 'bun:test';
import { getErrorSpan, isRollParserError, RollParserError } from '../errors.js';
import { expectRollError } from '../test-helpers.js';
import { Lexer, LexerError, lex } from './lexer.js';
import { TokenType } from './tokens.js';

describe('Lexer', () => {
  describe('basic tokens', () => {
    it('should tokenize a simple dice roll', () => {
      const tokens = lex('2d20+5');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '20', position: 2 });
      expect(tokens[3]).toMatchObject({ type: TokenType.PLUS, value: '+', position: 4 });
      expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: '5', position: 5 });
      expect(tokens[5]).toMatchObject({ type: TokenType.EOF, value: '', position: 6 });
    });

    it('should handle case insensitivity for dice operator', () => {
      const tokens = lex('D20');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '20', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.EOF, value: '', position: 3 });
    });

    it('should handle whitespace between tokens', () => {
      const tokens = lex('2 d 20');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 2 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '20', position: 4 });
      expect(tokens[3]).toMatchObject({ type: TokenType.EOF, value: '', position: 6 });
    });

    it('should return only EOF for empty string', () => {
      const tokens = lex('');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: TokenType.EOF, value: '', position: 0 });
    });

    it('should return only EOF for whitespace-only string', () => {
      const tokens = lex('   \t\n  ');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toMatchObject({ type: TokenType.EOF, value: '', position: 7 });
    });
  });

  describe('numbers', () => {
    it('should tokenize integer numbers', () => {
      const tokens = lex('42');

      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '42', position: 0 });
    });

    it('should tokenize decimal numbers', () => {
      const tokens = lex('1.5');

      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '1.5', position: 0 });
    });

    it('should throw for trailing dot not followed by digit', () => {
      expect(() => lex('1.+2')).toThrow(LexerError);
    });

    it('should tokenize multi-digit numbers', () => {
      const tokens = lex('100d20');

      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '100', position: 0 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '20', position: 4 });
    });
  });

  describe('operators', () => {
    it('should tokenize all arithmetic operators', () => {
      const tokens = lex('+-*/%');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]?.type).toBe(TokenType.PLUS);
      expect(tokens[1]?.type).toBe(TokenType.MINUS);
      expect(tokens[2]?.type).toBe(TokenType.MULTIPLY);
      expect(tokens[3]?.type).toBe(TokenType.DIVIDE);
      expect(tokens[4]?.type).toBe(TokenType.MODULO);
    });

    it('should tokenize ** as power operator', () => {
      const tokens = lex('2**3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.POWER, value: '**', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 3 });
    });

    it('should tokenize ^ as power operator', () => {
      const tokens = lex('2^3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.POWER, value: '^', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 2 });
    });

    it('should tokenize parentheses', () => {
      const tokens = lex('(1+2)');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toMatchObject({ type: TokenType.LPAREN, value: '(', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.PLUS, value: '+', position: 2 });
      expect(tokens[3]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 3 });
      expect(tokens[4]).toMatchObject({ type: TokenType.RPAREN, value: ')', position: 4 });
    });
  });

  describe('keep/drop modifiers', () => {
    it('should tokenize kh as KEEP_HIGH (maximal munch)', () => {
      const tokens = lex('kh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.KEEP_HIGH, value: 'kh', position: 0 });
    });

    it('should tokenize kl as KEEP_LOW', () => {
      const tokens = lex('kl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.KEEP_LOW, value: 'kl', position: 0 });
    });

    it('should tokenize k alone as KEEP_HIGH (shorthand)', () => {
      const tokens = lex('k3');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.KEEP_HIGH, value: 'k', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 1 });
    });

    it('should tokenize dh as DROP_HIGH (maximal munch)', () => {
      const tokens = lex('dh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DROP_HIGH, value: 'dh', position: 0 });
    });

    it('should tokenize dl as DROP_LOW', () => {
      const tokens = lex('dl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DROP_LOW, value: 'dl', position: 0 });
    });

    it('should handle case insensitivity for modifiers', () => {
      expect(lex('KH')[0]?.type).toBe(TokenType.KEEP_HIGH);
      expect(lex('Kl')[0]?.type).toBe(TokenType.KEEP_LOW);
      expect(lex('DH')[0]?.type).toBe(TokenType.DROP_HIGH);
      expect(lex('Dl')[0]?.type).toBe(TokenType.DROP_LOW);
    });

    it('should tokenize 4d6kh3 correctly', () => {
      const tokens = lex('4d6kh3');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '6', position: 2 });
      expect(tokens[3]).toMatchObject({ type: TokenType.KEEP_HIGH, value: 'kh', position: 3 });
      expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 5 });
    });

    it('should tokenize 4d6dl1 correctly', () => {
      const tokens = lex('4d6dl1');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '6', position: 2 });
      expect(tokens[3]).toMatchObject({ type: TokenType.DROP_LOW, value: 'dl', position: 3 });
      expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 5 });
    });
  });

  describe('disambiguation', () => {
    it('should distinguish d followed by digit as DICE', () => {
      const tokens = lex('d6');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '6', position: 1 });
    });

    it('should distinguish dh as DROP_HIGH not DICE', () => {
      const tokens = lex('dh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DROP_HIGH, value: 'dh', position: 0 });
    });

    it('should distinguish dl as DROP_LOW not DICE', () => {
      const tokens = lex('dl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DROP_LOW, value: 'dl', position: 0 });
    });
  });

  describe('complex expressions', () => {
    it('should tokenize (1+1)d(3*2)', () => {
      const tokens = lex('(1+1)d(3*2)');

      expect(tokens).toHaveLength(12);
      expect(tokens[0]?.type).toBe(TokenType.LPAREN);
      expect(tokens[1]?.type).toBe(TokenType.NUMBER);
      expect(tokens[2]?.type).toBe(TokenType.PLUS);
      expect(tokens[3]?.type).toBe(TokenType.NUMBER);
      expect(tokens[4]?.type).toBe(TokenType.RPAREN);
      expect(tokens[5]?.type).toBe(TokenType.DICE);
      expect(tokens[6]?.type).toBe(TokenType.LPAREN);
      expect(tokens[7]?.type).toBe(TokenType.NUMBER);
      expect(tokens[8]?.type).toBe(TokenType.MULTIPLY);
      expect(tokens[9]?.type).toBe(TokenType.NUMBER);
      expect(tokens[10]?.type).toBe(TokenType.RPAREN);
      expect(tokens[11]?.type).toBe(TokenType.EOF);
    });

    it('should tokenize 2d20kh1+5', () => {
      const tokens = lex('2d20kh1+5');

      expect(tokens).toHaveLength(8);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.DICE);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[3]?.type).toBe(TokenType.KEEP_HIGH);
      expect(tokens[4]?.type).toBe(TokenType.NUMBER);
      expect(tokens[5]?.type).toBe(TokenType.PLUS);
      expect(tokens[6]?.type).toBe(TokenType.NUMBER);
    });
  });

  describe('comparison operators', () => {
    it('should tokenize > as GREATER', () => {
      const tokens = lex('>5');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.GREATER, value: '>', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '5', position: 1 });
    });

    it('should tokenize >= as GREATER_EQUAL (maximal munch)', () => {
      const tokens = lex('>=6');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.GREATER_EQUAL, value: '>=', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '6', position: 2 });
    });

    it('should tokenize < as LESS', () => {
      const tokens = lex('<2');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.LESS, value: '<', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 1 });
    });

    it('should tokenize <= as LESS_EQUAL (maximal munch)', () => {
      const tokens = lex('<=3');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.LESS_EQUAL, value: '<=', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 2 });
    });

    it('should tokenize = as EQUAL', () => {
      const tokens = lex('=1');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.EQUAL, value: '=', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 1 });
    });

    it('should not conflate > = (with space) as >=', () => {
      const tokens = lex('> =');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.GREATER, value: '>', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.EQUAL, value: '=', position: 2 });
    });
  });

  describe('explode operators', () => {
    it('should tokenize ! as EXPLODE', () => {
      const tokens = lex('!');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.EXPLODE, value: '!', position: 0 });
    });

    it('should tokenize !! as EXPLODE_COMPOUND (maximal munch)', () => {
      const tokens = lex('!!');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({
        type: TokenType.EXPLODE_COMPOUND,
        value: '!!',
        position: 0,
      });
    });

    it('should tokenize !p as EXPLODE_PENETRATING', () => {
      const tokens = lex('!p');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({
        type: TokenType.EXPLODE_PENETRATING,
        value: '!p',
        position: 0,
      });
    });

    it('should be case-insensitive for !P', () => {
      const tokens = lex('!P');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({
        type: TokenType.EXPLODE_PENETRATING,
        value: '!p',
        position: 0,
      });
    });

    it('should tokenize 1d6! as dice + explode', () => {
      const tokens = lex('1d6!');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.DICE);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
      expect(tokens[3]?.type).toBe(TokenType.EXPLODE);
    });

    it('should tokenize 1d6!>5 as dice + explode + comparison', () => {
      const tokens = lex('1d6!>5');

      expect(tokens).toHaveLength(7);
      expect(tokens[3]?.type).toBe(TokenType.EXPLODE);
      expect(tokens[4]?.type).toBe(TokenType.GREATER);
      expect(tokens[5]).toMatchObject({ type: TokenType.NUMBER, value: '5', position: 5 });
    });
  });

  describe('reroll tokens', () => {
    it('should tokenize r as REROLL', () => {
      const tokens = lex('r');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.REROLL, value: 'r', position: 0 });
    });

    it('should tokenize ro as REROLL_ONCE (maximal munch)', () => {
      const tokens = lex('ro');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.REROLL_ONCE, value: 'ro', position: 0 });
    });

    it('should tokenize r<2 as REROLL + LESS + NUMBER', () => {
      const tokens = lex('r<2');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.REROLL);
      expect(tokens[1]?.type).toBe(TokenType.LESS);
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 2 });
    });

    it('should tokenize ro>=3 as REROLL_ONCE + GREATER_EQUAL + NUMBER', () => {
      const tokens = lex('ro>=3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.REROLL_ONCE);
      expect(tokens[1]?.type).toBe(TokenType.GREATER_EQUAL);
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 4 });
    });
  });

  describe('percentile dice', () => {
    it('should tokenize d% as DICE_PERCENT', () => {
      const tokens = lex('d%');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE_PERCENT, value: 'd%', position: 0 });
    });

    it('should tokenize 2d% as NUMBER + DICE_PERCENT', () => {
      const tokens = lex('2d%');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE_PERCENT, value: 'd%', position: 1 });
    });

    it('should not confuse standalone % with d%', () => {
      const tokens = lex('10%3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.MODULO);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
    });
  });

  describe('fate dice', () => {
    it('should tokenize dF as DICE_FATE', () => {
      const tokens = lex('dF');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 0 });
    });

    it('should be case-insensitive for df', () => {
      const tokens = lex('df');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 0 });
    });

    it('should tokenize 4dF as NUMBER + DICE_FATE', () => {
      const tokens = lex('4dF');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 1 });
    });

    it('should not confuse dF with dh/dl', () => {
      expect(lex('dh')[0]?.type).toBe(TokenType.DROP_HIGH);
      expect(lex('dl')[0]?.type).toBe(TokenType.DROP_LOW);
      expect(lex('dF')[0]?.type).toBe(TokenType.DICE_FATE);
    });

    it('should tokenize 4dFkh2 without greedy identifier merge', () => {
      const tokens = lex('4dFkh2');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.KEEP_HIGH, value: 'kh', position: 3 });
      expect(tokens[3]).toMatchObject({ type: TokenType.NUMBER, value: '2', position: 5 });
    });

    it('should tokenize 4dFdl1 without greedy identifier merge', () => {
      const tokens = lex('4dFdl1');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.DICE_FATE);
      expect(tokens[2]?.type).toBe(TokenType.DROP_LOW);
      expect(tokens[3]?.type).toBe(TokenType.NUMBER);
    });

    it('should tokenize dFdF as two consecutive fate tokens', () => {
      const tokens = lex('dFdF');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE_FATE, value: 'df', position: 2 });
    });

    it('should tokenize dF+5 with trailing arithmetic', () => {
      const tokens = lex('dF+5');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.DICE_FATE);
      expect(tokens[1]?.type).toBe(TokenType.PLUS);
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
    });

    it('should tokenize 2dFd20 with a following dice expression', () => {
      const tokens = lex('2dFd20');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]?.type).toBe(TokenType.DICE_FATE);
      expect(tokens[2]?.type).toBe(TokenType.DICE);
      expect(tokens[3]?.type).toBe(TokenType.NUMBER);
    });
  });

  describe('fail token', () => {
    it('should tokenize f as FAIL', () => {
      const tokens = lex('f1');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toMatchObject({ type: TokenType.FAIL, value: 'f', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 1 });
    });
  });

  describe('function tokens', () => {
    it('should tokenize floor as FUNCTION', () => {
      const tokens = lex('floor');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.FUNCTION, value: 'floor', position: 0 });
    });

    it('should tokenize all math functions', () => {
      for (const name of ['floor', 'ceil', 'round', 'abs', 'sqrt', 'pow', 'max', 'min']) {
        const tokens = lex(name);
        expect(tokens[0]?.type).toBe(TokenType.FUNCTION);
        expect(tokens[0]?.value).toBe(name);
      }
    });

    it('should tokenize a postfix min bound as FUNCTION + NUMBER: 4d6min2', () => {
      // The parser decides modifier-vs-call by position; the lexer only
      // guarantees the digit stops the identifier munch.
      const tokens = lex('4d6min2');
      expect(tokens.map((token) => token.type)).toEqual([
        TokenType.NUMBER,
        TokenType.DICE,
        TokenType.NUMBER,
        TokenType.FUNCTION,
        TokenType.NUMBER,
        TokenType.EOF,
      ]);
      expect(tokens[3]?.value).toBe('min');
    });

    it('should be case-insensitive for functions', () => {
      expect(lex('FLOOR')[0]?.type).toBe(TokenType.FUNCTION);
      expect(lex('Floor')[0]?.type).toBe(TokenType.FUNCTION);
      expect(lex('CEIL')[0]?.type).toBe(TokenType.FUNCTION);
    });

    it('should resolve d-in-round: round is FUNCTION, not DICE', () => {
      const tokens = lex('round');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]?.type).toBe(TokenType.FUNCTION);
      expect(tokens[0]?.value).toBe('round');
    });

    it('should not confuse function names with dice/modifiers', () => {
      expect(lex('d')[0]?.type).toBe(TokenType.DICE);
      expect(lex('k')[0]?.type).toBe(TokenType.KEEP_HIGH);
      expect(lex('kh')[0]?.type).toBe(TokenType.KEEP_HIGH);
    });
  });

  describe('comma token', () => {
    it('should tokenize , as COMMA', () => {
      const tokens = lex('1,2');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]).toMatchObject({ type: TokenType.COMMA, value: ',', position: 1 });
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
    });
  });

  describe('vs token', () => {
    it('should tokenize vs as VS', () => {
      const tokens = lex('vs');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toMatchObject({ type: TokenType.VS, value: 'vs', position: 0 });
    });

    it('should be case-insensitive for VS', () => {
      expect(lex('VS')[0]?.type).toBe(TokenType.VS);
      expect(lex('Vs')[0]?.type).toBe(TokenType.VS);
    });

    it('should tokenize 1d20+10 vs 25', () => {
      const tokens = lex('1d20+10 vs 25');

      expect(tokens).toHaveLength(8);
      expect(tokens[5]).toMatchObject({ type: TokenType.VS, value: 'vs', position: 8 });
      expect(tokens[6]).toMatchObject({ type: TokenType.NUMBER, value: '25', position: 11 });
    });
  });

  describe('Stage 3 tokens', () => {
    describe('group braces', () => {
      it('should tokenize { as LBRACE', () => {
        const tokens = lex('{');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.LBRACE, value: '{', position: 0 });
        expect(tokens[1]?.type).toBe(TokenType.EOF);
      });

      it('should tokenize } as RBRACE', () => {
        const tokens = lex('}');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.RBRACE, value: '}', position: 0 });
      });

      it('should tokenize {1d20,2d6} with commas as separators', () => {
        const tokens = lex('{1d20,2d6}');

        expect(tokens).toHaveLength(10);
        expect(tokens[0]).toMatchObject({ type: TokenType.LBRACE, value: '{', position: 0 });
        expect(tokens[4]).toMatchObject({ type: TokenType.COMMA, value: ',', position: 5 });
        expect(tokens[8]).toMatchObject({ type: TokenType.RBRACE, value: '}', position: 9 });
      });
    });

    describe('sort modifiers', () => {
      it('should tokenize s as SORT_ASC', () => {
        const tokens = lex('s');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.SORT_ASC, value: 's', position: 0 });
      });

      it('should tokenize sa as SORT_ASC', () => {
        const tokens = lex('sa');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.SORT_ASC, value: 'sa', position: 0 });
      });

      it('should tokenize sd as SORT_DESC', () => {
        const tokens = lex('sd');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.SORT_DESC, value: 'sd', position: 0 });
      });

      it('should be case-insensitive for sort modifiers', () => {
        expect(lex('SA')[0]?.type).toBe(TokenType.SORT_ASC);
        expect(lex('Sd')[0]?.type).toBe(TokenType.SORT_DESC);
      });
    });

    describe('crit threshold modifiers', () => {
      it('should tokenize cs as CRIT_SUCCESS', () => {
        const tokens = lex('cs');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.CRIT_SUCCESS, value: 'cs', position: 0 });
      });

      it('should tokenize cf as CRIT_FAIL', () => {
        const tokens = lex('cf');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.CRIT_FAIL, value: 'cf', position: 0 });
      });

      it('should be case-insensitive for crit modifiers', () => {
        expect(lex('CS')[0]?.type).toBe(TokenType.CRIT_SUCCESS);
        expect(lex('Cf')[0]?.type).toBe(TokenType.CRIT_FAIL);
      });
    });

    describe('@ variable references', () => {
      it('should tokenize bare @name and preserve case', () => {
        const tokens = lex('@StrMod');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.AT, value: 'StrMod', position: 0 });
      });

      it('should allow digits and underscores after the first char', () => {
        const tokens = lex('@abilities_3');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.AT, value: 'abilities_3', position: 0 });
      });

      it('should allow an underscore-leading name', () => {
        const tokens = lex('@_hidden');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toMatchObject({ type: TokenType.AT, value: '_hidden', position: 0 });
      });

      it('should tokenize @{name with spaces and hyphens} preserving case', () => {
        const tokens = lex('@{Strength Modifier-1}');

        expect(tokens).toHaveLength(2);
        expect(tokens[0]).toEqual({
          type: TokenType.AT,
          value: 'Strength Modifier-1',
          position: 0,
          // `end` covers the whole `@{...}` span, not just the captured name.
          end: 22,
        });
      });

      it('should stop scanning at non-identifier chars in the bare form', () => {
        const tokens = lex('@foo+1');

        expect(tokens).toHaveLength(4);
        expect(tokens[0]).toMatchObject({ type: TokenType.AT, value: 'foo', position: 0 });
        expect(tokens[1]).toMatchObject({ type: TokenType.PLUS, value: '+', position: 4 });
        expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 5 });
      });

      it('should preserve case distinctly (@Foo vs @foo)', () => {
        expect(lex('@Foo')[0]?.value).toBe('Foo');
        expect(lex('@foo')[0]?.value).toBe('foo');
      });

      it('should throw LexerError for bare @ with no name', () => {
        expect(() => lex('@')).toThrow(LexerError);
      });

      it('should throw LexerError for bare @ followed by a digit', () => {
        expect(() => lex('@2')).toThrow(LexerError);
      });

      it('should throw LexerError for unterminated @{', () => {
        expect(() => lex('@{foo')).toThrow(LexerError);
      });

      it('should throw LexerError when @{ contains a newline before }', () => {
        expect(() => lex('@{foo\n}')).toThrow(LexerError);
      });

      it('should report position and character on @ errors', () => {
        const error = expectRollError(() => lex('1d20+@'), LexerError, 'UNEXPECTED_CHARACTER');

        expect(error.position).toBe(5);
        expect(error.character).toBe('@');
      });
    });
  });

  describe('edge cases', () => {
    it('should tokenize 0d6 (zero count dice)', () => {
      const tokens = lex('0d6');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '0', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '6', position: 2 });
    });

    it('should tokenize 1d1 (single-sided die)', () => {
      const tokens = lex('1d1');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 0 });
      expect(tokens[1]).toMatchObject({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toMatchObject({ type: TokenType.NUMBER, value: '1', position: 2 });
    });

    it('should throw for trailing dot (1.)', () => {
      expect(() => lex('1.')).toThrow(LexerError);
    });

    it('should handle leading zeros in numbers', () => {
      const tokens = lex('007d20');

      expect(tokens[0]).toMatchObject({ type: TokenType.NUMBER, value: '007', position: 0 });
    });
  });

  describe('token end offsets', () => {
    it('sets end to the exclusive offset after each token', () => {
      const tokens = lex('12d20kh3');

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '12', position: 0, end: 2 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 2, end: 3 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '20', position: 3, end: 5 });
      expect(tokens[3]).toEqual({ type: TokenType.KEEP_HIGH, value: 'kh', position: 5, end: 7 });
      expect(tokens[4]).toEqual({ type: TokenType.NUMBER, value: '3', position: 7, end: 8 });
      expect(tokens[5]).toEqual({ type: TokenType.EOF, value: '', position: 8, end: 8 });
    });

    it('covers consumed input where value differs from source', () => {
      // `dF` normalizes to 'df' and `@{..}` drops the braces from `value` — `end`
      // still spans every consumed character.
      expect(lex('4DF')[1]).toEqual({
        type: TokenType.DICE_FATE,
        value: 'df',
        position: 1,
        end: 3,
      });
      expect(lex('@{a b}')[0]).toEqual({ type: TokenType.AT, value: 'a b', position: 0, end: 6 });
      expect(lex('d%')[0]).toEqual({
        type: TokenType.DICE_PERCENT,
        value: 'd%',
        position: 0,
        end: 2,
      });
      expect(lex('1d6!p')[3]).toEqual({
        type: TokenType.EXPLODE_PENETRATING,
        value: '!p',
        position: 3,
        end: 5,
      });
    });
  });

  describe('error handling', () => {
    it('should throw LexerError for invalid characters', () => {
      expect(() => lex('2d20#')).toThrow(LexerError);
    });

    it('should include position in error', () => {
      const error = expectRollError(() => lex('2d20#'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.position).toBe(4);
      expect(error.character).toBe('#');
    });

    it('should throw for unexpected identifier', () => {
      expect(() => lex('2d20x')).toThrow(LexerError);
      expect(() => lex('xyz')).toThrow(LexerError);
    });

    it('should include identifier in error message', () => {
      const error = expectRollError(() => lex('abc'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.message).toContain('abc');
    });

    it('should report full code points for astral characters', () => {
      const error = expectRollError(() => lex('🎲d6'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.character).toBe('🎲');
      expect(error.message).toContain('🎲');
    });

    it('should hint at modifier splits for merged identifiers', () => {
      // `4d6khs` — maximal munch merges `kh` + `s` into one identifier.
      const error = expectRollError(() => lex('4d6khs'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.message).toContain(`did you mean 'kh' followed by 's'`);
      expect(error.message).toContain('kh1s');
    });

    it('should not hint for identifiers with no keyword prefix', () => {
      const error = expectRollError(() => lex('xyz'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.message).not.toContain('did you mean');
    });

    it('should hint at the sd/kh split for merged sort+keep identifiers', () => {
      // `4d6sdkh2` — maximal munch merges `sd` + `kh` into one identifier.
      const error = expectRollError(() => lex('4d6sdkh2'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.message).toContain(`did you mean 'sd' followed by 'kh'`);
      expect(error.message).toContain('sd kh');
      expect(error.position).toBe(3);
    });

    // `sd` takes no count, so a count-less first half splits on a space.
    it('should split a count-less modifier on a space, not a count (#326)', () => {
      const error = expectRollError(() => lex('4d6sasd'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.message).toContain(`did you mean 'sa' followed by 'sd'`);
      expect(error.message).toContain('sa sd');
      expect(error.message).not.toContain('sa1sd');
    });

    // The tail has to be a modifier in its own right. `kx` and `flor` merely
    // start with one, so any split of them is still unparsable.
    it('should not hint when the tail is not a modifier (#326)', () => {
      for (const notation of ['2d6kx1', 'flor(1.5)', '4d6khsasd']) {
        const error = expectRollError(() => lex(notation), LexerError, 'UNEXPECTED_IDENTIFIER');

        expect(error.message).not.toContain('did you mean');
      }
    });

    // Both keyword tables are keyed by arbitrary user input. Over a plain object
    // literal, `constructor` resolves up the prototype chain.
    it('should treat Object.prototype keys as unknown identifiers (#326)', () => {
      const error = expectRollError(() => lex('constructor'), LexerError, 'UNEXPECTED_IDENTIFIER');

      expect(error.character).toBe('constructor');
    });

    it('should not splat a prototype member into a split hint (#326)', () => {
      const error = expectRollError(
        () => lex('4d6constructorkh2'),
        LexerError,
        'UNEXPECTED_IDENTIFIER',
      );

      expect(error.message).not.toContain('native code');
      expect(error.message).not.toContain('did you mean');
    });
  });

  describe('unicode and whitespace boundaries', () => {
    // Characterization tests: only ASCII space, tab, CR and LF are whitespace —
    // anything else that looks blank or numeric to a human is an unexpected
    // character, reported at a code-point-accurate position.

    // Escaped rather than pasted — these render as nothing between the quotes,
    // which is the whole reason the code point has to be named.
    it('should name code points the message cannot render (#326)', () => {
      const cases: [string, string][] = [
        ['2d6\u00A0+3', 'U+00A0'],
        ['2d6\u200B+3', 'U+200B'],
        ['\uFEFF2d6', 'U+FEFF'],
        ['\uFF11\uFF44\uFF16', 'U+FF11'],
      ];

      for (const [notation, codePoint] of cases) {
        const error = expectRollError(() => lex(notation), LexerError, 'UNEXPECTED_CHARACTER');

        expect(error.message).toContain(codePoint);
      }
    });

    // Printable ASCII is legible between the quotes already; naming it there
    // would be noise on the overwhelmingly common case.
    it('should not name printable ASCII code points', () => {
      const error = expectRollError(() => lex('2d6+&'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.message).toBe(`Unexpected character: '&'`);
    });

    it('should reject a no-break space as an unexpected character', () => {
      const error = expectRollError(() => lex('2d6 +3'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.character).toBe(' ');
      expect(error.position).toBe(3);
    });

    it('should reject a zero-width space as an unexpected character', () => {
      const error = expectRollError(() => lex('2d6​+3'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.character).toBe('​');
      expect(error.position).toBe(3);
    });

    it('should reject a leading byte-order mark', () => {
      const error = expectRollError(() => lex('﻿2d6'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.character).toBe('﻿');
      expect(error.position).toBe(0);
    });

    it('should reject full-width digits', () => {
      const error = expectRollError(() => lex('１ｄ６'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.character).toBe('１');
      expect(error.position).toBe(0);
    });

    it('should skip CRLF like any other whitespace run', () => {
      const tokens = lex('2d6\r\n+3');

      expect(tokens).toHaveLength(6);
      expect(tokens[3]).toMatchObject({ type: TokenType.PLUS, value: '+', position: 5 });
      expect(tokens[4]).toMatchObject({ type: TokenType.NUMBER, value: '3', position: 6 });
    });

    it('should accept unicode inside braced variable names', () => {
      expect(lex('@{力}')[0]).toEqual({
        type: TokenType.AT,
        value: '力',
        position: 0,
        end: 4,
      });
    });

    it('should accept astral characters inside braced variable names', () => {
      // `🎲` spans two UTF-16 units, so `end` is 5 for a four-code-point source.
      expect(lex('@{🎲}')[0]).toEqual({
        type: TokenType.AT,
        value: '🎲',
        position: 0,
        end: 5,
      });
    });

    it('should reject a bare @ followed by a non-ASCII name', () => {
      // The bare form is `[A-Za-z_][A-Za-z0-9_]*`, so `@力` reads as an empty name
      // rather than a unicode identifier.
      const error = expectRollError(() => lex('@力'), LexerError, 'UNEXPECTED_CHARACTER');

      expect(error.message).toContain('must start with');
      expect(error.position).toBe(0);
    });

    // One check rejects a missing name and a wrongly-started one alike, so the
    // message has to hold for both.
    it('should say what a bare @ name must start with, not that it is empty (#326)', () => {
      for (const notation of ['@', '1d20+@', '@1', '@力']) {
        const error = expectRollError(() => lex(notation), LexerError, 'UNEXPECTED_CHARACTER');

        expect(error.message).not.toContain('Empty');
        expect(error.message).toContain(`must start with a letter or '_'`);
      }
    });

    // The `@` these carry is a span anchor, not the offending text, so quoting
    // it back reads as noise.
    it('should not echo the @ back on messages that name a rule (#327)', () => {
      for (const notation of ['@', '@1', '@{abc']) {
        const error = expectRollError(() => lex(notation), LexerError, 'UNEXPECTED_CHARACTER');

        expect(error.message).not.toContain(`: '@'`);
        expect(error.character).toBe('@');
      }
    });

    it('should still quote the offending text where it is the whole point (#327)', () => {
      const character = expectRollError(() => lex('2d6+&'), LexerError, 'UNEXPECTED_CHARACTER');
      expect(character.message).toBe(`Unexpected character: '&'`);

      const identifier = expectRollError(() => lex('1d6mi'), LexerError, 'UNEXPECTED_IDENTIFIER');
      expect(identifier.message).toBe(`Unexpected identifier: 'mi'`);
    });
  });

  describe('non-string input', () => {
    // The signature says `string`; the APIs feeding untrusted notation say `string | null`.
    const cases: [label: string, input: unknown, received: string][] = [
      ['null', null, 'null'],
      ['undefined', undefined, 'undefined'],
      ['a number', 42, '42'],
      ['a plain object', {}, 'object'],
      ['an array', ['1d6'], 'object'],
      ['a function', () => '1d6', 'function'],
      ['a String wrapper', new String('1d6'), 'object'],
    ];

    for (const [label, input, received] of cases) {
      it(`rejects ${label} with a typed error (#229)`, () => {
        const error = expectRollError(
          () => lex(input as string),
          RollParserError,
          'INVALID_NOTATION_TYPE',
        );

        expect(error.message).toBe(`Notation must be a string, received ${received}`);
        expect(isRollParserError(error)).toBe(true);
        expect(getErrorSpan(error)).toBeUndefined();
      });
    }

    it('rejects an object with a hostile toString (#229)', () => {
      const hostile = {
        toString() {
          throw new Error('nope');
        },
      };

      expectRollError(
        () => lex(hostile as unknown as string),
        RollParserError,
        'INVALID_NOTATION_TYPE',
      );
    });
  });

  describe('Lexer class', () => {
    it('should allow incremental tokenization', () => {
      const lexer = new Lexer('1+2');

      expect(lexer.nextToken().type).toBe(TokenType.NUMBER);
      expect(lexer.nextToken().type).toBe(TokenType.PLUS);
      expect(lexer.nextToken().type).toBe(TokenType.NUMBER);
      expect(lexer.nextToken().type).toBe(TokenType.EOF);
    });

    it('should return EOF repeatedly after end', () => {
      const lexer = new Lexer('1');

      lexer.nextToken(); // NUMBER
      expect(lexer.nextToken().type).toBe(TokenType.EOF);
      expect(lexer.nextToken().type).toBe(TokenType.EOF);
      expect(lexer.nextToken().type).toBe(TokenType.EOF);
    });
  });
});
