import { expect } from 'bun:test';
import type { RollParserError, RollParserErrorCode } from './errors.js';

let distBuild: Promise<void> | undefined;

/**
 * Runs the real `build` script once per test process, so suites that exercise
 * `dist/` (the package self-reference, the packed CLI) see the current source
 * rather than a stale emit. Memoized because `bun test` runs every file
 * sequentially in one process — the first caller pays for the build, and the
 * `clean` step inside `build` cannot race another test file.
 */
export function ensureFreshDist(): Promise<void> {
  distBuild ??= buildDist(['bun', 'run', 'build']);
  return distBuild;
}

/** Exported for its own failure-path test; use {@link ensureFreshDist}. */
export async function buildDist(command: string[]): Promise<void> {
  const proc = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' });
  // Drain both pipes — an unread pipe can block the child, and `tsc` reports
  // its diagnostics on stdout.
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    throw new Error(`Failed to rebuild dist/ for tests:\n${stdout}${stderr}`);
  }
}

/**
 * Asserts that `fn` throws `ErrorClass` carrying `code`, and returns the error
 * so call sites can go on to assert spans, tokens, or message text.
 *
 * Replaces the `expect(() => …).toThrow(Class)` + `try`/`catch` + code-check
 * trio the suite used to repeat: the failing call runs once instead of twice,
 * and a call that fails to throw reports that here rather than falling off the
 * end of an empty `catch`.
 */
export function expectRollError<E extends RollParserError>(
  fn: () => unknown,
  ErrorClass: new (...args: never[]) => E,
  code: RollParserErrorCode,
): E {
  try {
    fn();
  } catch (caught) {
    if (!(caught instanceof ErrorClass)) {
      throw new Error(`Expected ${ErrorClass.name}, got ${String(caught)}`);
    }

    expect(caught.code).toBe(code);

    return caught;
  }

  throw new Error(`Expected ${ErrorClass.name} with code ${code}, but nothing was thrown`);
}
