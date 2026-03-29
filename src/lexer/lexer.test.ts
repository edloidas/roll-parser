import { describe, expect, it } from 'bun:test';
import { Lexer, LexerError, lex } from './lexer';
import { TokenType } from './tokens';

describe('Lexer', () => {
  describe('basic tokens', () => {
    it('should tokenize a simple dice roll', () => {
      const tokens = lex('2d20+5');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '20', position: 2 });
      expect(tokens[3]).toEqual({ type: TokenType.PLUS, value: '+', position: 4 });
      expect(tokens[4]).toEqual({ type: TokenType.NUMBER, value: '5', position: 5 });
      expect(tokens[5]).toEqual({ type: TokenType.EOF, value: '', position: 6 });
    });

    it('should handle case insensitivity for dice operator', () => {
      const tokens = lex('D20');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.DICE, value: 'd', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '20', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.EOF, value: '', position: 3 });
    });

    it('should handle whitespace between tokens', () => {
      const tokens = lex('2 d 20');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 2 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '20', position: 4 });
      expect(tokens[3]).toEqual({ type: TokenType.EOF, value: '', position: 6 });
    });

    it('should return only EOF for empty string', () => {
      const tokens = lex('');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({ type: TokenType.EOF, value: '', position: 0 });
    });

    it('should return only EOF for whitespace-only string', () => {
      const tokens = lex('   \t\n  ');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({ type: TokenType.EOF, value: '', position: 7 });
    });
  });

  describe('numbers', () => {
    it('should tokenize integer numbers', () => {
      const tokens = lex('42');

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '42', position: 0 });
    });

    it('should tokenize decimal numbers', () => {
      const tokens = lex('1.5');

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '1.5', position: 0 });
    });

    it('should throw for trailing dot not followed by digit', () => {
      // '1.' followed by something that is not a digit should error
      expect(() => lex('1.+2')).toThrow(LexerError);
    });

    it('should tokenize multi-digit numbers', () => {
      const tokens = lex('100d20');

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '100', position: 0 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '20', position: 4 });
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
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.POWER, value: '**', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '3', position: 3 });
    });

    it('should tokenize ^ as power operator', () => {
      const tokens = lex('2^3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.POWER, value: '^', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '3', position: 2 });
    });

    it('should tokenize parentheses', () => {
      const tokens = lex('(1+2)');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toEqual({ type: TokenType.LPAREN, value: '(', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '1', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.PLUS, value: '+', position: 2 });
      expect(tokens[3]).toEqual({ type: TokenType.NUMBER, value: '2', position: 3 });
      expect(tokens[4]).toEqual({ type: TokenType.RPAREN, value: ')', position: 4 });
    });
  });

  describe('keep/drop modifiers', () => {
    it('should tokenize kh as KEEP_HIGH (maximal munch)', () => {
      const tokens = lex('kh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.KEEP_HIGH, value: 'kh', position: 0 });
    });

    it('should tokenize kl as KEEP_LOW', () => {
      const tokens = lex('kl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.KEEP_LOW, value: 'kl', position: 0 });
    });

    it('should tokenize k alone as KEEP_HIGH (shorthand)', () => {
      const tokens = lex('k3');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.KEEP_HIGH, value: 'k', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '3', position: 1 });
    });

    it('should tokenize dh as DROP_HIGH (maximal munch)', () => {
      const tokens = lex('dh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DROP_HIGH, value: 'dh', position: 0 });
    });

    it('should tokenize dl as DROP_LOW', () => {
      const tokens = lex('dl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DROP_LOW, value: 'dl', position: 0 });
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
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '6', position: 2 });
      expect(tokens[3]).toEqual({ type: TokenType.KEEP_HIGH, value: 'kh', position: 3 });
      expect(tokens[4]).toEqual({ type: TokenType.NUMBER, value: '3', position: 5 });
    });

    it('should tokenize 4d6dl1 correctly', () => {
      const tokens = lex('4d6dl1');

      expect(tokens).toHaveLength(6);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '6', position: 2 });
      expect(tokens[3]).toEqual({ type: TokenType.DROP_LOW, value: 'dl', position: 3 });
      expect(tokens[4]).toEqual({ type: TokenType.NUMBER, value: '1', position: 5 });
    });
  });

  describe('disambiguation', () => {
    it('should distinguish d followed by digit as DICE', () => {
      const tokens = lex('d6');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.DICE, value: 'd', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '6', position: 1 });
    });

    it('should distinguish dh as DROP_HIGH not DICE', () => {
      const tokens = lex('dh');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DROP_HIGH, value: 'dh', position: 0 });
    });

    it('should distinguish dl as DROP_LOW not DICE', () => {
      const tokens = lex('dl');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DROP_LOW, value: 'dl', position: 0 });
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
      expect(tokens[0]).toEqual({ type: TokenType.GREATER, value: '>', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '5', position: 1 });
    });

    it('should tokenize >= as GREATER_EQUAL (maximal munch)', () => {
      const tokens = lex('>=6');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.GREATER_EQUAL, value: '>=', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '6', position: 2 });
    });

    it('should tokenize < as LESS', () => {
      const tokens = lex('<2');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.LESS, value: '<', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '2', position: 1 });
    });

    it('should tokenize <= as LESS_EQUAL (maximal munch)', () => {
      const tokens = lex('<=3');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.LESS_EQUAL, value: '<=', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '3', position: 2 });
    });

    it('should tokenize = as EQUAL', () => {
      const tokens = lex('=1');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.EQUAL, value: '=', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '1', position: 1 });
    });

    it('should not conflate > = (with space) as >=', () => {
      const tokens = lex('> =');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.GREATER, value: '>', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.EQUAL, value: '=', position: 2 });
    });
  });

  describe('explode operators', () => {
    it('should tokenize ! as EXPLODE', () => {
      const tokens = lex('!');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.EXPLODE, value: '!', position: 0 });
    });

    it('should tokenize !! as EXPLODE_COMPOUND (maximal munch)', () => {
      const tokens = lex('!!');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.EXPLODE_COMPOUND, value: '!!', position: 0 });
    });

    it('should tokenize !p as EXPLODE_PENETRATING', () => {
      const tokens = lex('!p');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.EXPLODE_PENETRATING, value: '!p', position: 0 });
    });

    it('should be case-insensitive for !P', () => {
      const tokens = lex('!P');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.EXPLODE_PENETRATING, value: '!p', position: 0 });
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
      expect(tokens[5]).toEqual({ type: TokenType.NUMBER, value: '5', position: 5 });
    });
  });

  describe('reroll tokens', () => {
    it('should tokenize r as REROLL', () => {
      const tokens = lex('r');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.REROLL, value: 'r', position: 0 });
    });

    it('should tokenize ro as REROLL_ONCE (maximal munch)', () => {
      const tokens = lex('ro');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.REROLL_ONCE, value: 'ro', position: 0 });
    });

    it('should tokenize r<2 as REROLL + LESS + NUMBER', () => {
      const tokens = lex('r<2');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.REROLL);
      expect(tokens[1]?.type).toBe(TokenType.LESS);
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '2', position: 2 });
    });

    it('should tokenize ro>=3 as REROLL_ONCE + GREATER_EQUAL + NUMBER', () => {
      const tokens = lex('ro>=3');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.REROLL_ONCE);
      expect(tokens[1]?.type).toBe(TokenType.GREATER_EQUAL);
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '3', position: 4 });
    });
  });

  describe('percentile dice', () => {
    it('should tokenize d% as DICE_PERCENT', () => {
      const tokens = lex('d%');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DICE_PERCENT, value: 'd%', position: 0 });
    });

    it('should tokenize 2d% as NUMBER + DICE_PERCENT', () => {
      const tokens = lex('2d%');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '2', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE_PERCENT, value: 'd%', position: 1 });
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
      expect(tokens[0]).toEqual({ type: TokenType.DICE_FATE, value: 'df', position: 0 });
    });

    it('should be case-insensitive for df', () => {
      const tokens = lex('df');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.DICE_FATE, value: 'df', position: 0 });
    });

    it('should tokenize 4dF as NUMBER + DICE_FATE', () => {
      const tokens = lex('4dF');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '4', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE_FATE, value: 'df', position: 1 });
    });

    it('should not confuse dF with dh/dl', () => {
      expect(lex('dh')[0]?.type).toBe(TokenType.DROP_HIGH);
      expect(lex('dl')[0]?.type).toBe(TokenType.DROP_LOW);
      expect(lex('dF')[0]?.type).toBe(TokenType.DICE_FATE);
    });
  });

  describe('fail token', () => {
    it('should tokenize f as FAIL', () => {
      const tokens = lex('f1');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({ type: TokenType.FAIL, value: 'f', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.NUMBER, value: '1', position: 1 });
    });
  });

  describe('function tokens', () => {
    it('should tokenize floor as FUNCTION', () => {
      const tokens = lex('floor');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.FUNCTION, value: 'floor', position: 0 });
    });

    it('should tokenize all math functions', () => {
      for (const name of ['floor', 'ceil', 'round', 'abs', 'max', 'min']) {
        const tokens = lex(name);
        expect(tokens[0]?.type).toBe(TokenType.FUNCTION);
        expect(tokens[0]?.value).toBe(name);
      }
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
      // 'd' alone is still DICE
      expect(lex('d')[0]?.type).toBe(TokenType.DICE);
      // 'k' alone is still KEEP_HIGH
      expect(lex('k')[0]?.type).toBe(TokenType.KEEP_HIGH);
      // 'kh' is still KEEP_HIGH
      expect(lex('kh')[0]?.type).toBe(TokenType.KEEP_HIGH);
    });
  });

  describe('comma token', () => {
    it('should tokenize , as COMMA', () => {
      const tokens = lex('1,2');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]?.type).toBe(TokenType.NUMBER);
      expect(tokens[1]).toEqual({ type: TokenType.COMMA, value: ',', position: 1 });
      expect(tokens[2]?.type).toBe(TokenType.NUMBER);
    });
  });

  describe('vs token', () => {
    it('should tokenize vs as VS', () => {
      const tokens = lex('vs');

      expect(tokens).toHaveLength(2);
      expect(tokens[0]).toEqual({ type: TokenType.VS, value: 'vs', position: 0 });
    });

    it('should be case-insensitive for VS', () => {
      expect(lex('VS')[0]?.type).toBe(TokenType.VS);
      expect(lex('Vs')[0]?.type).toBe(TokenType.VS);
    });

    it('should tokenize 1d20+10 vs 25', () => {
      const tokens = lex('1d20+10 vs 25');

      expect(tokens).toHaveLength(8);
      expect(tokens[5]).toEqual({ type: TokenType.VS, value: 'vs', position: 8 });
      expect(tokens[6]).toEqual({ type: TokenType.NUMBER, value: '25', position: 11 });
    });
  });

  describe('edge cases', () => {
    it('should tokenize 0d6 (zero count dice)', () => {
      const tokens = lex('0d6');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '0', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '6', position: 2 });
    });

    it('should tokenize 1d1 (single-sided die)', () => {
      const tokens = lex('1d1');

      expect(tokens).toHaveLength(4);
      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '1', position: 0 });
      expect(tokens[1]).toEqual({ type: TokenType.DICE, value: 'd', position: 1 });
      expect(tokens[2]).toEqual({ type: TokenType.NUMBER, value: '1', position: 2 });
    });

    it('should throw for trailing dot (1.)', () => {
      expect(() => lex('1.')).toThrow(LexerError);
    });

    it('should handle leading zeros in numbers', () => {
      const tokens = lex('007d20');

      expect(tokens[0]).toEqual({ type: TokenType.NUMBER, value: '007', position: 0 });
    });
  });

  describe('error handling', () => {
    it('should throw LexerError for invalid characters', () => {
      expect(() => lex('2d20@')).toThrow(LexerError);
    });

    it('should include position in error', () => {
      try {
        lex('2d20@');
      } catch (e) {
        expect(e).toBeInstanceOf(LexerError);
        expect((e as LexerError).position).toBe(4);
        expect((e as LexerError).character).toBe('@');
      }
    });

    it('should throw for unexpected identifier', () => {
      expect(() => lex('2d20x')).toThrow(LexerError);
      expect(() => lex('xyz')).toThrow(LexerError);
    });

    it('should include identifier in error message', () => {
      try {
        lex('abc');
      } catch (e) {
        expect(e).toBeInstanceOf(LexerError);
        expect((e as LexerError).message).toContain('abc');
      }
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
