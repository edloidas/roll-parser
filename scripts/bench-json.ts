/**
 * Runs the full bench suite and writes a compact JSON summary for CI trend
 * tracking (#131).
 *
 * The output is shaped for `benchmark-action/github-action-benchmark`'s
 * `customSmallerIsBetter` tool: an array of `{ name, unit, value }`. `value` is
 * always **p50**, never avg — avg on this suite is effectively a GC-pause
 * histogram (809 ns avg against 508 ns p50 on the same benchmark), and cross-
 * process avg variance runs ±43% where p50 stays within ±5-10%.
 *
 * Conversion and per-record validation live in `bench-records.ts`.
 *
 * Usage: `bun run bench:json [outputPath]`
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { run } from 'mitata';
import { registerAllBenches } from '../bench/index.bench.js';
import { toRecords } from './bench-records.js';

const DEFAULT_OUTPUT_PATH = join(import.meta.dir, '..', '.tmp', 'bench-results.json');

async function main(): Promise<void> {
  const outputPath = resolve(process.argv[2] ?? DEFAULT_OUTPUT_PATH);

  const expectedCount = registerAllBenches();

  let dump = '';

  // ! `debug` and `samples` must stay disabled — mitata's default JSON dump
  //   embeds every raw sample and is ~23 MB for this suite.
  await run({
    format: { json: { debug: false, samples: false } },
    print: (chunk: string) => {
      dump += chunk;
    },
  });

  const { records, problems } = toRecords(JSON.parse(dump));

  const failures = [...problems];

  if (records.length === 0) {
    failures.push('mitata produced no usable benchmark stats');
  } else if (records.length !== expectedCount) {
    failures.push(
      `expected ${expectedCount} records, got ${records.length} — a bench run is missing from the dump, or a registrar's returned count is stale`,
    );
  }

  // ! Never write a partial series: the CI trend compares against whatever
  //   landed last, so a shrunk or corrupt export reads as a phantom regression
  //   on every later run (#157).
  if (failures.length > 0) {
    console.error('bench-json: refusing to write a partial or corrupt export');

    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }

    process.exit(1);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);

  console.log(`bench-json: wrote ${records.length} records to ${outputPath}`);
}

await main();
