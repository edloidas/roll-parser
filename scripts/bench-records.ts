/**
 * Turns a mitata JSON dump into `customSmallerIsBetter` records for the CI
 * trend job, rejecting anything that would poison the series (#157).
 *
 * Split out of `bench-json.ts` so the conversion is testable without running
 * the bench suite.
 */

export type MitataStats = { p50: number; p75: number; ticks: number };

export type MitataRun = { name: string; stats?: MitataStats };

export type MitataTrial = { group: number; runs: MitataRun[] };

export type MitataDump = { layout: { name: string | null }[]; benchmarks: MitataTrial[] };

/** One `customSmallerIsBetter` data point. */
export type BenchmarkRecord = {
  name: string;
  unit: 'ns';
  value: number;
  range: string;
  extra: string;
};

/**
 * Records that passed validation, plus one message per run that did not. A
 * rejected run is absent from `records` — callers must treat a non-empty
 * `problems` as fatal rather than exporting the remainder.
 */
export type RecordsResult = { records: BenchmarkRecord[]; problems: string[] };

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

function isNonEmptyName(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

/**
 * Why these stats cannot become a record, or `null` when they are usable.
 * Checked before the numbers are rounded, so a dump-format change surfaces as
 * a named offender instead of a `NaN` data point.
 */
function findStatsProblem({ p50, p75, ticks }: MitataStats): string | null {
  if (!Number.isFinite(p50) || p50 <= 0) return `p50 is not a positive finite number (${p50})`;
  if (!Number.isFinite(p75) || p75 < p50) return `p75 is not a finite number >= p50 (${p75})`;
  // A non-finite `ticks` makes the modulo `NaN`, which silently reports every
  // bench as `single` and defeats the mode tripwire.
  if (!Number.isFinite(ticks) || ticks <= 0) {
    return `ticks is not a positive finite number (${ticks})`;
  }

  return null;
}

export function toRecords(dump: MitataDump): RecordsResult {
  const records: BenchmarkRecord[] = [];
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const trial of dump.benchmarks) {
    // `trial.group` indexes `layout`; `summary()` nests a collection that inherits
    // its parent group's name, so this stays the group label.
    const group = dump.layout[trial.group]?.name;
    const groupLabel = isNonEmptyName(group) ? group : `#${trial.group}`;

    for (const [index, trialRun] of trial.runs.entries()) {
      const label = `${groupLabel} / ${isNonEmptyName(trialRun.name) ? trialRun.name : `#${index}`}`;

      // Every bench registers inside a `group()`, so an index the layout cannot
      // resolve means a corrupt dump, never a legitimately ungrouped bench.
      if (!isNonEmptyName(group)) {
        problems.push(`${label}: group ${trial.group} has no name in the layout`);
        continue;
      }

      if (!isNonEmptyName(trialRun.name)) {
        problems.push(`${label}: case name is empty`);
        continue;
      }

      const stats = trialRun.stats;

      if (stats == null) {
        problems.push(`${label}: missing stats`);
        continue;
      }

      const problem = findStatsProblem(stats);

      if (problem != null) {
        problems.push(`${label}: ${problem}`);
        continue;
      }

      // The count check cannot catch this: a duplicate plus a dropped run leaves
      // the total intact while one series carries another's numbers.
      if (seen.has(label)) {
        problems.push(`${label}: duplicate record name`);
        continue;
      }

      seen.add(label);

      const { p50, p75, ticks } = stats;
      const mode = getSamplingMode(ticks);

      records.push({
        name: label,
        unit: 'ns',
        value: round(p50),
        range: `± ${round(p75 - p50)} ns`,
        extra: `group=${group} case=${trialRun.name} p50=${round(p50)}ns p75=${round(p75)}ns mode=${mode}`,
      });
    }
  }

  return { records, problems };
}
