#!/usr/bin/env node

/**
 * CLI entry point for roll-parser.
 *
 * @module cli/index
 */

import { isRollParserError } from '../errors';
import { VERSION } from '../index';
import { roll } from '../roll';
import { parseArgs } from './args';
import { formatResult } from './format';

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
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

main();
