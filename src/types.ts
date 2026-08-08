/**
 * Shared type definitions for roll results and comparison primitives.
 *
 * @module types
 */

import type { ASTNode } from './parser/ast.js';

/**
 * Comparison operator for compare points. Spelled exactly as it appears in
 * notation — `4d6!>=5` carries `'>='`, bare `f1` normalizes to `'='`.
 *
 * @category AST
 */
export type CompareOp = '>' | '>=' | '<' | '<=' | '=';

/**
 * A comparison threshold used by exploding dice, reroll, success counting, and
 * crit-threshold overrides.
 *
 * The value is an {@link ASTNode} to support computed thresholds
 * (`1d6!>(1d2+3)`), matching the pattern used by `DiceNode.count` and
 * `DiceNode.sides`. The evaluated counterpart is {@link ResolvedComparePoint}.
 *
 * @category AST
 */
export type ComparePoint = {
  readonly operator: CompareOp;
  readonly value: ASTNode;
};

/**
 * A {@link ComparePoint} whose value has been evaluated to a number. Used
 * throughout {@link RollPart}, where meta-expressions are already resolved —
 * `1d6!>(1d2+3)` surfaces as `{ operator: '>', value: 5 }`.
 *
 * @category Results
 */
export type ResolvedComparePoint = {
  readonly operator: CompareOp;
  readonly value: number;
};

/**
 * A resolved crit threshold — `'default'` means the per-die default rule,
 * which is what bare `cs` / `cf` produce. It reads the natural face
 * (`initialResult ?? result`): critical when it equals `sides`, fumble when
 * it equals 1, both only for `sides > 1`. An explicit ComparePoint instead
 * reads the die's current `result`, so a preceding modifier that rewrote it
 * is visible to the comparison.
 *
 * @category Results
 */
export type ResolvedCritThreshold = ResolvedComparePoint | 'default';

/**
 * Tags attached to a {@link DieResult} by the evaluator. A die can carry more
 * than one (an exploded die that was later dropped is `['dropped',
 * 'exploded']`), and the set drives the markers in `RollResult.rendered`.
 *
 * | Tag | Meaning | Rendered as |
 * |-----|---------|-------------|
 * | `'kept'` | Counted toward the total. Every non-dropped die carries it. | plain |
 * | `'dropped'` | Excluded from the total by `kh`/`kl`/`dh`/`dl` or group selection. | `~~n~~` |
 * | `'exploded'` | Produced by, or the trigger of, an explosion (`!`, `!!`, `!p`). | plain |
 * | `'rerolled'` | A discarded intermediate from `r` / `ro`, always paired with `'dropped'` — the replacement die carries no tag. | `~~n~~` (via `'dropped'`) |
 * | `'min'` | Raised to a `minN` bound; `initialResult` keeps the raw face. | plain |
 * | `'max'` | Lowered to a `maxN` bound; `initialResult` keeps the raw face. | plain |
 * | `'success'` | Met a success-count threshold (`>=6`). | `**n**` |
 * | `'failure'` | Met a failure threshold (`f1`). | `__n__` |
 * | `'meta'` | Rolled by a meta-expression rather than by the visible pool. | not shown |
 * | `'dc'` | The DC side of a `vs` comparison. Never part of the roll-side pool. | plain |
 *
 * `'meta'` is the one tag with no counterpart in the notation. Dice counts,
 * sides, modifier counts and computed thresholds may themselves be dice
 * (`(1d4)d6`, `4d6kh(1d2)`, `1d6!>(1d2+3)`). Those inner dice are not part of
 * any pool, so they never appear in a {@link RollPart}; they are appended to
 * `RollResult.rolls` tagged `'meta'` so an audit log can still show what the
 * meta-expression rolled. Filter them out when summing or displaying a pool.
 *
 * `'dc'` marks the DC side of a `vs` comparison. Unlike `'meta'` these dice do
 * render — `1d20[3] vs 2d10[5, 6]` shows both sides — but they are not part of
 * the roll-side pool, so no modifier may sum, select, clamp, reroll, explode,
 * or tally them. Filter them out when summing a pool, exactly as with `'meta'`.
 *
 * @category Results
 */
