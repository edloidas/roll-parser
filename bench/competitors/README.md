# Competitor comparison suite

Compares roll-parser against the other dice-notation libraries on npm, on the
machine it runs on. This directory is deliberately **not** a root workspace:
installing the repo must never pull competitor packages (and their transitive
`mathjs`) into the main dependency tree, lockfile, or audit surface. Competitor
versions are pinned exactly; bump them intentionally, in their own commit.

roll-parser itself is imported from `../../src`, so the suite always measures
the working tree, not a published version.

## Running

```bash
bun run bench:competitors   # from the repo root: install + matrix + bench

# or, from this directory:
bun install
bun run matrix    # feature/correctness matrix (statistical validation)
bun run bench     # mitata perf suite: parse-only and end-to-end roll
bun run errors    # qualitative probe: behavior on malformed input
bun run limits    # safety probe: absurd pool sizes, subprocess-timeboxed
bun run footprint # bundled size (esbuild + gzip) and cold-import cost
bun run all       # matrix + bench
```

There is also a manual `Competitor benchmarks` GitHub Actions workflow
(`workflow_dispatch`) that runs `matrix` + `bench` and uploads the output as an
artifact. It is not part of the CI gate: cross-library numbers against pinned
versions carry no regression signal for this repo, and shared runners are too
noisy for µs-level assertions.

## Protocol

- **Support is statistical, not syntactic.** A (library, notation) cell counts
  as PASS only when 5,000 rolls stay inside the notation's legal bounds and the
  observed mean matches the closed-form expectation. "Parses but misinterprets"
  shows as SEMANTIC, not as support.
- **Dialects are respected.** Where a library documents a different spelling
  for the same semantics, the matrix tests that spelling and marks the cell
  with `*` (e.g. Roll20 comparators are inclusive, so `10d10>=8` is spelled
  `10d10>8` for dice-roller-parser). Cells fail only on missing or wrong
  *semantics*, never on spelling.
- **Benchmarks run each library's documented one-shot API with its default
  RNG** — the out-of-the-box cost a consumer pays. Long-lived roller instances
  are reused where that is the library's documented usage. Read p50; mean is
  dominated by GC pauses.
- Bench group membership is fixed by the matrix: libraries that misinterpret a
  notation are excluded from that group rather than rewarded for doing the
  wrong thing quickly.

## Known competitor caveats (verified 2026-08-05, versions as pinned)

- **@dice-roller/rpg-dice-roller** — pool size hard-capped at 999 dice
  (`1000d6` throws `RangeError`); ~380 ms import cost and ~204 kB gzipped
  bundle from the `mathjs` dependency; bundling for browsers requires a
  `crypto` shim.
- **@randsum/roller** — RDN is its own dialect (`4d6L` drops the lowest,
  `4d6C{<2}` clamps, `4d6R{=1}` rerolls), and the matrix tests it with those
  spellings. The sharp edge is that it *accepts* the D&D-standard `4d6kh3` and
  inverts it: `notationToOptions` yields `{drop: {highest: 3}, keep: {highest:
  1}}`, so 20,000 rolls mean **1.77** — the lowest die — where the correct
  value is 12.24. `4d6kl1` is read correctly, so only the `kh` form is
  affected. No notation-level success counting, arithmetic beyond `+`/`-`,
  grouping, or computed dice counts.
- **dice-roller-parser** — `10d10>=8` parses but silently **sums** the pool
  instead of counting successes (use `>8`); `5d6!!` crashes with an internal
  `TypeError`; accepts `1d` → rolls 1 die, `d6+` → drops the dangling
  operator, `1d0` → returns 1. Unmaintained since 2020.
- **dice-typescript** — success pools put the *sum of qualifying faces* in
  `total` and the count in `successes`; accepts `1d0` and unbalanced parens;
  the only library that still **hangs** on `99999999d99999999` (killed after
  5 s) rather than rejecting it. Unmaintained since 2018.
- **@airjp73/dice-notation** — arithmetic and plain pools only (no keep/drop,
  explode, or success counting); accepts `(1+2` and `1d0`.
- **droll** — classic `NdS±C` only; no pool cap, so `99999999d99999999` runs
  to completion (741 ms here) instead of being rejected.

When a caveat here stops reproducing after a competitor upgrade, delete it —
this list documents pinned versions, not projects.
