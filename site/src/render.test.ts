import { describe, expect, it } from 'bun:test';
import { roll } from 'roll-parser';
import { createMockRng } from 'roll-parser/testing';
import { renderResultPanel } from './render.js';

/** The mini-die faces the equation chip renders, in order. */
function chipDice(notation: string, sequence: number[]): string[] {
  const html = renderResultPanel(roll(notation, { rng: createMockRng(sequence) }));
  return [...html.matchAll(/<span class="mini-die[^"]*"[^>]*>([^<]*)</g)].map(
    (match) => match[1] ?? '',
  );
}

describe('equation chip pools', () => {
  it('renders the appended explosion dice (#313)', () => {
    expect(chipDice('2d6!', [6, 4, 2])).toEqual(['6', '2', '4']);
  });

  it('renders penetrating explosions with their penalty applied (#313)', () => {
    expect(chipDice('2d6!p', [6, 4, 2])).toEqual(['6', '1', '4']);
  });

  it('renders both the discarded die and its replacement (#313)', () => {
    expect(chipDice('2d6r<3', [1, 5, 4])).toEqual(['1', '4', '5']);
  });

  it('prefers the outermost pool when explode wraps sort (#313)', () => {
    expect(chipDice('2d6s!', [3, 6, 5])).toEqual(['3', '6', '5']);
  });

  it('keeps compound explosions folded into the original dice', () => {
    expect(chipDice('2d6!!', [6, 4, 2])).toEqual(['8', '4']);
  });

  it('keeps the sorted order for a bare sort', () => {
    expect(chipDice('4d6s', [3, 1, 4, 2])).toEqual(['1', '2', '3', '4']);
  });

  it('keeps the tallied pool for a success count', () => {
    expect(chipDice('4d6>=4', [6, 2, 5, 1])).toEqual(['6', '2', '5', '1']);
  });
});
