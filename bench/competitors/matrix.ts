/**
 * Feature and correctness matrix.
 *
 * Every (library, notation) cell that rolls without throwing is validated over
 * N samples against known bounds and the notation's expected mean, so a cell
 * only counts as PASS when the semantics are right, not merely when the parse
 * succeeds. SEMANTIC marks "parses, but statistically wrong for the canonical
 * reading" — usually a dialect difference, sometimes a bug (see README).
 *
 * Dialect-variant spellings (`variants`) keep the comparison fair: a library
 * is tested with its own documented spelling where one exists.
 */

import { ADAPTERS, type AdapterName, competitorVersions } from './adapters.js';

const SAMPLES = 5000;

type Expectation = {
  min?: number;
  max?: number;
  mean?: number;
  /** Absolute tolerance on the observed mean. */
  tolerance?: number;
};

type MatrixCase = {
  /** Canonical notation (roll-parser dialect). */
  notation: string;
  group: string;
  description: string;
  expect: Expectation;
  /** Compare `successes` instead of `total` for adapters that separate them. */
  metric?: 'successes';
  /** Per-library spelling overrides. `null` skips the case for that library. */
  variants?: Partial<Record<AdapterName, string | null>>;
};

// Expected means are exact where closed-form (kh/kl/dh from order statistics),
// and generous elsewhere so only gross misinterpretation trips SEMANTIC.
const CASES: MatrixCase[] = [
  {
    notation: '1d20',
    group: 'basic',
    description: 'single die',
    expect: { min: 1, max: 20, mean: 10.5, tolerance: 0.4 },
  },
  {
    notation: 'd20',
    group: 'basic',
    description: 'implicit count',
    expect: { min: 1, max: 20, mean: 10.5, tolerance: 0.4 },
  },
  {
    notation: '3d6+2',
    group: 'basic',
    description: 'pool + modifier',
    expect: { min: 5, max: 20, mean: 12.5, tolerance: 0.4 },
  },
  {
    notation: '2d6+1d4+3',
    group: 'basic',
    description: 'mixed pools',
    expect: { min: 6, max: 19, mean: 12.5, tolerance: 0.4 },
  },
  {
    notation: 'd%',
    group: 'basic',
    description: 'percentile',
    expect: { min: 1, max: 100, mean: 50.5, tolerance: 1.6 },
  },
  {
    notation: '4dF',
    group: 'basic',
    description: 'Fudge/Fate',
    expect: { min: -4, max: 4, mean: 0, tolerance: 0.25 },
  },

  {
    notation: '4d6kh3',
    group: 'keep/drop',
    description: 'keep highest',
    expect: { min: 3, max: 18, mean: 12.2446, tolerance: 0.4 },
    // RDN spells "drop the lowest" as `4d6L`; it has no keep-N form. Its own
    // `kh3` parse is inverted — see README.
    variants: { 'randsum/roller': '4d6L' },
  },
  {
    notation: '2d20kl1',
    group: 'keep/drop',
    description: 'disadvantage',
    expect: { min: 1, max: 20, mean: 7.175, tolerance: 0.4 },
    variants: { 'randsum/roller': '2d20H' },
  },
  {
    notation: '4d6dl1',
    group: 'keep/drop',
    description: 'drop lowest',
    expect: { min: 3, max: 18, mean: 12.2446, tolerance: 0.4 },
    variants: { 'randsum/roller': '4d6L' },
  },
  {
    notation: '4d6dh1',
    group: 'keep/drop',
    description: 'drop highest',
    expect: { min: 3, max: 18, mean: 8.7554, tolerance: 0.4 },
    variants: { 'randsum/roller': '4d6H' },
  },

  {
    notation: '3d6!',
    group: 'explode/reroll',
    description: 'exploding',
    expect: { min: 3, mean: 12.6, tolerance: 0.6 },
  },
  {
    notation: '5d6!!',
    group: 'explode/reroll',
    description: 'compound explode',
    expect: { min: 5, mean: 21, tolerance: 1.0 },
  },
  {
    notation: '4d6r=1',
    group: 'explode/reroll',
    description: 'reroll 1s',
    // Recursive reroll has a per-die mean of 4.0, reroll-once 3.9167 — the
    // band accepts both readings.
    expect: { min: 4, max: 24, mean: 15.9, tolerance: 0.65 },
    variants: {
      'dice-roller-parser': '4d6r1',
      'dice-typescript': '4d6r1',
      'randsum/roller': '4d6R{=1}',
    },
  },
  {
    notation: '4d6min2',
    group: 'explode/reroll',
    description: 'minimum cap',
    // Per-die mean with 1s lifted to 2: (2+2+3+4+5+6)/6 = 22/6.
    expect: { min: 8, max: 24, mean: 14.6667, tolerance: 0.5 },
    variants: { 'randsum/roller': '4d6C{<2}' },
  },
  {
    notation: '4d6max5',
    group: 'explode/reroll',
    description: 'maximum cap',
    // Per-die mean with 6s clamped to 5: (1+2+3+4+5+5)/6 = 20/6.
    expect: { min: 4, max: 20, mean: 13.3333, tolerance: 0.5 },
    variants: { 'randsum/roller': '4d6C{>5}' },
  },

  {
    notation: '10d10>=8',
    group: 'success',
    description: 'count successes',
    expect: { min: 0, max: 10, mean: 3.0, tolerance: 0.35 },
    metric: 'successes',
    // Roll20 comparators are inclusive: `>8` reads "8 or higher". Its `>=8`
    // spelling silently sums the pool instead — see README.
    variants: { 'dice-roller-parser': '10d10>8', 'randsum/roller': null },
  },
  {
    notation: '10d10>=8f1',
    group: 'success',
    description: 'successes minus fails',
    expect: { min: -10, max: 10, mean: 2.0, tolerance: 0.4 },
    variants: {
      'rpg-dice-roller': '10d10>=8f<=1',
      'dice-roller-parser': '10d10>8f<1',
      'dice-typescript': null,
      'randsum/roller': null,
    },
  },

  {
    notation: '(1d6+2)*3',
    group: 'math',
    description: 'parens + multiply',
    expect: { min: 9, max: 24, mean: 16.5, tolerance: 0.6 },
  },
  {
    notation: 'floor(7/2)+1d4',
    group: 'math',
    description: 'function call',
    expect: { min: 4, max: 7, mean: 5.5, tolerance: 0.35 },
  },
  {
    notation: 'sqrt(16)+1d4',
    group: 'math',
    description: 'square root',
    expect: { min: 5, max: 8, mean: 6.5, tolerance: 0.35 },
  },
  {
    notation: '(1d4)d6',
    group: 'math',
    description: 'computed dice count',
    expect: { min: 1, max: 24, mean: 8.75, tolerance: 0.5 },
  },

  {
    notation: '{2d20, 1d12}kh1',
    group: 'pools',
    description: 'group keep-highest',
    expect: { min: 1, max: 40, mean: 21.1, tolerance: 1.2 },
  },
  {
    notation: '100d6',
    group: 'scale',
    description: 'large pool',
    expect: { min: 100, max: 600, mean: 350, tolerance: 4 },
  },
];

