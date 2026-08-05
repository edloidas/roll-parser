/**
 * Invalid-input probe: what does each library do with malformed notation?
 * Typed error with a code and position, generic error, silent acceptance, or
 * internal crash. Purely qualitative — read the table, no assertions.
 *
 * ! '99999999d99999999' lives in limits.ts: libraries without roll caps hang
 *   on it, so it must run under a subprocess timeout.
 */

import { ADAPTERS } from './adapters.js';

const BAD_INPUTS = ['', '1d', '4d6kh', 'd6+', '1d6!!!', '(1+2', '1d0', 'hello'];

type Outcome = { kind: string; detail: string };

function attempt(fn: () => number): Outcome {
  try {
    const value = fn();
    return { kind: 'ACCEPTED', detail: `-> ${value}` };
  } catch (error) {
    if (!(error instanceof Error)) return { kind: 'THROWN', detail: String(error).slice(0, 60) };
    const typed = error as Error & { code?: string; position?: number };
    const name = typed.constructor.name;
    const extras = [
      typed.code === undefined ? '' : `code=${typed.code}`,
      typed.position === undefined ? '' : `pos=${typed.position}`,
    ]
      .filter(Boolean)
      .join(' ');
    return { kind: name, detail: `${extras} ${typed.message.slice(0, 60)}`.trim() };
  }
}

for (const input of BAD_INPUTS) {
  console.log(`\n### input: ${JSON.stringify(input)}`);
  for (const adapter of ADAPTERS) {
    const outcome = attempt(() => adapter.rollTotal(input));
    console.log(`  ${adapter.name.padEnd(22)} ${outcome.kind.padEnd(18)} ${outcome.detail}`);
  }
}
