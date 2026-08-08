/**
 * Pratt parser for dice notation.
 *
 * @module parser/parser
 */

import type { RollParserErrorCode } from '../errors.js';
import { RollParserError } from '../errors.js';
import { lex } from '../lexer/lexer.js';
import { type Token, TokenType } from '../lexer/tokens.js';
import type { CompareOp, ComparePoint } from '../types.js';
import type {
  ASTNode,
  BinaryOpNode,
  CritThreshold,
  CritThresholdNode,
  DiceNode,
  DieBoundNode,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  GroupNode,
  KeepDropNode,
  LiteralNode,
  RerollNode,
  SortNode,
  SuccessCountNode,
  UnaryOpNode,
  VariableNode,
  VersusNode,
} from './ast.js';
import { isCritThreshold, isSuccessCount } from './ast.js';
import {
  containsDice,
  containsDicePool,
  containsFatePool,
  containsMultiSubGroup,
  containsVersus,
  countsPerDie,
  deepContainsDicePool,
  sumsToKeptFaces,
  unwrapAllTransparent,
  unwrapGrouped,
} from './guards.js';

/**
 * Error thrown when the parser encounters invalid syntax.
 *
 * `position` is a zero-based UTF-16 offset into the notation. It is
 * deliberately absent from `message` — read it from the field, or uniformly
 * across all roll-parser errors via `getErrorSpan`.
 *
 * @example
 * ```typescript
 * import { ParseError, roll, TokenType } from 'roll-parser';
 *
 * try {
 *   roll('4d6d1');
 * } catch (error) {
 *   const typed = error as ParseError;
 *   typed.code; // 'AMBIGUOUS_DICE_CHAIN'
 *   typed.position; // 3
 *   typed.token?.type === TokenType.DICE; // true
 * }
 * ```
 *
 * @category Errors
 */
export class ParseError extends RollParserError {
  /** Zero-based UTF-16 offset in the notation where parsing failed. */
  readonly position: number;
  /**
   * The token the parser was looking at. `undefined` when the failure is not
   * anchored to a token — currently only `UNEXPECTED_END`, raised when the
   * input stops short.
   */
  readonly token: Token | undefined;

  constructor(
    message: string,
    code: RollParserErrorCode,
    position: number,
    token?: Token,
    options?: ErrorOptions,
  ) {
    super(message, code, options);
    this.name = 'ParseError';
    this.position = position;
    this.token = token;
  }
}

/**
 * Binding power constants for operators.
 * Higher values bind tighter. Right < Left for right-associativity.
 *
 * Precedence order (lowest to highest):
 * - Versus (`vs`): 2-3 (lowest — full expressions on both sides)
 * - Comparison (success-count LED): 8
 * - Addition/subtraction: 10
 * - Multiplication/division/modulo: 20
 * - Unary minus: 25 (binds to complete dice expr: -1d4 = -(1d4))
 * - Power: 30-31
 * - Modifiers (postfix): 35 (must be < DICE_RIGHT to bind to complete dice expr)
 * - Dice: 40-41
 */
const BP = {
  // Lowest, so both sides take a full expression: `1d20+10 vs 25+10` =
  // `(1d20+10) vs (25+10)`.
  VS_LEFT: 2,
  VS_RIGHT: 3,
  // Below ADD/MUL so `XdY+N>T` parses as `(XdY+N)>T` and fails the pool-target
  // guard with a clear error, instead of `>` stealing `N` from the `+`.
  COMPARE: 8,
  ADD_LEFT: 10,
  ADD_RIGHT: 11,
  MUL_LEFT: 20,
  MUL_RIGHT: 21,
  // Between MUL and POW so `-1d4` = `-(1d4)`, not `(-1)d4`.
  UNARY: 25,
  POW_LEFT: 31,
  POW_RIGHT: 30,
  // Must stay below DICE_RIGHT so a postfix modifier binds to the whole dice
  // expression: `4d6kh3` = `(4d6)kh3`.
  MODIFIER: 35,
  DICE_LEFT: 40,
  DICE_RIGHT: 41,
} as const;

/**
 * Maximum expression nesting depth. Far beyond any human-authored notation —
 * exists so adversarial input like 20,000 nested parens throws a typed
 * `ParseError` instead of an uncaught `RangeError` stack overflow (which
 * would also break the `isRollParserError` contract). Bounding parse depth
 * also bounds AST depth, protecting the recursive AST walkers and evaluator.
 *
 * Not configurable — unlike the {@link EvaluationOptions} caps, this one always
 * applies, so untrusted notation can never blow the stack.
 *
 * @example
 * ```typescript
 * import { isRollParserError, MAX_PARSE_DEPTH, parse } from 'roll-parser';
 *
 * MAX_PARSE_DEPTH; // 128
 *
 * try {
 *   parse('('.repeat(20_000) + '1d6' + ')'.repeat(20_000));
 * } catch (error) {
 *   isRollParserError(error) && error.code; // 'MAX_DEPTH_EXCEEDED'
 * }
 * ```
 *
 * @category Limits
 */
export const MAX_PARSE_DEPTH = 128;

/**
 * Human-readable symbols for the tokens `expect()` can be asked for.
 *
 * `satisfies` keeps the key literals, so `ExpectableToken` narrows `expect()`
 * to exactly these tokens and the lookup can never miss.
 */
const TOKEN_DISPLAY = {
  [TokenType.LPAREN]: `'('`,
  [TokenType.RPAREN]: `')'`,
  [TokenType.LBRACE]: `'{'`,
  [TokenType.RBRACE]: `'}'`,
  [TokenType.COMMA]: `','`,
} satisfies Partial<Record<TokenType, string>>;

