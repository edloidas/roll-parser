import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ensureFreshDist } from '../test-helpers.js';

type PackageJson = {
  bin?: Record<string, string>;
};

const CLI_BIN = './dist/cli/index.js';

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

// Runs the real `build` script so the assertions judge the artifact a consumer
// installs — including the executable bit `tsc` never sets. `ensureFreshDist`
// memoizes one build per run; its `clean` is safe because `bun test` is sequential.
beforeAll(async () => {
  await ensureFreshDist();
}, 60_000);

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

    const direct = await runCommand([CLI_BIN, '--version']);
    expect(direct.exitCode).toBe(0);
  });

  test('built CLI runs under Node for help and seeded rolls', async () => {
    const help = await runCommand(['node', CLI_BIN, '--help']);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('Usage: roll-parser');

    const roll = await runCommand(['node', CLI_BIN, '4d6kh3', '--verbose', '--seed', 'test']);
    expect(roll.exitCode).toBe(0);
    expect(roll.stdout.trim()).toBe('4d6[3, (3), 6, 5] = 14');
  });

  test('built CLI accepts negative prefix dice notation', async () => {
    const result = await runCommand(['node', CLI_BIN, '-d6', '--seed', 'test']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe('-3');
  });
});

describe('two-pass emit', () => {
  test('strips comments from emitted JS but keeps TSDoc in declarations (#165)', async () => {
    const js = await Bun.file('./dist/errors.js').text();
    const declaration = await Bun.file('./dist/errors.d.ts').text();

    // The sourcemap pragma is the only comment tsc emits under `removeComments`.
    const comments = js.split('\n').filter((line) => line.trimStart().startsWith('//'));
    expect(js).not.toContain('/*');
    expect(comments).toEqual(['//# sourceMappingURL=errors.js.map']);

    expect(declaration).toContain('/**');
    expect(declaration).toContain('@category Errors');
  });

  test('keeps both map kinds (#165)', () => {
    for (const map of ['./dist/errors.js.map', './dist/errors.d.ts.map']) {
      expect(existsSync(map)).toBe(true);
    }
  });
});
