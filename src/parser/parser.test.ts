import { describe, expect, it } from 'bun:test';
import { parse, ParseError, Parser } from './parser.js';
import { lex } from '../lexer/lexer.js';
import type { ComparePoint } from '../types.js';
import type {
  ASTNode,
  BinaryOpNode,
  CritThreshold,
  CritThresholdNode,
  DiceNode,
  ExplodeNode,
  FateDiceNode,
  FunctionCallNode,
  GroupedNode,
  GroupNode,
  LiteralNode,
  ModifierNode,
  RerollNode,
  SortNode,
  SuccessCountNode,
  UnaryOpNode,
  VariableNode,
  VersusNode,
} from './ast.js';

// * Helper functions for readable assertions

/**
 * Recursively removes `start`/`end` spans so structural assertions stay
 * readable — span correctness has its own dedicated describe block below.
 */
function stripSpans<T>(node: T): T {
  if (Array.isArray(node)) return node.map(stripSpans) as T;
  if (node === null || typeof node !== 'object') return node;

  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'start' || key === 'end') continue;
    copy[key] = stripSpans(value);
  }
  return copy as T;
}

/** `parse` + `stripSpans` — the default for structural AST assertions. */
function parseAst(notation: string): ASTNode {
  return stripSpans(parse(notation));
}

function literal(value: number): LiteralNode {
  return { type: 'Literal', value };
}

function dice(count: ASTNode, sides: ASTNode): DiceNode {
  return { type: 'Dice', count, sides };
}

