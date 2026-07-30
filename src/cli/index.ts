#!/usr/bin/env node

/**
 * CLI entry point for roll-parser.
 *
 * Owns the process-level wiring only; the command itself lives in
 * `./main.js` so it stays testable without spawning a subprocess.
 *
 * @module cli/index
 */

import { main } from './main.js';

// Minimal host-process surface this entry needs. The library build compiles
// with no Node/Bun type packages (`types: []` in tsconfig.build.json) so that
// runtime globals in library code are type errors; this module-scoped declare
// keeps the one legitimate use local without leaking `process` program-wide.
declare const process: {
  argv: string[];
  exitCode: number | undefined;
  stdout: { write(text: string): void };
  stderr: { write(text: string): void };
};

const exitCode = main({
  argv: process.argv.slice(2),
  stdout: (text) => {
    process.stdout.write(text);
  },
  stderr: (text) => {
    process.stderr.write(text);
  },
});

// Left unset on success — assigning 0 would override an exit code a
// surrounding runtime hook may already have set.
if (exitCode !== 0) process.exitCode = exitCode;
