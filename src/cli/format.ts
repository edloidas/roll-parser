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
 * Converts markdown strikethrough to terminal-friendly parentheses.
 *
 * The evaluator uses `~~value~~` for dropped dice in the rendered field.
 * This replaces those with `(value)` for clear terminal display.
 */
function formatRendered(rendered: string): string {
  return rendered.replace(/~~(-?\d+)~~/g, '($1)');
}
