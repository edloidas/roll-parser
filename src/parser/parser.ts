/**
 * Pratt parser for dice notation.
 *
 * @module parser/parser
 */

import type { RollParserErrorCode } from '../errors';
import { RollParserError } from '../errors';
import { lex } from '../lexer/lexer';
import { type Token, TokenType } from '../lexer/tokens';
import type { CompareOp, ComparePoint } from '../types';
import type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  ExplodeNode,
  FateDiceNode,
  LiteralNode,
  ModifierNode,
  RerollNode,
  UnaryOpNode,
} from './ast';

/**
 * Error thrown when the parser encounters invalid syntax.
 */
export class ParseError extends RollParserError {
  readonly position: number;
  readonly token: Token | undefined;

  constructor(message: string, code: RollParserErrorCode, position: number, token?: Token) {
    super(`${message} at position ${position}`, code);
    this.name = 'ParseError';
    this.position = position;
    this.token = token ?? undefined;
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
      throw new ParseError('Unexpected end of input', 'UNEXPECTED_END', this.peek().position);
    }

    const ast = this.parseExpression(0);

    // Ensure we consumed all tokens
    if (this.peek().type !== TokenType.EOF) {
      const token = this.peek();
      throw new ParseError(
        `Unexpected token '${token.value}'`,
        'UNEXPECTED_TOKEN',
        token.position,
        token,
      );
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

      case TokenType.DICE_PERCENT:
        return this.parsePrefixDicePercent();

      case TokenType.DICE_FATE:
        return this.parsePrefixFateDice();

      case TokenType.LPAREN:
        return this.parseGrouped();

      case TokenType.EOF:
        throw new ParseError('Unexpected end of input', 'UNEXPECTED_END', token.position);

      default:
        throw new ParseError(
          `Unexpected token '${token.value}'`,
          'UNEXPECTED_TOKEN',
          token.position,
          token,
        );
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

      case TokenType.DICE_PERCENT:
        return this.parseInfixDicePercent(left);

      case TokenType.DICE_FATE:
        return this.parseInfixFateDice(left);

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

      case TokenType.EXPLODE:
      case TokenType.EXPLODE_COMPOUND:
      case TokenType.EXPLODE_PENETRATING:
        return this.parseExplode(left, token);

      case TokenType.REROLL:
      case TokenType.REROLL_ONCE:
        return this.parseReroll(left, token);

      default:
        throw new ParseError(
          `Unexpected infix token '${token.value}'`,
          'UNEXPECTED_TOKEN',
          token.position,
          token,
        );
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

  private parsePrefixDicePercent(): DiceNode {
    // d% → Dice(1, 100)
    return {
      type: 'Dice',
      count: { type: 'Literal', value: 1 },
      sides: { type: 'Literal', value: 100 },
    };
  }

  private parseInfixDicePercent(left: ASTNode): DiceNode {
    // 2d% → Dice(2, 100)
    return {
      type: 'Dice',
      count: left,
      sides: { type: 'Literal', value: 100 },
    };
  }

  private parsePrefixFateDice(): FateDiceNode {
    // dF → FateDice(1)
    return {
      type: 'FateDice',
      count: { type: 'Literal', value: 1 },
    };
  }

  private parseInfixFateDice(left: ASTNode): FateDiceNode {
    // 4dF → FateDice(4). Unlike parseInfixDice, there is no sides sub-parse,
    // so modifiers (`kh`, `dl`, …) naturally bind at the outer Pratt loop
    // without BP competition against a right-operand.
    return {
      type: 'FateDice',
      count: left,
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

    // Default to 1 when no explicit count follows the modifier (e.g., 4d6kh → 4d6kh1)
    const nextToken = this.peek().type;
    const count: ASTNode =
      nextToken === TokenType.NUMBER || nextToken === TokenType.LPAREN
        ? this.parseExpression(BP.DICE_LEFT)
        : { type: 'Literal', value: 1 };

    return {
      type: 'Modifier',
      modifier,
      selector,
      count,
      target,
    };
  }

  private parseExplode(target: ASTNode, token: Token): ExplodeNode {
    // ? Reject nested explodes (e.g., `1d6!!!`) — a second explode token atop
    //   an ExplodeNode has no meaningful semantics and is rejected per spec.
    if (target.type === 'Explode') {
      throw new ParseError(
        `Cannot chain explode modifiers`,
        'INVALID_EXPLODE_TARGET',
        token.position,
        token,
      );
    }

    const variant: ExplodeNode['variant'] =
      token.type === TokenType.EXPLODE
        ? 'standard'
        : token.type === TokenType.EXPLODE_COMPOUND
          ? 'compound'
          : 'penetrating';

    const node: ExplodeNode = { type: 'Explode', variant, target };
    if (this.isComparePointAhead()) {
      node.threshold = this.parseComparePoint();
    }
    return node;
  }

  private parseReroll(target: ASTNode, token: Token): RerollNode {
    // A reroll token must be followed by a comparison — bare `r` / `ro` is invalid.
    if (!this.isComparePointAhead()) {
      throw new ParseError(
        `Expected comparison operator after '${token.value}'`,
        'EXPECTED_TOKEN',
        token.position,
        token,
      );
    }

    const once = token.type === TokenType.REROLL_ONCE;
    const condition = this.parseComparePoint();

    return { type: 'Reroll', once, condition, target };
  }

  // * Compare point utilities

  /**
   * Checks whether the next token is a comparison operator.
   */
  isComparePointAhead(): boolean {
    const type = this.peek().type;
    return (
      type === TokenType.GREATER ||
      type === TokenType.GREATER_EQUAL ||
      type === TokenType.LESS ||
      type === TokenType.LESS_EQUAL ||
      type === TokenType.EQUAL
    );
  }

  /**
   * Parses a comparison operator followed by a value expression.
   * Called by modifier parsers (explode, reroll, success counting).
   *
   * @returns A ComparePoint with the operator and value AST node
   * @throws {ParseError} If the next token is not a comparison operator
   */
  parseComparePoint(): ComparePoint {
    const token = this.peek();
    const operator = this.getCompareOp(token);

    this.advance();

    const value = this.parseExpression(BP.DICE_LEFT);

    return { operator, value };
  }

  private getCompareOp(token: Token): CompareOp {
    switch (token.type) {
      case TokenType.GREATER:
        return '>';
      case TokenType.GREATER_EQUAL:
        return '>=';
      case TokenType.LESS:
        return '<';
      case TokenType.LESS_EQUAL:
        return '<=';
      case TokenType.EQUAL:
        return '=';
      default:
        throw new ParseError(
          `Expected comparison operator but got '${token.value}'`,
          'EXPECTED_TOKEN',
          token.position,
          token,
        );
    }
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
        throw new ParseError(
          `Unknown operator '${token.value}'`,
          'UNEXPECTED_TOKEN',
          token.position,
          token,
        );
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
      case TokenType.DICE_PERCENT:
      case TokenType.DICE_FATE:
        return BP.DICE_LEFT;
      case TokenType.KEEP_HIGH:
      case TokenType.KEEP_LOW:
      case TokenType.DROP_HIGH:
      case TokenType.DROP_LOW:
      case TokenType.EXPLODE:
      case TokenType.EXPLODE_COMPOUND:
      case TokenType.EXPLODE_PENETRATING:
      case TokenType.REROLL:
      case TokenType.REROLL_ONCE:
        return BP.MODIFIER;
      case TokenType.RPAREN:
      case TokenType.EOF:
      // Comparison operators terminate the current expression — they are
      // consumed by modifier parsers (explode, reroll, success counting),
      // not by the main Pratt loop.
      case TokenType.GREATER:
      case TokenType.GREATER_EQUAL:
      case TokenType.LESS:
      case TokenType.LESS_EQUAL:
      case TokenType.EQUAL:
      // Punctuation and keywords that terminate expressions
      case TokenType.COMMA:
      case TokenType.FUNCTION:
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
      throw new ParseError(
        `Expected ${expected} but got '${token.value}'`,
        'EXPECTED_TOKEN',
        token.position,
        token,
      );
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