type CellStatus = 'pass' | 'semantic' | 'unsupported';

type Cell = {
  status: CellStatus;
  notationUsed: string;
  detail?: string;
  observed?: { mean: number; min: number; max: number };
};

function evaluateCell(matrixCase: MatrixCase, adapterName: AdapterName): Cell {
  const adapter = ADAPTERS.find((candidate) => candidate.name === adapterName);
  if (adapter === undefined) throw new Error(`unknown adapter ${adapterName}`);

  const variant = matrixCase.variants?.[adapterName];
  if (variant === null) {
    return {
      status: 'unsupported',
      notationUsed: matrixCase.notation,
      detail: 'no equivalent spelling/semantics',
    };
  }
  const notation = variant ?? matrixCase.notation;

  const sampler =
    matrixCase.metric === 'successes' && adapter.rollSuccesses !== undefined
      ? adapter.rollSuccesses
      : adapter.rollTotal;

  try {
    let sum = 0;
    let lowest = Number.POSITIVE_INFINITY;
    let highest = Number.NEGATIVE_INFINITY;
    for (let index = 0; index < SAMPLES; index++) {
      const value = sampler(notation);
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`non-numeric result: ${value}`);
      }
      sum += value;
      if (value < lowest) lowest = value;
      if (value > highest) highest = value;
    }
    const mean = sum / SAMPLES;
    const { expect } = matrixCase;
    const problems: string[] = [];
    if (expect.min !== undefined && lowest < expect.min) {
      problems.push(`min ${lowest} < ${expect.min}`);
    }
    if (expect.max !== undefined && highest > expect.max) {
      problems.push(`max ${highest} > ${expect.max}`);
    }
    if (expect.mean !== undefined && Math.abs(mean - expect.mean) > (expect.tolerance ?? 0.4)) {
      problems.push(`mean ${mean.toFixed(2)} vs expected ${expect.mean}`);
    }
    return {
      status: problems.length === 0 ? 'pass' : 'semantic',
      notationUsed: notation,
      detail: problems.join('; ') || undefined,
      observed: { mean: Number(mean.toFixed(3)), min: lowest, max: highest },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { status: 'unsupported', notationUsed: notation, detail: message.slice(0, 100) };
  }
}

const STATUS_LABEL: Record<CellStatus, string> = {
  pass: 'PASS',
  semantic: 'SEMANTIC',
  unsupported: 'no',
};

async function main(): Promise<void> {
  console.log(`roll-parser competitor matrix — ${SAMPLES} samples per supported cell`);
  console.log('competitors:', JSON.stringify(await competitorVersions()));
  console.log('');

  const adapterNames = ADAPTERS.map((adapter) => adapter.name);
  const columnWidth = Math.max(...adapterNames.map((name) => name.length)) + 2;
  const results: Record<string, Record<string, Cell>> = {};

  console.log(
    'notation'.padEnd(18) + adapterNames.map((name) => name.padEnd(columnWidth)).join(''),
  );
  let currentGroup = '';
  for (const matrixCase of CASES) {
    if (matrixCase.group !== currentGroup) {
      currentGroup = matrixCase.group;
      console.log(`-- ${currentGroup}`);
    }
    results[matrixCase.notation] = {};
    const row = adapterNames.map((name) => {
      const cell = evaluateCell(matrixCase, name);
      const caseResults = results[matrixCase.notation];
      if (caseResults !== undefined) caseResults[name] = cell;
      const marker = cell.notationUsed === matrixCase.notation ? '' : '*';
      return (STATUS_LABEL[cell.status] + marker).padEnd(columnWidth);
    });
    console.log(matrixCase.notation.padEnd(18) + row.join(''));
  }

  console.log('\n* = dialect-variant spelling used (see `variants` in matrix.ts)');
  console.log('\ndetails for SEMANTIC cells:');
  for (const [notation, cells] of Object.entries(results)) {
    for (const [adapterName, cell] of Object.entries(cells)) {
      if (cell.status === 'semantic') {
        console.log(`  ${notation} | ${adapterName} (${cell.notationUsed}): ${cell.detail}`);
      }
    }
  }

  await Bun.write(
    new URL('matrix-results.json', import.meta.url),
    JSON.stringify({ samples: SAMPLES, cases: CASES, results }, null, 2),
  );
  console.log('\nwrote matrix-results.json');
}

await main();
