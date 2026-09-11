/**
 * In-process tests for the CLI command.
 *
 * The subprocess suite in `cli.test.ts` proves the shebang entry point wires
 * itself to the real process; everything about argument handling, exit codes,
 * and error rendering is exercised here instead — spawn-free and visible to
 * the coverage reporter.
 *
 * @module cli/main.test
 */

import { describe, expect, test } from 'bun:test';
import { VERSION } from '../index.js';
import { LexerError } from '../lexer/lexer.js';
import { main, writeErrorContext } from './main.js';

type CliRun = { stdout: string; stderr: string; exitCode: number };

/** Runs `main` against in-memory streams. */
function run(argv: string[]): CliRun {
  let stdout = '';
  let stderr = '';
  const exitCode = main({
    argv,
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    },
  });

  return { stdout, stderr, exitCode };
}

/** Collects everything `writeErrorContext` emits for one notation/error pair. */
function contextFor(notation: string, error: unknown): string {
  let out = '';
  writeErrorContext(notation, error, (text) => {
    out += text;
  });

  return out;
}

describe('cli main', () => {
  describe('informational flags', () => {
    test('--help prints usage and exits 0', () => {
      const { stdout, stderr, exitCode } = run(['--help']);

      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage: roll-parser');
      expect(stdout).toContain('--verbose');
      expect(stdout).toContain('--seed');
      expect(stderr).toBe('');
    });

    test('-h is an alias for --help', () => {
      expect(run(['-h']).stdout).toBe(run(['--help']).stdout);
    });

    test('--version prints the package version', () => {
      const { stdout, exitCode } = run(['--version']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe(`${VERSION}\n`);
    });

    test('--help wins over a notation argument', () => {
      const { stdout, exitCode } = run(['2d6', '--help']);

      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage: roll-parser');
    });

    test('--help wins over an earlier usage error', () => {
      const { stdout, stderr, exitCode } = run(['--oops', '--help']);

      expect(exitCode).toBe(0);
      expect(stdout).toContain('Usage: roll-parser');
      expect(stderr).toBe('');
    });

    test('--version wins over an earlier usage error', () => {
      const { stdout, stderr, exitCode } = run(['--oops', '--version']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe(`${VERSION}\n`);
      expect(stderr).toBe('');
    });

    test('help documents json output and exit codes', () => {
      const { stdout } = run(['--help']);

      expect(stdout).toContain('--json');
      expect(stdout).toContain('"seed"');
      expect(stdout).toContain('"version"');
      expect(stdout).toContain('DegreeOfSuccess');
      expect(stdout).toContain('Exit codes:');
      expect(stdout).toContain('0  Success');
      expect(stdout).toContain('1  Roll or parse error');
      expect(stdout).toContain('2  Usage error');
    });

    test('help documents the json error line and the two positional exclusions', () => {
      const { stdout } = run(['--help']);

      expect(stdout).toContain('JSON errors:');
      expect(stdout).toContain('"error"');
      expect(stdout).toContain('"span"');
      expect(stdout).toContain('Usage errors are covered too');
      expect(stdout).toContain('a seed value in --seed --json');
      expect(stdout).toContain('notation after --');
    });
  });

  describe('rolling', () => {
    test('seeded roll is deterministic', () => {
      const first = run(['2d6+3', '--seed', 'test']);
      const second = run(['2d6+3', '--seed', 'test']);

      expect(first.exitCode).toBe(0);
      expect(first.stdout).toBe('9\n');
      expect(second.stdout).toBe(first.stdout);
    });

    test('--verbose renders the breakdown with dropped dice', () => {
      const { stdout, exitCode } = run(['4d6kh3', '--verbose', '--seed', 'test']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('4d6[3, (3), 6, 5] = 14\n');
    });

    test('-v matches --verbose', () => {
      expect(run(['4d6kh3', '-v', '--seed', 'test']).stdout).toBe(
        run(['4d6kh3', '--verbose', '--seed', 'test']).stdout,
      );
    });

    test('--seed=value matches --seed value', () => {
      expect(run(['2d6', '--seed=test']).stdout).toBe(run(['2d6', '--seed', 'test']).stdout);
    });

    test('multiple positional args join into one notation', () => {
      expect(run(['2d6', '+', '3', '--seed', 'test']).stdout).toBe(
        run(['2d6 + 3', '--seed', 'test']).stdout,
      );
    });

    test('--json prints the whole result as parseable JSON', () => {
      const { stdout, stderr, exitCode } = run(['4d6kh3', '--seed', 'test', '--json']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(stdout.endsWith('\n')).toBe(true);
      expect(stdout.trimEnd()).not.toContain('\n');

      const parsed = JSON.parse(stdout);

      expect(parsed.total).toBe(14);
      expect(parsed.notation).toBe('4d6kh3');
      expect(parsed.rolls).toHaveLength(4);
      expect(parsed.parts.type).toBe('keepDrop');
      expect(parsed.parts.total).toBe(14);
      expect(parsed.parts.target.type).toBe('dice');
      expect(parsed.parts.target.rolls.map((die: { result: number }) => die.result)).toEqual([
        3, 3, 6, 5,
      ]);
      expect(parsed.seed).toBe('test');
      expect(parsed.version).toBe(VERSION);
    });

    test('--json emits a minted seed when --seed is omitted', () => {
      const first = JSON.parse(run(['4d6kh3', '--json']).stdout);

      expect(typeof first.seed).toBe('string');
      expect(first.seed).not.toBe('');
      expect(first.version).toBe(VERSION);

      const replay = JSON.parse(run(['4d6kh3', '--seed', first.seed, '--json']).stdout);

      expect(replay.total).toBe(first.total);
      expect(replay.rendered).toBe(first.rendered);
      expect(replay.seed).toBe(first.seed);
    });

    test('a minted seed is fresh on every unseeded run', () => {
      const seeds = new Set(
        Array.from({ length: 5 }, () => JSON.parse(run(['1d20', '--json']).stdout).seed),
      );

      expect(seeds.size).toBe(5);
    });

    test('--json wins over --verbose', () => {
      expect(run(['4d6kh3', '--seed', 'test', '--json', '--verbose']).stdout).toBe(
        run(['4d6kh3', '--seed', 'test', '--json']).stdout,
      );
    });

    test('--json renders errors as JSON on stderr (#343)', () => {
      const { stdout, stderr, exitCode } = run(['2d6+&', '--json', '--seed', 'test']);

      expect(exitCode).toBe(1);
      expect(stdout).toBe('');
      expect(JSON.parse(stderr)).toEqual({
        error: {
          message: "Unexpected character: '&'",
          code: 'UNEXPECTED_CHARACTER',
          span: { start: 4 },
        },
        notation: '2d6+&',
        seed: 'test',
        version: VERSION,
      });
    });

    test('an unseeded roll still lands in range', () => {
      const { stdout, exitCode } = run(['3d6']);

      expect(exitCode).toBe(0);
      expect(Number(stdout.trim())).toBeGreaterThanOrEqual(3);
      expect(Number(stdout.trim())).toBeLessThanOrEqual(18);
    });

    test('non-JSON output stays the total alone, with no seed appended', () => {
      expect(run(['2d6+3', '--seed', 'test']).stdout).toBe('9\n');
      expect(run(['2d6+3', '--seed', 'test', '--verbose']).stdout).toBe('2d6[3, 3] + 3 = 9\n');
    });
  });

  describe('terminator', () => {
    test('-- protects a negative notation', () => {
      const { stdout, exitCode } = run(['--seed', 'test', '--', '-1d6+3']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('0\n');
      expect(stdout).toBe(run(['-1d6+3', '--seed', 'test']).stdout);
    });

    test('-- protects a group notation', () => {
      const { stdout, exitCode } = run(['--seed', 'test', '--', '{2d20kh1,1d8}kh1']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('8\n');
    });

    test('-- lets a variable notation reach the evaluator', () => {
      const { stderr, exitCode } = run(['--seed', 'test', '--', '@str+1']);

      // Exit 1 (evaluation), not exit 2 (usage) — the argument was not eaten.
      expect(exitCode).toBe(1);
      expect(stderr).toContain('Undefined variable: str');
    });

    test('a dash-prefixed group is notation even without --', () => {
      const { stdout, exitCode } = run(['-{2d6}', '--seed', 'test']);

      expect(exitCode).toBe(0);
      expect(stdout).toBe('-6\n');
    });

    test('a bare -- reports the missing notation', () => {
      const { stderr, exitCode } = run(['--']);

      expect(exitCode).toBe(2);
      expect(stderr).toContain('No dice notation provided');
    });

    test('an option swallowed by -- earns a hint (#344)', () => {
      const { stderr, exitCode } = run(['--', '-1d6', '--verbose']);

      expect(exitCode).toBe(1);
      expect(stderr).toBe(
        "Error: Unexpected identifier: 'verbose'\n" +
          '  -1d6 --verbose\n' +
          '         ^\n' +
          'Hint: options must come before "--"\n',
      );
    });

    test('a dash-prefixed non-option after -- earns no hint (#344)', () => {
      const { stderr, exitCode } = run(['--', '-1d6', '-x']);

      expect(exitCode).toBe(1);
      expect(stderr).toBe("Error: Unexpected identifier: 'x'\n  -1d6 -x\n        ^\n");
    });

    test('a -- taken as the --seed value earns no hint (#344)', () => {
      const { stderr, exitCode } = run(['--seed', '--', '2d6 --verbose']);

      // `--seed` ate the `--` as its value, so no terminator ever ran.
      expect(exitCode).toBe(1);
      expect(stderr).toBe("Error: Unexpected identifier: 'verbose'\n  2d6 --verbose\n        ^\n");
    });

    test('a quoted notation carrying an option word earns no hint (#344)', () => {
      const { stderr, exitCode } = run(['2d6 --verbose', '--seed', 'test']);

      // No terminator was typed, so the ordering advice would name a `--` the
      // user never wrote.
      expect(exitCode).toBe(1);
      expect(stderr).toBe("Error: Unexpected identifier: 'verbose'\n  2d6 --verbose\n        ^\n");
    });

    test('--json keeps its single line, hint or not (#344)', () => {
      const { stderr } = run(['--json', '--seed', 'test', '--', '-1d6', '--verbose']);

      expect(stderr.trimEnd()).not.toContain('\n');
      expect(JSON.parse(stderr).error.message).toBe("Unexpected identifier: 'verbose'");
    });
  });

  describe('exit codes', () => {
    test('usage error exits 2', () => {
      const { stderr, exitCode } = run(['--unknown']);

      expect(exitCode).toBe(2);
      expect(stderr).toContain('Unknown option: --unknown');
      expect(stderr).toContain('Run "roll-parser --help" for usage.');
    });

    test('missing --seed value exits 2', () => {
      const { stderr, exitCode } = run(['2d6', '--seed']);

      expect(exitCode).toBe(2);
      expect(stderr).toContain('Missing value for --seed');
    });

    test('no notation exits 2', () => {
      const { stderr, exitCode } = run([]);

      expect(exitCode).toBe(2);
      expect(stderr).toContain('No dice notation provided');
    });

    test('roll-parser error exits 1', () => {
      const { stdout, stderr, exitCode } = run(['invalid_notation']);

      expect(exitCode).toBe(1);
      expect(stdout).toBe('');
      expect(stderr).toBe("Error: Unexpected identifier: 'invalid'\n  invalid_notation\n  ^\n");
    });

    test('positioned error prints the notation with a caret', () => {
      const { stderr, exitCode } = run(['2d6+&']);

      expect(exitCode).toBe(1);
      expect(stderr).toBe(`Error: Unexpected character: '&'\n  2d6+&\n      ^\n`);
    });

    test('evaluator error caret uses the node span', () => {
      const { stderr, exitCode } = run(['2d6+1d0+3']);

      expect(exitCode).toBe(1);
      expect(stderr).toBe('Error: Invalid dice sides: 0\n  2d6+1d0+3\n      ^\n');
    });
  });

  describe('json errors', () => {
    test('the record is a single line and stdout stays empty', () => {
      const { stdout, stderr } = run(['2d6+&', '--json', '--seed', 'test']);

      expect(stdout).toBe('');
      expect(stderr.endsWith('\n')).toBe(true);
      expect(stderr.trimEnd()).not.toContain('\n');
    });

    test('an evaluator error carries the span end the caret cannot show', () => {
      const { stderr, exitCode } = run(['2d6+1d0+3', '--json', '--seed', 'test']);

      expect(exitCode).toBe(1);
      expect(JSON.parse(stderr).error).toEqual({
        message: 'Invalid dice sides: 0',
        code: 'INVALID_DICE_SIDES',
        span: { start: 4, end: 7 },
      });
    });

    test('a parser error carries a start-only span', () => {
      const { stderr, exitCode } = run(['(1+2', '--json', '--seed', 'test']);

      expect(exitCode).toBe(1);
      expect(JSON.parse(stderr).error).toEqual({
        message: "Expected ')' but got end of input",
        code: 'EXPECTED_TOKEN',
        span: { start: 4 },
      });
    });

    test('a missing notation is JSON too, still exit 2', () => {
      const { stdout, stderr, exitCode } = run(['--json']);

      expect(exitCode).toBe(2);
      expect(stdout).toBe('');
      expect(JSON.parse(stderr)).toEqual({
        error: { message: 'No dice notation provided.' },
        version: VERSION,
      });
    });

    test('an unknown option is JSON even though it precedes --json', () => {
      const { stdout, stderr, exitCode } = run(['--bogus', '--json']);

      expect(exitCode).toBe(2);
      expect(stdout).toBe('');
      expect(JSON.parse(stderr)).toEqual({
        error: { message: 'Unknown option: --bogus' },
        version: VERSION,
      });
    });

    test('a missing --seed value is JSON too', () => {
      const { stdout, stderr, exitCode } = run(['2d6', '--json', '--seed']);

      expect(exitCode).toBe(2);
      expect(stdout).toBe('');
      expect(JSON.parse(stderr)).toEqual({
        error: { message: 'Missing value for --seed' },
        version: VERSION,
      });
    });

    test('a usage error stays plain text when --seed consumed --json', () => {
      const { stderr, exitCode } = run(['--seed', '--json', '--bogus']);

      expect(exitCode).toBe(2);
      expect(stderr).toBe('Error: Unknown option: --bogus\nRun "roll-parser --help" for usage.\n');
    });

    test('a usage error stays plain text when -- made --json notation', () => {
      const { stderr, exitCode } = run(['--bogus', '--', '--json']);

      expect(exitCode).toBe(2);
      expect(stderr).toBe('Error: Unknown option: --bogus\nRun "roll-parser --help" for usage.\n');
    });

    test('a seeded failure replays from its own record', () => {
      const record = JSON.parse(run(['1d6/(1d2-1)', '--json', '--seed', 'test']).stderr);

      expect(record.error.code).toBe('DIVISION_BY_ZERO');

      const replay = JSON.parse(run(['1d6/(1d2-1)', '--json', '--seed', record.seed]).stderr);

      expect(replay).toEqual(record);
    });

    test('an unseeded failure records the minted seed and replays from it', () => {
      // `1d6/0` draws before it divides, so the failure doesn't depend on which value came back.
      const record = JSON.parse(run(['1d6/0', '--json']).stderr);

      expect(record.error.code).toBe('DIVISION_BY_ZERO');
      expect(typeof record.seed).toBe('string');
      expect(record.seed).not.toBe('');

      const replay = JSON.parse(run(['1d6/0', '--json', '--seed', record.seed]).stderr);

      expect(replay).toEqual(record);
    });

    test('the minted seed on a failure is fresh on every run', () => {
      const seeds = new Set(
        Array.from({ length: 5 }, () => JSON.parse(run(['1d6/0', '--json']).stderr).seed),
      );

      expect(seeds.size).toBe(5);
    });
  });

  describe('non-library failures', () => {
    test('a plain Error from the output sink propagates instead of exiting 1', () => {
      // `stdout` is written inside `main`'s try/catch, so a throwing sink is the
      // one seam that reaches the non-RollParserError re-raise branch.
      expect(() =>
        main({
          argv: ['2d6', '--seed', 'test'],
          stdout: () => {
            throw new Error('stream closed');
          },
          stderr: () => {},
        }),
      ).toThrow('stream closed');
    });
  });

  describe('writeErrorContext', () => {
    test('counts columns in code points, not UTF-16 units', () => {
      // `&` sits at UTF-16 offset 6 but column 5 — the astral `🎲` is two units, one column.
      expect(run(['@{🎲}+&']).stderr).toContain('  @{🎲}+&\n       ^\n');
    });

    test('emits nothing for a non-library error', () => {
      expect(contextFor('2d6', new Error('boom'))).toBe('');
    });

    test('emits nothing for a position past the end of the notation', () => {
      expect(contextFor('2d6', new LexerError('bad', 'UNEXPECTED_CHARACTER', 4, '&'))).toBe('');
    });

    test('a position exactly at the end still renders a caret', () => {
      expect(contextFor('2d6', new LexerError('bad', 'UNEXPECTED_CHARACTER', 3, '&'))).toBe(
        '  2d6\n     ^\n',
      );
    });

    test('emits nothing for a multi-line notation', () => {
      expect(contextFor('2d6\n+&', new LexerError('bad', 'UNEXPECTED_CHARACTER', 5, '&'))).toBe('');
    });

    test('a zero position puts the caret under the first column', () => {
      expect(contextFor('&d6', new LexerError('bad', 'UNEXPECTED_CHARACTER', 0, '&'))).toBe(
        '  &d6\n  ^\n',
      );
    });
  });
});
