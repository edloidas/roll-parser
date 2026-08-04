/**
 * Dice notation lexer with character-by-character scanning.
 *
 * @module lexer/lexer
 */

import type { RollParserErrorCode } from '../errors.js';
import { describeValue, RollParserError } from '../errors.js';
import { type Token, TokenType } from './tokens.js';

/**
 * Error thrown when the lexer encounters an invalid character.
 *
 * `position` is a zero-based UTF-16 offset into the input. It is deliberately
 * absent from `message` — read it from the field, or uniformly across all
 * roll-parser errors via `getErrorSpan`.
 *
 * Codes: `UNEXPECTED_CHARACTER` for a character that cannot start any token,
 * `UNEXPECTED_IDENTIFIER` for a word that is not a known keyword.
 *
 * @example
 * ```typescript
 * import { LexerError, roll } from 'roll-parser';
 *
 * try {
 *   roll('2d6+&');
 * } catch (error) {
 *   const typed = error as LexerError;
 *   typed.code; // 'UNEXPECTED_CHARACTER'
 *   typed.character; // '&'
 *   typed.position; // 4
 * }
 * ```
 *
 * @category Errors
 */
export class LexerError extends RollParserError {
  /** Zero-based UTF-16 offset of the offending character in the input. */
  readonly position: number;
  /**
   * The offending text — a single character for `UNEXPECTED_CHARACTER` (the
   * whole code point, so astral symbols are not split into surrogates), or
   * the unrecognized word for `UNEXPECTED_IDENTIFIER`.
   */
  readonly character: string;

  constructor(
    message: string,
    code: RollParserErrorCode,
    position: number,
    character: string,
    options?: ErrorOptions,
  ) {
    super(`${message}: '${character}'`, code, options);
    this.name = 'LexerError';
    this.position = position;
    this.character = character;
  }
}

//
// * Character codes
//

// Range tests compare code units: `char.toLowerCase()` per character allocated
// a string on the lexer's hottest loop.
const CHAR_DIGIT_0 = 48;
const CHAR_DIGIT_9 = 57;
const CHAR_UPPER_A = 65;
const CHAR_UPPER_Z = 90;
const CHAR_LOWER_A = 97;
const CHAR_LOWER_Z = 122;

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
  s: TokenType.SORT_ASC,
  sa: TokenType.SORT_ASC,
  sd: TokenType.SORT_DESC,
  cs: TokenType.CRIT_SUCCESS,
  cf: TokenType.CRIT_FAIL,
};

/**
 * Builds a hint for identifiers that start with a known keyword. Maximal
 * munch merges adjacent modifiers when the first has no count — `4d6khs`
 * lexes as one identifier `khs` instead of `kh` + `s`. Point the user at the
 * explicit-count (or whitespace) split.
 */
