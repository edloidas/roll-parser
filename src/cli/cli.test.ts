/**
 * Subprocess tests for the CLI entry point.
 *
 * Only what genuinely needs a second process lives here: that
 * `src/cli/index.ts` reads `process.argv`, writes the real streams, and sets
 * `process.exitCode` from `main`'s return value. Everything else — flags,
 * output formatting, exit-code selection, caret rendering — is covered
 * spawn-free in `main.test.ts`. The packaged artifact (shebang, exec bit,
 * running under Node) is covered in `package-smoke.test.ts`.
 *
 * @module cli/cli.test
 */

import { describe, expect, test } from 'bun:test';

const CLI_PATH = 'src/cli/index.ts';

async function runCli(
  args: string[],
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const proc = Bun.spawn(['bun', 'run', CLI_PATH, ...args], {
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

describe('CLI process wiring', () => {
  test('argv reaches main and output reaches stdout with exit code 0', async () => {
    const { stdout, stderr, exitCode } = await runCli(['4d6kh3', '--verbose', '--seed', 'test']);

    expect(exitCode).toBe(0);
    expect(stdout).toBe('4d6[3, (3), 6, 5] = 14\n');
    expect(stderr).toBe('');
  });

  test('a roll-parser error reaches stderr and sets exit code 1', async () => {
    const { stdout, stderr, exitCode } = await runCli(['2d6+&']);

    expect(exitCode).toBe(1);
    expect(stdout).toBe('');
    expect(stderr).toBe(`Error: Unexpected character: '&'\n  2d6+&\n      ^\n`);
  });

  test('a usage error sets exit code 2', async () => {
    const { stderr, exitCode } = await runCli(['--unknown']);

    expect(exitCode).toBe(2);
    expect(stderr).toContain('Unknown option');
  });
});
