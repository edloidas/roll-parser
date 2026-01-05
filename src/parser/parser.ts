/**
 * Pratt parser for dice notation.
 *
 * @module parser/parser
 */

import { lex } from '../lexer/lexer';
import { type Token, TokenType } from '../lexer/tokens';
import type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  LiteralNode,
  ModifierNode,
  UnaryOpNode,
} from './ast';

/**
 * Error thrown when the parser encounters invalid syntax.
 */
export class ParseError extends Error {
  constructor(
    message: string,
    public readonly position: number,
    public readonly token?: Token,
  ) {
    super(`${message} at position ${position}`);
    this.name = 'ParseError';
  }
}

/**
 * Binding power constants for operators.
 * Higher values bind tighter. Right < Left for right-associativity.
 *
 * Precedence order (lowest to highest):
 * - Addition/subtraction: 10
 * - Multiplication/division/modulo: 20
 * - Unary minus: 25 (binds to complete dice expr: -1d4 = -(1d4))
 * - Power: 30-31
 * - Modifiers (postfix): 35 (must be < DICE_RIGHT to bind to complete dice expr)
 * - Dice: 40-41
 */
const BP = {
  // Addition/subtraction (left-associative)
  ADD_LEFT: 10,
  ADD_RIGHT: 11,
  // Multiplication/division/modulo (left-associative)
  MUL_LEFT: 20,
  MUL_RIGHT: 21,
  // Unary minus: between mul and power so -1d4 = -(1d4) not (-1)d4
  UNARY: 25,
  // Power (right-associative: left > right)
  POW_LEFT: 31,
  POW_RIGHT: 30,
  // Postfix modifiers: must be < DICE_RIGHT so they bind to complete dice expr
  MODIFIER: 35,
  // Dice operator (highest math precedence)
  DICE_LEFT: 40,
  DICE_RIGHT: 41,
} as const;

/**
 * Pratt parser for dice notation.
 *
 * Uses binding power (precedence) to handle operator associativity and
 * precedence without left recursion issues.
 */
export class Parser {
  private readonly tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Parse the token stream into an AST.
   */
  parse(): ASTNode {
    if (this.peek().type === TokenType.EOF) {
      throw new ParseError('Unexpected end of input', this.peek().position);
    }

    const ast = this.parseExpression(0);

    // Ensure we consumed all tokens
    if (this.peek().type !== TokenType.EOF) {
      const token = this.peek();
      throw new ParseError(`Unexpected token '${token.value}'`, token.position, token);
    }

    return ast;
  }

  /**
   * Parse an expression with minimum binding power.
   */
  private parseExpression(minBp: number): ASTNode {
    let left = this.parseNud();

    while (this.hasTokens()) {
      const token = this.peek();
      const leftBp = this.getLeftBp(token);

      if (leftBp < minBp) break;

      this.advance();
      left = this.parseLed(left, token);
    }

    return left;
  }

  /**
   * NUD - Null Denotation.
   * Handles tokens that appear at the start of an expression (prefix position).
   */
  private parseNud(): ASTNode {
    const token = this.advance();

    switch (token.type) {
      case TokenType.NUMBER:
        return this.parseLiteral(token);

      case TokenType.MINUS:
        return this.parseUnaryMinus();

      case TokenType.DICE:
        return this.parsePrefixDice();

      case TokenType.LPAREN:
        return this.parseGrouped();

      case TokenType.EOF:
        throw new ParseError('Unexpected end of input', token.position);

      default:
        throw new ParseError(`Unexpected token '${token.value}'`, token.position, token);
    }
  }

  /**
   * LED - Left Denotation.
   * Handles tokens that appear between expressions (infix/postfix position).
   */
  private parseLed(left: ASTNode, token: Token): ASTNode {
    switch (token.type) {
      case TokenType.DICE:
        return this.parseInfixDice(left);

      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
      case TokenType.MODULO:
      case TokenType.POWER:
        return this.parseBinaryOp(left, token);

      case TokenType.KEEP_HIGH:
      case TokenType.KEEP_LOW:
      case TokenType.DROP_HIGH:
      case TokenType.DROP_LOW:
        return this.parseModifier(left, token);

      default:
        throw new ParseError(`Unexpected infix token '${token.value}'`, token.position, token);
    }
  }

  // * Node parsers

  private parseLiteral(token: Token): LiteralNode {
    return {
      type: 'Literal',
      value: Number.parseFloat(token.value),
    };
  }

  private parseUnaryMinus(): UnaryOpNode {
    const operand = this.parseExpression(BP.UNARY);
    return {
      type: 'UnaryOp',
      operator: '-',
      operand,
    };
  }

  private parsePrefixDice(): DiceNode {
    // d20 → Dice(1, 20)
    const sides = this.parseExpression(BP.DICE_RIGHT);
    return {
      type: 'Dice',
      count: { type: 'Literal', value: 1 },
      sides,
    };
  }

