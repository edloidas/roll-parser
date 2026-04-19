/**
 * AST node type definitions for the dice notation parser.
 *
 * @module parser/ast
 */

import type { ComparePoint } from '../types';

/**
 * Numeric literal node.
 */
export type LiteralNode = {
  type: 'Literal';
  value: number;
};

/**
 * Dice roll node.
 * Count and sides can be expressions to support computed dice like (1+1)d(3*2).
 */
export type DiceNode = {
  type: 'Dice';
  count: ASTNode;
  sides: ASTNode;
};

/**
 * Fate/Fudge dice node (`dF`).
 * Each die produces a result in {-1, 0, +1}. No configurable sides.
 */
export type FateDiceNode = {
  type: 'FateDice';
  count: ASTNode;
};

/**
 * Binary operation node.
 */
export type BinaryOpNode = {
  type: 'BinaryOp';
  operator: '+' | '-' | '*' | '/' | '%' | '**';
  left: ASTNode;
  right: ASTNode;
};

/**
 * Unary operation node.
 */
export type UnaryOpNode = {
  type: 'UnaryOp';
  operator: '-';
  operand: ASTNode;
};

/**
 * Keep/drop modifier node.
 * Wraps a dice expression with keep highest/lowest or drop highest/lowest.
 */
export type ModifierNode = {
  type: 'Modifier';
  modifier: 'keep' | 'drop';
  selector: 'highest' | 'lowest';
  count: ASTNode;
  target: ASTNode;
};

/**
 * Exploding dice node (`!`, `!!`, `!p`, `!>Y`).
 * Wraps a dice expression with a standard, compounding, or penetrating
 * explosion. An absent `threshold` means "explode on the die's maximum face".
 */
export type ExplodeNode = {
  type: 'Explode';
  variant: 'standard' | 'compound' | 'penetrating';
  threshold?: ComparePoint;
  target: ASTNode;
};

/**
 * Reroll node (`r<COND>`, `ro<COND>`).
 * Re-rolls dice that match a comparison condition. `once: true` for `ro`
 * keeps the second result regardless of match; `once: false` for `r`
 * re-rolls recursively until the condition no longer matches.
 */
export type RerollNode = {
  type: 'Reroll';
  once: boolean;
  condition: ComparePoint;
  target: ASTNode;
};

/**
 * Union type of all AST nodes.
 */
export type ASTNode =
  | LiteralNode
  | DiceNode
  | FateDiceNode
  | BinaryOpNode
  | UnaryOpNode
  | ModifierNode
  | ExplodeNode
  | RerollNode;

/**
 * Type guard for LiteralNode.
 */
export function isLiteral(node: ASTNode): node is LiteralNode {
  return node.type === 'Literal';
}

/**
 * Type guard for DiceNode.
 */
export function isDice(node: ASTNode): node is DiceNode {
  return node.type === 'Dice';
}

/**
 * Type guard for FateDiceNode.
 */
export function isFateDice(node: ASTNode): node is FateDiceNode {
  return node.type === 'FateDice';
}

/**
 * Type guard for BinaryOpNode.
 */
export function isBinaryOp(node: ASTNode): node is BinaryOpNode {
  return node.type === 'BinaryOp';
}

/**
 * Type guard for UnaryOpNode.
 */
export function isUnaryOp(node: ASTNode): node is UnaryOpNode {
  return node.type === 'UnaryOp';
}

/**
 * Type guard for ModifierNode.
 */
export function isModifier(node: ASTNode): node is ModifierNode {
  return node.type === 'Modifier';
}

/**
 * Type guard for ExplodeNode.
 */
export function isExplode(node: ASTNode): node is ExplodeNode {
  return node.type === 'Explode';
}

/**
 * Type guard for RerollNode.
 */
export function isReroll(node: ASTNode): node is RerollNode {
  return node.type === 'Reroll';
}
