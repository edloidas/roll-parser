# RNG Standards

## Interface

All dice rolling MUST go through the `RNG` interface:

```typescript
interface RNG {
  next(): number;                            // [0, 1)
  nextInt(min: number, max: number): number; // [min, max] inclusive
}
```

1. Never call `Math.random()` in roll logic
2. Inject the RNG via the options parameter
3. Default to `SeededRNG` when none is provided
4. Use `createMockRng` in tests

## Draw Order

`MockRNG` draw order for notations with meta-expressions is specified in
**README.md → Randomness → Draw order**, with worked tables for both cases.
That section is the single source of truth — do not restate it here or in
source comments; link to it.

The short version: keep/drop arguments (`4d6kh(1d2)`) draw *before* the pool;
threshold arguments (`4d6cs>(1d2)`) draw *after* it. `src/rng/mock.ts` carries
the same note in its TSDoc for consumers who never read the README.
