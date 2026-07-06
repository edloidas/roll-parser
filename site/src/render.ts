/**
 * Result-panel and error rendering: total, degree/success badges, the
 * marker-annotated breakdown, and inline error highlighting.
 *
 * @module render
 */

import { DegreeOfSuccess, type RollParserError, type RollResult } from '../../src/index.js';

/** Above this die count the breakdown is skipped — itemizing is pointless noise. */
const MAX_BREAKDOWN_DICE = 500;

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

  return `<p class="breakdown">${renderBreakdown(result.rendered)}</p>`;
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
