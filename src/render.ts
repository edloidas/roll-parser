/**
 * Breakdown rendering with consumer-supplied markers.
 *
 * `RollResult.rendered` bakes one markdown dialect into a string. This module
 * rebuilds the same breakdown from `RollResult.parts`, letting the caller
 * decide how each die is marked — HTML spans, ANSI codes, Telegram
 * MarkdownV2, or nothing at all. Import it from `roll-parser/render`.
 *
 * @module render
 */

import type {
  DieResult,
  KeepDropSpec,
  ResolvedComparePoint,
  ResolvedCritThreshold,
  RollPart,
  RollResult,
} from './types.js';
import { DegreeOfSuccess } from './types.js';

/**
 * Per-die markers. Every slot is optional; an omitted slot leaves the die's
 * text untouched, so `{}` renders a breakdown with no markup whatsoever.
 *
 * `text` arrives as the die's value already wrapped by any inner mark, and
 * composition order is fixed: `critical` then `fumble` innermost, then
 * exactly one of `dropped`, `success`, or `failure` outermost — matching the
 * priority `RollResult.rendered` uses, where a dropped die is never also
 * shown as a success.
 *
 * @example A die that is both critical and dropped
 * ```typescript
 * { critical: (_die, text) => `<b>${text}</b>`, dropped: (_die, text) => `<s>${text}</s>` }
 * // renders <s><b>20</b></s>
 * ```
 *
 * @category Rendering
 */
export type DieMarks = {
  /** Excluded from the total by `kh`/`kl`/`dh`/`dl`, a reroll, or group selection. */
  dropped?: (die: DieResult, text: string) => string;
  /** Met a success-count threshold. */
  success?: (die: DieResult, text: string) => string;
  /** Met a failure threshold. */
  failure?: (die: DieResult, text: string) => string;
  /** `DieResult.critical` — the default rule or an explicit `cs` threshold. */
  critical?: (die: DieResult, text: string) => string;
  /** `DieResult.fumble` — the default rule or an explicit `cf` threshold. */
  fumble?: (die: DieResult, text: string) => string;
  /**
   * Wraps a whole sub-roll dropped by group selection (`{1d8, 1d10}kh1`).
   *
   * Inside it, `dropped`, `success`, and `failure` are suppressed — the
   * wrapper already carries the verdict, and marking a dropped die inside a
   * dropped sub-roll says nothing extra. `critical` and `fumble` still apply:
   * they describe the face, not the selection. A nested `droppedGroup` also
   * survives, so `{{1d6, 1d8}kh1, 1d10}kh1` can wrap twice.
   */
  droppedGroup?: (inner: string) => string;
};

/**
 * The marks `RollResult.rendered` itself uses. Applied when
 * {@link renderBreakdown} is called without a `marks` argument; spread it to
 * override one slot while keeping the rest markdown.
 *
 * @category Rendering
 */
export const MARKDOWN_MARKS: DieMarks = {
  dropped: (_die, text) => `~~${text}~~`,
  success: (_die, text) => `**${text}**`,
  failure: (_die, text) => `__${text}__`,
  droppedGroup: (inner) => `~~${inner}~~`,
};

const KEEP_DROP_CODES = {
  keep: { highest: 'kh', lowest: 'kl' },
  drop: { highest: 'dh', lowest: 'dl' },
} as const;

const EXPLODE_MARKERS = {
  standard: '!',
  compound: '!!',
  penetrating: '!p',
} as const;

const DEGREE_LABELS: Record<DegreeOfSuccess, string> = {
  [DegreeOfSuccess.CriticalFailure]: 'Critical Failure',
  [DegreeOfSuccess.Failure]: 'Failure',
  [DegreeOfSuccess.Success]: 'Success',
  [DegreeOfSuccess.CriticalSuccess]: 'Critical Success',
};

/** Bare identifier grammar; anything else was written `@{like this}`. */
const BARE_VARIABLE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function comparePointCode(point: ResolvedComparePoint): string {
  return `${point.operator}${point.value}`;
}

function critCode(prefix: 'cs' | 'cf', threshold: ResolvedCritThreshold): string {
  return threshold === 'default' ? prefix : `${prefix}${comparePointCode(threshold)}`;
}

function keepDropCode(spec: KeepDropSpec): string {
  return `${KEEP_DROP_CODES[spec.kind][spec.selector]}${spec.count}`;
}

/** `'='` is elided because bare `fN` parses back to it — `f3`, `f<3`, `f>=3`. */
function failCode(point: ResolvedComparePoint): string {
  return point.operator === '=' ? `f${point.value}` : `f${comparePointCode(point)}`;
}

/**
 * Rebuilds the normalized expression a part contributes to
 * `RollResult.expression` — the prefix every dice bracket hangs off.
 *
 * Meta-expressions are already resolved to numbers here, so `4d6kh(1d2)`
 * comes back as `4d6kh1`, exactly as the evaluator spells it.
 */