export type DieModifier =
  | 'dropped'
  | 'kept'
  | 'exploded'
  | 'rerolled'
  | 'min'
  | 'max'
  | 'success'
  | 'failure'
  | 'meta'
  | 'dc';

/**
 * PF2e Degree of Success. Produced by the `vs` operator when comparing a
 * roll against a Difficulty Class. Ordering is significant — natural 20
 * upgrades one step and natural 1 downgrades one step.
 *
 * Numeric by design: the enum members are plain numbers, so `--json` CLI
 * output and `JSON.stringify` emit `0`–`3` and comparisons like
 * `degree >= DegreeOfSuccess.Success` work.
 *
 * @example
 * ```typescript
 * import { DegreeOfSuccess, roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('1d20+7 vs 15', { rng: createMockRng([12]) });
 * result.degree; // DegreeOfSuccess.Success (2)
 * result.natural; // 12 — the raw d20 face, used for the ±1 step
 * result.rendered; // '1d20[12] + 7 vs 15 = Success'
 *
 * if (result.degree != null && result.degree >= DegreeOfSuccess.Success) {
 *   // hit
 * }
 * ```
 *
 * @category Results
 */
export enum DegreeOfSuccess {
  CriticalFailure = 0,
  Failure = 1,
  Success = 2,
  CriticalSuccess = 3,
}

/**
 * One physical die and everything the evaluator learned about it.
 *
 * The same object is shared between `RollResult.rolls` and the `rolls[]` of
 * the {@link RollPart} that produced it — there is no deep clone, so mutating
 * a die is visible through both views.
 *
 * @example
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
 * result.rolls[1];
 * // { sides: 6, result: 6, modifiers: ['kept'], critical: true, fumble: false }
 * result.rolls[2];
 * // { sides: 6, result: 2, modifiers: ['dropped'], critical: false, fumble: false }
 * ```
 *
 * @category Results
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
  /**
   * True if the die met its critical criteria — by default, rolling the
   * maximum face on a die with more than one side. That default never fires
   * on `d1` or on Fate dice (`sides = 0` has no maximum face), but an
   * explicit `cs` threshold does: `4dFcs>0` flags every `+1`.
   */
  critical: boolean;
  /**
   * True if the die met its fumble criteria — by default, rolling a 1 on a
   * die with more than one side. As with {@link DieResult.critical}, the
   * default never fires on `d1` or Fate dice, while an explicit `cf`
   * threshold does: `4dFcf=-1` flags every `-1`.
   */
  fumble: boolean;
};

/**
 * One entry inside a flattened keep/drop chain. Counts are resolved at
 * evaluation time (meta-expressions like `kh(1d2)` become the rolled number).
 *
 * Chained keep/drop modifiers flatten into one list — `4d6kh3dl1` yields two
 * specs against a single pool, each applied independently, with drop sets
 * unioned (Roll20 semantics).
 *
 * @category Results
 */
export type KeepDropSpec = {
  readonly kind: 'keep' | 'drop';
  readonly selector: 'highest' | 'lowest';
  readonly count: number;
};

/**
 * Fields shared by every {@link RollPart} variant. `start`/`end` mirror the
 * source span of the AST node the part was evaluated from — present whenever
 * the AST came from `parse()`, absent on hand-built ASTs.
 *
 * Useful for code that walks the parts tree generically: any part can be
 * narrowed to this shape without switching on `type` first.
 *
 * @category Results
 */
