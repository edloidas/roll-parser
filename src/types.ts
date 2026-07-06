/**
 * Shared type definitions for roll results and comparison primitives.
 *
 * @module types
 */

import type { ASTNode } from './parser/ast.js';

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
 * A ComparePoint whose value has been evaluated to a number. Used in
 * `RollPart` where meta-expressions are already resolved.
 */
export type ResolvedComparePoint = {
  operator: CompareOp;
  value: number;
};

/**
 * A resolved crit threshold — `'default'` means the per-die default rule
 * (`result === sides` for critical, `result === 1` for fumble).
 */
export type ResolvedCritThreshold = ResolvedComparePoint | 'default';

/**
 * Modifier flags applied to individual die results.
 */
export type DieModifier =
  | 'dropped'
  | 'kept'
  | 'exploded'
  | 'rerolled'
  | 'success'
  | 'failure'
  | 'meta';

/**
 * PF2e Degree of Success. Produced by the `vs` operator when comparing a
 * roll against a Difficulty Class. Ordering is significant — natural 20
 * upgrades one step and natural 1 downgrades one step.
 */
export enum DegreeOfSuccess {
  CriticalFailure = 0,
  Failure = 1,
  Success = 2,
  CriticalSuccess = 3,
}

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
  /**
   * Raw first roll before any mutation (e.g., compound-explode accumulation).
   * Only populated when `result` has been overwritten with a computed value.
   * Consumers that need the original face (nat-20 / nat-1 detection) should
   * read `initialResult ?? result`.
   */
  initialResult?: number;
  /** Modifiers applied to this die */
  modifiers: DieModifier[];
  /** True if rolled the maximum value (always false for Fate dice) */
  critical: boolean;
  /** True if rolled 1 (always false for Fate dice) */
  fumble: boolean;
};

/**
 * Per-spec keep/drop entry inside a flattened modifier chain. Counts are
 * resolved at evaluation time (meta-expressions like `kh(1d2)` become the
 * rolled number).
 */
export type ModifierSpec = {
  kind: 'keep' | 'drop';
  selector: 'highest' | 'lowest';
  count: number;
};

/**
 * Fields shared by every RollPart variant. `start`/`end` mirror the source
 * span of the AST node the part was evaluated from — present whenever the
 * AST came from `parse()`, absent on hand-built ASTs.
 */
type RollPartBase = {
  /** Sub-total this part contributed to its parent. */
  total: number;
  start?: number;
  end?: number;
};

/**
 * Structured breakdown of an evaluated expression, mirroring the AST 1:1 —
 * every ASTNode produces exactly one RollPart. Discriminants are lowercase
 * camelCase to distinguish evaluation-tree types from `ASTNode.type`
 * (PascalCase) at a glance.
 *
 * Invariants:
 * - `RollResult.parts.total === RollResult.total`.
 * - `successCount.total === successes - failures`.
 * - `literal.total === value` and `variable.total === value`.
 * - Each part's `rolls[]` shares `DieResult` references with
 *   `RollResult.rolls[]`; both reflect post-evaluation state (explode
 *   accumulation, reroll flags, keep/drop flags). No deep clone.
 *
 * Meta-expression sub-trees (`4d6kh(1d2)`, `(1+1)d6` counts/sides, computed
 * thresholds) are not surfaced as nested parts — their resolved numbers
 * appear in the owning part, and their dice are inspectable in
 * `RollResult.rolls` via the `'meta'` modifier tag.
 */
export type RollPart =
  | (RollPartBase & { type: 'literal'; value: number })
  | (RollPartBase & { type: 'variable'; name: string; value: number })
  | (RollPartBase & { type: 'dice'; count: number; sides: number; rolls: DieResult[] })
  | (RollPartBase & { type: 'fateDice'; count: number; rolls: DieResult[] })
  | (RollPartBase & { type: 'grouped'; inner: RollPart })
  | (RollPartBase & {
      type: 'binaryOp';
      operator: '+' | '-' | '*' | '/' | '%' | '**';
      left: RollPart;
      right: RollPart;
    })
  | (RollPartBase & { type: 'unaryOp'; operator: '-'; operand: RollPart })
  | (RollPartBase & { type: 'modifier'; specs: ModifierSpec[]; target: RollPart })
  | (RollPartBase & {
      type: 'explode';
      variant: 'standard' | 'compound' | 'penetrating';
      threshold?: ResolvedComparePoint;
      target: RollPart;
    })
  | (RollPartBase & {
      type: 'reroll';
      once: boolean;
      condition: ResolvedComparePoint;
      target: RollPart;
    })
  | (RollPartBase & {
      type: 'successCount';
      threshold: ResolvedComparePoint;
      failThreshold?: ResolvedComparePoint;
      target: RollPart;
      successes: number;
      failures: number;
    })
  | (RollPartBase & { type: 'versus'; roll: RollPart; dc: RollPart; degree: DegreeOfSuccess })
  | (RollPartBase & { type: 'functionCall'; name: string; args: RollPart[] })
  | (RollPartBase & { type: 'group'; parts: RollPart[]; keptIndices?: number[] })
  | (RollPartBase & { type: 'sort'; order: 'ascending' | 'descending'; target: RollPart })
  | (RollPartBase & {
      type: 'critThreshold';
      successThresholds: ResolvedCritThreshold[];
      failThresholds: ResolvedCritThreshold[];
      target: RollPart;
    });

/** Convenience alias for consumers writing exhaustive switches. */
export type RollPartType = RollPart['type'];

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
  /** Structured breakdown of the evaluated expression, mirroring the AST 1:1. */
  parts: RollPart;
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
  /**
   * PF2e Degree of Success. Present only when the expression used the `vs`
   * operator at the top level (e.g. `1d20+10 vs 25`).
   */
  degree?: DegreeOfSuccess;
  /**
   * Natural d20 value used for PF2e upgrade/downgrade — present only when
   * exactly one kept d20 was rolled on the roll side of a `vs` expression.
   */
  natural?: number;
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
  /** Variable context for `@name` / `@{name}` references (default: empty) */
  context?: Record<string, number>;
  /** Behavior when a referenced variable is missing from context (default: 'throw') */
  onMissingVariable?: 'throw' | 'zero';
};
