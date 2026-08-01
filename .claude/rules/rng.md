# RNG Standards

All dice rolling goes through the `RNG` interface (`src/rng/types.ts`),
injected via the options parameter, defaulting to `SeededRNG`; tests use
`createMockRng`. `Math.random()` has exactly one permitted call site: seeding
`SeededRNG` when the caller supplies no seed. Anywhere else in a roll path is
a bug.

## Draw Order

Keep/drop arguments (`4d6kh(1d2)`) draw *before* the pool; threshold arguments
(`4d6cs>(1d2)`) draw *after* it. **README.md → Randomness → Draw order** is the
single source of truth, with worked tables for both cases — do not restate it
here or in source comments. `src/rng/mock.ts` carries the same note in its
TSDoc for consumers who never read the README.
