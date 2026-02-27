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
  seed: string | undefined;
  showHelp: boolean;
  showVersion: boolean;
};

/**
 * Result of parsing CLI arguments — either success or a usage error.
 */
export type ParseArgsResult = { ok: true; args: CliArgs } | { ok: false; error: string };

/**
 * Parses a raw argument array into typed CLI options.
 *
 * @param argv - Arguments to parse (typically `process.argv.slice(2)`)
 * @returns Parsed result or an error message for usage errors
 */
export function parseArgs(argv: string[]): ParseArgsResult {
  let verbose = false;
  let seed: string | undefined;
  let showHelp = false;
  let showVersion = false;
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] as string;

    if (arg === '--help' || arg === '-h') {
      showHelp = true;
    } else if (arg === '--version') {
      showVersion = true;
    } else if (arg === '--verbose' || arg === '-v') {
      verbose = true;
    } else if (arg === '--seed') {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('-')) {
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
    } else if (arg.startsWith('-') && arg.length > 1 && !/^\d/.test(arg.slice(1))) {
      return { ok: false, error: `Unknown option: ${arg}` };
    } else {
      positional.push(arg);
    }
  }

  const notation = positional.length > 0 ? positional.join(' ') : undefined;

  return { ok: true, args: { notation, verbose, seed, showHelp, showVersion } };
}
