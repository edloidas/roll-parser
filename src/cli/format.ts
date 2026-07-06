/**
 * CLI output formatting.
 *
 * Transforms RollResult into terminal-appropriate strings.
 *
 * @module cli/format
 */

import type { RollResult } from '../types';

/**
 * Formats a roll result for terminal display.
 *
 * In normal mode, returns just the total. In verbose mode, returns the
 * rendered breakdown with terminal-safe formatting for dropped dice.
 *
 * @param result - The roll result to format
 * @param verbose - Whether to show the detailed breakdown
 * @returns Formatted string for terminal output
 */
export function formatResult(result: RollResult, verbose: boolean): string {
  if (!verbose) {
    return String(result.total);
  }

  return formatRendered(result.rendered);
}

/**
 * Converts markdown-style dice markers to terminal-friendly forms.
 *
 * The evaluator uses markdown syntax in the rendered field:
 *   `~~value~~` — dropped dice or dropped group sub-rolls
 *   `**value**` — dice counted as success
 *   `__value__` — dice counted as failure
 *
 * For plain terminals these become `(value)`, `[value]`, and `{value}` so
 * the per-die classification stays visible without any markup dependency.
 * Dropped spans can wrap a whole sub-roll (e.g. `~~1d8[2]~~` from
 * `{1d8, 1d10}kh1`), so the strikethrough pattern accepts any tilde-free
 * content, not just a single number. The evaluator never nests `~~`
 * (see `stripInnerMarkers`), so the tilde-free span match is safe.
 */
function formatRendered(rendered: string): string {
  return rendered
    .replace(/\*\*(-?\d+)\*\*/g, '[$1]')
    .replace(/__(-?\d+)__/g, '{$1}')
    .replace(/~~([^~]+)~~/g, '($1)');
}
