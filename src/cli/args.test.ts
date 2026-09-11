import { describe, expect, test } from 'bun:test';
import { isKnownOption, parseArgs } from './args.js';

describe('parseArgs', () => {
  describe('notation parsing', () => {
    test('parses a single notation argument', () => {
      const result = parseArgs(['2d6+3']);
      expect(result).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: '2d6+3',
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: false,
          showVersion: false,
        },
      });
    });

    test('joins multiple positional args with spaces', () => {
      const result = parseArgs(['2d6', '+', '3']);
      expect(result).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: '2d6 + 3',
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: false,
          showVersion: false,
        },
      });
    });

    test('returns undefined notation when no positional args', () => {
      const result = parseArgs([]);
      expect(result).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: undefined,
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: false,
          showVersion: false,
        },
      });
    });

    test('treats negative numbers as positional args', () => {
      const result = parseArgs(['-3']);
      expect(result).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: '-3',
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: false,
          showVersion: false,
        },
      });
    });

    test.each(['-d6', '-D6', '-dF', '-(2d6)', '-{2d6}', '-@str'])(
      'treats %s as a positional arg',
      (notation) => {
        const result = parseArgs([notation]);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.args.notation).toBe(notation);
      },
    );

    test('rejects unknown short options that do not look like notation', () => {
      const result = parseArgs(['-x']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: -x', json: false });
    });
  });

  describe('help flag', () => {
    test('parses --help', () => {
      const result = parseArgs(['--help']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });

    test('parses -h', () => {
      const result = parseArgs(['-h']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });
  });

  describe('version flag', () => {
    test('parses --version', () => {
      const result = parseArgs(['--version']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showVersion).toBe(true);
    });
  });

  describe('verbose flag', () => {
    test('parses --verbose', () => {
      const result = parseArgs(['--verbose']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.verbose).toBe(true);
    });

    test('parses -v', () => {
      const result = parseArgs(['-v']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.verbose).toBe(true);
    });
  });

  describe('seed flag', () => {
    test('parses --seed with space separator', () => {
      const result = parseArgs(['2d6', '--seed', 'my-seed']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.seed).toBe('my-seed');
        expect(result.args.notation).toBe('2d6');
      }
    });

    test('parses --seed= with equals separator', () => {
      const result = parseArgs(['2d6', '--seed=my-seed']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.seed).toBe('my-seed');
    });

    test('returns error for --seed without value', () => {
      const result = parseArgs(['2d6', '--seed']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed', json: false });
    });

    test('returns error for --seed= with empty value', () => {
      const result = parseArgs(['--seed=']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed', json: false });
    });

    test('returns error for --seed with an empty value', () => {
      const result = parseArgs(['2d6', '--seed', '']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed', json: false });
    });

    test('parses --seed with negative numeric value', () => {
      const result = parseArgs(['2d6', '--seed', '-42']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.seed).toBe('-42');
      }
    });

    test('both separators accept a dash-prefixed value', () => {
      const spaced = parseArgs(['2d6', '--seed', '-abc']);
      const equals = parseArgs(['2d6', '--seed=-abc']);

      expect(spaced).toEqual(equals);
      expect(spaced.ok).toBe(true);
      if (spaced.ok) expect(spaced.args.seed).toBe('-abc');
    });

    test('consumes a flag-shaped value as the seed', () => {
      const result = parseArgs(['2d6', '--seed', '--verbose']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.seed).toBe('--verbose');
        expect(result.args.verbose).toBe(false);
      }
    });
  });

  describe('json flag', () => {
    test('survives a usage error raised at a later argument', () => {
      const result = parseArgs(['2d6', '--json', '--bogus']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --bogus', json: true });
    });

    test('survives a usage error raised at an earlier argument', () => {
      const result = parseArgs(['--bogus', '2d6', '--json']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --bogus', json: true });
    });

    test('reports the first of several usage errors', () => {
      const result = parseArgs(['--first', '--second', '--json']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --first', json: true });
    });

    test('reports the missing seed value when it precedes an unknown option', () => {
      const result = parseArgs(['--seed', '', '--bogus', '--json']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed', json: true });
    });

    test('reports the unknown option when it precedes a missing seed value', () => {
      const result = parseArgs(['--bogus', '--seed', '', '--json']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --bogus', json: true });
    });

    test('reports the missing --seed= value when it precedes an unknown option', () => {
      const result = parseArgs(['--seed=', '--bogus', '--json']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed', json: true });
    });

    test('is not set when --seed consumed it as a value', () => {
      const result = parseArgs(['--seed', '--json', '--bogus']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --bogus', json: false });
    });

    test('is not set when the terminator made it notation', () => {
      const result = parseArgs(['--bogus', '--', '--json']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --bogus', json: false });
    });

    test('parses --json', () => {
      const result = parseArgs(['2d6', '--json']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.json).toBe(true);
        expect(result.args.notation).toBe('2d6');
      }
    });

    test('--json and --verbose both set', () => {
      const result = parseArgs(['2d6', '--json', '--verbose']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.json).toBe(true);
        expect(result.args.verbose).toBe(true);
      }
    });
  });

  describe('terminator', () => {
    test('treats a dash-prefixed notation after -- as positional', () => {
      const result = parseArgs(['--', '-1d6+3']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.notation).toBe('-1d6+3');
    });

    test('keeps options before -- and notation after it', () => {
      const result = parseArgs(['--seed', 'test', '--', '{2d20kh1,1d8}kh1']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.seed).toBe('test');
        expect(result.args.notation).toBe('{2d20kh1,1d8}kh1');
      }
    });

    test('stops option parsing entirely', () => {
      const result = parseArgs(['--', '@str+1', '--verbose']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.notation).toBe('@str+1 --verbose');
        expect(result.args.verbose).toBe(false);
      }
    });

    test('a bare -- leaves the notation undefined', () => {
      const result = parseArgs(['--']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.notation).toBe(undefined);
    });

    test('--help after -- is notation, not a flag', () => {
      const result = parseArgs(['--', '--help']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.showHelp).toBe(false);
        expect(result.args.notation).toBe('--help');
      }
    });
  });

  describe('terminator reporting', () => {
    test('terminated is true only when -- stopped option parsing', () => {
      const result = parseArgs(['--', '-1d6']);
      expect(result).toMatchObject({ ok: true, terminated: true });
    });

    test('a -- consumed as the --seed value is not a terminator (#344)', () => {
      const result = parseArgs(['--seed', '--', '2d6']);
      expect(result).toMatchObject({ ok: true, terminated: false });
      if (result.ok) expect(result.args.seed).toBe('--');
    });

    test('terminated is false when no -- appears at all', () => {
      expect(parseArgs(['2d6+3'])).toMatchObject({ ok: true, terminated: false });
    });

    test('a -- bound as a seed value leaves the rest to the loop (#364)', () => {
      expect(parseArgs(['--seed', '--', '--verbose', '2d6'])).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: '2d6',
          verbose: true,
          json: false,
          seed: '--',
          showHelp: false,
          showVersion: false,
        },
      });
    });

    // The first `--seed` binds the second as its value, so the `--` after it is
    // a real terminator and everything past it is notation.
    test('a seed value of --seed leaves the next -- terminating (#364)', () => {
      expect(parseArgs(['--seed', '--seed', '--', '--help'])).toEqual({
        ok: true,
        terminated: true,
        args: {
          notation: '--help',
          verbose: false,
          json: false,
          seed: '--seed',
          showHelp: false,
          showVersion: false,
        },
      });
    });

    test('a real terminator still stops the scan (#364)', () => {
      expect(parseArgs(['--seed=x', '--', '--help'])).toEqual({
        ok: true,
        terminated: true,
        args: {
          notation: '--help',
          verbose: false,
          json: false,
          seed: 'x',
          showHelp: false,
          showVersion: false,
        },
      });
    });
  });

  describe('informational precedence', () => {
    test('--help wins over an earlier unknown option', () => {
      const result = parseArgs(['--oops', '--help']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });

    test('--version wins over an earlier unknown option', () => {
      const result = parseArgs(['-x', '--version']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showVersion).toBe(true);
    });

    test('--help wins over a dangling --seed', () => {
      const result = parseArgs(['--seed', '--help']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });

    test.each([
      ['--version', '--help'],
      ['--help', '--version'],
    ])('--help wins over --version given %s then %s', (first, second) => {
      const result = parseArgs([first, second]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.showHelp).toBe(true);
        expect(result.args.showVersion).toBe(false);
      }
    });

    test('--help still wins when --seed took the -- as its value (#364)', () => {
      expect(parseArgs(['--seed', '--', '--help'])).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: undefined,
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: true,
          showVersion: false,
        },
      });
    });

    test('--version still wins when --seed took the -- as its value (#364)', () => {
      expect(parseArgs(['--seed', '--', '--version'])).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: undefined,
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: false,
          showVersion: true,
        },
      });
    });

    test('-h still wins when --seed took the -- as its value (#364)', () => {
      const result = parseArgs(['--seed', '--', '-h']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });

    // The scan skips a seed value, so `-h` sitting in one has to be exempted by
    // name or it is consumed and never seen.
    test('-h in the seed-value position outranks the seed (#364)', () => {
      const result = parseArgs(['--seed', '-h']);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.args.showHelp).toBe(true);
    });

    test('informational flags drop other options', () => {
      const result = parseArgs(['2d6', '--json', '--help']);
      expect(result).toEqual({
        ok: true,
        terminated: false,
        args: {
          notation: undefined,
          verbose: false,
          json: false,
          seed: undefined,
          showHelp: true,
          showVersion: false,
        },
      });
    });
  });

  describe('flag combinations', () => {
    test('verbose + seed together', () => {
      const result = parseArgs(['4d6kh3', '--verbose', '--seed', 'test']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.notation).toBe('4d6kh3');
        expect(result.args.verbose).toBe(true);
        expect(result.args.seed).toBe('test');
      }
    });

    test('flags before notation', () => {
      const result = parseArgs(['--verbose', '2d6+3']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.notation).toBe('2d6+3');
        expect(result.args.verbose).toBe(true);
      }
    });

    test('flags after notation', () => {
      const result = parseArgs(['2d6+3', '--verbose']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.notation).toBe('2d6+3');
        expect(result.args.verbose).toBe(true);
      }
    });

    test('flags interspersed with notation parts', () => {
      const result = parseArgs(['2d6', '--verbose', '+', '3']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.notation).toBe('2d6 + 3');
        expect(result.args.verbose).toBe(true);
      }
    });
  });

  describe('error cases', () => {
    test('returns error for unknown long flag', () => {
      const result = parseArgs(['--unknown']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: --unknown', json: false });
    });

    // The `-x` short-flag case sits in `notation parsing`, next to the
    // negative-notation cases it draws the boundary against.
  });
});

describe('isKnownOption', () => {
  // Each row asserts the predicate against what `parseArgs` actually does with
  // the same argument, so an option added to `applyArg` alone fails here.
  // Blind to one added to neither — that pairs two silences, not two lists.
  test.each([
    ['--verbose', true],
    ['-v', true],
    ['--json', true],
    ['--help', true],
    ['-h', true],
    ['--version', true],
    ['--seed', true],
    ['--seed=demo', true],
    ['--unknown', false],
    ['--seeds', false],
    ['-x', false],
  ])('agrees with parseArgs on %s', (arg, known) => {
    const parsed = parseArgs([arg as string]);
    const rejectedAsUnknown = !parsed.ok && parsed.error === `Unknown option: ${arg}`;

    expect(isKnownOption(arg as string)).toBe(known);
    expect(rejectedAsUnknown).toBe(!known);
  });

  // `parseArgs` accepts these as notation, which says nothing about the predicate.
  test.each(['-1d6', '-d6', '2d6+3', '--', ''])('rejects %s, which is not an option', (arg) => {
    expect(isKnownOption(arg)).toBe(false);
  });
});
