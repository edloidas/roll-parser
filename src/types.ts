/**
 * Shared type definitions for roll results.
 *
 * @module types
 */

/**
 * Modifier flags applied to individual die results.
 */
export type DieModifier = 'dropped' | 'kept' | 'exploded' | 'rerolled';

/**
 * Individual die roll result with metadata.
 */
export type DieResult = {
  /** Number of sides on the die */
  sides: number;
  /** The rolled value */
  result: number;
  /** Modifiers applied to this die */
  modifiers: DieModifier[];
  /** True if rolled the maximum value */
  critical: boolean;
  /** True if rolled 1 */
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
};

/**
 * Options for the evaluate function.
 */
export type EvaluateOptions = {
  /** Original notation string (for result metadata) */
  notation?: string;
};