/** Token types that carry a display symbol and may be passed to `expect()`. */
type ExpectableToken = keyof typeof TOKEN_DISPLAY;

/**
 * Arity table for math functions. `min` and `max` are inclusive.
 * `POSITIVE_INFINITY` means unbounded (variadic).
 */
const FUNCTION_ARITY: Record<string, { min: number; max: number }> = {
  floor: { min: 1, max: 1 },
  ceil: { min: 1, max: 1 },
  round: { min: 1, max: 1 },
  abs: { min: 1, max: 1 },
  sqrt: { min: 1, max: 1 },
  pow: { min: 2, max: 2 },
  max: { min: 2, max: Number.POSITIVE_INFINITY },
  min: { min: 2, max: Number.POSITIVE_INFINITY },
};

/** Renders an arity range for the `INVALID_FUNCTION_ARITY` message. */
function formatArity(arity: { min: number; max: number }): string {
  if (arity.max === Number.POSITIVE_INFINITY) return `at least ${arity.min}`;
  if (arity.min === arity.max) return `${arity.min}`;
  return `${arity.min}–${arity.max}`;
}

/** Explode variant produced by each explode token. */
const EXPLODE_VARIANTS: Partial<Record<TokenType, ExplodeNode['variant']>> = {
  [TokenType.EXPLODE]: 'standard',
  [TokenType.EXPLODE_COMPOUND]: 'compound',
  [TokenType.EXPLODE_PENETRATING]: 'penetrating',
};

/**
 * Pratt parser for dice notation.
 *
 * Uses binding power (precedence) to handle operator associativity and
 * precedence without left recursion issues.
 */
export class Parser {
  private readonly tokens: Token[];
  private pos = 0;
  private depth = 0;

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
    const entryDepth = this.depth;
    this.depth += 1;
    this.guardDepth();

