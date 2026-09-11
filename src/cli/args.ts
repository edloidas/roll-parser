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
 * Result of parsing CLI arguments — either success or a usage error. The
 * failure arm carries `json` so a usage error renders in the format the
 * caller asked for; the success arm carries `terminated`, true only when a
 * `--` was consumed as the terminator rather than as a `--seed` value.
 */
export type ParseArgsResult =
  | { ok: true; args: CliArgs; terminated: boolean }
  | { ok: false; error: string; json: boolean };

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

/** Which informational flag an argument is, if any. */
function informationalKind(arg: string | undefined): 'help' | 'version' | undefined {
  if (arg === '--help' || arg === '-h') return 'help';
  if (arg === '--version') return 'version';
  return undefined;
}

/**
 * Finds `--help` / `--version` anywhere before the `--` terminator. Help wins
 * over version regardless of order, and both win over usage errors — a user
 * who mistyped an option is asking for the manual, not for a diagnostic.
 *
 * Consumes a `--seed` value the way the main loop does, so a `--` in that
 * position is the value and not the terminator. The one exception is an
 * informational flag sitting there, which outranks the seed: `--seed --help`
 * is help, not a seed of `--help`.
 */
function findInformationalFlag(argv: string[]): 'help' | 'version' | undefined {
  let flag: 'help' | 'version' | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;
    const kind = informationalKind(arg);

    if (kind === 'help') return 'help';
    if (kind === 'version') flag = 'version';
    else if (arg === TERMINATOR) break;
    else if (arg === '--seed' && informationalKind(argv[i + 1]) == null) i += 1;
  }

  return flag;
}

/**
 * True for an argument that starts with `-` yet reads as notation rather than
 * an option: negative numbers (`-3`) and negative-prefixed expressions
 * (`-d6`, `-D6`, `-dF`, `-(2d6)`, `-{2d6}`, `-@str`). These need no `--`, which
 * exists for notation that would otherwise parse as an option.
 */
function isNegativeNotation(arg: string): boolean {
  return /^[\ddD({@]/.test(arg.slice(1));
}

/** Every option this parser accepts as a whole argument. */
const KNOWN_OPTIONS = new Set(['--verbose', '-v', '--json', '--help', '-h', '--version', '--seed']);

/**
 * True for an argument this parser accepts as a *valid* option outside a `--`
 * terminator — `--typo` is read as an option and rejected, and is not one here.
 */
export function isKnownOption(arg: string): boolean {
  return KNOWN_OPTIONS.has(arg) || arg.startsWith('--seed=');
}

/**
 * A seed is an opaque string, so any non-empty next argument counts:
 * `--seed -abc` is a valid seed, not a missing value. `null` when it is missing.
 */
function readSeedValue(
  arg: string,
  next: string | undefined,
): { seed: string; consumed: number } | null {
  if (arg === '--seed') {
    return next == null || next === '' ? null : { seed: next, consumed: 1 };
  }

  const value = arg.slice('--seed='.length);
  return value === '' ? null : { seed: value, consumed: 0 };
}

type ArgAccumulator = {
  verbose: boolean;
  json: boolean;
  seed?: string;
  error?: string;
  positional: string[];
};

/**
 * First usage error wins — a later one is deliberately dropped. The sole owner
 * of the `??=`, so a new error site cannot express the precedence wrongly.
 */
function failWith(acc: ArgAccumulator, message: string): void {
  acc.error ??= message;
}

/** Returns how many further arguments this one consumed as a value. */
function applyArg(arg: string, next: string | undefined, acc: ArgAccumulator): number {
  if (arg === '--verbose' || arg === '-v') {
    acc.verbose = true;
  } else if (arg === '--json') {
    acc.json = true;
  } else if (arg === '--seed' || arg.startsWith('--seed=')) {
    const read = readSeedValue(arg, next);
    if (read == null) {
      failWith(acc, 'Missing value for --seed');
    } else {
      acc.seed = read.seed;
      return read.consumed;
    }
  } else if (arg.startsWith('--') || (arg.startsWith('-') && !isNegativeNotation(arg))) {
    failWith(acc, `Unknown option: ${arg}`);
  } else {
    acc.positional.push(arg);
  }

  return 0;
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
      terminated: false,
      args: {
        ...BASE_ARGS,
        showHelp: informational === 'help',
        showVersion: informational === 'version',
      },
    };
  }

  const acc: ArgAccumulator = { verbose: false, json: false, positional: [] };
  let terminated = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;

    if (arg === TERMINATOR) {
      acc.positional.push(...argv.slice(i + 1));
      terminated = true;
      break;
    }

    i += applyArg(arg, argv[i + 1], acc);
  }

  const { verbose, json, seed, error, positional } = acc;

  // The loop runs to the end even after a usage error: only it knows that
  // `--seed --json` binds the flag as a seed value and `-- --json` makes it notation.
  if (error != null) {
    return { ok: false, error, json };
  }

  // Joined, not separate rolls — a shell splits `roll-parser 2d6 + 3` into three
  // words and the user means one expression.
  const notation = positional.length > 0 ? positional.join(' ') : undefined;

  return { ok: true, terminated, args: { ...BASE_ARGS, notation, verbose, json, seed } };
}
