/**
 * CLI output formatting.
 *
 * Transforms RollResult into terminal-appropriate strings.
 *
 * @module cli/format
 */

import { type DieMarks, renderBreakdown } from '../render.js';
import type { RollResult } from '../types.js';

/**
 * Terminal stand-ins for the markdown markers `RollResult.rendered` uses:
 * dropped dice become `(value)`, successes `[value]`, failures `{value}`, so
 * the per-die classification stays visible with no markup dependency. A
 * dropped group sub-roll takes the same parentheses as a dropped die.
 */
const TERMINAL_MARKS: DieMarks = {
  dropped: (_die, text) => `(${text})`,
  success: (_die, text) => `[${text}]`,
  failure: (_die, text) => `{${text}}`,
  droppedGroup: (inner) => `(${inner})`,
};

/**
 * Output mode selectors for {@link formatResult}.
 */
export type FormatOptions = {
  /** Emit the whole result as compact JSON. Takes precedence over `verbose`. */
  json?: boolean;
  /** Show the detailed roll breakdown instead of the bare total. */
  verbose?: boolean;
};

/**
 * Formats a roll result for terminal display.
 *
 * In normal mode, returns just the total. In verbose mode, returns the
 * rendered breakdown with terminal-safe formatting for dropped dice. In JSON
 * mode, returns the complete `RollResult` — including the structured `parts`
 * tree — as a single-line `JSON.stringify` payload, where `degree` appears as
 * its numeric `DegreeOfSuccess` value.
 *
 * @param result - The roll result to format
 * @param options - Output mode; JSON wins when combined with verbose
 * @returns Formatted string for terminal output
 */
export function formatResult(result: RollResult, options: FormatOptions = {}): string {
  const { json = false, verbose = false } = options;

  if (json) {
    return JSON.stringify(result);
  }

  if (!verbose) {
    return String(result.total);
  }

  return renderBreakdown(result, TERMINAL_MARKS);
}
