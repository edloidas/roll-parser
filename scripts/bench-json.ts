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
 * Usage: `bun run bench:json [outputPath]`
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { run } from 'mitata';
import { registerAllBenches } from '../bench/index.bench.js';

type MitataStats = { p50: number; p75: number; ticks: number };

type MitataRun = { name: string; stats?: MitataStats };

type MitataTrial = { group: number; runs: MitataRun[] };

type MitataDump = { layout: { name: string | null }[]; benchmarks: MitataTrial[] };

/** One `customSmallerIsBetter` data point. */
type BenchmarkRecord = {
  name: string;
  unit: 'ns';
  value: number;
  range: string;
  extra: string;
};

const DEFAULT_OUTPUT_PATH = join(import.meta.dir, '..', '.tmp', 'bench-results.json');

/** mitata's batch size — `ticks` is a multiple of it whenever batching kicked in. */
const MITATA_BATCH_SAMPLES = 4096;

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Which sampling mode mitata settled on. `primeBenchFn` pins every bench to
 * `batch`, so `single` here means that pin broke — the two modes are not
 * comparable (`single` times one post-GC call per sample and reads 10-30x high
 * on sub-10 µs work), and a series that changes mode between runs shows a
 * measurement artefact, not a regression (#143). Recorded in `extra` so the CI
 * trend artefact carries the evidence.
 */
function getSamplingMode(ticks: number): 'batch' | 'single' {
  return ticks % MITATA_BATCH_SAMPLES === 0 ? 'batch' : 'single';
}

function toRecords(dump: MitataDump): BenchmarkRecord[] {
  const records: BenchmarkRecord[] = [];

  for (const trial of dump.benchmarks) {
    // ? `trial.group` is an index into `layout`; `summary()` nests a collection
    //   that inherits its parent group's name, so this stays the group label.
    const group = dump.layout[trial.group]?.name ?? 'ungrouped';

    for (const trialRun of trial.runs) {
      if (trialRun.stats == null) continue;

      const { p50, p75, ticks } = trialRun.stats;
      const mode = getSamplingMode(ticks);

      records.push({
        name: `${group} / ${trialRun.name}`,
        unit: 'ns',
        value: round(p50),
        range: `± ${round(p75 - p50)} ns`,
        extra: `group=${group} case=${trialRun.name} p50=${round(p50)}ns p75=${round(p75)}ns mode=${mode}`,
      });
    }
  }

  return records;
}

async function main(): Promise<void> {
  const outputPath = resolve(process.argv[2] ?? DEFAULT_OUTPUT_PATH);

  registerAllBenches();

  let dump = '';

  // ! `debug` and `samples` must stay disabled — mitata's default JSON dump
  //   embeds every raw sample and is ~23 MB for this suite.
  await run({
    format: { json: { debug: false, samples: false } },
    print: (chunk: string) => {
      dump += chunk;
    },
  });

  const records = toRecords(JSON.parse(dump));

  if (records.length === 0) {
    console.error('bench-json: mitata produced no usable benchmark stats');
    process.exit(1);
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(records, null, 2)}\n`);

  console.log(`bench-json: wrote ${records.length} records to ${outputPath}`);
}

await main();
