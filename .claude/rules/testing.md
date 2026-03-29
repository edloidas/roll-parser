# Testing Standards

Uses Bun's built-in test runner (`bun test`).

## Structure

Nested `describe` gives context — keep test names short and descriptive.
`test` and `it` are interchangeable; the codebase uses both.

```typescript
describe('evaluate', () => {
  describe('arithmetic operations', () => {
    test('addition', () => { ... });
    test('complex expression with precedence', () => { ... });
  });
});
```

## Dice Tests

Use `createMockRng` for all deterministic dice tests. See `rng.md`.

```typescript
// Internal tests use relative imports:
import { createMockRng } from '../rng/mock';
// npm consumers use: import { createMockRng } from 'roll-parser/testing';

test('keeps highest die from pool', () => {
  const ast = parse('2d20kh1');
  const rng = createMockRng([7, 15]);
  const result = evaluate(ast, rng);

  expect(result.total).toBe(15);
});
```

## Property-Based Testing (fast-check)

Use for mathematical invariants. Typical `numRuns`: 100–500.
Pass a seeded `roll(notation, { seed })` when comparing two rolls on the same random sequence.

```typescript
import fc from 'fast-check';

test('NdX total is always in valid range [N, N*X]', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 20 }),
      fc.integer({ min: 1, max: 100 }),
      (count, sides) => {
        const result = roll(`${count}d${sides}`);
        return result.total >= count && result.total <= count * sides;
      },
    ),
    { numRuns: 500 },
  );
});
```

## Conventions

- Co-locate with source: `foo.ts` → `foo.test.ts`
- Target >90% statement coverage, 100% function coverage
