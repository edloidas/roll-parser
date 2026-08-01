/**
 * CLI command implementation for roll-parser.
 *
 * Split out of `index.ts` so `main` and `writeErrorContext` can run
 * in-process under the test runner — the shebang entry point stays a thin
 * wrapper that owns `process.argv`, the real streams, and `process.exitCode`.
 *
 * @module cli/main
 */

import { getErrorSpan, isRollParserError } from '../errors.js';
import { VERSION } from '../index.js';
import { roll } from '../roll.js';
import { parseArgs } from './args.js';
import { formatResult } from './format.js';

const HELP_TEXT = `roll-parser v${VERSION}

Usage: roll-parser [options] [--] <notation>

Options:
  -h, --help       Show this help message
  --version        Show version number
  -v, --verbose    Show detailed roll breakdown
  --json           Print the whole result as compact JSON (wins over --verbose)
  --seed <value>   Use seed for reproducible rolls
  --               Treat every following argument as notation

JSON output:
  Emits the complete result, including the structured "parts" tree. The
  "degree" field (DegreeOfSuccess) serializes as a number: 0 critical failure,
  1 failure, 2 success, 3 critical success. Errors stay plain text on stderr.

Exit codes:
  0  Success
  1  Roll or parse error
  2  Usage error

Examples:
  roll-parser 2d6+3
  roll-parser 4d6kh3 --verbose
  roll-parser 4d6dl1 --seed "character-str"
  roll-parser "1d20+7 vs 25" --json
  roll-parser -- -1d6+3
`;

/** Sink for one stream's worth of CLI output. */
export type WriteFn = (text: string) => void;

/** Everything `main` needs from the host process. */
export type CliEnv = {
  /** Arguments after the interpreter and script path (`process.argv.slice(2)`). */
  argv: string[];
  stdout: WriteFn;
  stderr: WriteFn;
};

/**
 * Prints the notation with a caret under the error position. `getErrorSpan`
 * normalizes the lexer/parser `position` and the evaluator `start`/`end`
 * shapes, so no duck-typing is needed here. Skipped for multi-line notations
 * and out-of-range positions to keep the caret honest.
 */
export function writeErrorContext(notation: string, error: unknown, write: WriteFn): void {
  const span = getErrorSpan(error);
  if (span == null) return;
  if (notation.includes('\n') || span.start > notation.length) return;

  // Code points, not UTF-16 units — an astral character ('🎲') is two units but
  // one column, and counting units shifts the caret right.
  const column = [...notation.slice(0, span.start)].length;

  write(`  ${notation}\n`);
  write(`  ${' '.repeat(column)}^\n`);
}

/**
 * Runs one CLI invocation and returns the process exit code: `0` on success,
 * `1` for a roll-parser error, `2` for a usage error. Anything that is not a
 * `RollParserError` propagates so the runtime reports it with a stack.
 *
 * `--json` swaps the success payload only — diagnostics stay plain text on
 * stderr and the exit codes are identical, so scripts can branch on the code
 * before parsing stdout.
 */
export function main(env: CliEnv): number {
  const { argv, stdout, stderr } = env;
  const parsed = parseArgs(argv);

  if (!parsed.ok) {
    stderr(`Error: ${parsed.error}\n`);
    stderr('Run "roll-parser --help" for usage.\n');
    return 2;
  }

  const { args } = parsed;

  if (args.showHelp) {
    stdout(HELP_TEXT);
    return 0;
  }

  if (args.showVersion) {
    stdout(`${VERSION}\n`);
    return 0;
  }

  if (args.notation == null) {
    stderr('Error: No dice notation provided.\n');
    stderr('Run "roll-parser --help" for usage.\n');
    return 2;
  }

  try {
    const options = args.seed != null ? { seed: args.seed } : {};
    const result = roll(args.notation, options);
    const output = formatResult(result, { json: args.json, verbose: args.verbose });
    stdout(`${output}\n`);
  } catch (error) {
    if (isRollParserError(error)) {
      stderr(`Error: ${error.message}\n`);
      writeErrorContext(args.notation, error, stderr);
      return 1;
    }
    throw error;
  }

  return 0;
}