function fateDice(count: ASTNode): FateDiceNode {
  return { type: 'FateDice', count };
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

function explode(
  variant: ExplodeNode['variant'],
  target: ASTNode,
  threshold?: ComparePoint,
): ExplodeNode {
  const node: ExplodeNode = { type: 'Explode', variant, target };
  if (threshold) node.threshold = threshold;
  return node;
}

function reroll(once: boolean, condition: ComparePoint, target: ASTNode): RerollNode {
  return { type: 'Reroll', once, condition, target };
}

function successCount(
  target: ASTNode,
  threshold: ComparePoint,
  failThreshold?: ComparePoint,
): SuccessCountNode {
  const node: SuccessCountNode = { type: 'SuccessCount', target, threshold };
  if (failThreshold) node.failThreshold = failThreshold;
  return node;
}

function cp(operator: ComparePoint['operator'], value: ASTNode): ComparePoint {
  return { operator, value };
}

function versus(roll: ASTNode, dc: ASTNode): VersusNode {
  return { type: 'Versus', roll, dc };
}

function functionCall(name: string, args: ASTNode[]): FunctionCallNode {
  return { type: 'FunctionCall', name, args };
}

function grouped(expression: ASTNode): GroupedNode {
  return { type: 'Grouped', expression };
}

function group(expressions: ASTNode[]): GroupNode {
  return { type: 'Group', expressions };
}

function variable(name: string): VariableNode {
  return { type: 'Variable', name };
}

function sort(order: SortNode['order'], target: ASTNode): SortNode {
  return { type: 'Sort', order, target };
}

function critThreshold(
  successThresholds: CritThreshold[],
  failThresholds: CritThreshold[],
  target: ASTNode,
): CritThresholdNode {
  return { type: 'CritThreshold', successThresholds, failThresholds, target };
}

describe('Parser', () => {
  describe('literal parsing', () => {
    it('should parse integer literals', () => {
      expect(parseAst('42')).toEqual(literal(42));
    });

    it('should parse decimal literals', () => {
      expect(parseAst('3.14')).toEqual(literal(3.14));
    });

    it('should parse zero', () => {
      expect(parseAst('0')).toEqual(literal(0));
    });

    it('should parse large numbers', () => {
      expect(parseAst('1000000')).toEqual(literal(1000000));
    });
  });

  describe('unary minus', () => {
    it('should parse negative literal', () => {
      expect(parseAst('-5')).toEqual(unary(literal(5)));
    });

    it('should parse negative dice', () => {
      expect(parseAst('-d4')).toEqual(unary(dice(literal(1), literal(4))));
    });

    it('should parse negative parenthesized expression', () => {
      expect(parseAst('-(1+2)')).toEqual(unary(grouped(binary('+', literal(1), literal(2)))));
    });

    it('should parse double negative', () => {
      expect(parseAst('--5')).toEqual(unary(unary(literal(5))));
    });
  });

  describe('basic dice', () => {
    it('should parse prefix dice (d20 → 1d20)', () => {
      expect(parseAst('d20')).toEqual(dice(literal(1), literal(20)));
    });

    it('should parse infix dice', () => {
      expect(parseAst('2d6')).toEqual(dice(literal(2), literal(6)));
    });

    it('should parse 4d6', () => {
      expect(parseAst('4d6')).toEqual(dice(literal(4), literal(6)));
    });

    it('should parse single-sided die', () => {
      expect(parseAst('1d1')).toEqual(dice(literal(1), literal(1)));
    });

    it('should parse zero count dice', () => {
      expect(parseAst('0d6')).toEqual(dice(literal(0), literal(6)));
    });
  });

  describe('percentile dice (d%)', () => {
    it('should parse prefix d% as 1d100', () => {
      expect(parseAst('d%')).toEqual(dice(literal(1), literal(100)));
    });

    it('should parse infix 2d%', () => {
      expect(parseAst('2d%')).toEqual(dice(literal(2), literal(100)));
    });

    it('should parse d%+5', () => {
      expect(parseAst('d%+5')).toEqual(binary('+', dice(literal(1), literal(100)), literal(5)));
    });

    it('should parse computed count (2)d%', () => {
      expect(parseAst('(2)d%')).toEqual(dice(grouped(literal(2)), literal(100)));
    });

    it('should parse 2d%kh1 with keep modifier', () => {
      expect(parseAst('2d%kh1')).toEqual(
        modifier('keep', 'highest', literal(1), dice(literal(2), literal(100))),
      );
    });

    it('should produce same AST as d100', () => {
      expect(parseAst('d%')).toEqual(parseAst('d100'));
    });

    it('should be case-insensitive (D%)', () => {
      expect(parseAst('D%')).toEqual(dice(literal(1), literal(100)));
    });

    it('should not affect modulo operator', () => {
      expect(parseAst('10%3')).toEqual(binary('%', literal(10), literal(3)));
    });

    it('should throw on d%%', () => {
      expect(() => parseAst('d%%')).toThrow(ParseError);
    });

    it('should throw on d % 3 (whitespace breaks token)', () => {
      expect(() => parseAst('d % 3')).toThrow(ParseError);
    });
  });

  describe('fate dice (dF)', () => {
    it('should parse prefix dF as FateDice(1)', () => {
      expect(parseAst('dF')).toEqual(fateDice(literal(1)));
    });

    it('should parse infix 4dF', () => {
      expect(parseAst('4dF')).toEqual(fateDice(literal(4)));
    });

    it('should parse computed count (2+2)dF', () => {
      expect(parseAst('(2+2)dF')).toEqual(fateDice(grouped(binary('+', literal(2), literal(2)))));
    });

    it('should parse dF+5 with trailing arithmetic', () => {
      expect(parseAst('dF+5')).toEqual(binary('+', fateDice(literal(1)), literal(5)));
    });

    it('should parse 4dFkh2 with keep modifier', () => {
      expect(parseAst('4dFkh2')).toEqual(
        modifier('keep', 'highest', literal(2), fateDice(literal(4))),
      );
    });

    it('should parse 4dFdl1 with drop modifier', () => {
      expect(parseAst('4dFdl1')).toEqual(
        modifier('drop', 'lowest', literal(1), fateDice(literal(4))),
      );
    });

    it('should parse -dF as unary minus over fate dice', () => {
      expect(parseAst('-dF')).toEqual(unary(fateDice(literal(1))));
    });

    it('should parse (-1)dF with unary count (evaluator rejects at runtime)', () => {
      expect(parseAst('(-1)dF')).toEqual(fateDice(grouped(unary(literal(1)))));
    });

    it('should be case-insensitive (DF, Df, df)', () => {
      expect(parseAst('DF')).toEqual(fateDice(literal(1)));
      expect(parseAst('Df')).toEqual(fateDice(literal(1)));
      expect(parseAst('df')).toEqual(fateDice(literal(1)));
    });
  });

  describe('arithmetic precedence', () => {
    it('should parse addition', () => {
      expect(parseAst('1+2')).toEqual(binary('+', literal(1), literal(2)));
    });

    it('should parse subtraction', () => {
      expect(parseAst('5-3')).toEqual(binary('-', literal(5), literal(3)));
    });

    it('should parse multiplication', () => {
      expect(parseAst('2*3')).toEqual(binary('*', literal(2), literal(3)));
    });

    it('should parse division', () => {
      expect(parseAst('10/2')).toEqual(binary('/', literal(10), literal(2)));
    });

    it('should parse modulo', () => {
      expect(parseAst('10%3')).toEqual(binary('%', literal(10), literal(3)));
    });

    it('should respect precedence: 1+2*3 = 1+(2*3)', () => {
      expect(parseAst('1+2*3')).toEqual(
        binary('+', literal(1), binary('*', literal(2), literal(3))),
      );
    });

    it('should respect precedence: 1*2+3 = (1*2)+3', () => {
      expect(parseAst('1*2+3')).toEqual(
        binary('+', binary('*', literal(1), literal(2)), literal(3)),
      );
    });

    it('should be left-associative: 1-2-3 = (1-2)-3', () => {
      expect(parseAst('1-2-3')).toEqual(
        binary('-', binary('-', literal(1), literal(2)), literal(3)),
      );
    });

    it('should be left-associative: 10/2/5 = (10/2)/5', () => {
      expect(parseAst('10/2/5')).toEqual(
        binary('/', binary('/', literal(10), literal(2)), literal(5)),
      );
    });
  });

  describe('power operator', () => {
    it('should parse ** as power', () => {
      expect(parseAst('2**3')).toEqual(binary('**', literal(2), literal(3)));
    });

    it('should parse ^ as power', () => {
      expect(parseAst('2^3')).toEqual(binary('**', literal(2), literal(3)));
    });

    it('should be right-associative: 2**3**2 = 2**(3**2)', () => {
      // This evaluates to 2^9 = 512, not (2^3)^2 = 64
      expect(parseAst('2**3**2')).toEqual(
        binary('**', literal(2), binary('**', literal(3), literal(2))),
      );
    });

    it('should have higher precedence than multiplication', () => {
      // 2*3**2 = 2*(3^2) = 2*9 = 18
      expect(parseAst('2*3**2')).toEqual(
        binary('*', literal(2), binary('**', literal(3), literal(2))),
      );
    });
  });

  describe('parentheses', () => {
    it('should override precedence: (1+2)*3', () => {
      expect(parseAst('(1+2)*3')).toEqual(
        binary('*', grouped(binary('+', literal(1), literal(2))), literal(3)),
      );
    });

    it('should handle nested parentheses', () => {
      expect(parseAst('((1+2))')).toEqual(grouped(grouped(binary('+', literal(1), literal(2)))));
    });

    it('should handle computed dice count: (1+1)d6', () => {
      expect(parseAst('(1+1)d6')).toEqual(
        dice(grouped(binary('+', literal(1), literal(1))), literal(6)),
      );
    });

    it('should handle computed dice sides: 1d(3*2)', () => {
      expect(parseAst('1d(3*2)')).toEqual(
        dice(literal(1), grouped(binary('*', literal(3), literal(2)))),
      );
    });

    it('should handle both computed: (1+1)d(3*2)', () => {
      expect(parseAst('(1+1)d(3*2)')).toEqual(
        dice(
          grouped(binary('+', literal(1), literal(1))),
          grouped(binary('*', literal(3), literal(2))),
        ),
      );
    });
  });

  describe('keep/drop modifiers', () => {
    it('should parse keep highest: 4d6kh3', () => {
      expect(parseAst('4d6kh3')).toEqual(
        modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
      );
    });

    it('should parse keep lowest: 2d20kl1', () => {
      expect(parseAst('2d20kl1')).toEqual(
        modifier('keep', 'lowest', literal(1), dice(literal(2), literal(20))),
      );
    });

    it('should parse drop highest: 4d6dh1', () => {
      expect(parseAst('4d6dh1')).toEqual(
        modifier('drop', 'highest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should parse drop lowest: 4d6dl1', () => {
      expect(parseAst('4d6dl1')).toEqual(
        modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should parse k as shorthand for kh: 4d6k3', () => {
      expect(parseAst('4d6k3')).toEqual(
        modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
      );
    });

    it('should handle advantage: 2d20kh1', () => {
      expect(parseAst('2d20kh1')).toEqual(
        modifier('keep', 'highest', literal(1), dice(literal(2), literal(20))),
      );
    });

    it('should handle disadvantage: 2d20kl1', () => {
      expect(parseAst('2d20kl1')).toEqual(
        modifier('keep', 'lowest', literal(1), dice(literal(2), literal(20))),
      );
    });

    it('should default implicit modifier count to 1: 4d6kh', () => {
      expect(parseAst('4d6kh')).toEqual(
        modifier('keep', 'highest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should default implicit kl count to 1: 4d6kl', () => {
      expect(parseAst('4d6kl')).toEqual(
        modifier('keep', 'lowest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should default implicit dl count to 1: 4d6dl', () => {
      expect(parseAst('4d6dl')).toEqual(
        modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
      );
    });

    it('should default implicit dh count to 1: 4d6dh', () => {
      expect(parseAst('4d6dh')).toEqual(
        modifier('drop', 'highest', literal(1), dice(literal(4), literal(6))),
      );
    });
  });

  describe('dice + arithmetic', () => {
    it('should parse 1d20+5', () => {
      expect(parseAst('1d20+5')).toEqual(binary('+', dice(literal(1), literal(20)), literal(5)));
    });

    it('should parse 2d6+1d4', () => {
      expect(parseAst('2d6+1d4')).toEqual(
        binary('+', dice(literal(2), literal(6)), dice(literal(1), literal(4))),
      );
    });

    it('should respect dice precedence over arithmetic', () => {
      // 2d6+3 = (2d6)+3, not 2d(6+3)
      expect(parseAst('2d6+3')).toEqual(binary('+', dice(literal(2), literal(6)), literal(3)));
    });

    it('should parse complex: (1d20+5)*2', () => {
      expect(parseAst('(1d20+5)*2')).toEqual(
        binary('*', grouped(binary('+', dice(literal(1), literal(20)), literal(5))), literal(2)),
      );
    });
  });

  describe('modifier + arithmetic', () => {
    it('should parse 4d6kh3+5', () => {
      // Modifier applies only to dice, then addition
      expect(parseAst('4d6kh3+5')).toEqual(
        binary(
          '+',
          modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
          literal(5),
        ),
      );
    });

    it('should parse 2d20kh1+5 (advantage + modifier)', () => {
      expect(parseAst('2d20kh1+5')).toEqual(
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
      expect(parseAst('4d6dl1+2d8kh1*2')).toEqual(
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
      expect(parseAst('d20+d6')).toEqual(
        binary('+', dice(literal(1), literal(20)), dice(literal(1), literal(6))),
      );
    });

    it('should parse -1d4+5', () => {
      expect(parseAst('-1d4+5')).toEqual(
        binary('+', unary(dice(literal(1), literal(4))), literal(5)),
      );
    });
  });

  describe('error handling', () => {
    it('should throw on empty input', () => {
      expect(() => parseAst('')).toThrow(ParseError);
    });

    it('should throw on unexpected operator at start', () => {
      expect(() => parseAst('+')).toThrow(ParseError);
      expect(() => parseAst('*')).toThrow(ParseError);
    });

    it('should throw on missing closing parenthesis', () => {
      expect(() => parseAst('(1+2')).toThrow(ParseError);
    });

    it('should throw on extra closing parenthesis', () => {
      expect(() => parseAst('1+2)')).toThrow(ParseError);
    });

    it('should throw on trailing operator', () => {
      expect(() => parseAst('1+')).toThrow(ParseError);
    });

    it('should include position in error', () => {
      try {
        parseAst('1+');
      } catch (e) {
        expect(e).toBeInstanceOf(ParseError);
        expect((e as ParseError).position).toBeGreaterThanOrEqual(0);
      }
    });

    it('should throw on modifier without target', () => {
      expect(() => parseAst('kh3')).toThrow(ParseError);
    });

    it('should name the expected symbol and end of input in expect() errors', () => {
      expect(() => parseAst('((1d6')).toThrow(`Expected ')' but got end of input`);
      expect(() => parseAst('floor 2')).toThrow(`Expected '(' but got '2'`);
    });

    it('should throw a typed ParseError on excessive nesting depth', () => {
      const deep = `${'('.repeat(20_000)}1d6${')'.repeat(20_000)}`;
      expect(() => parseAst(deep)).toThrow(ParseError);
      expect(() => parseAst(deep)).toThrow('maximum depth');
    });

    it('should accept reasonable nesting depth', () => {
      const nested = `${'('.repeat(50)}1d6${')'.repeat(50)}`;
      expect(() => parseAst(nested)).not.toThrow();
    });
  });

  describe('ambiguous bare dice chains', () => {
    it('should reject 4d6d1 with a drop/parenthesize hint', () => {
      expect(() => parseAst('4d6d1')).toThrow(ParseError);
      expect(() => parseAst('4d6d1')).toThrow('Ambiguous dice chain');
    });

    it('should reject dice chains onto percentile and Fate dice', () => {
      expect(() => parseAst('2d6d%')).toThrow('Ambiguous dice chain');
      expect(() => parseAst('2d6dF')).toThrow('Ambiguous dice chain');
    });

    it('should reject chains after modifiers and sorts', () => {
      // Implicit kh count, then `d6` would chain onto the pool.
      // (`4d6kh3d1` is different: the `3d1` binds as the kh count meta-dice.)
      expect(() => parseAst('4d6kh d6')).toThrow('Ambiguous dice chain');
      expect(() => parseAst('4d6s d6')).toThrow('Ambiguous dice chain');
    });

    it('should keep parenthesized nested dice legal', () => {
      expect(parseAst('(4d6)d1')).toEqual(dice(grouped(dice(literal(4), literal(6))), literal(1)));
    });

    it('should keep computed counts and dice-as-sides legal', () => {
      expect(parseAst('(1+1)d6')).toEqual(
        dice(grouped(binary('+', literal(1), literal(1))), literal(6)),
      );
      // Sides position is not ambiguous — only the count side chains.
      expect(parseAst('d(d6)')).toEqual(dice(literal(1), grouped(dice(literal(1), literal(6)))));
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace', () => {
      expect(parseAst('2 d 20 + 5')).toEqual(
        binary('+', dice(literal(2), literal(20)), literal(5)),
      );
    });

    it('should handle multiple dice expressions', () => {
      expect(parseAst('1d6+2d6+3d6')).toEqual(
        binary(
          '+',
          binary('+', dice(literal(1), literal(6)), dice(literal(2), literal(6))),
          dice(literal(3), literal(6)),
        ),
      );
    });

    it('should handle deeply nested expression', () => {
      expect(parseAst('(((1)))')).toEqual(grouped(grouped(grouped(literal(1)))));
    });

    it('should handle prefix d with arithmetic', () => {
      // d6+d8 = (d6)+(d8)
      expect(parseAst('d6+d8')).toEqual(
        binary('+', dice(literal(1), literal(6)), dice(literal(1), literal(8))),
      );
    });
  });

  describe('modifier chaining', () => {
    it('should parse 4d6dl1kh3 as (4d6dl1)kh3', () => {
      // Chained modifiers: drop lowest 1, then keep highest 3
      expect(parseAst('4d6dl1kh3')).toEqual(
        modifier(
          'keep',
          'highest',
          literal(3),
          modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
        ),
      );
    });

    it('should parse 4d6kh3dl1 (reverse order)', () => {
      // Reverse order: keep highest 3, then drop lowest 1
      expect(parseAst('4d6kh3dl1')).toEqual(
        modifier(
          'drop',
          'lowest',
          literal(1),
          modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
        ),
      );
    });

    it('should parse multiple same modifiers: 4d6dl1dl1', () => {
      // Chaining same modifier type (semantically odd but should parse)
      expect(parseAst('4d6dl1dl1')).toEqual(
        modifier(
          'drop',
          'lowest',
          literal(1),
          modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
        ),
      );
    });

    it('should allow computed count in chain: 4d6kh(1+2)', () => {
      // Computed counts should still work with the fix
      expect(parseAst('4d6kh(1+2)')).toEqual(
        modifier(
          'keep',
          'highest',
          grouped(binary('+', literal(1), literal(2))),
          dice(literal(4), literal(6)),
        ),
      );
    });

    it('should parse triple chain: 4d6dl1kh3dh1', () => {
      // Three modifiers in sequence
      expect(parseAst('4d6dl1kh3dh1')).toEqual(
        modifier(
          'drop',
          'highest',
          literal(1),
          modifier(
            'keep',
            'highest',
            literal(3),
            modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6))),
          ),
        ),
      );
    });
  });

  describe('node spans', () => {
    it('sets start/end on literals and dice', () => {
      const ast = parse('12d20');
      expect(ast).toMatchObject({ type: 'Dice', start: 0, end: 5 });
      const node = ast as DiceNode;
      expect(node.count).toMatchObject({ start: 0, end: 2 });
      expect(node.sides).toMatchObject({ start: 3, end: 5 });
    });

    it('binary ops span both operands, ignoring whitespace inside tokens only', () => {
      const ast = parse('2d6 + 10');
      expect(ast).toMatchObject({ type: 'BinaryOp', start: 0, end: 8 });
      const node = ast as BinaryOpNode;
      expect(node.left).toMatchObject({ start: 0, end: 3 });
      expect(node.right).toMatchObject({ start: 6, end: 8 });
    });

    it('grouped spans include the parentheses', () => {
      const ast = parse('(1d6+2)*3') as BinaryOpNode;
      expect(ast.left).toMatchObject({ type: 'Grouped', start: 0, end: 7 });
    });

    it('modifiers span target through count; implicit counts are zero-width', () => {
      expect(parse('4d6kh3')).toMatchObject({ type: 'Modifier', start: 0, end: 6 });
      const implicit = parse('4d6kh') as ModifierNode;
      expect(implicit).toMatchObject({ start: 0, end: 5 });
      expect(implicit.count).toMatchObject({ start: 3, end: 3 });
    });

    it('postfix wrappers span through their thresholds', () => {
      expect(parse('1d6!>=5')).toMatchObject({ type: 'Explode', start: 0, end: 7 });
      expect(parse('2d6r<2')).toMatchObject({ type: 'Reroll', start: 0, end: 6 });
      expect(parse('10d10>=6f1')).toMatchObject({ type: 'SuccessCount', start: 0, end: 10 });
      expect(parse('1d20cs>18')).toMatchObject({ type: 'CritThreshold', start: 0, end: 9 });
      expect(parse('4d6sd')).toMatchObject({ type: 'Sort', start: 0, end: 5 });
    });

    it('chained crit thresholds extend the collapsed node end', () => {
      expect(parse('1d20cs>19cs=1')).toMatchObject({ type: 'CritThreshold', start: 0, end: 13 });
    });

    it('groups span the braces, versus spans both sides', () => {
      expect(parse('{1d6, 1d8}')).toMatchObject({ type: 'Group', start: 0, end: 10 });
      expect(parse('1d20+5 vs 15')).toMatchObject({ type: 'Versus', start: 0, end: 12 });
    });

    it('functions span name through closing paren; variables span the reference', () => {
      expect(parse('floor(1d6/2)')).toMatchObject({ type: 'FunctionCall', start: 0, end: 12 });
      expect(parse('@{a b}')).toMatchObject({ type: 'Variable', start: 0, end: 6 });
    });

    it('prefix and percent/Fate dice carry token-anchored spans', () => {
      expect(parse('d20')).toMatchObject({ type: 'Dice', start: 0, end: 3 });
      expect(parse('2d%')).toMatchObject({ type: 'Dice', start: 0, end: 3 });
      expect(parse('4dF')).toMatchObject({ type: 'FateDice', start: 0, end: 3 });
      expect(parse('-1d4')).toMatchObject({ type: 'UnaryOp', start: 0, end: 4 });
    });
  });

  describe('Parser class', () => {
    it('should allow direct usage with tokens', () => {
      const tokens = lex('2d6');
      const parser = new Parser(tokens);
      const ast = parser.parse();

      expect(stripSpans(ast)).toEqual(dice(literal(2), literal(6)));
    });
  });

  describe('exploding dice', () => {
    it('should parse standard explode: 1d6!', () => {
      expect(parseAst('1d6!')).toEqual(explode('standard', dice(literal(1), literal(6))));
    });

    it('should parse compound explode: 1d6!!', () => {
      expect(parseAst('1d6!!')).toEqual(explode('compound', dice(literal(1), literal(6))));
    });

    it('should parse penetrating explode: 1d6!p', () => {
      expect(parseAst('1d6!p')).toEqual(explode('penetrating', dice(literal(1), literal(6))));
    });

    it('should parse explode with greater-than threshold: 1d6!>5', () => {
      expect(parseAst('1d6!>5')).toEqual(
        explode('standard', dice(literal(1), literal(6)), cp('>', literal(5))),
      );
    });

    it('should parse compound explode with greater-equal threshold: 1d6!!>=3', () => {
      expect(parseAst('1d6!!>=3')).toEqual(
        explode('compound', dice(literal(1), literal(6)), cp('>=', literal(3))),
      );
    });

    it('should parse penetrating explode with threshold: 1d6!p>3', () => {
      expect(parseAst('1d6!p>3')).toEqual(
        explode('penetrating', dice(literal(1), literal(6)), cp('>', literal(3))),
      );
    });

    it('should parse explode with equals threshold: 1d6!=6', () => {
      expect(parseAst('1d6!=6')).toEqual(
        explode('standard', dice(literal(1), literal(6)), cp('=', literal(6))),
      );
    });

    it('should parse explode with less-than threshold: 1d6!<2', () => {
      expect(parseAst('1d6!<2')).toEqual(
        explode('standard', dice(literal(1), literal(6)), cp('<', literal(2))),
      );
    });

    it('should reject nested explode (1d6!!!): compound then standard', () => {
      // Lexer maximal-munch: `!!!` → EXPLODE_COMPOUND + EXPLODE. The second
      // EXPLODE targets an ExplodeNode, which parseExplode rejects.
      expect(() => parseAst('1d6!!!')).toThrow(ParseError);
      try {
        parseAst('1d6!!!');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
      }
    });

    it('should parse explode-then-keep: 4d6!kh3', () => {
      expect(parseAst('4d6!kh3')).toEqual(
        modifier('keep', 'highest', literal(3), explode('standard', dice(literal(4), literal(6)))),
      );
    });

    it('should parse keep-then-explode: 4d6kh3!', () => {
      expect(parseAst('4d6kh3!')).toEqual(
        explode('standard', modifier('keep', 'highest', literal(3), dice(literal(4), literal(6)))),
      );
    });

    it('should parse explode and keep inside binary op: 4d6!kh3+5', () => {
      expect(parseAst('4d6!kh3+5')).toEqual(
        binary(
          '+',
          modifier(
            'keep',
            'highest',
            literal(3),
            explode('standard', dice(literal(4), literal(6))),
          ),
          literal(5),
        ),
      );
    });

    it('should parse prefix-dice explode: d6!', () => {
      expect(parseAst('d6!')).toEqual(explode('standard', dice(literal(1), literal(6))));
    });

    it('should parse percentile explode: 1d%!', () => {
      expect(parseAst('1d%!')).toEqual(explode('standard', dice(literal(1), literal(100))));
    });

    it('should parse explode with computed threshold: 1d6!>(1+2)', () => {
      expect(parseAst('1d6!>(1+2)')).toEqual(
        explode(
          'standard',
          dice(literal(1), literal(6)),
          cp('>', grouped(binary('+', literal(1), literal(2)))),
        ),
      );
    });

    it('should reject d6!d20 as an ambiguous bare dice chain', () => {
      // EXPLODE (BP.MODIFIER=35) binds to `d6` first, then the second DICE
      // token would bind the exploded pool as an infix count — the `4d6d1`
      // trap in another costume. Parenthesized nesting stays legal.
      expect(() => parseAst('d6!d20')).toThrow('Ambiguous dice chain');
      expect(parseAst('(d6!)d20')).toEqual(
        dice(grouped(explode('standard', dice(literal(1), literal(6)))), literal(20)),
      );
    });
  });

  describe('reroll mechanics', () => {
    it('should parse recursive reroll: 2d6r<2', () => {
      expect(parseAst('2d6r<2')).toEqual(
        reroll(false, cp('<', literal(2)), dice(literal(2), literal(6))),
      );
    });

    it('should parse reroll-once: 2d6ro<3', () => {
      expect(parseAst('2d6ro<3')).toEqual(
        reroll(true, cp('<', literal(3)), dice(literal(2), literal(6))),
      );
    });

    it('should parse reroll with equals: 2d6r=1', () => {
      expect(parseAst('2d6r=1')).toEqual(
        reroll(false, cp('=', literal(1)), dice(literal(2), literal(6))),
      );
    });

    it('should parse reroll-once with greater-equal: 2d6ro>=5', () => {
      expect(parseAst('2d6ro>=5')).toEqual(
        reroll(true, cp('>=', literal(5)), dice(literal(2), literal(6))),
      );
    });

    it('should parse Fate dice reroll with negative compare value: 4dFr=-1', () => {
      expect(parseAst('4dFr=-1')).toEqual(
        reroll(false, cp('=', unary(literal(1))), fateDice(literal(4))),
      );
    });

    it('should parse reroll with computed threshold: 2d6r<(1+1)', () => {
      expect(parseAst('2d6r<(1+1)')).toEqual(
        reroll(
          false,
          cp('<', grouped(binary('+', literal(1), literal(1)))),
          dice(literal(2), literal(6)),
        ),
      );
    });

    it('should reject bare r without comparison', () => {
      expect(() => parseAst('2d6r')).toThrow(ParseError);
      try {
        parseAst('2d6r');
      } catch (err) {
        expect((err as ParseError).code).toBe('EXPECTED_TOKEN');
      }
    });

    it('should reject bare ro without comparison', () => {
      expect(() => parseAst('2d6ro')).toThrow(ParseError);
      try {
        parseAst('2d6ro');
      } catch (err) {
        expect((err as ParseError).code).toBe('EXPECTED_TOKEN');
      }
    });

    it('should parse reroll-then-keep: 2d6r<2kh1', () => {
      expect(parseAst('2d6r<2kh1')).toEqual(
        modifier(
          'keep',
          'highest',
          literal(1),
          reroll(false, cp('<', literal(2)), dice(literal(2), literal(6))),
        ),
      );
    });

    it('should parse keep-then-reroll: 2d6kh1r<2', () => {
      expect(parseAst('2d6kh1r<2')).toEqual(
        reroll(
          false,
          cp('<', literal(2)),
          modifier('keep', 'highest', literal(1), dice(literal(2), literal(6))),
        ),
      );
    });

    it('should parse chained reroll-once then recursive: 2d6ro<2r<3', () => {
      expect(parseAst('2d6ro<2r<3')).toEqual(
        reroll(
          false,
          cp('<', literal(3)),
          reroll(true, cp('<', literal(2)), dice(literal(2), literal(6))),
        ),
      );
    });

    it('should parse reroll-then-explode: 2d6r<2!', () => {
      expect(parseAst('2d6r<2!')).toEqual(
        explode('standard', reroll(false, cp('<', literal(2)), dice(literal(2), literal(6)))),
      );
    });

    it('should parse reroll in binary expression: 2d6r<2+5', () => {
      expect(parseAst('2d6r<2+5')).toEqual(
        binary('+', reroll(false, cp('<', literal(2)), dice(literal(2), literal(6))), literal(5)),
      );
    });
  });

  describe('success counting', () => {
    it('should parse 10d10>=6', () => {
      expect(parseAst('10d10>=6')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6))),
      );
    });

    it('should parse all comparison operators', () => {
      expect(parseAst('10d10>5')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>', literal(5))),
      );
      expect(parseAst('10d10<3')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('<', literal(3))),
      );
      expect(parseAst('10d10<=2')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('<=', literal(2))),
      );
      expect(parseAst('10d10=1')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('=', literal(1))),
      );
    });

    it('should parse with fail threshold: 10d10>=6f1', () => {
      expect(parseAst('10d10>=6f1')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('=', literal(1))),
      );
    });

    it('should parse with negative fail value: 10d10>=6f-1', () => {
      expect(parseAst('10d10>=6f-1')).toEqual(
        successCount(
          dice(literal(10), literal(10)),
          cp('>=', literal(6)),
          cp('=', unary(literal(1))),
        ),
      );
    });

    it('should parse fail threshold with <: 10d10>=6f<2', () => {
      expect(parseAst('10d10>=6f<2')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('<', literal(2))),
      );
    });

    it('should parse fail threshold with <=: 10d10>=6f<=2', () => {
      expect(parseAst('10d10>=6f<=2')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('<=', literal(2))),
      );
    });

    it('should parse fail threshold with >: 10d10>=6f>8', () => {
      expect(parseAst('10d10>=6f>8')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('>', literal(8))),
      );
    });

    it('should parse fail threshold with >=: 10d10>=6f>=8', () => {
      expect(parseAst('10d10>=6f>=8')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('>=', literal(8))),
      );
    });

    it('should parse fail threshold with explicit =: 10d10>=6f=1', () => {
      expect(parseAst('10d10>=6f=1')).toEqual(
        successCount(dice(literal(10), literal(10)), cp('>=', literal(6)), cp('=', literal(1))),
      );
    });

    it('should parse Fate success with <: 4dF>=0f<0', () => {
      expect(parseAst('4dF>=0f<0')).toEqual(
        successCount(fateDice(literal(4)), cp('>=', literal(0)), cp('<', literal(0))),
      );
    });

    it('should reject outer + on SuccessCount: 5d6>=5+3', () => {
      expect(() => parseAst('5d6>=5+3')).toThrow(ParseError);
      try {
        parseAst('5d6>=5+3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject outer * on SuccessCount: 5d6>=5 * 2', () => {
      expect(() => parseAst('5d6>=5 * 2')).toThrow(ParseError);
      try {
        parseAst('5d6>=5 * 2');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should wrap keep-highest-then-count: 4d6kh3>=5', () => {
      expect(parseAst('4d6kh3>=5')).toEqual(
        successCount(
          modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
          cp('>=', literal(5)),
        ),
      );
    });

    it('should bind compare to explode threshold, not success count: 10d10!>=6', () => {
      // ? Explode greedily consumes a trailing ComparePoint as its own
      //   threshold, so `10d10!>=6` means "explode on >=6", not "explode
      //   then count successes". Disambiguate with parentheses.
      expect(parseAst('10d10!>=6')).toEqual(
        explode('standard', dice(literal(10), literal(10)), cp('>=', literal(6))),
      );
    });

    it('should wrap parenthesized explode then count: (10d10!)>=6', () => {
      expect(parseAst('(10d10!)>=6')).toEqual(
        successCount(
          grouped(explode('standard', dice(literal(10), literal(10)))),
          cp('>=', literal(6)),
        ),
      );
    });

    it('should wrap explicit-threshold explode then count: 10d10!=10>=6', () => {
      expect(parseAst('10d10!=10>=6')).toEqual(
        successCount(
          explode('standard', dice(literal(10), literal(10)), cp('=', literal(10))),
          cp('>=', literal(6)),
        ),
      );
    });

    it('should wrap reroll-then-count: 4d6r<3>=5', () => {
      expect(parseAst('4d6r<3>=5')).toEqual(
        successCount(
          reroll(false, cp('<', literal(3)), dice(literal(4), literal(6))),
          cp('>=', literal(5)),
        ),
      );
    });

    it('should parse Fate success with fail: 4dF>=1f-1', () => {
      expect(parseAst('4dF>=1f-1')).toEqual(
        successCount(fateDice(literal(4)), cp('>=', literal(1)), cp('=', unary(literal(1)))),
      );
    });

    it('should parse with computed threshold: 2d6>=(1+4)', () => {
      expect(parseAst('2d6>=(1+4)')).toEqual(
        successCount(
          dice(literal(2), literal(6)),
          cp('>=', grouped(binary('+', literal(1), literal(4)))),
        ),
      );
    });

    it('should reject modifier after success count: 10d10>=6kh5', () => {
      expect(() => parseAst('10d10>=6kh5')).toThrow(ParseError);
      try {
        parseAst('10d10>=6kh5');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject explode after success count: 10d10>=6!', () => {
      expect(() => parseAst('10d10>=6!')).toThrow(ParseError);
      try {
        parseAst('10d10>=6!');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject reroll after success count: 10d10>=6r<3', () => {
      expect(() => parseAst('10d10>=6r<3')).toThrow(ParseError);
      try {
        parseAst('10d10>=6r<3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject chained success count: 10d10>=6>=5', () => {
      expect(() => parseAst('10d10>=6>=5')).toThrow(ParseError);
      try {
        parseAst('10d10>=6>=5');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject non-dice target: 1>=3', () => {
      expect(() => parseAst('1>=3')).toThrow(ParseError);
      try {
        parseAst('1>=3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject parenthesized non-dice target: (1+2)>=3', () => {
      expect(() => parseAst('(1+2)>=3')).toThrow(ParseError);
      try {
        parseAst('(1+2)>=3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject non-pool arithmetic target: (1d6+2)>=3', () => {
      expect(() => parseAst('(1d6+2)>=3')).toThrow(ParseError);
      try {
        parseAst('(1d6+2)>=3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject non-pool multiplication target: (1d6*2)>=10', () => {
      expect(() => parseAst('(1d6*2)>=10')).toThrow(ParseError);
      try {
        parseAst('(1d6*2)>=10');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject versus inside success-count target: (1d20 vs 15)>=1', () => {
      expect(() => parseAst('(1d20 vs 15)>=1')).toThrow(ParseError);
      try {
        parseAst('(1d20 vs 15)>=1');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject XdY+N>T (BP keeps arithmetic ahead of compare): 5d6+2>4', () => {
      expect(() => parseAst('5d6+2>4')).toThrow(ParseError);
      try {
        parseAst('5d6+2>4');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject XdY+N>=T: 5d6+2>=4', () => {
      expect(() => parseAst('5d6+2>=4')).toThrow(ParseError);
      try {
        parseAst('5d6+2>=4');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject binary wrapping on success count: 2 * (1d6>=5)', () => {
      expect(() => parseAst('2 * (1d6>=5)')).toThrow(ParseError);
      try {
        parseAst('2 * (1d6>=5)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject parenthesized + on success count: (1d6>=5) + 3', () => {
      expect(() => parseAst('(1d6>=5) + 3')).toThrow(ParseError);
      try {
        parseAst('(1d6>=5) + 3');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject success count inside function arg: max(1d6>=5, 2)', () => {
      expect(() => parseAst('max(1d6>=5, 2)')).toThrow(ParseError);
      try {
        parseAst('max(1d6>=5, 2)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject success count as vs roll side: 10d10>=6 vs 8', () => {
      expect(() => parseAst('10d10>=6 vs 8')).toThrow(ParseError);
      try {
        parseAst('10d10>=6 vs 8');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject unary minus on success count: -(1d6>=5)', () => {
      expect(() => parseAst('-(1d6>=5)')).toThrow(ParseError);
      try {
        parseAst('-(1d6>=5)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should still parse plain pool success count: 5d6>=5', () => {
      expect(parseAst('5d6>=5')).toEqual(
        successCount(dice(literal(5), literal(6)), cp('>=', literal(5))),
      );
    });
  });

  describe('success count rejected in meta-expression positions', () => {
    // SuccessCount is terminal at every meta-expression parse site: modifier
    // count, dice sides/count (infix + prefix), Fate/percent dice count,
    // SuccessCount threshold value, bare `fN` value, and compare-point values
    // (Explode / Reroll). Wrapping in parens used to bypass the #51 guards.

    it('should reject SuccessCount as keep-modifier count: 4d6kh(3d6>=3)', () => {
      expect(() => parseAst('4d6kh(3d6>=3)')).toThrow(ParseError);
      try {
        parseAst('4d6kh(3d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as prefix dice sides: d(1d6>=3)', () => {
      expect(() => parseAst('d(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('d(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as infix dice sides: 4d(1d6>=3)', () => {
      expect(() => parseAst('4d(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('4d(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as infix dice count: (1d6>=3)d6', () => {
      expect(() => parseAst('(1d6>=3)d6')).toThrow(ParseError);
      try {
        parseAst('(1d6>=3)d6');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as percentile dice count: (1d6>=3)d%', () => {
      expect(() => parseAst('(1d6>=3)d%')).toThrow(ParseError);
      try {
        parseAst('(1d6>=3)d%');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as Fate dice count: (1d6>=3)dF', () => {
      expect(() => parseAst('(1d6>=3)dF')).toThrow(ParseError);
      try {
        parseAst('(1d6>=3)dF');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as threshold value: 5d10>=(1d6>=3)', () => {
      expect(() => parseAst('5d10>=(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('5d10>=(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as bare fN value: 5d10>=6f(1d6>=3)', () => {
      expect(() => parseAst('5d10>=6f(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('5d10>=6f(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as explode compare-point value: 1d6!>=(1d6>=3)', () => {
      expect(() => parseAst('1d6!>=(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('1d6!>=(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });

    it('should reject SuccessCount as reroll compare-point value: 1d6r<=(1d6>=3)', () => {
      expect(() => parseAst('1d6r<=(1d6>=3)')).toThrow(ParseError);
      try {
        parseAst('1d6r<=(1d6>=3)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
      }
    });
  });

  describe('versus rejected in meta-expression positions', () => {
    // Versus produces a PF2e degree — a terminal scalar, not a valid
    // meta-expression input. Symmetric with the SuccessCount rejections
    // above; prevents `versusMetadata` from being silently dropped in
    // `mergeMetaRolls` sites.

    it('should reject Versus as keep-modifier count: 4d6kh(1d20 vs 10)', () => {
      expect(() => parseAst('4d6kh(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('4d6kh(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as prefix dice sides: d(1d20 vs 10)', () => {
      expect(() => parseAst('d(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('d(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as infix dice sides: 4d(1d20 vs 10)', () => {
      expect(() => parseAst('4d(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('4d(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as infix dice count: (1d20 vs 10)d6', () => {
      expect(() => parseAst('(1d20 vs 10)d6')).toThrow(ParseError);
      try {
        parseAst('(1d20 vs 10)d6');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as percentile dice count: (1d20 vs 10)d%', () => {
      expect(() => parseAst('(1d20 vs 10)d%')).toThrow(ParseError);
      try {
        parseAst('(1d20 vs 10)d%');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as Fate dice count: (1d20 vs 10)dF', () => {
      expect(() => parseAst('(1d20 vs 10)dF')).toThrow(ParseError);
      try {
        parseAst('(1d20 vs 10)dF');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as threshold value: 5d10>=(1d20 vs 10)', () => {
      expect(() => parseAst('5d10>=(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('5d10>=(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as bare fN value: 5d10>=6f(1d20 vs 10)', () => {
      expect(() => parseAst('5d10>=6f(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('5d10>=6f(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as explode compare-point value: 1d6!>=(1d20 vs 10)', () => {
      expect(() => parseAst('1d6!>=(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('1d6!>=(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus as reroll compare-point value: 1d6r<=(1d20 vs 10)', () => {
      expect(() => parseAst('1d6r<=(1d20 vs 10)')).toThrow(ParseError);
      try {
        parseAst('1d6r<=(1d20 vs 10)');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    // #109 — single-sub-roll Group passthrough makes Versus reachable past
    // the shallow rejectVersusTarget check. Each meta-expression site needs
    // a `{...}`-form rejection to mirror the existing parens-form coverage.
    it('should reject Versus inside parens-wrapped single-sub group as keep-modifier count: 4d6kh({1d20 vs 10})', () => {
      // ? `kh{...}` is not valid syntax — `kh` requires parens, not braces.
      //   `kh({...})` is the actual bypass route: parens around a single-sub
      //   Group around Versus. The new deep-walk catches it.
      expect(() => parseAst('4d6kh({1d20 vs 10})')).toThrow(ParseError);
      try {
        parseAst('4d6kh({1d20 vs 10})');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus inside single-sub group as success-count threshold: 5d10>={1d20 vs 10}', () => {
      expect(() => parseAst('5d10>={1d20 vs 10}')).toThrow(ParseError);
      try {
        parseAst('5d10>={1d20 vs 10}');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus inside single-sub group as kh target: {1d20 vs 15}kh1', () => {
      // ! Pre-existing inconsistency closed: parseModifier did not call
      //   rejectVersusTarget. The Group passthrough made it reachable past
      //   `containsDicePool` (deep walk recurses into Versus.roll/dc), so the
      //   reject was the only thing standing between user input and a
      //   silently-dropped `degree`/`natural`.
      expect(() => parseAst('{1d20 vs 15}kh1')).toThrow(ParseError);
      try {
        parseAst('{1d20 vs 15}kh1');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject Versus buried in unary inside single-sub group as kh target: {-(1d20 vs 15)}kh1', () => {
      expect(() => parseAst('{-(1d20 vs 15)}kh1')).toThrow(ParseError);
    });

    it('should reject Versus inside single-sub group as sort target: {1d20 vs 15}s', () => {
      expect(() => parseAst('{1d20 vs 15}s')).toThrow(ParseError);
      try {
        parseAst('{1d20 vs 15}s');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should accept Versus inside single-sub group as arithmetic operand: {1d20 vs 15}+5', () => {
      // ? BinaryOp uses `mergeContext`, which propagates `versusMetadata`.
      //   Not a meta-expression site — explicitly distinguished from the
      //   modifier/sort/cs cases above.
      expect(() => parseAst('{1d20 vs 15}+5')).not.toThrow();
    });
  });

  describe('postfix modifier target validation', () => {
    // Postfix pool modifiers (kh/kl/dh/dl, !/!!/!p, r/ro) require a dice-pool
    // target. Wrapping arithmetic silently drops user math — must parse-error.

    describe('keep/drop reject non-pool targets', () => {
      it('should reject (1d6+5)kh1', () => {
        expect(() => parseAst('(1d6+5)kh1')).toThrow(ParseError);
        try {
          parseAst('(1d6+5)kh1');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_MODIFIER_TARGET');
        }
      });

      it('should reject floor(1d6/2)kh1', () => {
        expect(() => parseAst('floor(1d6/2)kh1')).toThrow(ParseError);
        try {
          parseAst('floor(1d6/2)kh1');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_MODIFIER_TARGET');
        }
      });

      it('should reject 4d6+2kh3 (modifier binds to literal 2)', () => {
        expect(() => parseAst('4d6+2kh3')).toThrow(ParseError);
        try {
          parseAst('4d6+2kh3');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_MODIFIER_TARGET');
        }
      });

      it('should reject (1+2)dl1', () => {
        expect(() => parseAst('(1+2)dl1')).toThrow(ParseError);
        try {
          parseAst('(1+2)dl1');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_MODIFIER_TARGET');
        }
      });
    });

    describe('explode rejects non-pool targets', () => {
      it('should reject (1d6+5)!', () => {
        expect(() => parseAst('(1d6+5)!')).toThrow(ParseError);
        try {
          parseAst('(1d6+5)!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject (1d6+5)!!', () => {
        expect(() => parseAst('(1d6+5)!!')).toThrow(ParseError);
        try {
          parseAst('(1d6+5)!!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject (1d6+5)!p', () => {
        expect(() => parseAst('(1d6+5)!p')).toThrow(ParseError);
        try {
          parseAst('(1d6+5)!p');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject floor(1d6/2)!', () => {
        expect(() => parseAst('floor(1d6/2)!')).toThrow(ParseError);
        try {
          parseAst('floor(1d6/2)!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject (4d6+1d4)! (sum of pools is not a single pool)', () => {
        expect(() => parseAst('(4d6+1d4)!')).toThrow(ParseError);
        try {
          parseAst('(4d6+1d4)!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });
    });

    describe('explode rejects Fate dice pools', () => {
      it('should reject 4dF!', () => {
        expect(() => parseAst('4dF!')).toThrow(ParseError);
        try {
          parseAst('4dF!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject 4dF!>0', () => {
        expect(() => parseAst('4dF!>0')).toThrow(ParseError);
        try {
          parseAst('4dF!>0');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject 4dF!!', () => {
        expect(() => parseAst('4dF!!')).toThrow(ParseError);
        try {
          parseAst('4dF!!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject 4dF!!>0', () => {
        expect(() => parseAst('4dF!!>0')).toThrow(ParseError);
        try {
          parseAst('4dF!!>0');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject 4dF!p', () => {
        expect(() => parseAst('4dF!p')).toThrow(ParseError);
        try {
          parseAst('4dF!p');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject 4dF!p>0', () => {
        expect(() => parseAst('4dF!p>0')).toThrow(ParseError);
        try {
          parseAst('4dF!p>0');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject (4dF)!', () => {
        expect(() => parseAst('(4dF)!')).toThrow(ParseError);
        try {
          parseAst('(4dF)!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should reject Fate pool wrapped in a chained pool modifier (4dFr=-1)!', () => {
        expect(() => parseAst('(4dFr=-1)!')).toThrow(ParseError);
        try {
          parseAst('(4dFr=-1)!');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });

      it('should carry a descriptive message mentioning Fate dice', () => {
        try {
          parseAst('4dF!');
        } catch (err) {
          expect((err as ParseError).message).toContain('Fate');
        }
      });
    });

    describe('reroll rejects non-pool targets', () => {
      it('should reject (1d6+5)r<3', () => {
        expect(() => parseAst('(1d6+5)r<3')).toThrow(ParseError);
        try {
          parseAst('(1d6+5)r<3');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_REROLL_TARGET');
        }
      });

      it('should reject floor(1d6/2)ro<3', () => {
        expect(() => parseAst('floor(1d6/2)ro<3')).toThrow(ParseError);
        try {
          parseAst('floor(1d6/2)ro<3');
        } catch (err) {
          expect((err as ParseError).code).toBe('INVALID_REROLL_TARGET');
        }
      });
    });

    describe('valid dice-pool targets still parse', () => {
      it('should accept (4d6)kh3', () => {
        expect(parseAst('(4d6)kh3')).toEqual(
          modifier('keep', 'highest', literal(3), grouped(dice(literal(4), literal(6)))),
        );
      });

      it('should accept (4d6)!', () => {
        expect(parseAst('(4d6)!')).toEqual(
          explode('standard', grouped(dice(literal(4), literal(6)))),
        );
      });

      it('should accept 4dFkh2', () => {
        expect(parseAst('4dFkh2')).toEqual(
          modifier('keep', 'highest', literal(2), fateDice(literal(4))),
        );
      });

      it('should accept chained 4d6!kh3', () => {
        expect(parseAst('4d6!kh3')).toEqual(
          modifier(
            'keep',
            'highest',
            literal(3),
            explode('standard', dice(literal(4), literal(6))),
          ),
        );
      });

      it('should accept chained 4d6kh3!', () => {
        expect(parseAst('4d6kh3!')).toEqual(
          explode(
            'standard',
            modifier('keep', 'highest', literal(3), dice(literal(4), literal(6))),
          ),
        );
      });

      it('should accept chained 4d6!r<2', () => {
        expect(parseAst('4d6!r<2')).toEqual(
          reroll(false, cp('<', literal(2)), explode('standard', dice(literal(4), literal(6)))),
        );
      });
    });
  });

  describe('versus (PF2e degrees of success)', () => {
    it('should parse simple versus: 1d20 vs 15', () => {
      expect(parseAst('1d20 vs 15')).toEqual(versus(dice(literal(1), literal(20)), literal(15)));
    });

    it('should be case-insensitive: 1d20 VS 15', () => {
      expect(parseAst('1d20 VS 15')).toEqual(versus(dice(literal(1), literal(20)), literal(15)));
    });

    it('should bind below addition: 1d20+10 vs 25', () => {
      expect(parseAst('1d20+10 vs 25')).toEqual(
        versus(binary('+', dice(literal(1), literal(20)), literal(10)), literal(25)),
      );
    });

    it('should allow expression on DC side: 1d20 vs 15+10', () => {
      expect(parseAst('1d20 vs 15+10')).toEqual(
        versus(dice(literal(1), literal(20)), binary('+', literal(15), literal(10))),
      );
    });

    it('should allow expressions on both sides: 1d20+10 vs 15+10', () => {
      expect(parseAst('1d20+10 vs 15+10')).toEqual(
        versus(
          binary('+', dice(literal(1), literal(20)), literal(10)),
          binary('+', literal(15), literal(10)),
        ),
      );
    });

    it('should allow dice on DC side (contested): 1d20 vs 1d20+10', () => {
      expect(parseAst('1d20 vs 1d20+10')).toEqual(
        versus(
          dice(literal(1), literal(20)),
          binary('+', dice(literal(1), literal(20)), literal(10)),
        ),
      );
    });

    it('should allow modifiers on the roll side: 2d20kh1+5 vs 20', () => {
      expect(parseAst('2d20kh1+5 vs 20')).toEqual(
        versus(
          binary(
            '+',
            modifier('keep', 'highest', literal(1), dice(literal(2), literal(20))),
            literal(5),
          ),
          literal(20),
        ),
      );
    });

    it('should parse paren-nested DC (evaluator catches nesting): 1d20 vs (5 vs 3)', () => {
      expect(parseAst('1d20 vs (5 vs 3)')).toEqual(
        versus(dice(literal(1), literal(20)), grouped(versus(literal(5), literal(3)))),
      );
    });

    it('should reject chained versus: 1d20 vs 15 vs 20', () => {
      expect(() => parseAst('1d20 vs 15 vs 20')).toThrow(ParseError);
      try {
        parseAst('1d20 vs 15 vs 20');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject chained versus with modifiers: 1d20+5 vs 15 vs 20', () => {
      expect(() => parseAst('1d20+5 vs 15 vs 20')).toThrow(ParseError);
      try {
        parseAst('1d20+5 vs 15 vs 20');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });

    it('should reject paren-wrapped chained versus at parse: (1d20 vs 15) vs 10', () => {
      // Chain guard unwraps `Grouped`, so parens do not bypass the parse-time
      // check. Previously parsed and threw at eval via `mergeContext`.
      expect(() => parseAst('(1d20 vs 15) vs 10')).toThrow(ParseError);
      try {
        parseAst('(1d20 vs 15) vs 10');
      } catch (err) {
        expect((err as ParseError).code).toBe('NESTED_VERSUS');
      }
    });
  });

  describe('math functions', () => {
    it('should parse unary function: floor(10)', () => {
      expect(parseAst('floor(10)')).toEqual(functionCall('floor', [literal(10)]));
    });

    it('should parse function with expression arg: floor(10/3)', () => {
      expect(parseAst('floor(10/3)')).toEqual(
        functionCall('floor', [binary('/', literal(10), literal(3))]),
      );
    });

    it('should parse function with dice arg: floor(1d6/3)', () => {
      expect(parseAst('floor(1d6/3)')).toEqual(
        functionCall('floor', [binary('/', dice(literal(1), literal(6)), literal(3))]),
      );
    });

    it('should parse all unary functions', () => {
      expect(parseAst('ceil(1.5)')).toEqual(functionCall('ceil', [literal(1.5)]));
      expect(parseAst('round(1.5)')).toEqual(functionCall('round', [literal(1.5)]));
      expect(parseAst('abs(-5)')).toEqual(functionCall('abs', [unary(literal(5))]));
    });

    it('should parse variadic max with two args: max(1d6, 1d8)', () => {
      expect(parseAst('max(1d6, 1d8)')).toEqual(
        functionCall('max', [dice(literal(1), literal(6)), dice(literal(1), literal(8))]),
      );
    });

    it('should parse variadic max with three args: max(1, 2, 3)', () => {
      expect(parseAst('max(1, 2, 3)')).toEqual(
        functionCall('max', [literal(1), literal(2), literal(3)]),
      );
    });

    it('should parse variadic min: min(10, 1d20+5)', () => {
      expect(parseAst('min(10, 1d20+5)')).toEqual(
        functionCall('min', [literal(10), binary('+', dice(literal(1), literal(20)), literal(5))]),
      );
    });

    it('should parse nested function calls: floor(floor(10/3)/2)', () => {
      expect(parseAst('floor(floor(10/3)/2)')).toEqual(
        functionCall('floor', [
          binary('/', functionCall('floor', [binary('/', literal(10), literal(3))]), literal(2)),
        ]),
      );
    });

    it('should parse function in arithmetic: 2*floor(1d6/2)', () => {
      expect(parseAst('2*floor(1d6/2)')).toEqual(
        binary(
          '*',
          literal(2),
          functionCall('floor', [binary('/', dice(literal(1), literal(6)), literal(2))]),
        ),
      );
    });

    it('should parse case-insensitive: FLOOR(10/3)', () => {
      expect(parseAst('FLOOR(10/3)')).toEqual(
        functionCall('floor', [binary('/', literal(10), literal(3))]),
      );
    });

    it('should tolerate whitespace between name and paren: floor (10/3)', () => {
      expect(parseAst('floor (10/3)')).toEqual(
        functionCall('floor', [binary('/', literal(10), literal(3))]),
      );
    });

    it('should throw INVALID_FUNCTION_ARITY for zero args: floor()', () => {
      expect(() => parseAst('floor()')).toThrow(ParseError);
      try {
        parseAst('floor()');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_FUNCTION_ARITY');
      }
    });

    it('should throw INVALID_FUNCTION_ARITY for too many args: floor(1, 2)', () => {
      expect(() => parseAst('floor(1, 2)')).toThrow(ParseError);
      try {
        parseAst('floor(1, 2)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_FUNCTION_ARITY');
      }
    });

    it('should throw INVALID_FUNCTION_ARITY when max has only 1 arg: max(1d6)', () => {
      expect(() => parseAst('max(1d6)')).toThrow(ParseError);
      try {
        parseAst('max(1d6)');
      } catch (err) {
        expect((err as ParseError).code).toBe('INVALID_FUNCTION_ARITY');
      }
    });

    it('should throw EXPECTED_TOKEN when function has no parens: floor + 3', () => {
      expect(() => parseAst('floor + 3')).toThrow(ParseError);
      try {
        parseAst('floor + 3');
      } catch (err) {
        expect((err as ParseError).code).toBe('EXPECTED_TOKEN');
      }
    });
  });

  describe('variable references', () => {
    it('should parse bare @name with case preserved', () => {
      expect(parseAst('@StrMod')).toEqual(variable('StrMod'));
    });

    it('should parse braced @{name with spaces}', () => {
      expect(parseAst('@{Strength Modifier}')).toEqual(variable('Strength Modifier'));
    });

    it('should treat @Foo and @foo as distinct variables', () => {
      expect(parseAst('@Foo')).toEqual(variable('Foo'));
      expect(parseAst('@foo')).toEqual(variable('foo'));
    });

    it('should parse variable in arithmetic: 1d20+@str', () => {
      expect(parseAst('1d20+@str')).toEqual(
        binary('+', dice(literal(1), literal(20)), variable('str')),
      );
    });

    it('should parse variable in dice count: @count d6', () => {
      expect(parseAst('@count d6')).toEqual(dice(variable('count'), literal(6)));
    });

    it('should parse variable in dice sides: 1d@sides', () => {
      expect(parseAst('1d@sides')).toEqual(dice(literal(1), variable('sides')));
    });

    it('should parse variables on both sides: @count d@sides', () => {
      expect(parseAst('@count d@sides')).toEqual(dice(variable('count'), variable('sides')));
    });

    it('should parse variable in modifier count: 4d6kh@keep', () => {
      expect(parseAst('4d6kh@keep')).toEqual(
        modifier('keep', 'highest', variable('keep'), dice(literal(4), literal(6))),
      );
    });

    it('should parse variable as success-count threshold: 2d6>=@dc', () => {
      expect(parseAst('2d6>=@dc')).toEqual(
        successCount(dice(literal(2), literal(6)), cp('>=', variable('dc'))),
      );
    });

    it('should parse braced variable inside grouped count: (@{base})d6', () => {
      expect(parseAst('(@{base})d6')).toEqual(dice(grouped(variable('base')), literal(6)));
    });

    it('should parse variable as a leaf with no LED — @str+@dex', () => {
      expect(parseAst('@str+@dex')).toEqual(binary('+', variable('str'), variable('dex')));
    });
  });

  describe('grouped rolls', () => {
    describe('shape', () => {
      it('should parse single-sub-roll group as Group with one expression', () => {
        expect(parseAst('{4d6}')).toEqual(group([dice(literal(4), literal(6))]));
      });

      it('should parse literal group', () => {
        expect(parseAst('{3, 5, 7}')).toEqual(group([literal(3), literal(5), literal(7)]));
      });

      it('should parse multi-sub-roll group with arithmetic sub-expressions', () => {
        expect(parseAst('{4d6+2d8, 3d20+3, 5d10+1}')).toEqual(
          group([
            binary('+', dice(literal(4), literal(6)), dice(literal(2), literal(8))),
            binary('+', dice(literal(3), literal(20)), literal(3)),
            binary('+', dice(literal(5), literal(10)), literal(1)),
          ]),
        );
      });

      it('should parse single-expression flat-pool group', () => {
        expect(parseAst('{4d10+5d6}')).toEqual(
          group([binary('+', dice(literal(4), literal(10)), dice(literal(5), literal(6)))]),
        );
      });

      it('should parse nested group', () => {
        expect(parseAst('{1d6, {5}}')).toEqual(
          group([dice(literal(1), literal(6)), group([literal(5)])]),
        );
      });

      it('should parse doubly nested group with outer keep/drop', () => {
        expect(parseAst('{{1d6, 2d8}kh1, 3d10}kl1')).toEqual(
          modifier(
            'keep',
            'lowest',
            literal(1),
            group([
              modifier(
                'keep',
                'highest',
                literal(1),
                group([dice(literal(1), literal(6)), dice(literal(2), literal(8))]),
              ),
              dice(literal(3), literal(10)),
            ]),
          ),
        );
      });
    });

    describe('keep/drop modifiers', () => {
      it('should parse group + kh modifier', () => {
        expect(parseAst('{1d6, 1d8}kh1')).toEqual(
          modifier(
            'keep',
            'highest',
            literal(1),
            group([dice(literal(1), literal(6)), dice(literal(1), literal(8))]),
          ),
        );
      });

      it('should parse group + kl modifier', () => {
        expect(parseAst('{1d20, 1d20}kl1')).toEqual(
          modifier(
            'keep',
            'lowest',
            literal(1),
            group([dice(literal(1), literal(20)), dice(literal(1), literal(20))]),
          ),
        );
      });

      it('should parse flat-pool group + kh with implicit count', () => {
        expect(parseAst('{4d10+5d6}kh2')).toEqual(
          modifier(
            'keep',
            'highest',
            literal(2),
            group([binary('+', dice(literal(4), literal(10)), dice(literal(5), literal(6)))]),
          ),
        );
      });

      it('should accept literal-only multi-sub-roll group with keep/drop', () => {
        expect(parseAst('{3, 5, 7}kh1')).toEqual(
          modifier('keep', 'highest', literal(1), group([literal(3), literal(5), literal(7)])),
        );
      });

      it('should reject keep/drop on a single-sub-roll group with no dice', () => {
        expect(() => parseAst('{5}kh1')).toThrow(ParseError);
      });
    });

    describe('group inside arithmetic and unary', () => {
      it('should parse group on the right of +', () => {
        expect(parseAst('5 + {1d6, 1d8}kh1')).toEqual(
          binary(
            '+',
            literal(5),
            modifier(
              'keep',
              'highest',
              literal(1),
              group([dice(literal(1), literal(6)), dice(literal(1), literal(8))]),
            ),
          ),
        );
      });

      it('should parse group multiplied by a literal', () => {
        expect(parseAst('2 * {1d6, 1d8}kh1')).toEqual(
          binary(
            '*',
            literal(2),
            modifier(
              'keep',
              'highest',
              literal(1),
              group([dice(literal(1), literal(6)), dice(literal(1), literal(8))]),
            ),
          ),
        );
      });

      it('should parse unary minus before group', () => {
        expect(parseAst('-{1d6, 2d8}kh1')).toEqual(
          unary(
            modifier(
              'keep',
              'highest',
              literal(1),
              group([dice(literal(1), literal(6)), dice(literal(2), literal(8))]),
            ),
          ),
        );
      });
    });

    describe('errors', () => {
      it('should reject empty group', () => {
        expect(() => parseAst('{}')).toThrow(ParseError);
        try {
          parseAst('{}');
        } catch (e) {
          expect((e as ParseError).code).toBe('UNEXPECTED_TOKEN');
          expect((e as ParseError).message).toContain('Empty group');
        }
      });

      it('should reject unterminated group with EOF', () => {
        expect(() => parseAst('{1d6, 2d8')).toThrow(ParseError);
        try {
          parseAst('{1d6, 2d8');
        } catch (e) {
          expect((e as ParseError).code).toBe('EXPECTED_TOKEN');
          expect((e as ParseError).message).toContain('Unterminated group');
        }
      });

      it('should reject unterminated group with stray token', () => {
        expect(() => parseAst('{1d6 +}')).toThrow(ParseError);
      });

      it('should reject stray closing brace at top level', () => {
        expect(() => parseAst('1d6}')).toThrow(ParseError);
      });

      it('should reject stray opening brace after an expression', () => {
        expect(() => parseAst('1d6{1d8}')).toThrow(ParseError);
      });

      it('should reject explode on a group: {4d6}!', () => {
        expect(() => parseAst('{4d6}!')).toThrow(ParseError);
        try {
          parseAst('{4d6}!');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
          expect((e as ParseError).message).toContain('Cannot explode a group');
        }
      });

      it('should reject explode on a parenthesized group: ({4d6})!', () => {
        expect(() => parseAst('({4d6})!')).toThrow(ParseError);
      });

      it('should reject compound explode on a group', () => {
        expect(() => parseAst('{4d6}!!')).toThrow(ParseError);
      });

      it('should reject penetrating explode on a group', () => {
        expect(() => parseAst('{4d6}!p')).toThrow(ParseError);
      });

      it('should reject reroll on a group: {4d6}r<2', () => {
        expect(() => parseAst('{4d6}r<2')).toThrow(ParseError);
        try {
          parseAst('{4d6}r<2');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_REROLL_TARGET');
          expect((e as ParseError).message).toContain('Cannot reroll a group');
        }
      });

      it('should reject reroll-once on a group', () => {
        expect(() => parseAst('{4d6}ro<2')).toThrow(ParseError);
      });

      it('should reject explode on a modifier-wrapped group: {4d6}kh1!', () => {
        expect(() => parseAst('{4d6}kh1!')).toThrow(ParseError);
        try {
          parseAst('{4d6}kh1!');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
          expect((e as ParseError).message).toContain('Cannot explode a group');
        }
      });

      it('should reject reroll on a modifier-wrapped group: {4d6}kh1r<2', () => {
        expect(() => parseAst('{4d6}kh1r<2')).toThrow(ParseError);
        try {
          parseAst('{4d6}kh1r<2');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_REROLL_TARGET');
          expect((e as ParseError).message).toContain('Cannot reroll a group');
        }
      });

      it('should reject explode on a sort-wrapped group: {4d6}s!', () => {
        expect(() => parseAst('{4d6}s!')).toThrow(ParseError);
        try {
          parseAst('{4d6}s!');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_EXPLODE_TARGET');
        }
      });
    });
  });

  describe('sort modifiers', () => {
    describe('shape', () => {
      it('should parse s as ascending sort', () => {
        expect(parseAst('4d6s')).toEqual(sort('ascending', dice(literal(4), literal(6))));
      });

      it('should parse sa as ascending sort', () => {
        expect(parseAst('4d6sa')).toEqual(sort('ascending', dice(literal(4), literal(6))));
      });

      it('should parse sd as descending sort', () => {
        expect(parseAst('4d6sd')).toEqual(sort('descending', dice(literal(4), literal(6))));
      });

      it('should chain sort over keep/drop', () => {
        expect(parseAst('4d6dl1s')).toEqual(
          sort('ascending', modifier('drop', 'lowest', literal(1), dice(literal(4), literal(6)))),
        );
      });

      it('should chain keep/drop over sort (modifier outer)', () => {
        // ? `sdl` as one identifier maxes-munches to an unknown keyword in
        //   the lexer; whitespace separates the two modifiers cleanly.
        expect(parseAst('4d6s dl1')).toEqual(
          modifier('drop', 'lowest', literal(1), sort('ascending', dice(literal(4), literal(6)))),
        );
      });

      it('should chain sort over explode', () => {
        expect(parseAst('4d6!s')).toEqual(
          sort('ascending', explode('standard', dice(literal(4), literal(6)))),
        );
      });

      it('should allow double sort (idempotent chain)', () => {
        // ? Maximal-munch lexing treats `ss` / `ssd` as a single identifier,
        //   so chained sorts need whitespace between the keywords.
        expect(parseAst('4d6s s')).toEqual(
          sort('ascending', sort('ascending', dice(literal(4), literal(6)))),
        );
      });

      it('should allow mixed-direction chain', () => {
        expect(parseAst('4d6s sd')).toEqual(
          sort('descending', sort('ascending', dice(literal(4), literal(6)))),
        );
      });

      it('should accept arithmetic-wrapped pool via parens', () => {
        expect(parseAst('(1d6+2d8)s')).toEqual(
          sort(
            'ascending',
            grouped(binary('+', dice(literal(1), literal(6)), dice(literal(2), literal(8)))),
          ),
        );
      });

      it('should accept Fate dice pool', () => {
        expect(parseAst('4dFsd')).toEqual(sort('descending', fateDice(literal(4))));
      });

      it('should accept single-sub-roll group', () => {
        expect(parseAst('{4d6}s')).toEqual(
          sort('ascending', group([dice(literal(4), literal(6))])),
        );
      });
    });

    describe('errors', () => {
      it('should reject sort on a pure literal', () => {
        expect(() => parseAst('5s')).toThrow(ParseError);
        try {
          parseAst('5s');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_SORT_TARGET');
          expect((e as ParseError).message).toContain('dice pool');
        }
      });

      it('should reject sort on pure arithmetic', () => {
        expect(() => parseAst('(1+2)sd')).toThrow(ParseError);
      });

      it('should reject sort on a multi-sub-roll group', () => {
        expect(() => parseAst('{1d6, 2d8}s')).toThrow(ParseError);
        try {
          parseAst('{1d6, 2d8}s');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_SORT_TARGET');
          expect((e as ParseError).message).toContain('not yet support');
        }
      });

      it('should reject sort on a parens-wrapped multi-sub-roll group', () => {
        expect(() => parseAst('({1d6, 2d8})s')).toThrow(ParseError);
        try {
          parseAst('({1d6, 2d8})s');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_SORT_TARGET');
        }
      });

      it('should reject sort on SuccessCount target', () => {
        expect(() => parseAst('4d6>=4s')).toThrow(ParseError);
        try {
          parseAst('4d6>=4s');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
        }
      });

      it('should reject sort on Versus target (via parens)', () => {
        expect(() => parseAst('(1d20 vs 15)s')).toThrow(ParseError);
        try {
          parseAst('(1d20 vs 15)s');
        } catch (e) {
          expect((e as ParseError).code).toBe('NESTED_VERSUS');
        }
      });

      it('should reject sort on a function call over literals', () => {
        expect(() => parseAst('floor(5)s')).toThrow(ParseError);
      });
    });
  });

  describe('crit threshold modifiers', () => {
    describe('shape', () => {
      it('should parse bare cs as default success threshold', () => {
        expect(parseAst('1d20cs')).toEqual(
          critThreshold(['default'], [], dice(literal(1), literal(20))),
        );
      });

      it('should parse bare cf as default fail threshold', () => {
        expect(parseAst('1d20cf')).toEqual(
          critThreshold([], ['default'], dice(literal(1), literal(20))),
        );
      });

      it('should parse cs with a compare point', () => {
        expect(parseAst('1d20cs>19')).toEqual(
          critThreshold([cp('>', literal(19))], [], dice(literal(1), literal(20))),
        );
      });

      it('should parse cf with a compare point', () => {
        expect(parseAst('1d20cf<3')).toEqual(
          critThreshold([], [cp('<', literal(3))], dice(literal(1), literal(20))),
        );
      });

      it('should chain multiple cs thresholds into a single node', () => {
        expect(parseAst('1d20cs=20cs=1')).toEqual(
          critThreshold(
            [cp('=', literal(20)), cp('=', literal(1))],
            [],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should chain multiple cf thresholds into a single node', () => {
        expect(parseAst('1d20cf=1cf=2')).toEqual(
          critThreshold(
            [],
            [cp('=', literal(1)), cp('=', literal(2))],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should combine cs and cf into the same node', () => {
        expect(parseAst('1d20cs>19cf<3')).toEqual(
          critThreshold(
            [cp('>', literal(19))],
            [cp('<', literal(3))],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should be order-independent — cf first then cs', () => {
        expect(parseAst('1d20cf<3cs>19')).toEqual(
          critThreshold(
            [cp('>', literal(19))],
            [cp('<', literal(3))],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should parse mixed chain with defaults and compare points', () => {
        expect(parseAst('1d20cs=20cs=1cf>18')).toEqual(
          critThreshold(
            [cp('=', literal(20)), cp('=', literal(1))],
            [cp('>', literal(18))],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should chain cs over keep/drop', () => {
        expect(parseAst('4d20dl1cs>17')).toEqual(
          critThreshold(
            [cp('>', literal(17))],
            [],
            modifier('drop', 'lowest', literal(1), dice(literal(4), literal(20))),
          ),
        );
      });

      it('should chain cs over explode', () => {
        expect(parseAst('1d20!cs>19')).toEqual(
          critThreshold(
            [cp('>', literal(19))],
            [],
            explode('standard', dice(literal(1), literal(20))),
          ),
        );
      });

      it('should chain cs over sort', () => {
        // ? `4d6scs` maxes-munches to an unknown `scs` identifier in the
        //   lexer — whitespace separates the two keywords cleanly, same
        //   as the `4d6s dl1` pattern used by sort tests.
        expect(parseAst('4d6s cs>4')).toEqual(
          critThreshold([cp('>', literal(4))], [], sort('ascending', dice(literal(4), literal(6)))),
        );
      });

      it('should chain sort over cs (sort outer)', () => {
        // ? `cs` and `s` cannot be lexed together as one identifier — the
        //   intervening `>value` breaks maximal munch. No whitespace needed.
        expect(parseAst('4d6cs>4 s')).toEqual(
          sort('ascending', critThreshold([cp('>', literal(4))], [], dice(literal(4), literal(6)))),
        );
      });

      it('should collapse chain through parens', () => {
        // ? `(1d20cs>19)cs=1` must collapse into one CritThresholdNode, not
        //   double-wrap through the Grouped node.
        expect(parseAst('(1d20cs>19)cs=1')).toEqual(
          critThreshold(
            [cp('>', literal(19)), cp('=', literal(1))],
            [],
            dice(literal(1), literal(20)),
          ),
        );
      });

      it('should accept Fate dice pool', () => {
        expect(parseAst('4dFcs>0')).toEqual(
          critThreshold([cp('>', literal(0))], [], fateDice(literal(4))),
        );
      });

      it('should accept Fate dice with custom fail threshold', () => {
        expect(parseAst('4dFcf=-1')).toEqual(
          critThreshold([], [cp('=', unary(literal(1)))], fateDice(literal(4))),
        );
      });

      it('should allow SuccessCount to wrap CritThreshold', () => {
        // CritThreshold contains a dice pool — SuccessCount's pool check passes.
        expect(parseAst('10d10cs>8>=6')).toEqual(
          successCount(
            critThreshold([cp('>', literal(8))], [], dice(literal(10), literal(10))),
            cp('>=', literal(6)),
          ),
        );
      });

      // Single-sub-roll groups are the documented flat-pool escape hatch
      // (STAGE3.md "Group Semantics: Single vs Multi Sub-Roll") and pass
      // through to cs/cf as if they were the unwrapped form.
      it('should accept cs on a single-sub-roll group: {1d6}cs>5', () => {
        expect(parseAst('{1d6}cs>5')).toEqual(
          critThreshold([cp('>', literal(5))], [], group([dice(literal(1), literal(6))])),
        );
      });

      it('should accept cf on a single-sub-roll group: {1d6}cf<2', () => {
        expect(parseAst('{1d6}cf<2')).toEqual(
          critThreshold([], [cp('<', literal(2))], group([dice(literal(1), literal(6))])),
        );
      });

      it('should accept cs on a parens-wrapped single-sub-roll group: ({1d6})cs>5', () => {
        expect(parseAst('({1d6})cs>5')).toEqual(
          critThreshold([cp('>', literal(5))], [], grouped(group([dice(literal(1), literal(6))]))),
        );
      });

      it('should accept cs on a modifier-wrapped single-sub-roll group: {1d20}kh1cs>18', () => {
        expect(parseAst('{1d20}kh1cs>18')).toEqual(
          critThreshold(
            [cp('>', literal(18))],
            [],
            modifier('keep', 'highest', literal(1), group([dice(literal(1), literal(20))])),
          ),
        );
      });

      it('should accept cf on a modifier-wrapped single-sub-roll group: {1d6}kh1cf<2', () => {
        expect(parseAst('{1d6}kh1cf<2')).toEqual(
          critThreshold(
            [],
            [cp('<', literal(2))],
            modifier('keep', 'highest', literal(1), group([dice(literal(1), literal(6))])),
          ),
        );
      });
    });

    describe('errors', () => {
      it('should reject cs on a pure literal', () => {
        expect(() => parseAst('5cs')).toThrow(ParseError);
        try {
          parseAst('5cs');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('dice pool');
        }
      });

      it('should reject cs on pure arithmetic', () => {
        expect(() => parseAst('(1+2)cs>1')).toThrow(ParseError);
      });

      it('should reject cs on arithmetic-wrapped pool', () => {
        // ? Mirrors explode/reroll — cs/cf is "bare dice only". `(1d6+2d8)` is
        //   an arithmetic wrapper, not a dice pool in the shallow sense.
        expect(() => parseAst('(1d6+2d8)cs>5')).toThrow(ParseError);
        try {
          parseAst('(1d6+2d8)cs>5');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
        }
      });

      it('should reject cs on a multi-sub-roll group', () => {
        expect(() => parseAst('{1d6, 2d8}cs>5')).toThrow(ParseError);
        try {
          parseAst('{1d6, 2d8}cs>5');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('group');
        }
      });

      it('should reject cf on a multi-sub-roll group', () => {
        expect(() => parseAst('{1d6, 2d8}cf<2')).toThrow(ParseError);
      });

      it('should reject cs on a parens-wrapped multi-sub-roll group', () => {
        expect(() => parseAst('({1d6, 2d8})cs>5')).toThrow(ParseError);
        try {
          parseAst('({1d6, 2d8})cs>5');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
        }
      });

      it('should reject cs on a modifier-wrapped multi-sub-roll group: {1d20, 1d20}kh1cs>18', () => {
        // Without the unwrap-through-Modifier check, the evaluator overrides
        // critical/fumble on dropped sub-roll dice from each branch.
        expect(() => parseAst('{1d20, 1d20}kh1cs>18')).toThrow(ParseError);
        try {
          parseAst('{1d20, 1d20}kh1cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('group');
        }
      });

      it('should reject cf on a modifier-wrapped multi-sub-roll group: {1d20, 1d20}kh1cf<3', () => {
        expect(() => parseAst('{1d20, 1d20}kh1cf<3')).toThrow(ParseError);
        try {
          parseAst('{1d20, 1d20}kh1cf<3');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
        }
      });

      it('should reject cs on a parens-wrapped modifier-wrapped multi-sub-roll group', () => {
        // ? Acceptance criterion 5 from #97 — Grouped wrapper around the
        //   Modifier(Group([...])) chain still resolves to a Group via the
        //   shared unwrap.
        expect(() => parseAst('({1d20, 1d20}kh1)cs>18')).toThrow(ParseError);
        try {
          parseAst('({1d20, 1d20}kh1)cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
        }
      });

      // #109 — single-sub-roll passthrough must not smuggle a buried
      // multi-sub Group through a wrapper `unwrapTransparent` doesn't peel.
      it('should reject cs on nested multi-sub-roll group: {{1d20, 1d20}kh1}cs>18', () => {
        expect(() => parseAst('{{1d20, 1d20}kh1}cs>18')).toThrow(ParseError);
        try {
          parseAst('{{1d20, 1d20}kh1}cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('group');
        }
      });

      it('should reject cs on multi-sub group buried in arithmetic: {{1d6, 2d8}+0}cs>5', () => {
        expect(() => parseAst('{{1d6, 2d8}+0}cs>5')).toThrow(ParseError);
        try {
          parseAst('{{1d6, 2d8}+0}cs>5');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
        }
      });

      it('should reject cs on multi-sub group buried in unary: {-{1d6, 2d8}}cs>5', () => {
        expect(() => parseAst('{-{1d6, 2d8}}cs>5')).toThrow(ParseError);
      });

      it('should reject cs on multi-sub group buried in function call: {abs({1d6, 2d8})}cs>5', () => {
        expect(() => parseAst('{abs({1d6, 2d8})}cs>5')).toThrow(ParseError);
      });

      it('should reject cs on multi-sub group buried in nested function/arithmetic: {floor({1d6, 2d8}/1)}cs>5', () => {
        expect(() => parseAst('{floor({1d6, 2d8}/1)}cs>5')).toThrow(ParseError);
      });

      it('should reject cs on SuccessCount target', () => {
        expect(() => parseAst('4d6>=4cs>5')).toThrow(ParseError);
        try {
          parseAst('4d6>=4cs>5');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_SUCCESS_COUNT_TARGET');
        }
      });

      it('should reject cs on Versus target (via parens)', () => {
        expect(() => parseAst('(1d20 vs 15)cs>18')).toThrow(ParseError);
        try {
          parseAst('(1d20 vs 15)cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('NESTED_VERSUS');
        }
      });

      it('should reject cs on a function call over literals', () => {
        expect(() => parseAst('floor(5)cs>3')).toThrow(ParseError);
      });

      it('should reject bare cs on Fate dice pool', () => {
        // Fate results are `{-1, 0, +1}`; the default crit sentinel assumes
        // max-side semantics that don't apply. Custom thresholds remain valid.
        expect(() => parseAst('4dFcs')).toThrow(ParseError);
        try {
          parseAst('4dFcs');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('Fate');
        }
      });

      it('should reject bare cf on Fate dice pool', () => {
        // Without this guard, the default fumble check (`result === 1`) flips
        // a `+1` Fate face into a fumble — a semantic inversion.
        expect(() => parseAst('4dFcf')).toThrow(ParseError);
        try {
          parseAst('4dFcf');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('Fate');
        }
      });

      it('should reject bare cf chained after custom cs on Fate pool', () => {
        // ? `containsFatePool` recurses through `CritThreshold`, so the bare
        //   `cf` is caught even when the target is already a wrapping crit
        //   threshold node from a custom success threshold.
        expect(() => parseAst('4dFcs>0cf')).toThrow(ParseError);
        try {
          parseAst('4dFcs>0cf');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('Fate');
        }
      });

      // #109 — single-sub-roll Group passthrough makes Fate reachable past
      // the shallow `containsFatePool` check; `deepContainsFatePool` recurses
      // through arithmetic, so the bare-Fate guard still fires.
      it('should reject bare cf on Fate inside arithmetic group: {4dF+1d6}cf', () => {
        expect(() => parseAst('{4dF+1d6}cf')).toThrow(ParseError);
        try {
          parseAst('{4dF+1d6}cf');
        } catch (e) {
          expect((e as ParseError).code).toBe('INVALID_CRIT_THRESHOLD_TARGET');
          expect((e as ParseError).message).toContain('Fate');
        }
      });

      it('should reject bare cs on Fate inside parens-wrapped arithmetic group: ({4dF+1d6})cs', () => {
        expect(() => parseAst('({4dF+1d6})cs')).toThrow(ParseError);
      });

      it('should reject bare cf on Fate inside function-call group: {abs(4dF)}cf', () => {
        expect(() => parseAst('{abs(4dF)}cf')).toThrow(ParseError);
      });

      // #109 — single-sub-roll Group passthrough also smuggles Versus past
      // `rejectVersusTarget`'s shallow check at the cs/cf consumer site.
      it('should reject cs on Versus inside single-sub group: {1d20 vs 15}cs>18', () => {
        expect(() => parseAst('{1d20 vs 15}cs>18')).toThrow(ParseError);
        try {
          parseAst('{1d20 vs 15}cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('NESTED_VERSUS');
        }
      });

      it('should reject cs on Versus buried in arithmetic inside Group: {1+(1d20 vs 15)}cs>18', () => {
        expect(() => parseAst('{1+(1d20 vs 15)}cs>18')).toThrow(ParseError);
        try {
          parseAst('{1+(1d20 vs 15)}cs>18');
        } catch (e) {
          expect((e as ParseError).code).toBe('NESTED_VERSUS');
        }
      });

      it('should reject cs on Versus buried in function call inside Group: {abs(1d20 vs 15)}cs>18', () => {
        expect(() => parseAst('{abs(1d20 vs 15)}cs>18')).toThrow(ParseError);
      });
    });
  });
});