  private parseInfixDice(left: ASTNode): DiceNode {
    // 4d6 → Dice(4, 6)
    const sides = this.parseExpression(BP.DICE_RIGHT);
    return {
      type: 'Dice',
      count: left,
      sides,
    };
  }

  private parseGrouped(): ASTNode {
    const expr = this.parseExpression(0);
    this.expect(TokenType.RPAREN);
    return expr;
  }

  private parseBinaryOp(left: ASTNode, token: Token): BinaryOpNode {
    const operator = this.getOperatorSymbol(token);
    const rightBp = this.getRightBp(token);
    const right = this.parseExpression(rightBp);

    return {
      type: 'BinaryOp',
      operator,
      left,
      right,
    };
  }

  private parseModifier(target: ASTNode, token: Token): ModifierNode {
    const modifier =
      token.type === TokenType.KEEP_HIGH || token.type === TokenType.KEEP_LOW ? 'keep' : 'drop';

    const selector =
      token.type === TokenType.KEEP_HIGH || token.type === TokenType.DROP_HIGH
        ? 'highest'
        : 'lowest';

    // Count is required after modifier (number or parenthesized expression)
    const nextToken = this.peek().type;
    if (nextToken !== TokenType.NUMBER && nextToken !== TokenType.LPAREN) {
      throw new ParseError(
        `Expected number or expression after '${token.value}' modifier`,
        this.peek().position,
        this.peek(),
      );
    }

    // Use DICE_LEFT to prevent modifiers from appearing in count position (e.g., 4d6kh1kh3)
    // This allows computed counts like 4d6kh(1+2) but prevents nested modifiers
    const count = this.parseExpression(BP.DICE_LEFT);

    return {
      type: 'Modifier',
      modifier,
      selector,
      count,
      target,
    };
  }

  // * Helpers

  private getOperatorSymbol(token: Token): '+' | '-' | '*' | '/' | '%' | '**' {
    switch (token.type) {
      case TokenType.PLUS:
        return '+';
      case TokenType.MINUS:
        return '-';
      case TokenType.MULTIPLY:
        return '*';
      case TokenType.DIVIDE:
        return '/';
      case TokenType.MODULO:
        return '%';
      case TokenType.POWER:
        return '**';
      default:
        throw new ParseError(`Unknown operator '${token.value}'`, token.position, token);
    }
  }

  private getLeftBp(token: Token): number {
    switch (token.type) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        return BP.ADD_LEFT;
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
      case TokenType.MODULO:
        return BP.MUL_LEFT;
      case TokenType.POWER:
        return BP.POW_LEFT;
      case TokenType.DICE:
        return BP.DICE_LEFT;
      case TokenType.KEEP_HIGH:
      case TokenType.KEEP_LOW:
      case TokenType.DROP_HIGH:
      case TokenType.DROP_LOW:
        return BP.MODIFIER;
      case TokenType.RPAREN:
      case TokenType.EOF:
        // Terminators have negative BP to always break the expression loop
        return -1;
      default:
        return 0;
    }
  }

  private getRightBp(token: Token): number {
    switch (token.type) {
      case TokenType.PLUS:
      case TokenType.MINUS:
        return BP.ADD_RIGHT;
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
      case TokenType.MODULO:
        return BP.MUL_RIGHT;
      case TokenType.POWER:
        return BP.POW_RIGHT;
      case TokenType.DICE:
        return BP.DICE_RIGHT;
      default:
        return 0;
    }
  }

  private peek(): Token {
    return this.tokens[this.pos] ?? { type: TokenType.EOF, value: '', position: this.pos };
  }

  private advance(): Token {
    const token = this.peek();
    this.pos++;
    return token;
  }

  private expect(type: TokenType): Token {
    const token = this.peek();
    if (token.type !== type) {
      const expected = TokenType[type];
      throw new ParseError(`Expected ${expected} but got '${token.value}'`, token.position, token);
    }
    return this.advance();
  }

  private hasTokens(): boolean {
    return this.peek().type !== TokenType.EOF;
  }
}

/**
 * Parse a dice notation string into an AST.
 *
 * @param notation - The dice notation to parse
 * @returns The root AST node
 * @throws {LexerError} If the input contains invalid characters
 * @throws {ParseError} If the input has invalid syntax
 *
 * @example
 * ```typescript
 * const ast = parse('2d6+3');
 * // { type: 'BinaryOp', operator: '+',
 * //   left: { type: 'Dice', count: 2, sides: 6 },
 * //   right: { type: 'Literal', value: 3 } }
 * ```
 */
export function parse(notation: string): ASTNode {
  const tokens = lex(notation);
  const parser = new Parser(tokens);
  return parser.parse();
}
