import { describe, expect, test } from 'bun:test';
import { parseArgs } from './args.js';

describe('parseArgs', () => {
  describe('notation parsing', () => {
    test('parses a single notation argument', () => {
      const result = parseArgs(['2d6+3']);
      expect(result).toEqual({
        ok: true,
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

    test('treats negative prefix dice notation as positional args', () => {
      for (const notation of ['-d6', '-D6', '-dF', '-(2d6)', '-{2d6}', '-@str']) {
        const result = parseArgs([notation]);
        expect(result.ok).toBe(true);
        if (result.ok) expect(result.args.notation).toBe(notation);
      }
    });

    test('rejects unknown short options that do not look like notation', () => {
      const result = parseArgs(['-x']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: -x' });
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
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed' });
    });

    test('returns error for --seed= with empty value', () => {
      const result = parseArgs(['--seed=']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed' });
    });

    test('returns error for --seed with an empty value', () => {
      const result = parseArgs(['2d6', '--seed', '']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed' });
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

    test('--help wins over --version in either order', () => {
      for (const argv of [
        ['--version', '--help'],
        ['--help', '--version'],
      ]) {
        const result = parseArgs(argv);
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.args.showHelp).toBe(true);
          expect(result.args.showVersion).toBe(false);
        }
      }
    });

    test('informational flags drop other options', () => {
      const result = parseArgs(['2d6', '--json', '--help']);
      expect(result).toEqual({
        ok: true,
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
      expect(result).toEqual({ ok: false, error: 'Unknown option: --unknown' });
    });

    // The `-x` short-flag case lives in `notation parsing`, where it sits next
    // to the negative-notation cases it draws the boundary against.
  });
});
