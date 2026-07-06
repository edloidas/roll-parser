#!/usr/bin/env node

/**
 * CLI entry point for roll-parser.
 *
 * @module cli/index
 */

import { isRollParserError } from '../errors.js';
import { VERSION } from '../index.js';
import { roll } from '../roll.js';
import { parseArgs } from './args.js';
import { formatResult } from './format.js';

const HELP_TEXT = `roll-parser v${VERSION}

Usage: roll-parser <notation> [options]

Options:
  -h, --help       Show this help message
  --version        Show version number
  -v, --verbose    Show detailed roll breakdown
  --seed <value>   Use seed for reproducible rolls

Examples:
  roll-parser 2d6+3
  roll-parser 4d6kh3 --verbose
  roll-parser 4d6dl1 --seed "character-str"
`;

/**
 * Prints the notation with a caret under the error position for errors that
 * carry one (LexerError/ParseError `position`, EvaluatorError `start`).
 * Skipped for multi-line notations and out-of-range positions to keep the
 * caret honest.
 */
function writeErrorContext(notation: string, error: Error): void {
  const position =
    'position' in error ? error.position : 'start' in error ? error.start : undefined;
  if (typeof position !== 'number' || !Number.isInteger(position)) return;
  if (notation.includes('\n') || position < 0 || position > notation.length) return;

  process.stderr.write(`  ${notation}\n`);
  process.stderr.write(`  ${' '.repeat(position)}^\n`);
}

function main(): void {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed.ok) {
    process.stderr.write(`Error: ${parsed.error}\n`);
    process.stderr.write('Run "roll-parser --help" for usage.\n');
    process.exitCode = 2;
    return;
  }

  const { args } = parsed;

  if (args.showHelp) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (args.showVersion) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }

  if (args.notation == null) {
    process.stderr.write('Error: No dice notation provided.\n');
    process.stderr.write('Run "roll-parser --help" for usage.\n');
    process.exitCode = 2;
    return;
  }

  try {
    const options = args.seed != null ? { seed: args.seed } : {};
    const result = roll(args.notation, options);
    const output = formatResult(result, args.verbose);
    process.stdout.write(`${output}\n`);
  } catch (error) {
    if (isRollParserError(error)) {
      process.stderr.write(`Error: ${error.message}\n`);
      writeErrorContext(args.notation, error);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

main();
