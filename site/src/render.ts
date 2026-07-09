/**
 * Result-panel and error rendering: total, degree/success badges, the
 * marker-annotated breakdown, and inline error highlighting.
 *
 * @module render
 */

import {
  DegreeOfSuccess,
  type DieResult,
  type RollParserError,
  type RollPart,
  type RollResult,
} from '../../src/index.js';
import { dieStates, dieTitle } from './dice.js';

/** Above this die count the breakdown is skipped — itemizing is pointless noise. */
const MAX_BREAKDOWN_DICE = 500;

/** Above this many itemizable dice the structured equation is too busy — fall back. */
const MAX_EQUATION_DICE = 60;

/** Escapes the five HTML-significant characters. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Converts the library's markdown-ish `rendered` markers to styled spans.
 * Escapes first so notation characters (`>`, `<`) never inject markup, then
 * substitutes `~~n~~` (dropped), `**n**` (success), `__n__` (failure).
 */
function renderBreakdown(rendered: string): string {
  return escapeHtml(rendered)
    .replace(/~~(.+?)~~/g, '<span class="mk-dropped">$1</span>')
    .replace(/\*\*(.+?)\*\*/g, '<span class="mk-success">$1</span>')
    .replace(/__(.+?)__/g, '<span class="mk-failure">$1</span>');
}

/** Operator glyph — arithmetic symbols get their typographic forms. */
function operatorGlyph(operator: string): string {
  switch (operator) {
    case '*':
      return '×';
    case '/':
      return '÷';
    case '**':
      return '^';
    default:
      return operator;
  }
}

/** Rolled value for a mini die chip (`+1`/`0`/`−1` for Fate dice). */
function miniLabel(die: DieResult): string {
  if (die.sides === 0) {
    if (die.result > 0) return `+${die.result}`;
    if (die.result < 0) return `−${Math.abs(die.result)}`;
    return '0';
  }

  return String(die.result);
}

/** A small colored square echoing one die's value and state in the breakdown. */
function renderMiniDie(die: DieResult): string {
  const classes = ['mini-die', ...dieStates(die)].join(' ');
  const dot = die.modifiers.includes('exploded') ? '<span class="mini-dot"></span>' : '';

  return `<span class="${classes}" title="${escapeHtml(dieTitle(die))}">${escapeHtml(miniLabel(die))}${dot}</span>`;
}

/** Mini dice for a part's pool, skipping `meta` dice as the tray does. */
function renderMiniDice(rolls: DieResult[]): string {
  return rolls
    .filter((die) => !die.modifiers.includes('meta'))
    .map(renderMiniDie)
    .join('');
}

/**
 * Renders one evaluated `RollPart` tree into a horizontally-flowing equation.
 * Dice-bearing parts become group chips (label + mini dice + subtotal);
 * operators, literals, parens and function names render as plain tokens.
 * The outermost part's trailing subtotal is omitted — it equals the big total.
 */
