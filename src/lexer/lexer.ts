/**
 * Dice notation lexer with character-by-character scanning.
 *
 * @module lexer/lexer
 */

import { type Token, TokenType } from './tokens';

/**
 * Error thrown when the lexer encounters an invalid character.
 */
export class LexerError extends Error {
  constructor(
    message: string,
    public readonly position: number,
    public readonly character: string,
  ) {
    super(`${message} at position ${position}: '${character}'`);
    this.name = 'LexerError';
  }
}

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

    // * Identifiers and modifiers (d, k, kh, kl, dh, dl)
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
      default:
        throw new LexerError('Unexpected character', startPos, char);
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

  private scanIdentifier(): Token {
    const startPos = this.pos;
    const char = this.advance().toLowerCase();

    // Check for two-character modifiers first (maximal munch)
    if (!this.isAtEnd()) {
      const nextChar = this.peek().toLowerCase();
      const twoChar = char + nextChar;

      if (twoChar === 'kh') {
        this.advance();
        return this.createTokenAt(TokenType.KEEP_HIGH, twoChar, startPos);
      }
      if (twoChar === 'kl') {
        this.advance();
        return this.createTokenAt(TokenType.KEEP_LOW, twoChar, startPos);
      }
      if (twoChar === 'dh') {
        this.advance();
        return this.createTokenAt(TokenType.DROP_HIGH, twoChar, startPos);
      }
      if (twoChar === 'dl') {
        this.advance();
        return this.createTokenAt(TokenType.DROP_LOW, twoChar, startPos);
      }
    }

    // Single character tokens
    if (char === 'd') {
      return this.createTokenAt(TokenType.DICE, char, startPos);
    }
    if (char === 'k') {
      // 'k' alone is shorthand for 'kh'
      return this.createTokenAt(TokenType.KEEP_HIGH, char, startPos);
    }

    throw new LexerError('Unexpected identifier', startPos, char);
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
