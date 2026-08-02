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
      expect(stdout).toContain('DegreeOfSuccess');
      expect(stdout).toContain('Exit codes:');
      expect(stdout).toContain('0  Success');
      expect(stdout).toContain('1  Roll or parse error');
      expect(stdout).toContain('2  Usage error');
    });
  });

  describe('rolling', () => {
    test('seeded roll is deterministic', () => {
      const first = run(['2d6+3', '--seed', 'test']);
      const second = run(['2d6+3', '--seed', 'test']);

      expect(first.exitCode).toBe(0);
      expect(first.stdout).toBe(second.stdout);
      expect(Number(first.stdout.trim())).toBeGreaterThanOrEqual(5);
      expect(Number(first.stdout.trim())).toBeLessThanOrEqual(15);
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
      expect(parsed.parts.type).toBe('modifier');
      expect(parsed.parts.total).toBe(14);
      expect(parsed.parts.target.type).toBe('dice');
      expect(parsed.parts.target.rolls.map((die: { result: number }) => die.result)).toEqual([
        3, 3, 6, 5,
      ]);
    });

    test('--json wins over --verbose', () => {
      expect(run(['4d6kh3', '--seed', 'test', '--json', '--verbose']).stdout).toBe(
        run(['4d6kh3', '--seed', 'test', '--json']).stdout,
      );
    });

    test('--json leaves errors as plain text on stderr', () => {
      const { stdout, stderr, exitCode } = run(['2d6+&', '--json']);

      expect(exitCode).toBe(1);
      expect(stdout).toBe('');
      expect(stderr).toBe(`Error: Unexpected character: '&'\n  2d6+&\n      ^\n`);
    });

    test('an unseeded roll still lands in range', () => {
      const { stdout, exitCode } = run(['3d6']);

      expect(exitCode).toBe(0);
      expect(Number(stdout.trim())).toBeGreaterThanOrEqual(3);
      expect(Number(stdout.trim())).toBeLessThanOrEqual(18);
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
      expect(stderr).toContain('Error:');
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

    test('emits nothing for a non-integer position', () => {
      expect(contextFor('2d6+&', new LexerError('bad', 'UNEXPECTED_CHARACTER', 1.5, '&'))).toBe('');
    });

    test('emits nothing for a negative position', () => {
      expect(contextFor('2d6+&', new LexerError('bad', 'UNEXPECTED_CHARACTER', -1, '&'))).toBe('');
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
