/**
 * Token type definitions for the dice notation lexer.
 *
 * @module lexer/tokens
 */

/**
 * Token types for Stage 1 dice notation.
 *
 * Using numeric enum values for efficient comparisons and switch statements.
 */
export enum TokenType {
  /** Numeric literal: integer or decimal */
  NUMBER = 0,
  /** Dice operator: 'd' or 'D' */
  DICE = 1,
  /** Addition operator: '+' */
  PLUS = 2,
  /** Subtraction operator: '-' */
  MINUS = 3,
  /** Multiplication operator: '*' */
  MULTIPLY = 4,
  /** Division operator: '/' */
  DIVIDE = 5,
  /** Modulo operator: '%' */
  MODULO = 6,
  /** Power operator: '**' or '^' */
  POWER = 7,
  /** Left parenthesis: '(' */
  LPAREN = 8,
  /** Right parenthesis: ')' */
  RPAREN = 9,
  /** Keep highest modifier: 'kh' or 'k' */
  KEEP_HIGH = 10,
  /** Keep lowest modifier: 'kl' */
  KEEP_LOW = 11,
  /** Drop highest modifier: 'dh' */
  DROP_HIGH = 12,
  /** Drop lowest modifier: 'dl' */
  DROP_LOW = 13,
  /** End of input marker */
  EOF = 14,
}

/**
 * A token produced by the lexer.
 */
export type Token = {
  /** The type of this token */
  type: TokenType;
  /** The raw string value from input */
  value: string;
  /** Zero-based position in the input string */
  position: number;
};