function expr(part: RollPart): string {
  switch (part.type) {
    case 'literal':
      return String(part.value);
    case 'variable':
      return String(part.value);
    case 'dice':
      return `${part.count}d${part.sides}`;
    case 'fateDice':
      return `${part.count}dF`;
    case 'grouped':
      return `(${expr(part.inner)})`;
    case 'binaryOp':
      return `${expr(part.left)} ${part.operator} ${expr(part.right)}`;
    case 'unaryOp':
      return `-${expr(part.operand)}`;
    case 'group':
      return `{${part.parts.map(expr).join(', ')}}`;
    case 'functionCall':
      return `${part.name}(${part.args.map(expr).join(', ')})`;
    case 'keepDrop':
      return `${expr(part.target)}${part.specs.map(keepDropCode).join('')}`;
    case 'explode':
      return `${expr(part.target)}${explodeCode(part)}`;
    case 'reroll':
      return `${expr(part.target)}${part.once ? 'ro' : 'r'}${comparePointCode(part.condition)}`;
    case 'dieBound':
      return `${expr(part.target)}${dieBoundCode(part)}`;
    case 'sort':
      return `${expr(part.target)}${part.order === 'ascending' ? 's' : 'sd'}`;
    case 'critThreshold':
      return `${expr(part.target)}${critThresholdCode(part)}`;
    case 'successCount':
      return `${expr(part.target)}${successCountCode(part)}`;
    case 'versus':
      return `${expr(part.roll)} vs ${expr(part.dc)}`;
  }
}

function explodeCode(part: Extract<RollPart, { type: 'explode' }>): string {
  const marker = EXPLODE_MARKERS[part.variant];
  return part.threshold == null ? marker : `${marker}${comparePointCode(part.threshold)}`;
}

/** Negative bounds are parenthesized so the expression re-parses. */
function dieBoundCode(part: Extract<RollPart, { type: 'dieBound' }>): string {
  return part.value < 0 ? `${part.bound}(${part.value})` : `${part.bound}${part.value}`;
}

function critThresholdCode(part: Extract<RollPart, { type: 'critThreshold' }>): string {
  return [
    ...part.successThresholds.map((threshold) => critCode('cs', threshold)),
    ...part.failThresholds.map((threshold) => critCode('cf', threshold)),
  ].join('');
}

function successCountCode(part: Extract<RollPart, { type: 'successCount' }>): string {
  const fail = part.failThreshold == null ? '' : failCode(part.failThreshold);
  return `${comparePointCode(part.threshold)}${fail}`;
}

/**
 * Collects the dice a part's subtree produced, in evaluation order.
 *
 * `sort`, `explode`, `reroll`, and `successCount` carry their own pool and
 * stop the descent: a sorted pool is reordered, and an exploded or rerolled
 * one holds dice that exist nowhere under `target`.
 */
function collectDice(part: RollPart, out: DieResult[]): void {
  switch (part.type) {
    case 'dice':
    case 'fateDice':
    case 'sort':
    case 'explode':
    case 'reroll':
    case 'successCount':
      for (const die of part.rolls) out.push(die);
      return;
    case 'grouped':
      collectDice(part.inner, out);
      return;
    case 'unaryOp':
      collectDice(part.operand, out);
      return;
    case 'binaryOp':
      collectDice(part.left, out);
      collectDice(part.right, out);
      return;
    case 'keepDrop':
    case 'dieBound':
    case 'critThreshold':
      collectDice(part.target, out);
      return;
    case 'group':
      for (const sub of part.parts) collectDice(sub, out);
      return;
    case 'functionCall':
      for (const arg of part.args) collectDice(arg, out);
      return;
    case 'versus':
      collectDice(part.roll, out);
      collectDice(part.dc, out);
      return;
    case 'literal':
    case 'variable':
      return;
  }
}

function poolOf(part: RollPart): DieResult[] {
  const dice: DieResult[] = [];
  collectDice(part, dice);
  return dice;
}

/**
 * Marks one die. `plain` suppresses the three state marks for dice inside a
 * dropped sub-roll, where the group wrapper already carries the verdict —
 * crit and fumble survive, since they describe the face, not the selection.
 */
function markDie(die: DieResult, marks: DieMarks, plain: boolean): string {
  let text = String(die.result);

  if (die.critical) text = marks.critical?.(die, text) ?? text;
  if (die.fumble) text = marks.fumble?.(die, text) ?? text;
  if (plain) return text;

  const { modifiers } = die;
  if (modifiers.includes('dropped')) return marks.dropped?.(die, text) ?? text;
  if (modifiers.includes('success')) return marks.success?.(die, text) ?? text;
  if (modifiers.includes('failure')) return marks.failure?.(die, text) ?? text;

  return text;
}

/** `'meta'` dice were rolled to resolve a parameter — they are never shown. */
function renderPool(dice: readonly DieResult[], marks: DieMarks, plain: boolean): string {
  const shown: string[] = [];

  for (const die of dice) {
    if (die.modifiers.includes('meta')) continue;
    shown.push(markDie(die, marks, plain));
  }

  return `[${shown.join(', ')}]`;
}

/**
 * A modifier renders as `<target expression><code><pool>`, replacing whatever
 * bracket the target would have shown on its own. An empty pool means the
 * target rolled nothing at all, and the bracket is dropped with it.
 */
