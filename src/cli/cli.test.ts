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

describe('CLI integration', () => {
  test('--help prints usage and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['--help']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage: roll-parser');
    expect(stdout).toContain('--verbose');
    expect(stdout).toContain('--seed');
  });

  test('-h prints usage and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['-h']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('Usage: roll-parser');
  });

  test('--version prints version and exits 0', async () => {
    const { stdout, exitCode } = await runCli(['--version']);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  test('basic roll with --seed produces deterministic output', async () => {
    const { stdout: out1, exitCode: code1 } = await runCli(['2d6+3', '--seed', 'test']);
    const { stdout: out2 } = await runCli(['2d6+3', '--seed', 'test']);
    expect(code1).toBe(0);
    expect(out1.trim()).toBe(out2.trim());
    const total = Number(out1.trim());
    expect(total).toBeGreaterThanOrEqual(5);
    expect(total).toBeLessThanOrEqual(15);
  });

  test('--verbose shows rendered breakdown', async () => {
    const { stdout, exitCode } = await runCli(['4d6kh3', '--verbose', '--seed', 'test']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('4d6');
    expect(stdout).toContain('[');
    expect(stdout).toContain('=');
  });

  test('verbose mode shows dropped dice in parentheses', async () => {
    const { stdout } = await runCli(['4d6kh3', '-v', '--seed', 'test']);
    expect(stdout).toMatch(/\(\d+\)/);
    expect(stdout).not.toContain('~~');
  });

  test('multiple positional args are joined as notation', async () => {
    const { stdout: joined, exitCode } = await runCli(['2d6', '+', '3', '--seed', 'test']);
    const { stdout: single } = await runCli(['2d6+3', '--seed', 'test']);
    expect(exitCode).toBe(0);
    expect(joined.trim()).toBe(single.trim());
  });

  test('invalid notation exits with code 1', async () => {
    const { stderr, exitCode } = await runCli(['invalid_notation']);
    expect(exitCode).toBe(1);
    expect(stderr).toContain('Error:');
  });

  test('no arguments exits with code 2', async () => {
    const { stderr, exitCode } = await runCli([]);
    expect(exitCode).toBe(2);
    expect(stderr).toContain('No dice notation provided');
  });

  test('unknown flag exits with code 2', async () => {
    const { stderr, exitCode } = await runCli(['--unknown']);
    expect(exitCode).toBe(2);
    expect(stderr).toContain('Unknown option');
  });

  test('--seed without value exits with code 2', async () => {
    const { stderr, exitCode } = await runCli(['2d6', '--seed']);
    expect(exitCode).toBe(2);
    expect(stderr).toContain('Missing value');
  });

  test('--seed=value syntax works', async () => {
    const { stdout: eq, exitCode } = await runCli(['2d6', '--seed=test']);
    const { stdout: space } = await runCli(['2d6', '--seed', 'test']);
    expect(exitCode).toBe(0);
    expect(eq.trim()).toBe(space.trim());
  });
});
