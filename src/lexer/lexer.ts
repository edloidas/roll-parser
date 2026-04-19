/**
 * Dice notation lexer with character-by-character scanning.
 *
 * @module lexer/lexer
 */

import type { RollParserErrorCode } from '../errors';
import { RollParserError } from '../errors';
import { type Token, TokenType } from './tokens';

/**
 * Error thrown when the lexer encounters an invalid character.
 */
export class LexerError extends RollParserError {
  readonly position: number;
  readonly character: string;

  constructor(message: string, code: RollParserErrorCode, position: number, character: string) {
    super(`${message} at position ${position}: '${character}'`, code);
    this.name = 'LexerError';
    this.position = position;
    this.character = character;
  }
}

/** Known identifier keywords mapped to their token types. */
const IDENTIFIER_KEYWORDS: Record<string, TokenType> = {
  kh: TokenType.KEEP_HIGH,
  kl: TokenType.KEEP_LOW,
  k: TokenType.KEEP_HIGH,
  dh: TokenType.DROP_HIGH,
  dl: TokenType.DROP_LOW,
  d: TokenType.DICE,
  r: TokenType.REROLL,
  ro: TokenType.REROLL_ONCE,
  f: TokenType.FAIL,
  vs: TokenType.VS,
  floor: TokenType.FUNCTION,
  ceil: TokenType.FUNCTION,
  round: TokenType.FUNCTION,
  abs: TokenType.FUNCTION,
  max: TokenType.FUNCTION,
  min: TokenType.FUNCTION,
};

/**
 * Lexer for dice notation.
 *
 * Produces a stream of tokens from an input string using character-by-character
 * scanning with maximal munch for multi-character tokens.
 */
export class Lexer {
  private pos = 0;
  private readonly input: string;

  constructor(input: string) {
    this.input = input;
  }

  /**
   * Tokenize the entire input and return all tokens.
   */
  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (true) {
      const token = this.nextToken();
      tokens.push(token);
      if (token.type === TokenType.EOF) break;
    }