    try {
      let left = this.parseNud();

      while (this.hasTokens()) {
        const token = this.peek();
        const leftBp = this.getLeftBp(token);

        if (leftBp < minBp) break;

        this.advance();
        left = this.parseLed(left, token);
        // ! Each continuation wraps `left`, so the AST is one level deeper even
        // ! though this loop never recursed. Drop this and the bound stops
        // ! holding for left-associative chains.
        this.depth += 1;
        this.guardDepth();
      }

      return left;
    } finally {
      this.depth = entryDepth;
    }
  }

  /**
   * Throw once the AST under construction is deeper than the recursive walkers
   * can safely descend.
   */
  private guardDepth(): void {
    if (this.depth > MAX_PARSE_DEPTH) {
      throw new ParseError(
        `Expression nesting exceeds the maximum depth of ${MAX_PARSE_DEPTH}`,
        'MAX_DEPTH_EXCEEDED',
        this.peek().position,
        this.peek(),
      );
    }
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
        return this.parseUnaryMinus(token);

      case TokenType.DICE:
        return this.parsePrefixDice(token);

      case TokenType.DICE_PERCENT:
        return this.parsePrefixDicePercent(token);

      case TokenType.DICE_FATE:
        return this.parsePrefixFateDice(token);

      case TokenType.LPAREN:
        return this.parseGrouped(token);

      case TokenType.LBRACE:
        return this.parseGroup(token);

      case TokenType.FUNCTION:
        return this.parseFunctionCall(token);

      case TokenType.AT:
        return this.parseVariable(token);

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
        return this.parseInfixDice(left, token);

      case TokenType.DICE_PERCENT:
        return this.parseInfixDicePercent(left, token);

      case TokenType.DICE_FATE:
        return this.parseInfixFateDice(left, token);

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
        return this.parseKeepDrop(left, token);

      case TokenType.EXPLODE:
      case TokenType.EXPLODE_COMPOUND:
      case TokenType.EXPLODE_PENETRATING:
        return this.parseExplode(left, token);

      case TokenType.REROLL:
      case TokenType.REROLL_ONCE:
        return this.parseReroll(left, token);

      case TokenType.SORT_ASC:
      case TokenType.SORT_DESC:
        return this.parseSort(left, token);

      case TokenType.CRIT_SUCCESS:
      case TokenType.CRIT_FAIL:
        return this.parseCritThreshold(left, token);

      case TokenType.FUNCTION:
        // Only `min`/`max` reach LED position — `getLeftBp` keeps every
        // other function name at -1, ending the Pratt loop before dispatch.
        return this.parseDieBound(left, token);

      case TokenType.GREATER:
      case TokenType.GREATER_EQUAL:
      case TokenType.LESS:
      case TokenType.LESS_EQUAL:
      case TokenType.EQUAL:
        return this.parseSuccessCount(left, token);

      case TokenType.VS:
        return this.parseVersus(left, token);

      default:
        throw new ParseError(
          `Unexpected infix token '${token.value}'`,
          'UNEXPECTED_TOKEN',
          token.position,
          token,
        );
    }
  }

  //
  // * Node parsers
  //

  /**
   * Zero-width span for synthetic nodes (implicit counts, `d%` sides) that
   * have no source text of their own — anchored at the governing token.
   */
  private static syntheticLiteral(value: number, token: Token): LiteralNode {
    return { type: 'Literal', value, start: token.position, end: token.position };
  }

  private parseLiteral(token: Token): LiteralNode {
    return {
      type: 'Literal',
      value: Number.parseFloat(token.value),
      start: token.position,
      end: token.end,
    };
  }

  private parseUnaryMinus(token: Token): UnaryOpNode {
    const operand = this.parseExpression(BP.UNARY);
    this.rejectSuccessCountTarget(operand, token);
    return {
      type: 'UnaryOp',
      operator: '-',
      operand,
      start: token.position,
      end: operand.end ?? token.end,
    };
  }

  private parsePrefixDice(token: Token): DiceNode {
    const sides = this.parseExpression(BP.DICE_RIGHT);
    this.rejectSuccessCountTarget(sides, token);
    this.rejectVersusMetaOperand(sides, token);
    return {
      type: 'Dice',
      count: Parser.syntheticLiteral(1, token),
      sides,
      start: token.position,
      end: sides.end ?? token.end,
    };
  }

  private parseInfixDice(left: ASTNode, token: Token): DiceNode {
    this.rejectSuccessCountTarget(left, token);
    this.rejectVersusMetaOperand(left, token);
    this.rejectBareDiceChain(left, token);
    const sides = this.parseExpression(BP.DICE_RIGHT);
    this.rejectSuccessCountTarget(sides, token);
    this.rejectVersusMetaOperand(sides, token);
    return {
      type: 'Dice',
      count: left,
      sides,
      start: left.start ?? token.position,
      end: sides.end ?? token.end,
    };
  }

  private parsePrefixDicePercent(token: Token): DiceNode {
    return {
      type: 'Dice',
      count: Parser.syntheticLiteral(1, token),
      sides: Parser.syntheticLiteral(100, token),
      start: token.position,
      end: token.end,
    };
  }

  private parseInfixDicePercent(left: ASTNode, token: Token): DiceNode {
    this.rejectSuccessCountTarget(left, token);
    this.rejectVersusMetaOperand(left, token);
    this.rejectBareDiceChain(left, token);
    return {
      type: 'Dice',
      count: left,
      sides: Parser.syntheticLiteral(100, token),
      start: left.start ?? token.position,
      end: token.end,
    };
  }

  private parsePrefixFateDice(token: Token): FateDiceNode {
    return {
      type: 'FateDice',
      count: Parser.syntheticLiteral(1, token),
      start: token.position,
      end: token.end,
    };
  }

  private parseInfixFateDice(left: ASTNode, token: Token): FateDiceNode {
    // No sides sub-parse, unlike `parseInfixDice`, so modifiers (`kh`, `dl`, …)
    // bind at the outer Pratt loop with no BP competition from a right operand.
    this.rejectSuccessCountTarget(left, token);
    this.rejectVersusMetaOperand(left, token);
    this.rejectBareDiceChain(left, token);
    return {
      type: 'FateDice',
      count: left,
      start: left.start ?? token.position,
      end: token.end,
    };
  }

  private parseGrouped(token: Token): GroupedNode {
    const expression = this.parseExpression(0);
    const close = this.expect(TokenType.RPAREN);
    return { type: 'Grouped', expression, start: token.position, end: close.end };
  }

  private parseGroup(startToken: Token): GroupNode {
    // `LBRACE`/`RBRACE`/`COMMA` all have `getLeftBp === -1`, so inner
    // `parseExpression(0)` calls stop at the first `,` or `}` without competing
    // with modifier/arithmetic BPs.
    if (this.peek().type === TokenType.RBRACE) {
      throw new ParseError('Empty group', 'UNEXPECTED_TOKEN', startToken.position, startToken);
    }

    const expressions: ASTNode[] = [this.parseExpression(0)];
    while (this.peek().type === TokenType.COMMA) {
      this.advance();
      expressions.push(this.parseExpression(0));
    }

    if (this.peek().type !== TokenType.RBRACE) {
      const unterminated = this.peek();
      throw new ParseError(
        `Unterminated group: expected '}' or ','`,
        'EXPECTED_TOKEN',
        unterminated.position,
        unterminated,
      );
    }
    const close = this.advance();

    return { type: 'Group', expressions, start: startToken.position, end: close.end };
  }

  private parseVariable(token: Token): VariableNode {
    return { type: 'Variable', name: token.value, start: token.position, end: token.end };
  }

  private parseFunctionCall(token: Token): FunctionCallNode {
    // `FUNCTION`, `COMMA`, and `RPAREN` all sit at BP -1, so argument boundaries
    // fall out of the inner `parseExpression(0)` calls terminating on their own.
    this.expect(TokenType.LPAREN);

    const args: ASTNode[] = [];
    if (this.peek().type !== TokenType.RPAREN) {
      const first = this.parseExpression(0);
      this.rejectSuccessCountTarget(first, token);
      args.push(first);
      while (this.peek().type === TokenType.COMMA) {
        this.advance();
        const next = this.parseExpression(0);
        this.rejectSuccessCountTarget(next, token);
        args.push(next);
      }
    }

    const close = this.expect(TokenType.RPAREN);

    const arity = FUNCTION_ARITY[token.value];
    if (arity == null) {
      // Unreachable: the lexer only emits `FUNCTION` for registered names. Kept
      // so the parser/evaluator error-code contract stays symmetrical.
      throw new ParseError(
        `Unknown function '${token.value}'`,
        'UNKNOWN_FUNCTION',
        token.position,
        token,
      );
    }

    if (args.length < arity.min || args.length > arity.max) {
      const expected = formatArity(arity);
      throw new ParseError(
        `Function '${token.value}' expects ${expected} argument${arity.min === 1 && arity.max === 1 ? '' : 's'}, got ${args.length}`,
        'INVALID_FUNCTION_ARITY',
        token.position,
        token,
      );
    }

    return {
      type: 'FunctionCall',
      name: token.value,
      args,
      start: token.position,
      end: close.end,
    };
  }

  private parseBinaryOp(left: ASTNode, token: Token): BinaryOpNode {
    this.rejectSuccessCountTarget(left, token);

    const operator = this.getOperatorSymbol(token);
    const rightBp = this.getRightBp(token);
    const right = this.parseExpression(rightBp);

    this.rejectSuccessCountTarget(right, token);

    return {
      type: 'BinaryOp',
      operator,
      left,
      right,
      start: left.start ?? token.position,
      end: right.end ?? token.end,
    };
  }

  /**
   * Rejects a dice token whose count operand is itself a bare (unparenthesized)
   * dice expression. `4d6d1` would otherwise silently parse as `(4d6)d1` —
   * roll 4d6, then use the result as a count of d1 dice — which is almost
   * never intended: every major dice dialect reads `4d6d1` as "drop lowest 1".
   * Both meanings stay reachable through explicit forms: `4d6dl1` to drop,
   * `(4d6)d1` for nested dice.
   */
  private rejectBareDiceChain(left: ASTNode, token: Token): void {
    switch (left.type) {
      case 'Dice':
      case 'FateDice':
      case 'Explode':
      case 'Reroll':
      case 'DieBound':
      case 'KeepDrop':
      case 'Sort':
      case 'CritThreshold':
        throw new ParseError(
          `Ambiguous dice chain: use 'dl'/'dh' to drop dice (4d6dl1) or parentheses for nested dice ((4d6)d1)`,
          'AMBIGUOUS_DICE_CHAIN',
          token.position,
          token,
        );
      default:
        return;
    }
  }

  private rejectSuccessCountTarget(target: ASTNode, token: Token): void {
    // Narrow unwrap (only `Grouped`): `KeepDrop`/`Sort`/`CritThreshold` each run
    // this same reject before building their wrapper, so a `SuccessCount` can
    // never hide inside one and widening the set would never match.
    const node = unwrapGrouped(target);
    if (isSuccessCount(node)) {
      throw new ParseError(
        `Cannot apply modifier after success counting`,
        'INVALID_SUCCESS_COUNT_TARGET',
        token.position,
        token,
      );
    }
  }

  /**
   * Rejects `GroupNode` (or a wrapper-cloaked group) as the target of `token`.
   * Explode, reroll, and crit-threshold wrap bare dice pools only — a group
   * is a container of sub-expressions, so these modifiers have no defined
   * semantics. Walks `Grouped`/`KeepDrop`/`Sort`/`CritThreshold` so wrappers
   * cannot smuggle a group past the check (`{1d6}kh1cs>5`, `({1d6})!`,
   * `{1d6}scs>5` all reject the same as `{1d6}!`/`{1d6}cs>5`).
   *
   * `singleSubRollPasses` opts the caller into the single-sub-roll passthrough:
   * a `Group` with one expression is the user's explicit flat-pool escape
   * hatch and is equivalent to its unwrapped form. Currently only
   * `parseCritThreshold` opts in — explode/reroll keep the strict reject so
   * existing notation contracts don't shift.
   */
  private rejectGroupTarget(
    target: ASTNode,
    token: Token,
    action: string,
    code: RollParserErrorCode,
    singleSubRollPasses = false,
  ): void {
    const node = unwrapAllTransparent(target);
    if (node.type !== 'Group') return;
    if (singleSubRollPasses && node.expressions.length === 1) {
      // ! Deep-walk the inner sub-expression — `unwrapAllTransparent` only peels
      // ! `Grouped`/`KeepDrop`/`Sort`/`CritThreshold`, so a multi-sub Group
      // ! buried under arithmetic (`{{1d6,2d8}+0}cs>5`), a function call
      // ! (`{abs({1d6,2d8})}cs>5`), or a unary op would reach the evaluator and
      // ! override `critical`/`fumble` on dice from dropped sub-rolls.
      const inner = node.expressions[0];
      if (inner != null && containsMultiSubGroup(inner)) {
        throw new ParseError(`Cannot ${action} a group`, code, token.position, token);
      }
      return;
    }
    throw new ParseError(`Cannot ${action} a group`, code, token.position, token);
  }

  /**
   * Rejects a Versus anywhere inside a meta operand — a dice count, dice sides,
   * a modifier count, or a threshold/bound value.
   *
   * Deep, unlike {@link rejectVersusTarget}: `evalMetaOperand` reduces the
   * operand to a scalar and forwards rolls but not `versusMetadata`, so
   * `floor(1d20 vs 15)` or `(1d20 vs 15)+0` buried in a count loses the degree
   * exactly as a bare one does.
   */
  private rejectVersusMetaOperand(operand: ASTNode, token: Token): void {
    if (containsVersus(operand)) Parser.throwVersusMetaExpression(token);
  }

  /**
   * The wording the meta-expression rejections share. Not every `NESTED_VERSUS`
   * throw — `parseVersus` says "Cannot chain versus operators" for `a vs b vs c`,
   * a different condition. Routing that one through here would silently rewrite
   * its message, and `expectRollError` asserts only the code.
   */
  private static throwVersusMetaExpression(token: Token): never {
    throw new ParseError(
      `Versus cannot be used as a meta-expression`,
      'NESTED_VERSUS',
      token.position,
      token,
    );
  }

  private rejectVersusTarget(target: ASTNode, token: Token): void {
    // A Versus degree is a terminal scalar, never a valid modifier target —
    // every one of these modifiers drops `versusMetadata` on the way through.
    // Shallow on purpose: a multi-sub group like `{1d20 vs 15, 1d6}kh1` is
    // legal, and `evalGroupKeepDrop` propagates the degree from kept sub-rolls.
    // Narrow unwrap (only `Grouped`): `containsDicePool` does not recurse into
    // `Versus`, so `KeepDrop`/`Sort`/`CritThreshold` reject the wrap upstream.
    const node = unwrapGrouped(target);
    if (node.type === 'Versus') Parser.throwVersusMetaExpression(token);
    // ! `containsDicePool` recurses into a single-sub-roll Group via
    // ! `deepContainsDicePool`, which traverses Versus's `roll`/`dc` — so that
    // ! route gets a Versus past the shallow guards. Deep-walk for any descendant
    // ! Versus, or `{1d20 vs 15}cs>18`, `{1+(1d20 vs 15)}cs>18`, and
    // ! `4d6>={abs(1d20 vs 15)}` would parse while `(1d20 vs 15)cs>18` rejects.
    if (node.type === 'Group' && node.expressions.length === 1) {
      const inner = node.expressions[0];
      if (inner != null && containsVersus(inner)) Parser.throwVersusMetaExpression(token);
    }
  }

  private parseKeepDrop(target: ASTNode, token: Token): KeepDropNode {
    this.rejectSuccessCountTarget(target, token);
    // ! Keep/drop on a Versus target silently drops `degree`/`natural` metadata,
    // ! and `{1d20 vs 15}kh1` gets past `containsDicePool` — whose Group deep
    // ! walk recurses into Versus's `roll`/`dc` — so this reject is the only
    // ! thing closing that hole. Mirrors `parseSort`/`parseCritThreshold`.
    this.rejectVersusTarget(target, token);

    // Keep/drop needs a pool to select from; `(1d6+5)kh1` or `4d6+2kh3` would
    // silently drop the user's arithmetic.
    if (!containsDicePool(target)) {
      throw new ParseError(
        `Keep/drop modifiers require a dice pool target`,
        'INVALID_KEEP_DROP_TARGET',
        token.position,
        token,
      );
    }

    // ! A single-sub-roll Group is the flat-pool escape hatch, so `containsDicePool`
    // ! deep-walks the arithmetic that `(1d6+5)kh1` rejects outright — but the flat
    // ! path totals `sumKeptDice`, faces only. `{2d6+3}kh2` and `{2d6-1d4}kh3` are
    // ! exactly the drop that reject exists to prevent.
    const base = unwrapAllTransparent(target);
    if (base.type === 'Group' && base.expressions.length === 1) {
      const inner = base.expressions[0];
      if (inner != null) {
        // Single-sub Groups hide a count from the shallow reject at the top of this
        // method, so peel them to any depth and `{4d6>=5}kh1`, `{{4d6>=5}}kh1`, and
        // `(4d6>=5)kh1` all report one code. Peeling only picks which error the
        // caller sees — `sumsToKeptFaces` below refuses a count either way.
        let innermost = inner;
        while (true) {
          const peeled = unwrapGrouped(innermost);
          if (peeled.type !== 'Group' || peeled.expressions.length !== 1) break;
          const next = peeled.expressions[0];
          if (next == null) break;
          innermost = next;
        }
        this.rejectSuccessCountTarget(innermost, token);

        if (!sumsToKeptFaces(inner)) {
          throw new ParseError(
            `Keep/drop on a single-sub-roll group requires added dice terms only`,
            'INVALID_KEEP_DROP_TARGET',
            token.position,
            token,
          );
        }
      }
    }

    const kind =
      token.type === TokenType.KEEP_HIGH || token.type === TokenType.KEEP_LOW ? 'keep' : 'drop';

    const selector =
      token.type === TokenType.KEEP_HIGH || token.type === TokenType.DROP_HIGH
        ? 'highest'
        : 'lowest';

    const nextToken = this.peek().type;
    const hasExplicitCount =
      nextToken === TokenType.NUMBER ||
      nextToken === TokenType.LPAREN ||
      nextToken === TokenType.AT;
    const count: ASTNode = hasExplicitCount
      ? this.parseExpression(BP.DICE_LEFT)
      : Parser.syntheticLiteral(1, token);
    this.rejectSuccessCountTarget(count, token);
    this.rejectVersusMetaOperand(count, token);

    return {
      type: 'KeepDrop',
      kind,
      selector,
      count,
      target,
      start: target.start ?? token.position,
      end: hasExplicitCount ? (count.end ?? token.end) : token.end,
    };
  }

  private parseExplode(target: ASTNode, token: Token): ExplodeNode {
    this.rejectSuccessCountTarget(target, token);

    // Groups have no explode semantics. Must precede `containsDicePool`, which
    // recurses into `Group` and would let `{4d6}!` slip through.
    this.rejectGroupTarget(target, token, 'explode', 'INVALID_EXPLODE_TARGET');

    // Arithmetic wrappers like `(1d6+5)!` or `floor(1d6/2)!` would silently drop
    // the user's math.
    if (!containsDicePool(target)) {
      throw new ParseError(
        `Explode modifier requires a dice pool target`,
        'INVALID_EXPLODE_TARGET',
        token.position,
        token,
      );
    }

    // Fate's symmetric -1/0/+1 range has no max face to trigger on, so exploding
    // it has no defined semantics — reject here rather than no-op in the evaluator.
    if (containsFatePool(target)) {
      throw new ParseError(
        `Fate dice cannot explode`,
        'INVALID_EXPLODE_TARGET',
        token.position,
        token,
      );
    }

    // A second explode token atop an `Explode` (`1d6!!!`) has no semantics.
    if (target.type === 'Explode') {
      throw new ParseError(
        `Cannot chain explode modifiers`,
        'INVALID_EXPLODE_TARGET',
        token.position,
        token,
      );
    }

    // `parseLed` reaches here only for the three explode tokens, so the lookup
    // always hits; the fallback exists to keep the type non-optional.
    const variant: ExplodeNode['variant'] = EXPLODE_VARIANTS[token.type] ?? 'penetrating';

    const start = target.start ?? token.position;
    if (!this.isComparePointAhead()) {
      return { type: 'Explode', variant, target, start, end: token.end };
    }

    const threshold = this.parseComparePoint();

    return {
      type: 'Explode',
      variant,
      target,
      threshold,
      start,
      end: threshold.value.end ?? token.end,
    };
  }

  private parseReroll(target: ASTNode, token: Token): RerollNode {
    this.rejectSuccessCountTarget(target, token);

    // Groups have no reroll semantics. Must precede `containsDicePool`, which
    // recurses into `Group`.
    this.rejectGroupTarget(target, token, 'reroll', 'INVALID_REROLL_TARGET');

    // Arithmetic wrappers like `(1d6+5)r<3` or `floor(1d6/2)ro<3` would silently
    // drop the user's math.
    if (!containsDicePool(target)) {
      throw new ParseError(
        `Reroll modifier requires a dice pool target`,
        'INVALID_REROLL_TARGET',
        token.position,
        token,
      );
    }

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

    return {
      type: 'Reroll',
      once,
      condition,
      target,
      start: target.start ?? token.position,
      end: condition.value.end ?? token.end,
    };
  }

  private parseDieBound(target: ASTNode, token: Token): DieBoundNode {
    this.rejectSuccessCountTarget(target, token);
    this.rejectVersusTarget(target, token);

    // Groups have no per-die clamp semantics — a group's "dice" are sub-roll
    // subtotals. Must come before `containsDicePool`, which recurses into
    // `Group`.
    this.rejectGroupTarget(target, token, `apply '${token.value}' to`, 'INVALID_DIE_BOUND_TARGET');

    // A clamp needs a dice pool to act on. Wrapping arithmetic (e.g.
    // `(1d6+5)min3`) would silently drop user math.
    if (!containsDicePool(target)) {
      throw new ParseError(
        `Die bound modifier requires a dice pool target`,
        'INVALID_DIE_BOUND_TARGET',
        token.position,
        token,
      );
    }

    // Fate dice roll a fixed {-1, 0, +1}; clamping those faces has no
    // established semantics. Mirrors the Fate-explosion rejection.
    if (containsFatePool(target)) {
      throw new ParseError(
        `Fate dice cannot be clamped`,
        'INVALID_DIE_BOUND_TARGET',
        token.position,
        token,
      );
    }

    // A bound must be explicit — bare `4d6min` has nothing to clamp to.
    const nextToken = this.peek().type;
    const hasExplicitValue =
      nextToken === TokenType.NUMBER ||
      nextToken === TokenType.LPAREN ||
      nextToken === TokenType.AT;
    if (!hasExplicitValue) {
      throw new ParseError(
        `Expected value after '${token.value}'`,
        'EXPECTED_TOKEN',
        token.position,
        token,
      );
    }

    const value = this.parseExpression(BP.DICE_LEFT);
    this.rejectSuccessCountTarget(value, token);
    this.rejectVersusMetaOperand(value, token);

    return {
      type: 'DieBound',
      bound: token.value === 'min' ? 'min' : 'max',
      value,
      target,
      start: target.start ?? token.position,
      end: value.end ?? token.end,
    };
  }

  private parseSort(target: ASTNode, token: Token): SortNode {
    this.rejectSuccessCountTarget(target, token);
    this.rejectVersusTarget(target, token);

    // Deep guard, unlike explode/reroll: arithmetic-wrapped pools like
    // `(1d6+2d8)s` are sortable, while `5s`, `(1+2)s`, and `floor(5)s` have no
    // dice to reorder.
    if (!deepContainsDicePool(target)) {
      throw new ParseError(
        `Sort modifier requires a dice pool target`,
        'INVALID_SORT_TARGET',
        token.position,
        token,
      );
    }

    // ! Multi-sub-roll groups (`{a, b}s`, `({a, b})s`) require hierarchical sort —
    // ! dice within each sub-roll, then sub-rolls by total — but `evalSort` only
    // ! flat-sorts, so accepting the syntax would silently ship wrong output.
    // ! Single-sub Groups still pass; that is the flat-pool escape hatch.
    // TODO: Implement hierarchical group sort, then drop this reject.
    const base = unwrapAllTransparent(target);
    if (base.type === 'Group' && base.expressions.length >= 2) {
      throw new ParseError(
        `Sort modifier does not yet support multi-sub-roll groups`,
        'INVALID_SORT_TARGET',
        token.position,
        token,
      );
    }

    const order: SortNode['order'] = token.type === TokenType.SORT_ASC ? 'ascending' : 'descending';

    // Chained sorts (`4d6ss`, `4d6sasd`) are deliberately allowed: repeats are
    // idempotent and a later `sd` just overrides the order.
    return {
      type: 'Sort',
      order,
      target,
      start: target.start ?? token.position,
      end: token.end,
    };
  }

  private parseCritThreshold(target: ASTNode, token: Token): CritThresholdNode {
    this.rejectSuccessCountTarget(target, token);
    this.rejectVersusTarget(target, token);

    // A multi-sub-roll group is a container of sub-roll subtotals, not a pool:
    // `cs`/`cf` there would override `critical`/`fumble` on dropped sub-roll
    // dice. Single-sub-roll groups pass through as the flat-pool form
    // (`{1d20}kh1cs>18` ≡ `(1d20)kh1cs>18`). Must run before `containsDicePool`,
    // which recurses into `Group`.
    this.rejectGroupTarget(
      target,
      token,
      'apply crit threshold to',
      'INVALID_CRIT_THRESHOLD_TARGET',
      true,
    );

    // Shallow check like explode/reroll: `(1d6+2d8)cs>5`, `5cs`, `(1+2)cs`, and
    // `floor(5)cs` reject. Chained `cs`/`cf` still pass, since `containsDicePool`
    // recurses into a `CritThreshold`'s own target.
    if (!containsDicePool(target)) {
      throw new ParseError(
        `Crit threshold modifier requires a dice pool target`,
        'INVALID_CRIT_THRESHOLD_TARGET',
        token.position,
        token,
      );
    }

    // The bare `cs`/`cf` per-die default assumes max-side/1 semantics, which on
    // Fate's `{-1, 0, +1}` would flag the best face (`+1`) as a fumble. Explicit
    // ComparePoints stay accepted. Mirrors the Fate-explosion reject above.
    if (!this.isComparePointAhead() && containsFatePool(target)) {
      throw new ParseError(
        `Bare cs/cf cannot apply to Fate dice`,
        'INVALID_CRIT_THRESHOLD_TARGET',
        token.position,
        token,
      );
    }

    const threshold: CritThreshold = this.isComparePointAhead()
      ? this.parseComparePoint()
      : 'default';
    const end = threshold === 'default' ? token.end : (threshold.value.end ?? token.end);

    // Unwrap parens so `(1d20cs>19)cs=1` collapses into the inner node instead of
    // nesting a second `CritThreshold` around the `Grouped` — every threshold in
    // a chain must collect on one node, which parenthesizing would break.
    let chainTarget: ASTNode = target;
    while (chainTarget.type === 'Grouped') {
      chainTarget = chainTarget.expression;
    }
    if (isCritThreshold(chainTarget)) {
      // Rebuilt, not mutated: `NodeSpan` is readonly, and the discarded `Grouped`
      // wrapper must not leave a stale `end`.
      const isSuccess = token.type === TokenType.CRIT_SUCCESS;
      return {
        ...chainTarget,
        successThresholds: isSuccess
          ? [...chainTarget.successThresholds, threshold]
          : chainTarget.successThresholds,
        failThresholds: isSuccess
          ? chainTarget.failThresholds
          : [...chainTarget.failThresholds, threshold],
        end,
      };
    }

    return {
      type: 'CritThreshold',
      successThresholds: token.type === TokenType.CRIT_SUCCESS ? [threshold] : [],
      failThresholds: token.type === TokenType.CRIT_FAIL ? [threshold] : [],
      target,
      start: target.start ?? token.position,
      end,
    };
  }

  private parseSuccessCount(target: ASTNode, token: Token): SuccessCountNode {
    // Success counting is terminal: chaining (`>=5>=3`) has no semantics.
    this.rejectSuccessCountTarget(target, token);

    // Success counting reads a raw pool, so arithmetic or composition wrappers
    // (`1>=3`, `(1+2)>=3`, `(1d6*2)>=10`, `(1d20 vs 15)>=1`) would be silently
    // ignored.
    //
    // ! Both checks are load-bearing. `containsDicePool` rejects those wrappers
    // ! despite the dice; `containsDice` rejects a group holding none
    // ! (`{3, 5, 7}>=4`), which the multi-sub-roll rule accepts — that rule is
    // ! written for keep/drop, whose units are subtotals, not dice.
    if (!containsDicePool(target) || !containsDice(target)) {
      throw new ParseError(
        `Success counting requires a dice pool target`,
        'INVALID_SUCCESS_COUNT_TARGET',
        token.position,
        token,
      );
    }

    // ! A multi-sub-roll group is counted by subtotal, and only `evalSuccessCount`
    // ! knows how — it needs the group as its direct target. Reached any other way
    // ! (`{{2d6, 2d8}}>=4`, `({2d6, 2d8})>=4`, `{2d6, 2d8}kh1>=4`) the subtotals are
    // ! gone by the time the count runs, leaving loose faces to compare.
    const isSubtotalGroup = target.type === 'Group' && target.expressions.length >= 2;
    if (!isSubtotalGroup && !countsPerDie(target)) {
      throw new ParseError(
        `Success counting requires a target whose dice can be counted one face at a time`,
        'INVALID_SUCCESS_COUNT_TARGET',
        token.position,
        token,
      );
    }

    const operator = this.getCompareOp(token);
    // Threshold binds at `BP.DICE_LEFT` — see `parseComparePoint` TSDoc.
    const value = this.parseExpression(BP.DICE_LEFT);
    this.rejectSuccessCountTarget(value, token);
    this.rejectVersusMetaOperand(value, token);
    const start = target.start ?? token.position;
    const end = value.end ?? token.end;

    if (this.peek().type !== TokenType.FAIL) {
      return { type: 'SuccessCount', target, threshold: { operator, value }, start, end };
    }

    this.advance();
    const failThreshold = this.parseFailThreshold(token);

    return {
      type: 'SuccessCount',
      target,
      threshold: { operator, value },
      failThreshold,
      start,
      end: failThreshold.value.end ?? end,
    };
  }

  /** Parses the `f...` suffix of a success count. Bare `fN` means `f=N`. */
  private parseFailThreshold(token: Token): ComparePoint {
    if (this.isComparePointAhead()) return this.parseComparePoint();

    // Same threshold binding as `parseComparePoint` (BP.DICE_LEFT).
    const failValue = this.parseExpression(BP.DICE_LEFT);
    this.rejectSuccessCountTarget(failValue, token);
    this.rejectVersusMetaOperand(failValue, token);

    return { operator: '=', value: failValue };
  }

  private parseVersus(left: ASTNode, token: Token): VersusNode {
    this.rejectSuccessCountTarget(left, token);

    // A degree is a scalar, not a comparable, so `a vs b vs c` has no semantics.
    // Unwrapping `Grouped` makes `(a vs b) vs c` reject here like the bare form;
    // a paren-nested DC (`a vs (b vs c)`) is caught later by the evaluator's
    // `mergeContext`.
    let leftChain: ASTNode = left;
    while (leftChain.type === 'Grouped') {
      leftChain = leftChain.expression;
    }
    if (leftChain.type === 'Versus') {
      throw new ParseError('Cannot chain versus operators', 'NESTED_VERSUS', token.position, token);
    }

    const dc = this.parseExpression(BP.VS_RIGHT);
    this.rejectSuccessCountTarget(dc, token);

    return {
      type: 'Versus',
      roll: left,
      dc,
      start: left.start ?? token.position,
      end: dc.end ?? token.end,
    };
  }

  //
  // * Compare point utilities
  //

  /**
   * Checks whether the next token is a comparison operator.
   */
  private isComparePointAhead(): boolean {
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
   * The threshold value is parsed at `BP.DICE_LEFT`, which binds tighter than
   * arithmetic. This keeps the comparison bound to the dice pool on the left
   * rather than letting arithmetic to the right be consumed into the
   * threshold. As a consequence, `1d6>=5+2` parses as `(1d6>=5)+2` with
   * threshold `5` — not `7`. Computed thresholds require parens:
   * `1d6>=(5+2)`. Same binding applies to `parseSuccessCount` below.
   *
   * @returns A ComparePoint with the operator and value AST node
   * @throws {ParseError} If the next token is not a comparison operator
   */
  private parseComparePoint(): ComparePoint {
    const token = this.peek();
    const operator = this.getCompareOp(token);

    this.advance();

    const value = this.parseExpression(BP.DICE_LEFT);
    this.rejectSuccessCountTarget(value, token);
    this.rejectVersusMetaOperand(value, token);

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

  //
  // * Helpers
  //

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
      case TokenType.VS:
        return BP.VS_LEFT;
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
      case TokenType.SORT_ASC:
      case TokenType.SORT_DESC:
      case TokenType.CRIT_SUCCESS:
      case TokenType.CRIT_FAIL:
        return BP.MODIFIER;
      // Comparison operators act as LED-dispatched success-count modifiers here;
      // `parseComparePoint`, called manually by explode/reroll, bypasses this BP.
      // See `BP.COMPARE` for why it sits below ADD/MUL.
      case TokenType.GREATER:
      case TokenType.GREATER_EQUAL:
      case TokenType.LESS:
      case TokenType.LESS_EQUAL:
      case TokenType.EQUAL:
        return BP.COMPARE;
      // `min`/`max` double as postfix per-die clamps (`4d6min2`); every
      // other function name terminates the expression like punctuation.
      case TokenType.FUNCTION:
        return token.value === 'min' || token.value === 'max' ? BP.MODIFIER : -1;
      case TokenType.RPAREN:
      case TokenType.EOF:
      case TokenType.COMMA:
      // `}` is consumed inside `parseGroup`, and a stray `{` after a complete
      // expression is an error — both must terminate the outer Pratt loop.
      case TokenType.LBRACE:
      case TokenType.RBRACE:
        return -1;
      default:
        return 0;
    }
  }

  private getRightBp(token: Token): number {
    switch (token.type) {
      case TokenType.VS:
        return BP.VS_RIGHT;
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
    return (
      this.tokens[this.pos] ?? { type: TokenType.EOF, value: '', position: this.pos, end: this.pos }
    );
  }

  private advance(): Token {
    const token = this.peek();
    this.pos++;
    return token;
  }

  private expect(type: ExpectableToken): Token {
    const token = this.peek();
    if (token.type !== type) {
      const expected = TOKEN_DISPLAY[type];
      const got = token.type === TokenType.EOF ? 'end of input' : `'${token.value}'`;
      throw new ParseError(
        `Expected ${expected} but got ${got}`,
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
 * Parses a dice notation string into an {@link ASTNode} tree, lexing it first.
 *
 * {@link evaluate} never mutates the AST, so parse once and evaluate many times
 * when rolling the same notation repeatedly — that skips the lexer and parser
 * on every roll after the first. Use `parse` alone to validate notation
 * without consuming randomness.
 *
 * @param notation - The dice notation to parse
 * @returns The root AST node, with `start`/`end` spans on every node
 * @throws {LexerError} If the input contains invalid characters
 * @throws {ParseError} If the input has invalid syntax
 * @throws {RollParserError} `INVALID_NOTATION_TYPE` when `notation` is not a
 *   string — raised before lexing, so it carries no position
 *
 * @example
 * ```typescript
 * import { parse } from 'roll-parser';
 *
 * parse('2d6+3');
 * // {
 * //   type: 'BinaryOp', operator: '+', start: 0, end: 5,
 * //   left: {
 * //     type: 'Dice', start: 0, end: 3,
 * //     count: { type: 'Literal', value: 2, start: 0, end: 1 },
 * //     sides: { type: 'Literal', value: 6, start: 2, end: 3 },
 * //   },
 * //   right: { type: 'Literal', value: 3, start: 4, end: 5 },
 * // }
 * ```
 *
 * `count` and `sides` are full nodes, not numbers — that is what makes
 * computed dice like `(1d4)d6` expressible.
 *
 * @example Parse once, roll many
 * ```typescript
 * import { evaluate, parse, SeededRNG } from 'roll-parser';
 *
 * const ast = parse('4d6kh3');
 * const rng = new SeededRNG('demo');
 * const scores = Array.from({ length: 6 }, () => evaluate(ast, rng).total);
 * ```
 *
 * @category Core
 */
export function parse(notation: string): ASTNode {
  const tokens = lex(notation);
  const parser = new Parser(tokens);
  return parser.parse();
}