function renderEquation(root: RollPart, notation: string): string {
  let chipIndex = 0;

  function sliceOf(part: RollPart): string {
    if (part.start == null || part.end == null) return '';
    return notation.slice(part.start, part.end);
  }

  function subtotalText(part: RollPart): string {
    if (part.type === 'successCount') {
      return `${part.successes} success${part.successes === 1 ? '' : 'es'}`;
    }
    return String(part.total);
  }

  function fallbackDiceLabel(part: RollPart): string {
    if (part.type === 'fateDice') return `${part.count}dF`;
    if (part.type === 'dice') return `${part.count}d${part.sides}`;
    return '';
  }

  function groupChip(
    label: string,
    rolls: DieResult[],
    subtotal: string,
    isOutermost: boolean,
  ): string {
    const sub = isOutermost ? '' : `<span class="grp-sub">= ${escapeHtml(subtotal)}</span>`;

    return [
      `<span class="grp" style="--i:${chipIndex++}">`,
      label !== '' ? `<span class="grp-label">${escapeHtml(label)}</span>` : '',
      `<span class="grp-dice">${renderMiniDice(rolls)}</span>`,
      sub,
      '</span>',
    ].join('');
  }

  function braceGroup(
    group: Extract<RollPart, { type: 'group' }>,
    subtotal: string,
    isOutermost: boolean,
  ): string {
    const { keptIndices } = group;
    const items = group.parts
      .map((sub, idx) => {
        const inner = render(sub, false);
        const dropped = keptIndices != null && !keptIndices.includes(idx);
        return dropped ? `<span class="eq-dropped">${inner}</span>` : inner;
      })
      .join('<span class="eq-comma">, </span>');
    const tail = isOutermost ? '' : `<span class="grp-sub">= ${escapeHtml(subtotal)}</span>`;

    return `<span class="brace-grp" style="--i:${chipIndex++}"><span class="eq-paren">{</span>${items}<span class="eq-paren">}</span>${tail}</span>`;
  }

  /** Renders a modifier-family part as one chip, unwrapping to the dice it decorates. */
  function modifierLike(part: RollPart, isOutermost: boolean): string {
    let core: RollPart = part;
    while ('target' in core) core = core.target;

    const label = sliceOf(part);

    if (core.type === 'dice' || core.type === 'fateDice') {
      return groupChip(
        label || fallbackDiceLabel(core),
        core.rolls,
        subtotalText(part),
        isOutermost,
      );
    }
    if (core.type === 'group') {
      return braceGroup(core, subtotalText(part), isOutermost);
    }

    return render(core, isOutermost);
  }

  function render(part: RollPart, isOutermost: boolean): string {
    switch (part.type) {
      case 'literal':
        return `<span class="eq-lit">${escapeHtml(String(part.value))}</span>`;
      case 'variable':
        return `<span class="eq-var">${escapeHtml(sliceOf(part) || `@${part.name}`)}</span>`;
      case 'dice':
      case 'fateDice':
        return groupChip(
          sliceOf(part) || fallbackDiceLabel(part),
          part.rolls,
          subtotalText(part),
          isOutermost,
        );
      case 'grouped':
        return `<span class="eq-paren">(</span>${render(part.inner, isOutermost)}<span class="eq-paren">)</span>`;
      case 'binaryOp':
        return `${render(part.left, false)}<span class="eq-op">${escapeHtml(operatorGlyph(part.operator))}</span>${render(part.right, false)}`;
      case 'unaryOp':
        return `<span class="eq-op">−</span>${render(part.operand, false)}`;
      case 'functionCall': {
        const args = part.args
          .map((arg) => render(arg, false))
          .join('<span class="eq-comma">, </span>');
        return `<span class="eq-fn">${escapeHtml(part.name)}</span><span class="eq-paren">(</span>${args}<span class="eq-paren">)</span>`;
      }
      case 'group':
        return braceGroup(part, subtotalText(part), isOutermost);
      case 'versus':
        return `${render(part.roll, false)}<span class="eq-vs">vs</span>${render(part.dc, false)}`;
      case 'modifier':
      case 'explode':
      case 'reroll':
      case 'sort':
      case 'critThreshold':
      case 'successCount':
        return modifierLike(part, isOutermost);
    }
  }

  return render(root, true);
}

const DEGREE_LABELS: Record<DegreeOfSuccess, { text: string; cls: string }> = {
  [DegreeOfSuccess.CriticalSuccess]: { text: 'Critical Success', cls: 'deg-crit-success' },
  [DegreeOfSuccess.Success]: { text: 'Success', cls: 'deg-success' },
  [DegreeOfSuccess.Failure]: { text: 'Failure', cls: 'deg-failure' },
  [DegreeOfSuccess.CriticalFailure]: { text: 'Critical Failure', cls: 'deg-crit-failure' },
};