function buildIdentifierHint(identifier: string): string {
  for (let length = identifier.length - 1; length >= 1; length--) {
    const prefix = identifier.slice(0, length);
    if (IDENTIFIER_KEYWORDS[prefix] == null) continue;
    const rest = identifier.slice(length);
    return ` (did you mean '${prefix}' followed by '${rest}'? separate modifiers with a count or space, e.g. '${prefix}1${rest}')`;
  }
  return '';
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

    if (this.isDigit(char)) {
      return this.scanNumber();
    }

    if (this.isAlpha(char)) {
      return this.scanIdentifier();
    }

    if (char === '@') {
      return this.scanAt();
    }

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
      case '{':
        return this.createTokenAt(TokenType.LBRACE, char, startPos);
      case '}':
        return this.createTokenAt(TokenType.RBRACE, char, startPos);
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
        if (this.match('p') || this.match('P')) {
          return this.createTokenAt(TokenType.EXPLODE_PENETRATING, '!p', startPos);
        }
        return this.createTokenAt(TokenType.EXPLODE, char, startPos);
      default: {
        // Surrogate pairs (emoji, astral symbols) span two code units —
        // report the full code point instead of a lone surrogate ('�').
        const codePoint = this.input.codePointAt(startPos);
        const display = codePoint == null ? char : String.fromCodePoint(codePoint);
        throw new LexerError('Unexpected character', 'UNEXPECTED_CHARACTER', startPos, display);
      }
    }
  }

  //
  // * Private helpers
  //

  private skipWhitespace(): void {
    while (!this.isAtEnd() && this.isWhitespace(this.peek())) {
      this.advance();
    }
  }

  // Scanners slice once from a recorded start offset rather than accumulating
  // `value += this.advance()` — one string per token instead of one per character.
  private scanNumber(): Token {
    const startPos = this.pos;

    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      this.pos++;
    }

    if (!this.isAtEnd() && this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.pos++;
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        this.pos++;
      }
    }

    return this.createTokenAt(TokenType.NUMBER, this.input.slice(startPos, this.pos), startPos);
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
      this.pos += 2;
      return this.createTokenAt(TokenType.DICE_FATE, 'df', startPos);
    }

    while (!this.isAtEnd() && this.isAlpha(this.peek())) {
      this.pos++;
    }

    const lower = this.input.slice(startPos, this.pos).toLowerCase();

    if (lower === 'd' && !this.isAtEnd() && this.peek() === '%') {
      this.advance();
      return this.createTokenAt(TokenType.DICE_PERCENT, 'd%', startPos);
    }

    const tokenType = IDENTIFIER_KEYWORDS[lower];
    if (tokenType != null) {
      return this.createTokenAt(tokenType, lower, startPos);
    }

    throw new LexerError(
      `Unexpected identifier${buildIdentifierHint(lower)}`,
      'UNEXPECTED_IDENTIFIER',
      startPos,
      lower,
    );
  }

  /**
   * Scans a variable reference introduced by `@`.
   *
   * Two forms:
   * - Bare: `@name` where `name` matches `[A-Za-z_][A-Za-z0-9_]*` (case preserved).
   * - Braced: `@{name}` where `name` is any run of printable characters except
   *   `}` and newline (permits spaces, hyphens, digits).
   *
   * Case is preserved — distinct from `scanIdentifier`, which lowercases the
   * captured value. The emitted token's `value` is the variable name without
   * the leading `@` or the surrounding braces.
   */
  private scanAt(): Token {
    const startPos = this.pos;
    this.advance();

    let name: string;
    if (!this.isAtEnd() && this.peek() === '{') {
      this.advance();
      const nameStart = this.pos;
      while (!this.isAtEnd() && this.peek() !== '}' && this.peek() !== '\n') {
        this.advance();
      }
      if (this.isAtEnd() || this.peek() !== '}') {
        throw new LexerError('Unterminated @{...} variable', 'UNEXPECTED_CHARACTER', startPos, '@');
      }
      name = this.input.slice(nameStart, this.pos);
      this.advance();
    } else {
      const nameStart = this.pos;
      if (this.isAtEnd() || !this.isIdentifierStart(this.peek())) {
        throw new LexerError('Empty @ variable name', 'UNEXPECTED_CHARACTER', startPos, '@');
      }
      this.advance();
      while (!this.isAtEnd() && this.isIdentifierPart(this.peek())) {
        this.advance();
      }
      name = this.input.slice(nameStart, this.pos);
    }

    return this.createTokenAt(TokenType.AT, name, startPos);
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

  // `NaN` from an empty `peek()` fails every comparison, so end-of-input
  // still reads as "not a digit / not alpha" without an extra guard.
  private isDigit(char: string): boolean {
    const code = char.charCodeAt(0);
    return code >= CHAR_DIGIT_0 && code <= CHAR_DIGIT_9;
  }

  private isAlpha(char: string): boolean {
    const code = char.charCodeAt(0);
    return (
      (code >= CHAR_LOWER_A && code <= CHAR_LOWER_Z) ||
      (code >= CHAR_UPPER_A && code <= CHAR_UPPER_Z)
    );
  }

  private isIdentifierStart(char: string): boolean {
    return this.isAlpha(char) || char === '_';
  }

  private isIdentifierPart(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char) || char === '_';
  }

  private isWhitespace(char: string): boolean {
    return char === ' ' || char === '\t' || char === '\n' || char === '\r';
  }

  // Both factories run after the token's characters were consumed, so
  // `this.pos` is the exclusive end offset.
  private createToken(type: TokenType, value: string): Token {
    return { type, value, position: this.pos, end: this.pos };
  }

  private createTokenAt(type: TokenType, value: string, position: number): Token {
    return { type, value, position, end: this.pos };
  }
}

/**
 * Tokenizes a dice notation string. The first stage of the pipeline —
 * {@link parse} calls it for you; reach for `lex` directly only to build a
 * syntax highlighter or an editor integration.
 *
 * Notation is case-insensitive and whitespace-tolerant: `2D20 + 5` and
 * `2d20+5` produce the same tokens, and identifier tokens carry a lowercased
 * `value`. The one exception is `@name`, whose case is preserved.
 *
 * @param input - The dice notation to tokenize
 * @returns Every token in source order, always ending with one
 *   `TokenType.EOF` token
 * @throws {LexerError} If an invalid character or unknown identifier is found
 * @throws {RollParserError} `INVALID_NOTATION_TYPE` when `input` is not a
 *   string — raised before scanning, so it carries no position
 *
 * @example
 * ```typescript
 * import { lex, TokenType } from 'roll-parser';
 *
 * const tokens = lex('2d20+5');
 * tokens.length; // 6 — NUMBER DICE NUMBER PLUS NUMBER EOF
 * tokens[0]; // { type: TokenType.NUMBER, value: '2', position: 0, end: 1 }
 * tokens[1].type === TokenType.DICE; // true
 * tokens.at(-1)?.type === TokenType.EOF; // true
 * ```
 *
 * @category Core
 */
export function lex(input: string): Token[] {
  // ! The pipeline's only notation type guard — `parse` and `roll` both funnel through here.
  if (typeof input !== 'string') {
    throw new RollParserError(
      `Notation must be a string, received ${describeValue(input)}`,
      'INVALID_NOTATION_TYPE',
    );
  }

  return new Lexer(input).tokenize();
}
