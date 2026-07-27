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

const exitCode = main({
  argv: process.argv.slice(2),
  stdout: (text) => {
    process.stdout.write(text);
  },
  stderr: (text) => {
    process.stderr.write(text);
  },
});

// ? Left unset on success — assigning 0 would override an exit code a
//   surrounding runtime hook may already have set.
if (exitCode !== 0) process.exitCode = exitCode;
