/**
 * Shared type definitions for roll results and comparison primitives.
 *
 * @module types
 */

import type { ASTNode } from './parser/ast';

/**
 * Comparison operator for compare points.
 */
export type CompareOp = '>' | '>=' | '<' | '<=' | '=';

/**
 * A comparison threshold used by exploding dice, reroll, and success counting.
 *
 * The value is an ASTNode to support computed thresholds (e.g., `>=ceil(5)`),
 * matching the pattern used by DiceNode.count and DiceNode.sides.
 */
export type ComparePoint = {
  operator: CompareOp;
  value: ASTNode;
};

/**
 * Modifier flags applied to individual die results.
 */
export type DieModifier = 'dropped' | 'kept' | 'exploded' | 'rerolled' | 'success' | 'failure';

/**
 * Individual die roll result with metadata.
 */
export type DieResult = {
  /**
   * Number of sides on the die. Normal dice use `sides >= 1`. Fate/Fudge
   * dice use `sides = 0` as a sentinel — they have no configurable sides
   * and always produce results in {-1, 0, +1}.
   */
  sides: number;
  /** The rolled value */
  result: number;
  /** Modifiers applied to this die */
  modifiers: DieModifier[];
  /** True if rolled the maximum value (always false for Fate dice) */
  critical: boolean;
  /** True if rolled 1 (always false for Fate dice) */
  fumble: boolean;
};

/**
 * Complete roll result with all metadata.
 */
export type RollResult = {
  /** Final computed total */
  total: number;
  /** Original input notation */
  notation: string;
  /** Normalized expression */
  expression: string;
  /** Rendered result with individual rolls shown */
  rendered: string;
  /** All individual die results */
  rolls: DieResult[];
  /**
   * Number of dice tagged as success across the whole expression. Present
   * only when a success-counting modifier was used. Independent of `total` —
   * arithmetic on top of a success count (e.g. `5d6>=5 * 2`) affects `total`
   * but not `successes`.
   */
  successes?: number;
  /**
   * Number of dice tagged as failure across the whole expression. Present
   * only when a success-counting modifier with a fail threshold was used.
   */
  failures?: number;
};

/**
 * Options for the evaluate function.
 */
export type EvaluateOptions = {
  /** Original notation string (for result metadata) */
  notation?: string;
  /** Maximum total dice allowed per evaluation (default: 10,000) */
  maxDice?: number;
  /** Maximum explosion iterations allowed per die (default: 1,000) */
  maxExplodeIterations?: number;
  /** Maximum reroll iterations allowed per die (default: 1,000) */
  maxRerollIterations?: number;
};
