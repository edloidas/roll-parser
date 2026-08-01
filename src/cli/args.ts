/**
 * CLI argument parser.
 *
 * Pure function that parses process.argv-style string arrays into typed options.
 *
 * @module cli/args
 */

/**
 * Parsed CLI arguments.
 */
export type CliArgs = {
  notation: string | undefined;
  verbose: boolean;
  json: boolean;
  seed: string | undefined;
  showHelp: boolean;
  showVersion: boolean;
};

/**
 * Result of parsing CLI arguments — either success or a usage error.
 */
export type ParseArgsResult = { ok: true; args: CliArgs } | { ok: false; error: string };

/** Argument that stops option parsing — everything after it is notation. */
const TERMINATOR = '--';

/** Defaults every parse starts from. */
const BASE_ARGS: CliArgs = {
  notation: undefined,
  verbose: false,
  json: false,
  seed: undefined,
  showHelp: false,
  showVersion: false,
};

/**
 * Finds `--help` / `--version` anywhere before the `--` terminator. Help wins
 * over version regardless of order, and both win over usage errors — a user
 * who mistyped an option is asking for the manual, not for a diagnostic.
 */
function findInformationalFlag(argv: string[]): 'help' | 'version' | undefined {
  let flag: 'help' | 'version' | undefined;

  for (const arg of argv) {
    if (arg === TERMINATOR) break;
    if (arg === '--help' || arg === '-h') return 'help';
    if (arg === '--version') flag = 'version';
  }

  return flag;
}

/**
 * True for an argument that starts with `-` yet reads as notation rather than
 * an option: negative numbers (`-3`) and negative-prefixed expressions
 * (`-d6`, `-D6`, `-dF`, `-(2d6)`, `-{2d6}`, `-@str`). A fallback for users who
 * do not reach for `--`; `--` remains the unambiguous form.
 */
function isNegativeNotation(arg: string): boolean {
  return arg.length > 1 && /^[\ddD({@]/.test(arg.slice(1));
}

/**
 * Parses a raw argument array into typed CLI options.
 *
 * @param argv - Arguments to parse (typically `process.argv.slice(2)`)
 * @returns Parsed result or an error message for usage errors
 */
export function parseArgs(argv: string[]): ParseArgsResult {
  const informational = findInformationalFlag(argv);
  if (informational != null) {
    return {
      ok: true,
      args: {
        ...BASE_ARGS,
        showHelp: informational === 'help',
        showVersion: informational === 'version',
      },
    };
  }

  let verbose = false;
  let json = false;
  let seed: string | undefined;
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;

    if (arg === TERMINATOR) {
      positional.push(...argv.slice(i + 1));
      break;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--json') {
      json = true;
    } else if (arg === '--seed') {
      // A seed is an opaque string, so any non-empty next argument counts:
      // `--seed -abc` is a valid seed, not a missing value.
      const next = argv[i + 1];
      if (next == null || next === '') {
        return { ok: false, error: 'Missing value for --seed' };
      }
      seed = next;
      i++;
    } else if (arg.startsWith('--seed=')) {
      const value = arg.slice('--seed='.length);
      if (value === '') {
        return { ok: false, error: 'Missing value for --seed' };
      }
      seed = value;
    } else if (arg.startsWith('--')) {
      return { ok: false, error: `Unknown option: ${arg}` };
    } else if (arg.startsWith('-') && !isNegativeNotation(arg)) {
      return { ok: false, error: `Unknown option: ${arg}` };
    } else {
      positional.push(arg);
    }
  }

  // Joined, not separate rolls — a shell splits `roll-parser 2d6 + 3` into three
  // words and the user means one expression.
  const notation = positional.length > 0 ? positional.join(' ') : undefined;

  return { ok: true, args: { ...BASE_ARGS, notation, verbose, json, seed } };
}
