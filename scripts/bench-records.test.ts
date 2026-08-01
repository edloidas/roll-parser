import { describe, expect, it } from 'bun:test';
import type { MitataDump, MitataRun, MitataStats } from './bench-records.js';
import { toRecords } from './bench-records.js';

/** `ticks` is a multiple of mitata's 4096 batch size, so the mode reads `batch`. */
const GOOD_STATS: MitataStats = { p50: 500, p75: 620.5, ticks: 8192 };

function dumpOf(groupName: string | null, ...runs: MitataRun[]): MitataDump {
  return { layout: [{ name: groupName }], benchmarks: [{ group: 0, runs }] };
}

function statsWith(overrides: Partial<MitataStats>): MitataStats {
  return { ...GOOD_STATS, ...overrides };
}

describe('toRecords', () => {
  describe('valid dumps', () => {
    it('builds one record per run', () => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: GOOD_STATS }, { name: '3d6', stats: GOOD_STATS }),
      );

      expect(problems).toEqual([]);
      expect(records).toHaveLength(2);
      expect(records[0]).toEqual({
        name: 'lex / 1d20',
        unit: 'ns',
        value: 500,
        range: '± 120.5 ns',
        extra: 'group=lex case=1d20 p50=500ns p75=620.5ns mode=batch',
      });
    });

    it('rounds values to two decimals', () => {
      const { records } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ p50: 1.23456, p75: 2.34567 }) }),
      );

      expect(records[0]).toMatchObject({ value: 1.23, range: '± 1.11 ns' });
    });

    it('reports `single` when ticks is not a multiple of the batch size', () => {
      const { records } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ ticks: 8193 }) }),
      );

      expect(records[0]?.extra).toContain('mode=single');
    });

    it('accepts p75 equal to p50', () => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ p75: 500 }) }),
      );

      expect(problems).toEqual([]);
      expect(records[0]).toMatchObject({ range: '± 0 ns' });
    });

    it('resolves the group name per trial', () => {
      const { records } = toRecords({
        layout: [{ name: 'lex' }, { name: 'parse' }],
        benchmarks: [
          { group: 1, runs: [{ name: '1d20', stats: GOOD_STATS }] },
          { group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] },
        ],
      });

      expect(records.map((record) => record.name)).toEqual(['parse / 1d20', 'lex / 1d20']);
    });

    it('keeps the same case name under different groups', () => {
      const { records, problems } = toRecords({
        layout: [{ name: 'lex' }, { name: 'parse' }],
        benchmarks: [
          { group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] },
          { group: 1, runs: [{ name: '1d20', stats: GOOD_STATS }] },
        ],
      });

      expect(problems).toEqual([]);
      expect(records.map((record) => record.name)).toEqual(['lex / 1d20', 'parse / 1d20']);
    });

    it('returns nothing for an empty dump', () => {
      const { records, problems } = toRecords({ layout: [], benchmarks: [] });

      expect(records).toEqual([]);
      expect(problems).toEqual([]);
    });
  });

  describe('malformed dumps (#157)', () => {
    it('reports a run with missing stats instead of skipping it', () => {
      const { records, problems } = toRecords(dumpOf('lex', { name: '1d20' }));

      expect(records).toEqual([]);
      expect(problems).toEqual(['lex / 1d20: missing stats']);
    });

    it('keeps the valid runs out of the export when a sibling is malformed', () => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: GOOD_STATS }, { name: '3d6' }),
      );

      expect(records.map((record) => record.name)).toEqual(['lex / 1d20']);
      expect(problems).toEqual(['lex / 3d6: missing stats']);
    });

    it('reports an empty group name', () => {
      const { records, problems } = toRecords(dumpOf('  ', { name: '1d20', stats: GOOD_STATS }));

      expect(records).toEqual([]);
      expect(problems).toEqual(['#0 / 1d20: group 0 has no name in the layout']);
    });

    it('rejects a run whose group is absent from the layout (#191)', () => {
      const { records, problems } = toRecords({
        layout: [],
        benchmarks: [{ group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] }],
      });

      expect(records).toEqual([]);
      expect(problems).toEqual(['#0 / 1d20: group 0 has no name in the layout']);
    });

    it('rejects a run whose group name is null (#191)', () => {
      const { records, problems } = toRecords(dumpOf(null, { name: '1d20', stats: GOOD_STATS }));

      expect(records).toEqual([]);
      expect(problems).toEqual(['#0 / 1d20: group 0 has no name in the layout']);
    });

    it('reports every run of a trial whose group is unresolvable (#191)', () => {
      const { records, problems } = toRecords({
        layout: [{ name: 'lex' }],
        benchmarks: [
          { group: 1, runs: [{ name: '1d20', stats: GOOD_STATS }, { name: '3d6' }] },
          { group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] },
        ],
      });

      expect(records.map((record) => record.name)).toEqual(['lex / 1d20']);
      expect(problems).toEqual([
        '#1 / 1d20: group 1 has no name in the layout',
        '#1 / 3d6: group 1 has no name in the layout',
      ]);
    });

    it('rejects a record name duplicated within a trial (#191)', () => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: GOOD_STATS }, { name: '1d20', stats: GOOD_STATS }),
      );

      expect(records.map((record) => record.name)).toEqual(['lex / 1d20']);
      expect(problems).toEqual(['lex / 1d20: duplicate record name']);
    });

    it('rejects a record name duplicated across trials (#191)', () => {
      const { records, problems } = toRecords({
        layout: [{ name: 'lex' }],
        benchmarks: [
          { group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] },
          { group: 0, runs: [{ name: '1d20', stats: GOOD_STATS }] },
        ],
      });

      expect(records.map((record) => record.name)).toEqual(['lex / 1d20']);
      expect(problems).toEqual(['lex / 1d20: duplicate record name']);
    });

    it('claims a name only once a record is emitted (#191)', () => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20' }, { name: '1d20', stats: GOOD_STATS }),
      );

      expect(records.map((record) => record.name)).toEqual(['lex / 1d20']);
      expect(problems).toEqual(['lex / 1d20: missing stats']);
    });

    it('reports an empty case name', () => {
      const { records, problems } = toRecords(dumpOf('lex', { name: '', stats: GOOD_STATS }));

      expect(records).toEqual([]);
      expect(problems).toEqual(['lex / #0: case name is empty']);
    });

    it.each([
      ['zero', 0],
      ['negative', -1],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
    ])('reports a %s p50', (_label, p50) => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ p50 }) }),
      );

      expect(records).toEqual([]);
      expect(problems).toEqual([`lex / 1d20: p50 is not a positive finite number (${p50})`]);
    });

    it.each([
      ['below p50', 499],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
    ])('reports a p75 that is %s', (_label, p75) => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ p75 }) }),
      );

      expect(records).toEqual([]);
      expect(problems).toEqual([`lex / 1d20: p75 is not a finite number >= p50 (${p75})`]);
    });

    it.each([
      ['zero', 0],
      ['negative', -4096],
      ['NaN', Number.NaN],
    ])('reports a %s ticks rather than mislabelling the sampling mode', (_label, ticks) => {
      const { records, problems } = toRecords(
        dumpOf('lex', { name: '1d20', stats: statsWith({ ticks }) }),
      );

      expect(records).toEqual([]);
      expect(problems).toEqual([`lex / 1d20: ticks is not a positive finite number (${ticks})`]);
    });
  });
});
