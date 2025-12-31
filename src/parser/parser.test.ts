import { describe, expect, it } from 'bun:test';
import { parse, ParseError, Parser } from './parser';
import { lex } from '../lexer/lexer';
import type {
  ASTNode,
  BinaryOpNode,
  DiceNode,
  LiteralNode,
  ModifierNode,
  UnaryOpNode,
} from './ast';

// * Helper functions for readable assertions

function literal(value: number): LiteralNode {
  return { type: 'Literal', value };
}

function dice(count: ASTNode, sides: ASTNode): DiceNode {
  return { type: 'Dice', count, sides };
}

function binary(operator: BinaryOpNode['operator'], left: ASTNode, right: ASTNode): BinaryOpNode {
  return { type: 'BinaryOp', operator, left, right };
}

function unary(operand: ASTNode): UnaryOpNode {
  return { type: 'UnaryOp', operator: '-', operand };
}

function modifier(
  mod: 'keep' | 'drop',
  sel: 'highest' | 'lowest',
  count: ASTNode,
  target: ASTNode,
): ModifierNode {
  return { type: 'Modifier', modifier: mod, selector: sel, count, target };
}

describe('Parser', () => {
  describe('literal parsing', () => {
    it('should parse integer literals', () => {
      expect(parse('42')).toEqual(literal(42));
    });

    it('should parse decimal literals', () => {
      expect(parse('3.14')).toEqual(literal(3.14));
    });

    it('should parse zero', () => {
      expect(parse('0')).toEqual(literal(0));
    });

    it('should parse large numbers', () => {
      expect(parse('1000000')).toEqual(literal(1000000));
    });
  });

  describe('unary minus', () => {
    it('should parse negative literal', () => {
      expect(parse('-5')).toEqual(unary(literal(5)));
    });

    it('should parse negative dice', () => {
      expect(parse('-d4')).toEqual(unary(dice(literal(1), literal(4))));
    });

    it('should parse negative parenthesized expression', () => {
      expect(parse('-(1+2)')).toEqual(unary(binary('+', literal(1), literal(2))));
    });

    it('should parse double negative', () => {
      expect(parse('--5')).toEqual(unary(unary(literal(5))));
    });
  });

  describe('basic dice', () => {
    it('should parse prefix dice (d20 → 1d20)', () => {
      expect(parse('d20')).toEqual(dice(literal(1), literal(20)));
    });

    it('should parse infix dice', () => {
      expect(parse('2d6')).toEqual(dice(literal(2), literal(6)));
    });

    it('should parse 4d6', () => {
      expect(parse('4d6')).toEqual(dice(literal(4), literal(6)));
    });

    it('should parse single-sided die', () => {
      expect(parse('1d1')).toEqual(dice(literal(1), literal(1)));
    });

    it('should parse zero count dice', () => {
      expect(parse('0d6')).toEqual(dice(literal(0), literal(6)));
    });
  });

  describe('arithmetic precedence', () => {
    it('should parse addition', () => {
      expect(parse('1+2')).toEqual(binary('+', literal(1), literal(2)));
    });

    it('should parse subtraction', () => {
      expect(parse('5-3')).toEqual(binary('-', literal(5), literal(3)));
    });

    it('should parse multiplication', () => {
      expect(parse('2*3')).toEqual(binary('*', literal(2), literal(3)));
    });

    it('should parse division', () => {
      expect(parse('10/2')).toEqual(binary('/', literal(10), literal(2)));
    });

    it('should parse modulo', () => {
      expect(parse('10%3')).toEqual(binary('%', literal(10), literal(3)));
    });

    it('should respect precedence: 1+2*3 = 1+(2*3)', () => {
      expect(parse('1+2*3')).toEqual(binary('+', literal(1), binary('*', literal(2), literal(3))));
    });

    it('should respect precedence: 1*2+3 = (1*2)+3', () => {
      expect(parse('1*2+3')).toEqual(binary('+', binary('*', literal(1), literal(2)), literal(3)));
    });

    it('should be left-associative: 1-2-3 = (1-2)-3', () => {
      expect(parse('1-2-3')).toEqual(binary('-', binary('-', literal(1), literal(2)), literal(3)));
    });

    it('should be left-associative: 10/2/5 = (10/2)/5', () => {
      expect(parse('10/2/5')).toEqual(
        binary('/', binary('/', literal(10), literal(2)), literal(5)),
      );
    });
  });

  describe('power operator', () => {
    it('should parse ** as power', () => {
      expect(parse('2**3')).toEqual(binary('**', literal(2), literal(3)));
    });

    it('should parse ^ as power', () => {
      expect(parse('2^3')).toEqual(binary('**', literal(2), literal(3)));
    });

    it('should be right-associative: 2**3**2 = 2**(3**2)', () => {
      // This evaluates to 2^9 = 512, not (2^3)^2 = 64
      expect(parse('2**3**2')).toEqual(
        binary('**', literal(2), binary('**', literal(3), literal(2))),
      );
    });

    it('should have higher precedence than multiplication', () => {
      // 2*3**2 = 2*(3^2) = 2*9 = 18
      expect(parse('2*3**2')).toEqual(
        binary('*', literal(2), binary('**', literal(3), literal(2))),
      );
    });
  });

  describe('parentheses', () => {
    it('should override precedence: (1+2)*3', () => {
      expect(parse('(1+2)*3')).toEqual(
        binary('*', binary('+', literal(1), literal(2)), literal(3)),
      );
    });

    it('should handle nested parentheses', () => {
      expect(parse('((1+2))')).toEqual(binary('+', literal(1), literal(2)));
    });

    it('should handle computed dice count: (1+1)d6', () => {
      expect(parse('(1+1)d6')).toEqual(dice(binary('+', literal(1), literal(1)), literal(6)));
    });

    it('should handle computed dice sides: 1d(3*2)', () => {
      expect(parse('1d(3*2)')).toEqual(dice(literal(1), binary('*', literal(3), literal(2))));
    });

    it('should handle both computed: (1+1)d(3*2)', () => {
      expect(parse('(1+1)d(3*2)')).toEqual(
        dice(binary('+', literal(1), literal(1)), binary('*', literal(3), literal(2))),
      );
    });
  });

  describe('keep/drop modifiers', () => {
    it('should parse keep highest: 4d6kh3', () => {
      expect(parse('4d6kh3')).toEqual(
        modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
      );
    });

    it('should parse keep lowest: 2d20kl1', () => {
      expect(parse('2d20kl1')).toEqual(
        modifier('keep', 'lowest', literal(1), dice(literal(2), literal(20))),
      );
    });

    it('should parse drop highest: 4d6dh1', () => {
      expect(parse('4d6dh1')).toEqual(
        modifier('drop', 'highest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should parse drop lowest: 4d6dl1', () => {
      expect(parse('4d6dl1')).toEqual(
        modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should parse k as shorthand for kh: 4d6k3', () => {
      expect(parse('4d6k3')).toEqual(
        modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
      );
    });

    it('should handle advantage: 2d20kh1', () => {
      expect(parse('2d20kh1')).toEqual(
        modifier('keep', 'highest', literal(1), dice(literal(2), literal(20))),
      );
    });

    it('should handle disadvantage: 2d20kl1', () => {
      expect(parse('2d20kl1')).toEqual(
        modifier('keep', 'lowest', literal(1), dice(literal(2), literal(20))),
      );
    });
  });

  describe('dice + arithmetic', () => {
    it('should parse 1d20+5', () => {
      expect(parse('1d20+5')).toEqual(binary('+', dice(literal(1), literal(20)), literal(5)));
    });

    it('should parse 2d6+1d4', () => {
      expect(parse('2d6+1d4')).toEqual(
        binary('+', dice(literal(2), literal(6)), dice(literal(1), literal(4))),
      );
    });

    it('should respect dice precedence over arithmetic', () => {
      // 2d6+3 = (2d6)+3, not 2d(6+3)
      expect(parse('2d6+3')).toEqual(binary('+', dice(literal(2), literal(6)), literal(3)));
    });

    it('should parse complex: (1d20+5)*2', () => {
      expect(parse('(1d20+5)*2')).toEqual(
        binary('*', binary('+', dice(literal(1), literal(20)), literal(5)), literal(2)),
      );
    });
  });

  describe('modifier + arithmetic', () => {
    it('should parse 4d6kh3+5', () => {
      // Modifier applies only to dice, then addition
      expect(parse('4d6kh3+5')).toEqual(
        binary(
          '+',
          modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
          literal(5),
        ),
      );
    });

    it('should parse 2d20kh1+5 (advantage + modifier)', () => {
      expect(parse('2d20kh1+5')).toEqual(
        binary(
          '+',
          modifier('keep', 'highest', literal(1), dice(literal(2), literal(20))),
          literal(5),
        ),
      );
    });
  });

  describe('complex expressions', () => {
    it('should parse 4d6dl1+2d8kh1*2', () => {
      expect(parse('4d6dl1+2d8kh1*2')).toEqual(
        binary(
          '+',
          modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
          binary(
            '*',
            modifier('keep', 'highest', literal(1), dice(literal(2), literal(8))),
            literal(2),
          ),
        ),
      );
    });

    it('should parse d20+d6', () => {
      expect(parse('d20+d6')).toEqual(
        binary('+', dice(literal(1), literal(20)), dice(literal(1), literal(6))),
      );
    });

    it('should parse -1d4+5', () => {
      expect(parse('-1d4+5')).toEqual(binary('+', unary(dice(literal(1), literal(4))), literal(5)));
    });
  });

  describe('error handling', () => {
    it('should throw on empty input', () => {
      expect(() => parse('')).toThrow(ParseError);
    });

    it('should throw on unexpected operator at start', () => {
      expect(() => parse('+')).toThrow(ParseError);
      expect(() => parse('*')).toThrow(ParseError);
    });

    it('should throw on missing closing parenthesis', () => {
      expect(() => parse('(1+2')).toThrow(ParseError);
    });

    it('should throw on extra closing parenthesis', () => {
      expect(() => parse('1+2)')).toThrow(ParseError);
    });

    it('should throw on missing modifier count', () => {
      expect(() => parse('4d6kh')).toThrow(ParseError);
    });

    it('should throw on trailing operator', () => {
      expect(() => parse('1+')).toThrow(ParseError);
    });

    it('should include position in error', () => {
      try {
        parse('1+');
      } catch (e) {
        expect(e).toBeInstanceOf(ParseError);
        expect((e as ParseError).position).toBeGreaterThanOrEqual(0);
      }
    });

    it('should throw on modifier without target', () => {
      expect(() => parse('kh3')).toThrow(ParseError);
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace', () => {
      expect(parse('2 d 20 + 5')).toEqual(binary('+', dice(literal(2), literal(20)), literal(5)));
    });

    it('should handle multiple dice expressions', () => {
      expect(parse('1d6+2d6+3d6')).toEqual(
        binary(
          '+',
          binary('+', dice(literal(1), literal(6)), dice(literal(2), literal(6))),
          dice(literal(3), literal(6)),
        ),
      );
    });

    it('should handle deeply nested expression', () => {
      expect(parse('(((1)))')).toEqual(literal(1));
    });

    it('should handle prefix d with arithmetic', () => {
      // d6+d8 = (d6)+(d8)
      expect(parse('d6+d8')).toEqual(
        binary('+', dice(literal(1), literal(6)), dice(literal(1), literal(8))),
      );
    });
  });

  describe('Parser class', () => {
    it('should allow direct usage with tokens', () => {
      const tokens = lex('2d6');
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(ast).toEqual(dice(literal(2), literal(6)));
    });
  });
});