export type RollPartBase = {
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
 *
 * @example Walking the tree with an exhaustive switch
 * ```typescript
 * import type { RollPart } from 'roll-parser';
 *
 * function describe(part: RollPart): string {
 *   switch (part.type) {
 *     case 'literal':
 *       return String(part.value);
 *     case 'variable':
 *       return `@${part.name}`;
 *     case 'dice':
 *       return `${part.count}d${part.sides}[${part.rolls.map((d) => d.result).join(', ')}]`;
 *     case 'fateDice':
 *       return `${part.count}dF`;
 *     case 'grouped':
 *       return `(${describe(part.inner)})`;
 *     case 'binaryOp':
 *       return `${describe(part.left)} ${part.operator} ${describe(part.right)}`;
 *     case 'unaryOp':
 *       return `-${describe(part.operand)}`;
 *     case 'keepDrop':
 *       return `${describe(part.target)} [${part.specs.length} keep/drop]`;
 *     case 'explode':
 *       return `${describe(part.target)} (${part.variant} explode)`;
 *     case 'reroll':
 *       return `${describe(part.target)} (reroll${part.once ? ' once' : ''})`;
 *     case 'dieBound':
 *       return `${describe(part.target)} (${part.bound} ${part.value})`;
 *     case 'successCount':
 *       return `${describe(part.target)} => ${part.successes}-${part.failures}`;
 *     case 'versus':
 *       return `${describe(part.roll)} vs ${describe(part.dc)}`;
 *     case 'functionCall':
 *       return `${part.name}(${part.args.map(describe).join(', ')})`;
 *     case 'group':
 *       return `{${part.parts.map(describe).join(', ')}}`;
 *     case 'sort':
 *       return `${describe(part.target)} (${part.order})`;
 *     case 'critThreshold':
 *       return `${describe(part.target)} (crit override)`;
 *   }
 * }
 * ```
 *
 * @example Reading a concrete tree
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('4d6kh3 + 2', { rng: createMockRng([3, 6, 2, 5]) });
 * result.parts.type; // 'binaryOp'
 * result.parts.total; // 16 — always equal to result.total
 * describe(result.parts); // '4d6[3, 6, 2, 5] [1 keep/drop] + 2'
 * ```
 *
 * @category Results
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
  | (RollPartBase & { type: 'keepDrop'; specs: KeepDropSpec[]; target: RollPart })
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
  | (RollPartBase & { type: 'dieBound'; bound: 'min' | 'max'; value: number; target: RollPart })
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
  | (RollPartBase & {
      type: 'sort';
      order: 'ascending' | 'descending';
      /**
       * Every die the target produced, in sorted order, sharing `DieResult`
       * references with `target` — so flags set after the sort (`4d6s dl1`)
       * show through both. Like `RollResult.rolls` it keeps `'meta'` dice,
       * which `rendered` omits from the bracket.
       */
      rolls: DieResult[];
      target: RollPart;
    })
  | (RollPartBase & {
      type: 'critThreshold';
      successThresholds: ResolvedCritThreshold[];
      failThresholds: ResolvedCritThreshold[];
      target: RollPart;
    });

/**
 * The 17 discriminant strings of {@link RollPart}. Convenience alias for
 * consumers writing exhaustive switches or part-type lookup tables.
 *
 * @category Results
 */
export type RollPartType = RollPart['type'];

/**
 * Complete roll result with all metadata — what {@link roll} and
 * {@link evaluate} return.
 *
 * The top level is `Readonly` — a result describes one completed evaluation
 * and is never re-targeted. The `rolls` array and the `parts` tree stay
 * mutable so consumers can annotate or re-sort their own views.
 *
 * Fully JSON-serializable; this is exactly what the CLI's `--json` flag emits.
 *
 * @example
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('3d6', { rng: createMockRng([4, 2, 6]) });
 *
 * JSON.stringify(result);
 * // {
 * //   "total": 12,
 * //   "notation": "3d6",
 * //   "expression": "3d6",
 * //   "rendered": "3d6[4, 2, 6] = 12",
 * //   "rolls": [
 * //     { "sides": 6, "result": 4, "modifiers": ["kept"], "critical": false, "fumble": false },
 * //     { "sides": 6, "result": 2, "modifiers": ["kept"], "critical": false, "fumble": false },
 * //     { "sides": 6, "result": 6, "modifiers": ["kept"], "critical": true,  "fumble": false }
 * //   ],
 * //   "parts": {
 * //     "type": "dice", "count": 3, "sides": 6,
 * //     "rolls": [ ...the same three objects... ],
 * //     "total": 12, "start": 0, "end": 3
 * //   }
 * // }
 * ```
 *
 * @category Results
 */
export type RollResult = Readonly<{
  /** Final computed total */
  total: number;
  /** Original input notation */
  notation: string;
  /** Normalized expression */
  expression: string;
  /** Rendered result with individual rolls shown */
  rendered: string;
  /**
   * All individual die results, in evaluation order.
   *
   * Shares `DieResult` object references with the `rolls[]` arrays inside
   * `parts` — no deep clone. Mutating a die here is visible through the part
   * tree and vice versa; clone first if that matters.
   */
  rolls: DieResult[];
  /** Structured breakdown of the evaluated expression, mirroring the AST 1:1. */
  parts: RollPart;
  /**
   * Number of dice tagged as success across the whole expression. Present
   * only when a success-counting modifier was used. Independent of `total` —
   * arithmetic on top of a success count (e.g. `{5d6>=5}+2`) affects `total`
   * but not `successes`. Success counts are terminal, so the group braces are
   * required: `5d6>=5 * 2` is an `INVALID_SUCCESS_COUNT_TARGET` parse error.
   */
  successes?: number;
  /**
   * Number of dice tagged as failure across the whole expression. Present
   * whenever a success-counting modifier was used — `0` when no failure
   * threshold was given, since nothing can be tagged as a failure.
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
}>;

/**
 * Evaluation guardrails and variable resolution, shared by `EvaluateOptions`
 * and `RollOptions`. Every field is optional — the defaults bound adversarial
 * notation without capping any realistic expression.
 *
 * Tighten them when the notation comes from users you do not control; the
 * caps are the difference between a typed `EvaluatorError` and a request that
 * rolls ten million dice. Parse depth is capped separately and
 * unconditionally by {@link MAX_PARSE_DEPTH}.
 *
 * The three numeric limits fail closed: omit one — or pass `undefined` or
 * `null`, the no-options path a partial config produces — and it takes its
 * default, but supply anything else that is not a safe integer in range — a
 * string, `NaN`, `±Infinity`, a negative, a fraction — and evaluation throws
 * `INVALID_EVALUATION_LIMIT` before rolling. `maxDice` accepts `>= 1`, the two
 * iteration limits `>= 0`. No coercion: `maxDice: Number(input)` on
 * unparseable input rejects rather than quietly reverting to the permissive
 * default.
 *
 * @example Untrusted input
 * ```typescript
 * import { isRollParserError, roll } from 'roll-parser';
 *
 * const limits = {
 *   maxDice: 100,
 *   maxExplodeIterations: 20,
 *   maxRerollIterations: 20,
 * };
 *
 * try {
 *   roll('99999d6', limits).total;
 * } catch (error) {
 *   isRollParserError(error) && error.code; // 'DICE_LIMIT_EXCEEDED'
 * }
 * ```
 *
 * @example Variables
 * ```typescript
 * import { roll } from 'roll-parser';
 *
 * roll('1d20+@str', { context: { str: 4 }, seed: 'demo' }).total; // 5
 * roll('1d20+@str', { onMissingVariable: 'zero', seed: 'demo' }).total; // 1
 * ```
 *
 * @category Core
 */
export type EvaluationOptions = {
  /** Maximum total dice allowed per evaluation; integer >= 1 (default: 10,000) */
  maxDice?: number;
  /** Maximum explosion iterations allowed per die; integer >= 0 (default: 1,000) */
  maxExplodeIterations?: number;
  /** Maximum reroll iterations allowed per die; integer >= 0 (default: 1,000) */
  maxRerollIterations?: number;
  /** Variable context for `@name` / `@{name}` references (default: empty) */
  context?: Readonly<Record<string, number>>;
  /** Behavior when a referenced variable is missing from context (default: 'throw') */
  onMissingVariable?: 'throw' | 'zero';
};

/**
 * Options for {@link evaluate}: the shared {@link EvaluationOptions} plus the
 * original notation, which `evaluate` cannot recover from an AST.
 *
 * @category Core
 */
export type EvaluateOptions = EvaluationOptions & {
  /**
   * Original notation string, echoed back as `RollResult.notation`. When
   * omitted, falls back to the normalized `expression` reconstructed from the
   * AST — {@link roll} always forwards the string the caller typed.
   */
  notation?: string;
};
