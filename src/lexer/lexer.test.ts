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
    });

    it('should include character in error message', () => {
      try {
        lex('abc');
      } catch (e) {
        expect(e).toBeInstanceOf(LexerError);
        expect((e as LexerError).message).toContain('a');
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
