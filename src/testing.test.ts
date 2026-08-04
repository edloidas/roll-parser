/**
 * Tests for the `roll-parser/testing` entry point.
 *
 * `src/testing.ts` re-binds the mock RNG through local consts to work around
 * a Bun bundler bug (see the note in that file). Every other suite imports
 * `rng/mock.js` directly, so nothing exercised the re-binding — this file
 * consumes the entry point the way an npm consumer does.
 *
 * @module testing.test
 */

import { describe, expect, test } from 'bun:test';
import { roll } from './roll.js';
import * as testingApi from './testing.js';
import { createMockRng, MockRNGExhaustedError } from './testing.js';

/** Runtime values the subpath promises to export. */
const VALUE_EXPORTS = ['MockRNGExhaustedError', 'createMockRng'] as const;

/**
 * Every type the subpath promises to export. See `PublicTypeSurface` in
 * `index.test.ts` for why the list is written out by hand.
 */
export type PublicTestingTypeSurface = [testingApi.RNG];

describe('roll-parser/testing', () => {
  test('exports exactly the documented surface', () => {
    expect(typeof createMockRng).toBe('function');
    expect(typeof MockRNGExhaustedError).toBe('function');
  });

  test('the subpath exports nothing beyond the promised set', () => {
    expect(Object.keys(testingApi).sort()).toEqual([...VALUE_EXPORTS].sort());
  });

  test('createMockRng drives a real roll deterministically', () => {
    const result = roll('3d6', { rng: createMockRng([4, 2, 6]) });

    expect(result.total).toBe(12);
    expect(result.rolls.map((die) => die.result)).toEqual([4, 2, 6]);
  });

  test('the exported mock returns values in sequence', () => {
    const rng = createMockRng([0.5, 3]);

    expect(rng.next()).toBe(0.5);
    expect(rng.nextInt(1, 6)).toBe(3);
  });

  test('exhaustion throws the exported error class', () => {
    const rng = createMockRng([1]);
    rng.nextInt(1, 6);

    expect(() => rng.nextInt(1, 6)).toThrow(MockRNGExhaustedError);
  });

  test('the exported error class is the one the mock actually throws', () => {
    const rng = createMockRng([]);

    try {
      rng.next();
      expect.unreachable('expected MockRNGExhaustedError');
    } catch (error) {
      expect(error).toBeInstanceOf(MockRNGExhaustedError);
      expect((error as MockRNGExhaustedError).consumed).toBe(0);
      expect((error as Error).name).toBe('MockRNGExhaustedError');
    }
  });

  test('out-of-bounds values still raise RangeError through the entry point', () => {
    expect(() => createMockRng([9]).nextInt(1, 6)).toThrow(RangeError);
  });
});
