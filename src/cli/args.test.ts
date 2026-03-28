import { describe, expect, test } from 'bun:test';
import { parseArgs } from './args';

describe('parseArgs', () => {
  describe('notation parsing', () => {
    test('parses a single notation argument', () => {
      const result = parseArgs(['2d6+3']);
      expect(result).toEqual({
        ok: true,
        args: {
          notation: '2d6+3',
          verbose: false,
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
          seed: undefined,
          showHelp: false,
          showVersion: false,
        },
      });
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

    test('returns error when --seed is followed by another flag', () => {
      const result = parseArgs(['--seed', '--verbose']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed' });
    });

    test('parses --seed with negative numeric value', () => {
      const result = parseArgs(['2d6', '--seed', '-42']);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.args.seed).toBe('-42');
      }
    });

    test('returns error when --seed is followed by non-numeric flag', () => {
      const result = parseArgs(['--seed', '-v']);
      expect(result).toEqual({ ok: false, error: 'Missing value for --seed' });
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

    test('returns error for unknown short flag', () => {
      const result = parseArgs(['-x']);
      expect(result).toEqual({ ok: false, error: 'Unknown option: -x' });
    });
  });
});
