# roll-parser

Dice roll notation parser, shipped as a TypeScript library and a CLI, built with Bun.

This is the only agent instruction file. Do not add a `CLAUDE.md`: Claude Code reads
`AGENTS.md` only when no `CLAUDE.md` exists, so one would hide everything here.

## Commands

```bash
bun check:fix   # Typecheck + biome check --write (lint + format + import sort) — use during
                # iteration; the typecheck step rebuilds dist/ as a side effect
bun test        # Run tests — not read-only: some suites rebuild dist/ in-process
bun validate    # Full pre-release gate: check + build + check:package + check:size +
                # site:build + site:check + test:ci — site:build is what runs TypeDoc,
                # so a TSDoc error that breaks the API reference fails here
```

- Use Bun, never npm, yarn, or pnpm. npm appears only in the smoke CI jobs and the release
  publish step.
- `bunfig.toml` pins `minimumReleaseAge` to 3 days, so `bun add` of a freshly published
  version silently resolves to an older one.

Demo site (`site/`, Cloudflare Pages): `site:dev` (no TypeDoc, so `/docs/` is
absent), `site:build`, `site:check`, `site:preview`. `site/src` imports
`'roll-parser'`, which resolves to the built `dist/` — library `src/` edits
need `bun run build` to show up; site files hot-reload.

`bun install` installs a pre-commit hook that auto-fixes staged `.ts`/`.tsx`
with `biome check --write` and blocks commits on unfixable lint errors.

For a one-off check, write it to a file, run `bun run <file>`, and delete it. Promote a
recurring check to a real `*.test.ts`.

## Source

- Relative imports in `src/` carry explicit `.js` extensions; `moduleResolution: nodenext`
  rejects the rest at typecheck time.
- Library code stays environment-neutral: no Node/Bun globals or `node:` imports outside
  `src/cli/`. Biome `noNodejsModules`, `types: []` in `tsconfig.build.json`, and the
  `browser-smoke` CI job enforce it.
- Never edit `src/version.ts` by hand. `bun run generate:version` generates it from
  `package.json`; `check:version` and the `index.test.ts` drift test gate the sync.

## RNG

All dice rolling goes through the `RNG` interface (`src/rng/types.ts`), injected via the
options parameter and defaulting to `SeededRNG`; tests use `createMockRng`.

`Math.random()` has one permitted call site: `SeededRNG.toSeedString`, building the auto-seed
when the caller supplies no seed. It is called twice there, both draws feed the same entropy
string, and neither may move. Any other call in a roll path is a bug.

Draw order (keep/drop arguments draw before the pool, threshold arguments after it) is
specified once, in **README.md → Randomness → Draw order**. Do not restate it in source
comments; `src/rng/mock.ts` carries the consumer-facing note in its TSDoc.

## Comments

Default to no comment; the name should carry it. Comment a non-obvious *why* in 1–2 lines,
prefer TSDoc on anything exported, and never reference the task, PR, or issue — that belongs
in the commit message.

Four single-line prefixes, each colored differently by a comment-highlighter plugin. Never
combine two.

| Prefix | Color | Use for |
|--------|-------|---------|
| `// !` | red | Stops a reader: bug, security risk, breaking change, sharp edge |
| `// *` | green | Section divider, or a header over a multi-line comment |
| `// ?` | blue | Not settled: a hack, a temporary fix, a guess. Never for a finished decision's rationale — that is a plain comment |
| `// TODO:` | — | Actionable follow-up. Imperative verb, `[#123]` when an issue exists |

The highlighter colors per line, so repeat the prefix on every line of a block; a bare `//`
continuation loses the color. A `// *` section is a header of at most four words wrapped in
blank `//` lines, never `// ----`, `// ====`, or a numbered header.

```ts
// ! Fate dice use `sides === 0` as a sentinel.
// ! A renderer that reads it as a real side count emits `d0`.

//
// * Node dispatch
//
```

## Testing

Bun's test runner.

- The coverage floor lives only in `bunfig.toml`. Its **functions** threshold means every new
  function, exported or not, needs a test or `test:ci` fails.
- A test asserts a behavior, not just that the function ran. Expected values are hand-computed
  constants, never re-derived with the code's own formula or obtained by calling the function
  under test.
- Name the issue a regression test closes: `it('rejects 4d6d1 (#118)', …)`.

**Error assertions** use `expectRollError` from `src/test-helpers.ts`, never a bare
`try`/`catch` or a new local helper. It asserts class and code, returns the error, and fails
when nothing throws:

```typescript
import { expectRollError } from '../test-helpers.js';

expectRollError(() => parse('1d6!!!'), ParseError, 'INVALID_EXPLODE_TARGET');

const error = expectRollError(() => parse('(1+2'), ParseError, 'EXPECTED_TOKEN');
expect(error.position).toBe(4);
```

`src/test-helpers.ts` is test-only: excluded from `tsconfig.build.json` and from the published
`files`. Anything added there stays excluded from both.

**Error-code contract.** `src/errors.test.ts` maps every `RollParserErrorCode` to a provoking
input through a `Record<RollParserErrorCode, CodeCase>` annotation. That annotation is the
completeness gate: a new code without a case is a type error. Keep it a full `Record`, never a
partial or an index signature.

