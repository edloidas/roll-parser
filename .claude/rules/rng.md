# RNG Standards

## Interface

All dice rolling MUST use the RNG interface:

```typescript
interface RNG {
  next(): number;                            // [0, 1)
  nextInt(min: number, max: number): number; // [min, max] inclusive
}
```

## Rules

1. **Never use `Math.random()` directly** in roll logic
2. **Inject RNG** via options parameter
3. **Default to `SeededRNG`** when no RNG is provided
4. **Use `MockRNG` in tests** — returns a predefined sequence

## MockRNG Behavior

```typescript
const mock = createMockRng([3, 5, 1]);
mock.nextInt(1, 6); // Returns 3
mock.nextInt(1, 6); // Returns 5
mock.nextInt(1, 6); // Returns 1
mock.nextInt(1, 6); // Throws! (sequence exhausted)
```

`MockRNG` MUST throw on exhaustion — this catches incorrect roll counts in tests.
`MockRNG.nextInt` validates that returned values fall within `[min, max]` — throws `RangeError` if not.

## Draw Order

When authoring `MockRNG` sequences for dice expressions, follow this order:

1. **Inside `evalDice`**: `count` expression → `sides` expression → pool dice (one `nextInt` per die, left-to-right).
2. **Inside `flattenModifierChain`**: modifier-argument meta-expressions are drawn **before** the base dice pool. For `4d6kh(1d2)` the inner `1d2` draws first, then the `4d6` pool.

Worked example — `4d6kh(1d2)` with `createMockRng([1, 5, 3, 4, 6])`:

| Draw | Source | Value |
|------|--------|-------|
| 1 | `1d2` (keep-count meta-expression) | `1` |
| 2 | `4d6` pool, die 1 | `5` |
| 3 | `4d6` pool, die 2 | `3` |
| 4 | `4d6` pool, die 3 | `4` |
| 5 | `4d6` pool, die 4 | `6` |

Kept result: `6` (highest of `[5, 3, 4, 6]`).

## Usage in Tests

```typescript
import { describe, it, expect } from 'bun:test';
// Internal tests use relative imports:
import { createMockRng } from '@/rng/mock';
// npm consumers use: import { createMockRng } from 'roll-parser/testing';

describe('roll', () => {
  it('should roll exact values with MockRNG', () => {
    const rng = createMockRng([4, 2, 6]);

    const result = roll('3d6', { rng });

    expect(result.total).toBe(12); // 4 + 2 + 6
    expect(result.rolls).toEqual([
      { result: 4, sides: 6 },
      { result: 2, sides: 6 },
      { result: 6, sides: 6 },
    ]);
  });
});
```

## SeededRNG for Reproducibility

```typescript
// Same seed → same sequence
const rng1 = new SeededRNG('test-seed');
const rng2 = new SeededRNG('test-seed');

expect(rng1.nextInt(1, 6)).toBe(rng2.nextInt(1, 6));
```