function renderModifier(
  target: RollPart,
  code: string,
  dice: readonly DieResult[],
  marks: DieMarks,
  plain: boolean,
): string {
  const pool = dice.length === 0 ? '' : renderPool(dice, marks, plain);
  return `${expr(target)}${code}${pool}`;
}

function renderPart(part: RollPart, marks: DieMarks, plain: boolean): string {
  switch (part.type) {
    case 'literal':
      return String(part.value);
    case 'variable': {
      const display = BARE_VARIABLE.test(part.name) ? `@${part.name}` : `@{${part.name}}`;
      return `${display}[${part.value}]`;
    }
    case 'dice':
    case 'fateDice':
      return `${expr(part)}${renderPool(part.rolls, marks, plain)}`;
    case 'grouped':
      return `(${renderPart(part.inner, marks, plain)})`;
    case 'binaryOp':
      return `${renderPart(part.left, marks, plain)} ${part.operator} ${renderPart(part.right, marks, plain)}`;
    case 'unaryOp':
      return `-${renderPart(part.operand, marks, plain)}`;
    case 'functionCall': {
      const args = part.args.map((arg) => renderPart(arg, marks, plain)).join(', ');
      return `${part.name}(${args})`;
    }
    case 'versus':
      return `${renderPart(part.roll, marks, plain)} vs ${renderPart(part.dc, marks, plain)}`;
    case 'group':
      return renderGroup(part, marks, plain);
    case 'keepDrop':
      // Sub-roll selection renders through the group, which strikes whole
      // sub-rolls; only the flat-pool form collapses into one bracket.
      return part.target.type === 'group' && part.target.keptIndices != null
        ? renderPart(part.target, marks, plain)
        : `${expr(part.target)}${renderPool(poolOf(part.target), marks, plain)}`;
    case 'explode':
      return renderModifier(part.target, explodeCode(part), part.rolls, marks, plain);
    case 'reroll':
      return renderModifier(
        part.target,
        `${part.once ? 'ro' : 'r'}${comparePointCode(part.condition)}`,
        part.rolls,
        marks,
        plain,
      );
    case 'successCount':
      return renderModifier(part.target, successCountCode(part), part.rolls, marks, plain);
    case 'dieBound':
      return `${expr(part.target)}${dieBoundCode(part)}${renderPool(poolOf(part.target), marks, plain)}`;
    case 'sort':
      return `${expr(part.target)}${part.order === 'ascending' ? 's' : 'sd'}${renderPool(part.rolls, marks, plain)}`;
    case 'critThreshold':
      return `${expr(part.target)}${critThresholdCode(part)}${renderPool(poolOf(part.target), marks, plain)}`;
  }
}

function renderGroup(
  part: Extract<RollPart, { type: 'group' }>,
  marks: DieMarks,
  plain: boolean,
): string {
  const { keptIndices } = part;
  const subRolls = part.parts.map((sub, index) => {
    if (keptIndices == null || keptIndices.includes(index)) {
      return renderPart(sub, marks, plain);
    }
    const inner = renderPart(sub, marks, true);
    return marks.droppedGroup?.(inner) ?? inner;
  });

  return `{${subRolls.join(', ')}}`;
}

/**
 * Rebuilds a roll's breakdown from `RollResult.parts`, applying `marks` to
 * every die.
 *
 * With no `marks` the output is byte-identical to `RollResult.rendered` — a
 * property test pins that over generated notation. Pass any object to take
 * over: omitted slots render plain, so `{}` strips markup entirely and
 * `{ ...MARKDOWN_MARKS, critical: … }` keeps the rest of the markdown.
 *
 * The trailing `= <total>` is included, and becomes the degree label for a
 * `vs` roll, exactly as `rendered` does.
 *
 * @param result - A finished result from `roll` or `evaluate`
 * @param marks - Per-die markers; defaults to {@link MARKDOWN_MARKS}
 * @returns The rendered breakdown
 *
 * @example
 * ```typescript
 * import { roll } from 'roll-parser';
 * import { renderBreakdown } from 'roll-parser/render';
 * import { createMockRng } from 'roll-parser/testing';
 *
 * const result = roll('4d6kh3', { rng: createMockRng([3, 6, 2, 5]) });
 *
 * renderBreakdown(result); // '4d6[3, 6, ~~2~~, 5] = 14'
 * renderBreakdown(result, {}); // '4d6[3, 6, 2, 5] = 14'
 * renderBreakdown(result, {
 *   dropped: (_die, text) => `<s>${text}</s>`,
 *   critical: (_die, text) => `<b>${text}</b>`,
 * }); // '4d6[3, <b>6</b>, <s>2</s>, 5] = 14'
 * ```
 *
 * @category Rendering
 */
export function renderBreakdown(result: RollResult, marks: DieMarks = MARKDOWN_MARKS): string {
  const trailing = result.degree == null ? String(result.total) : DEGREE_LABELS[result.degree];

  return `${renderPart(result.parts, marks, false)} = ${trailing}`;
}