function degreeBadge(result: RollResult): string {
  if (result.degree == null) return '';

  const { text, cls } = DEGREE_LABELS[result.degree];
  const natural =
    result.natural != null ? `<span class="degree-nat">natural ${result.natural}</span>` : '';

  return `<div class="degree-badge ${cls}">${text}${natural}</div>`;
}

function successSummary(result: RollResult): string {
  if (result.successes == null) return '';

  const failures =
    result.failures != null
      ? `<span class="count-item count-fail"><b>${result.failures}</b>failure${result.failures === 1 ? '' : 's'}</span>`
      : '';

  return [
    '<div class="success-summary">',
    `<span class="count-item count-success"><b>${result.successes}</b>success${result.successes === 1 ? '' : 'es'}</span>`,
    failures,
    '</div>',
  ].join('');
}

function breakdownBlock(result: RollResult): string {
  if (result.rolls.length > MAX_BREAKDOWN_DICE) {
    return `<p class="breakdown too-many">${result.rolls.length} dice — too many to itemize</p>`;
  }

  const itemizable = result.rolls.filter((die) => !die.modifiers.includes('meta')).length;
  if (itemizable > MAX_EQUATION_DICE) {
    return `<p class="breakdown">${renderBreakdown(result.rendered)}</p>`;
  }

  try {
    return `<div class="breakdown equation">${renderEquation(result.parts, result.notation)}</div>`;
  } catch {
    // Any structural surprise falls back to the flat marker string.
    return `<p class="breakdown">${renderBreakdown(result.rendered)}</p>`;
  }
}

function expressionNote(result: RollResult): string {
  if (result.expression === result.notation) return '';
  return `<p class="expr-note">${escapeHtml(result.expression)}</p>`;
}

/** Renders the full result panel content for a successful roll. */
export function renderResultPanel(result: RollResult): string {
  // ? Success counting reframes the roll — lead with the counts, not the sum.
  const emphasizeCounts = result.successes != null;
  const totalBlock = emphasizeCounts
    ? successSummary(result)
    : `<div class="total" aria-label="total">${result.total}</div>`;

  return [degreeBadge(result), totalBlock, breakdownBlock(result), expressionNote(result)].join('');
}

/**
 * Renders an error into its own slot: message plus the notation echoed in
 * mono with the offending position/span highlighted. Non-parser errors get a
 * generic message and no highlight.
 */
export function renderErrorSlot(
  error: unknown,
  notation: string,
  isRollParserError: (value: unknown) => value is RollParserError,
): string {
  if (!isRollParserError(error)) {
    return '<span class="error-msg">Something went wrong evaluating that roll.</span>';
  }

  const message = escapeHtml(error.message);
  const highlighted = highlightNotation(notation, error);

  return `<span class="error-msg">${message}</span>${highlighted}`;
}

type SpannedError = RollParserError & {
  position?: number;
  start?: number;
  end?: number;
};

/** Wraps the offending character span of the notation in a highlight marker. */
function highlightNotation(notation: string, error: SpannedError): string {
  if (notation === '') return '';

  const { start, end } = resolveSpan(error, notation.length);
  if (start == null) return `<code class="error-echo">${escapeHtml(notation)}</code>`;

  const before = escapeHtml(notation.slice(0, start));
  const marked = escapeHtml(notation.slice(start, end)) || '&nbsp;';
  const after = escapeHtml(notation.slice(end));

  return `<code class="error-echo">${before}<mark class="error-span">${marked}</mark>${after}</code>`;
}

/** Normalizes lexer/parser `position` and evaluator `start`/`end` into a span. */
function resolveSpan(
  error: SpannedError,
  length: number,
): { start: number | undefined; end: number } {
  if (error.start != null) {
    const start = clamp(error.start, 0, length);
    const end = error.end != null ? clamp(error.end, start, length) : Math.min(start + 1, length);
    return { start, end };
  }

  if (error.position != null) {
    const start = clamp(error.position, 0, length);
    return { start, end: Math.min(start + 1, length) };
  }

  return { start: undefined, end: length };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