    return tokens;
  }

  /**
   * Get the next token from the input.
   */
  nextToken(): Token {
    this.skipWhitespace();

    if (this.isAtEnd()) {
      return this.createToken(TokenType.EOF, '');
    }

    const startPos = this.pos;
    const char = this.peek();

    // * Numbers
    if (this.isDigit(char)) {
      return this.scanNumber();
    }

    // * Identifiers (d, kh, kl, dh, dl, r, ro, f, vs, floor, ceil, ...)
    if (this.isAlpha(char)) {
      return this.scanIdentifier();
    }

    // * Operators and punctuation
    this.advance();

    switch (char) {
      case '+':
        return this.createTokenAt(TokenType.PLUS, char, startPos);
      case '-':
        return this.createTokenAt(TokenType.MINUS, char, startPos);
      case '*':
        if (this.match('*')) {
          return this.createTokenAt(TokenType.POWER, '**', startPos);
        }
        return this.createTokenAt(TokenType.MULTIPLY, char, startPos);
      case '/':
        return this.createTokenAt(TokenType.DIVIDE, char, startPos);
      case '%':
        return this.createTokenAt(TokenType.MODULO, char, startPos);
      case '^':
        return this.createTokenAt(TokenType.POWER, char, startPos);
      case '(':
        return this.createTokenAt(TokenType.LPAREN, char, startPos);
      case ')':
        return this.createTokenAt(TokenType.RPAREN, char, startPos);
      case ',':
        return this.createTokenAt(TokenType.COMMA, char, startPos);
      case '>':
        if (this.match('=')) {
          return this.createTokenAt(TokenType.GREATER_EQUAL, '>=', startPos);
        }
        return this.createTokenAt(TokenType.GREATER, char, startPos);
      case '<':
        if (this.match('=')) {
          return this.createTokenAt(TokenType.LESS_EQUAL, '<=', startPos);
        }
        return this.createTokenAt(TokenType.LESS, char, startPos);
      case '=':
        return this.createTokenAt(TokenType.EQUAL, char, startPos);
      case '!':
        if (this.match('!')) {
          return this.createTokenAt(TokenType.EXPLODE_COMPOUND, '!!', startPos);
        }
        if (!this.isAtEnd() && this.peek().toLowerCase() === 'p') {
          this.advance();
          return this.createTokenAt(TokenType.EXPLODE_PENETRATING, '!p', startPos);
        }
        return this.createTokenAt(TokenType.EXPLODE, char, startPos);
      default:
        throw new LexerError('Unexpected character', 'UNEXPECTED_CHARACTER', startPos, char);
    }
  }

  // * Private helpers

  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  private scanNumber(): Token {
    const startPos = this.pos;
    let value = '';

    // Integer part
    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Decimal part
    if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
      value += this.advance(); // consume '.'
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    return this.createTokenAt(TokenType.NUMBER, value, startPos);
  }

  /**
   * Scans an identifier using full-accumulation: collects all consecutive
   * alpha characters, then classifies the result against known keywords.
   *
   * Special cases run before/after the accumulation loop:
   * - `dF` / `Df` / `dF` / `DF` produces DICE_FATE. Must be handled BEFORE
   *   the loop because `F` is alpha and would otherwise be greedily merged
   *   into identifiers like `dfkh` (from `4dFkh2`) or `dfdf` (from `dFdF`).
   *   Reserves the `d[fF]` prefix namespace for Fate dice.
   * - Bare `d` followed by `%` produces DICE_PERCENT. `%` is not alpha so the
   *   accumulation loop stops naturally and the post-loop check handles it.
   */
  private scanIdentifier(): Token {
    const startPos = this.pos;

    const first = this.peek();
    const second = this.peekNext();
    if ((first === 'd' || first === 'D') && (second === 'f' || second === 'F')) {
      this.advance();
      this.advance();
      return this.createTokenAt(TokenType.DICE_FATE, 'df', startPos);
    }

    let value = '';

    while (!this.isAtEnd() && this.isAlpha(this.peek())) {
      value += this.advance();
    }

    const lower = value.toLowerCase();

    if (lower === 'd' && !this.isAtEnd() && this.peek() === '%') {
      this.advance();
      return this.createTokenAt(TokenType.DICE_PERCENT, 'd%', startPos);
    }

    const tokenType = IDENTIFIER_KEYWORDS[lower];
    if (tokenType != null) {
      return this.createTokenAt(tokenType, lower, startPos);
    }

    throw new LexerError('Unexpected identifier', 'UNEXPECTED_IDENTIFIER', startPos, lower);
  }

  private peek(): string {
    return this.input[this.pos] ?? '';
  }

  private peekNext(): string {
    return this.input[this.pos + 1] ?? '';
  }

  private advance(): string {
    return this.input[this.pos++] ?? '';
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.input[this.pos] !== expected) return false;
    this.pos++;
    return true;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.input.length;
  }

  private isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
  }

  private isAlpha(char: string): boolean {
    const c = char.toLowerCase();
    return c >= 'a' && c <= 'z';
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }

  private createToken(type: TokenType, value: string): Token {
    return { type, value, position: this.pos };
  }

  private createTokenAt(type: TokenType, value: string, position: number): Token {
    return { type, value, position };
  }
}

/**
 * Tokenize a dice notation string.
 *
 * @param input - The dice notation to tokenize
 * @returns Array of tokens including EOF
 * @throws {LexerError} If an invalid character is encountered
 *
 * @example
 * ```typescript
 * const tokens = lex('2d20+5');
 * // [NUMBER(2), DICE, NUMBER(20), PLUS, NUMBER(5), EOF]
 * ```
 */
export function lex(input: string): Token[] {
  return new Lexer(input).tokenize();
}
