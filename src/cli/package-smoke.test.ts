import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

type PackageJson = {
  bin?: Record<string, string>;
};

const CLI_BIN = './dist/cli.js';

async function runCommand(
  command: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(command, {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  return { stdout, stderr, exitCode };
}

beforeAll(async () => {
  const { stderr, exitCode } = await runCommand(['bun', 'run', 'build:cli']);
  if (exitCode !== 0) {
    throw new Error(`Failed to build packaged CLI smoke target:\n${stderr}`);
  }
});

describe('packaged CLI smoke', () => {
  test('package bin points to the built executable', async () => {
    const pkg = (await Bun.file('package.json').json()) as PackageJson;
    expect(pkg.bin?.['roll-parser']).toBe(CLI_BIN);
    expect(existsSync(join('.', CLI_BIN))).toBe(true);
  });

  test('built CLI keeps node shebang and executable bit', async () => {
    const cli = Bun.file(CLI_BIN);
    const text = await cli.text();
    const stats = statSync(CLI_BIN);

    expect(text.startsWith('#!/usr/bin/env node\n')).toBe(true);
    expect((stats.mode & 0o111) !== 0).toBe(true);
  });

  test('built CLI runs under Node for help and seeded rolls', async () => {
    const help = await runCommand(['node', CLI_BIN, '--help']);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('Usage: roll-parser');

    const roll = await runCommand(['node', CLI_BIN, '4d6kh3', '--verbose', '--seed', 'test']);
    expect(roll.exitCode).toBe(0);
    expect(roll.stdout.trim()).toBe('4d6[3, 6, 3, (3)] = 12');
  });

  test('built CLI accepts negative prefix dice notation', async () => {
    const result = await runCommand(['node', CLI_BIN, '-d6', '--seed', 'test']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('-3');
  });
});
