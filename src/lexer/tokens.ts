/**
 * Token type definitions for the dice notation lexer.
 *
 * @module lexer/tokens
 */

/**
 * Token types for dice notation.
 *
 * Grouped semantically. Numeric values are stable identifiers — the specific
 * numbers don't matter, but they must be unique.
 *
 * @category AST
 */
export enum TokenType {
  //
  // * Literals
  //

  /** Numeric literal: integer or decimal */
  NUMBER = 0,

  //
  // * Dice operators
  //

  /** Dice operator: 'd' or 'D' */
  DICE = 1,
  /** Percentile dice operator: 'd%' (alias for d100) */
  DICE_PERCENT = 2,
  /** Fate/Fudge dice operator: 'dF' */
  DICE_FATE = 3,

  //
  // * Arithmetic operators
  //

  /** Addition operator: '+' */
  PLUS = 4,
  /** Subtraction operator: '-' */
  MINUS = 5,
  /** Multiplication operator: '*' */
  MULTIPLY = 6,
  /** Division operator: '/' */
  DIVIDE = 7,
  /** Modulo operator: '%' */
  MODULO = 8,
  /** Power operator: '**' or '^' */
  POWER = 9,

  //
  // * Comparison operators
  //

  /** Greater than: '>' */
  GREATER = 10,
  /** Greater than or equal: '>=' */
  GREATER_EQUAL = 11,
  /** Less than: '<' */
  LESS = 12,
  /** Less than or equal: '<=' */
  LESS_EQUAL = 13,
  /** Equal: '=' */
  EQUAL = 14,

  //
  // * Grouping and punctuation
  //

  /** Left parenthesis: '(' */
  LPAREN = 15,
  /** Right parenthesis: ')' */
  RPAREN = 16,
  /** Argument separator: ',' */
  COMMA = 17,

  //
  // * Keep/drop modifiers
  //

  /** Keep highest modifier: 'kh' or 'k' */
  KEEP_HIGH = 18,
  /** Keep lowest modifier: 'kl' */
  KEEP_LOW = 19,
  /** Drop highest modifier: 'dh' */
  DROP_HIGH = 20,
  /** Drop lowest modifier: 'dl' */
  DROP_LOW = 21,

  //
  // * Explode modifiers
  //

  /** Standard explode: '!' */
  EXPLODE = 22,
  /** Compounding explode: '!!' */
  EXPLODE_COMPOUND = 23,
  /** Penetrating explode: '!p' */
  EXPLODE_PENETRATING = 24,

  //
  // * Reroll modifiers
  //

  /** Recursive reroll: 'r' */
  REROLL = 25,
  /** Reroll once: 'ro' */
  REROLL_ONCE = 26,

  //
  // * Success counting
  //

  /** Fail marker: 'f' */
  FAIL = 27,

  //
  // * Functions
  //

  /**
   * Math function: 'floor', 'ceil', 'round', 'abs', 'sqrt', 'pow', 'max',
   * 'min'. In postfix position, 'min'/'max' double as per-die clamp
   * modifiers (`4d6min2`) — the parser decides by position, not the lexer.
   */
  FUNCTION = 28,

  //
  // * Keywords
  //

  /** Versus operator: 'vs' */
  VS = 29,

  //
  // * Group boundaries
  //

  /** Left brace: '{' */
  LBRACE = 30,
  /** Right brace: '}' */
  RBRACE = 31,

  //
  // * Variables
  //

  /** Variable reference prefix: '@' */
  AT = 32,

  //
  // * Sort modifiers
  //

  /** Ascending sort: 's' or 'sa' */
  SORT_ASC = 33,
  /** Descending sort: 'sd' */
  SORT_DESC = 34,

  //
  // * Crit thresholds
  //

  /** Critical success threshold: 'cs' */
  CRIT_SUCCESS = 35,
  /** Critical failure threshold: 'cf' */
  CRIT_FAIL = 36,

  //
  // * End of input
  //

  /** End of input marker */
  EOF = 37,
}

/**
 * A token produced by {@link lex}: what it is, the text it came from, and
 * where in the input that text sits.
 *
 * `position`/`end` are a half-open range, so `input.slice(position, end)`
 * recovers the original source text — useful for syntax highlighting, where
 * `value` alone is lossy.
 *
 * @example
 * ```typescript
 * import { lex, TokenType } from 'roll-parser';
 *
 * const input = '4D6KH3';
 * const tokens = lex(input);
 * tokens[1]; // { type: TokenType.DICE, value: 'd', position: 1, end: 2 }
 * tokens[3].type === TokenType.KEEP_HIGH; // true
 * input.slice(tokens[3].position, tokens[3].end); // 'KH' — original casing
 * tokens[3].value; // 'kh' — normalized
 * ```
 *
 * @category AST
 */
export type Token = {
  /** The type of this token */
  readonly type: TokenType;
  /** The raw string value from input (lowercased for identifiers) */
  readonly value: string;
  /** Zero-based start offset in the input string (UTF-16 code units) */
  readonly position: number;
  /**
   * Zero-based end offset (exclusive). Not always `position + value.length` —
   * braced variables (`@{name}` stores only `name`) and case-normalized
   * identifiers consume more input than their `value` retains.
   */
  readonly end: number;
};