**Doc examples are tests.** `src/readme.test.ts` executes every `typescript` fence in
`README.md` and `MIGRATION.md` against the built package and asserts the values their trailing
comments claim (`expr; // 11`, `expr; // throws '…'`, or a lone `// <literal>` on the next line).
When one fails, fix the doc, not the test. Opt a block out with `<!-- readme-test: skip -->`
directly above the fence.

**CLI tests** run in-process: `main()` takes injected `argv`/`stdout`/`stderr`, so argument
handling, exit codes, and error rendering go in `cli/main.test.ts`, where coverage sees them.
Subprocess tests are limited to two files, and new CLI behavior goes in neither:

- `cli/cli.test.ts` — the shebang entry point on a real process
- `cli/package-smoke.test.ts` — the packed tarball as a consumer installs it

## Build and packaging

- The package is ESM-only compiled JS for Node ≥22.12, the first version with unflagged
  `require(esm)`.
- `dist/` is a per-file `tsc` emit in two passes: comment-free JS + `.js.map`, then `.d.ts` +
  `.d.ts.map` with TSDoc intact. Keep both map kinds. Under TS7 one pass cannot do both; the
  `tsconfig.build*.json` comments carry the rationale.
- The emit overwrites `dist/` in place and never wipes it first, because a running `site:dev`
  resolves `roll-parser` into it and cannot recover from a cached resolution failure.
  `scripts/prune-dist.ts` deletes what the passes did not write; `bun run clean` (which
  `release:dry` runs) is the pristine path.
- Do not reintroduce a bundler. Bun ≤1.3.11 breaks pure re-export entrypoints (e.g.
  `src/testing.ts`), and `--target browser` silently stubs `node:` builtins instead of erroring.
- Run TypeDoc from `scripts/docs/node_modules/.bin/typedoc`, not the root. TypeDoc 0.28.x peers
  at TypeScript `<=6` and throws on the root `typescript@7`, so that workspace nests its own
  `typescript@6`. Keep it separate until TypeDoc 1.0 ships TS7 support (`scripts/docs/package.json`
  has the full rationale).
- `files` ships `src/` on purpose. `.d.ts.map` points consumer go-to-definition at the real
  sources; removing `src/` breaks nothing visibly, the jumps just die.
- Byte budgets are a release gate (`check:size`). The `size-limit` block in `package.json` is
  the source of truth; read it before adding surface area. Raise a budget in its own commit,
  never inside a feature PR.

### Compatibility promises

- `README.md` promises Deno and Cloudflare Workers support, and the `deno-smoke` and
  `workers-smoke` jobs earn it: both install the packed tarball and assert a `createMockRng`
  total. Dropping either job turns that promise into a guess.
- `scripts/worker-smoke` stays out of the root workspaces. `wrangler` pulls a platform
  `workerd` binary, and the fixture has to resolve `roll-parser` to the tarball, not the repo.
- Published types have a TypeScript ≥5.0 floor, the first release with
  `moduleResolution: bundler`, which `README.md` offers. The `ts-compat` matrix typechecks
  `scripts/ts-compat/consumer.ts` against the packed tarball and `ts-compat-floor` asserts 4.9
  still fails. Raising the floor is a major. The fixture stays out of the root workspaces
  because each matrix leg installs its own `typescript`.

## Git & GitHub

Conventional Commits; types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
`chore`, `perf`, `build`, `ci`.

- **Commit**: `<type>: <description> #<issue>`, imperative, under 72 chars, no period. Body
  optional: past tense, one line per change, backticks for code refs. Add
  `Co-Authored-By: Mikita Taukachou <edloidas@gmail.com>` to every commit — commits here are
  pushed from the secondary `adiutriel` account. A `Changelog: skip` body trailer keeps a
  commit out of the release notes (honored by `release-changelog`).
- **Issue title**: `<type>: <description>`; `epic: <description>` for issues that aggregate
  sub-issues, never used in commits.
- **Issue body**: what and why, ending in a `Rationale` section. `####` headers for 1–2
  sections, `###` at 3+.
- **PR title**: matches the commit title, `<type>: <description> #<number>`.
- **PR body**: one blank line between sections. One `Closes #<number>` per line — GitHub links
  only the first issue on a line. No generated-by footer, `---` rule, session link, or `<sub>`
  attribution; PRs opened from the web have only this file to go on.
- PRs squash to a single commit on merge. Squash locally and force-push first, unless the PR
  combines work from several tasks.

`master` merges through a PR, must be up to date with it, and must pass every context the
`protect-master` ruleset requires; that ruleset is the source of truth. Renaming a job leaves
its old context pending forever.

## Releasing

1. Update `CHANGELOG.md` via the local `release-changelog` skill.
2. Bump `package.json`, then run `bun run generate:version`.
3. Commit both plus the regenerated `src/version.ts` as `chore: release v<version>`.
4. Tag that commit. Never tag a pre-existing unrelated commit; if the version already matches
   the target, stop and ask.

`release:dry` gates on `check:changelog` and `check:version`.
