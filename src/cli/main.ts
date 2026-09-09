/**
 * CLI command implementation for roll-parser.
 *
 * Split out of `index.ts` so `main` and `writeErrorContext` can run
 * in-process under the test runner — the shebang entry point stays a thin
 * wrapper that owns `process.argv`, the real streams, and `process.exitCode`.
 *
 * @module cli/main
 */

import {
  type ErrorSpan,
  getErrorSpan,
  isRollParserError,
  type RollParserErrorCode,
} from '../errors.js';
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
  Emits the complete result, including the structured "parts" tree, plus the
  "seed" that produced it and the "version" that fixes the seed-to-dice
  mapping — rerun with --seed <seed> on the same major to replay the roll.
  When --seed is omitted the CLI mints one. The "degree" field
  (DegreeOfSuccess) serializes as a number: 0 critical failure, 1 failure,
  2 success, 3 critical success.

JSON errors:
  Every diagnostic is one JSON line on stderr:
  {"error":{"message":...,"code":...,"span":{"start":N}},...}. A roll error
  adds the "notation" and "seed" that produced it, so a failure replays like
  a result does; "code" and "span" are absent when the failure carries
  neither. Usage errors are covered too, but only where --json still reads as
  the flag: it is a seed value in --seed --json, and notation after --.

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

// The build sets `types: []`, so no ambient runtime globals are declared.
declare const crypto: { randomUUID(): string };

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

/** The `error` member of the `--json` failure record. */
type JsonErrorBody = {
  message: string;
  code?: RollParserErrorCode;
  span?: ErrorSpan | undefined;
};

/**
 * What the failure record needs to replay a roll that got as far as the
 * dice. A usage error passes no context — it never reached the dice, so
 * there is no roll to reproduce.
 */
type RollContext = {
  notation: string;
  seed: string;
};

/**
 * Writes one failure record as compact JSON. `JSON.stringify` drops the
 * absent members, so a lexer error carries no `end` and a usage error carries
 * neither `code` nor `span` — the key is missing rather than null.
 */
function writeJsonError(write: WriteFn, error: JsonErrorBody, context?: RollContext): void {
  write(`${JSON.stringify({ error, ...context, version: VERSION })}\n`);
}

/**
 * Runs one CLI invocation and returns the process exit code: `0` on success,
 * `1` for a roll-parser error, `2` for a usage error. Anything that is not a
 * `RollParserError` propagates so the runtime reports it with a stack.
 *
 * `--json` swaps the success payload on stdout and every diagnostic on
 * stderr, usage errors included. Exit codes are identical either way, so
 * scripts can still branch on the code before reading a stream.
 */
export function main(env: CliEnv): number {
  const { argv, stdout, stderr } = env;
  const parsed = parseArgs(argv);

  if (!parsed.ok) {
    if (parsed.json) {
      writeJsonError(stderr, { message: parsed.error });
    } else {
      stderr(`Error: ${parsed.error}\n`);
      stderr('Run "roll-parser --help" for usage.\n');
    }
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
    if (args.json) {
      writeJsonError(stderr, { message: 'No dice notation provided.' });
    } else {
      stderr('Error: No dice notation provided.\n');
      stderr('Run "roll-parser --help" for usage.\n');
    }
    return 2;
  }

  // `SeededRNG`'s auto-seed is unreachable, so mint one that can be echoed back.
  const seed = args.seed ?? crypto.randomUUID();

  try {
    const result = roll(args.notation, { seed });
    const output = formatResult(result, { json: args.json, verbose: args.verbose, seed });
    stdout(`${output}\n`);
  } catch (error) {
    if (isRollParserError(error)) {
      if (args.json) {
        writeJsonError(
          stderr,
          { message: error.message, code: error.code, span: getErrorSpan(error) },
          { notation: args.notation, seed },
        );
      } else {
        stderr(`Error: ${error.message}\n`);
        writeErrorContext(args.notation, error, stderr);
      }
      return 1;
    }
    throw error;
  }

  return 0;
}
