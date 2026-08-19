# roll-parser

Dice roll notation parser. TypeScript library and CLI. Built with Bun.

## Rules

Also read files under `.claude/rules/`.
`AGENTS.md` → `CLAUDE.md` and `.agents/rules` → `.claude/rules` are symlinks —
edit the `.claude/` originals, never replace a symlink with a real file.

## Commands

```bash
bun check:fix   # Typecheck + biome check --write (lint + format + import sort) — use during
                # iteration; the typecheck step rebuilds dist/ as a side effect
bun test        # Run tests — not read-only: some suites rebuild dist/ in-process
bun validate    # Full pre-release gate: check + build + check:package + check:size +
                # site:build + site:check + test:ci — site:build is what runs TypeDoc,
                # so a TSDoc error that breaks the API reference fails here
```

Demo site (`site/`, Cloudflare Pages): `site:dev` (no TypeDoc, so `/docs/` is
absent), `site:build`, `site:check`, `site:preview`. `site/src` imports
`'roll-parser'`, which resolves to the built `dist/` — library `src/` edits
need `bun run build` to show up; site files hot-reload.

`bun install` installs a pre-commit hook that auto-fixes staged `.ts`/`.tsx`
with `biome check --write` and blocks commits on unfixable lint errors.

## Constraints

- Runtime: Bun — never use npm, yarn, or pnpm (npm appears only in the smoke CI jobs and the release publish step). `bunfig.toml` pins `minimumReleaseAge` to 3 days — `bun add` of a freshly published version silently resolves to an older one
- Library + CLI, ESM-only compiled JS (Node ≥22.12 — first version with unflagged `require(esm)`)
- `dist/` is a per-file `tsc` emit, never a bundle, in **two** passes: comment-free JS + `.js.map`, then `.d.ts` + `.d.ts.map` with TSDoc intact — one pass cannot do both under TS7 (rationale in the `tsconfig.build*.json` comments). Keep both map kinds
- The emit overwrites `dist/` in place and never wipes it first — a running `site:dev` resolves `roll-parser` into it and caches resolution failures it cannot recover from. `scripts/prune-dist.ts` deletes what the passes did not write; `bun run clean` (which `release:dry` runs) is the pristine path
- Do not reintroduce a bundler: Bun ≤1.3.11 breaks pure re-export entrypoints (e.g. `src/testing.ts`), and `--target browser` silently stubs `node:` builtins instead of erroring
- Byte budgets are a release gate (`check:size`) — the `size-limit` block in `package.json` is the source of truth, so read it before adding surface area. Raising a budget is its own commit, never a line in a feature PR
- `files` ships `src/` deliberately: `.d.ts.map` points consumer go-to-definition at the real sources. Removing it breaks nothing visibly — the jumps just die
- Relative imports in `src/` carry explicit `.js` extensions — enforced by `moduleResolution: nodenext` at typecheck time
- Library code must stay environment-neutral: no Node/Bun globals or `node:` imports outside `src/cli/` — enforced by Biome `noNodejsModules`, `types: []` in `tsconfig.build.json`, and the `browser-smoke` CI job
- `README.md` promises Deno and Cloudflare Workers support, and `deno-smoke` / `workers-smoke` are what earn it: both install the packed tarball and assert a `createMockRng` total, so dropping either job downgrades that promise to a guess
- `scripts/worker-smoke` is deliberately not a root workspace — `wrangler` pulls a platform `workerd` binary, and the fixture has to resolve `roll-parser` to the tarball, not the repo
- Published types carry a TypeScript ≥5.0 floor (the first release with `moduleResolution: bundler`, which `README.md` offers) — the `ts-compat` matrix typechecks `scripts/ts-compat/consumer.ts` against the packed tarball, `ts-compat-floor` asserts 4.9 still fails, and raising the floor is a major. That fixture is deliberately not a root workspace: each matrix leg installs its own `typescript`
- `src/version.ts` is generated from `package.json` by `bun run generate:version` — never edit it by hand; `check:version` and the `index.test.ts` drift test gate the sync
- TypeDoc runs from `scripts/docs/node_modules/.bin/typedoc`, not the root: 0.28.x peers at TypeScript `<=6` and throws on the root `typescript@7`, so that workspace nests its own `typescript@6`. Do not fold it back into the root until TypeDoc 1.0 ships TS7 support (full rationale in `scripts/docs/package.json`)

## Ad-hoc scripts

For one-off checks: create the file with the `Write` tool, run `bun run <file>`,
delete it with `rm`. Never shell heredocs — braces, quotes, or `$` inside one
trip Claude Code's expansion-obfuscation guard and force an approval prompt.
Prefer promoting recurring checks to a real `*.test.ts`.

## Git & GitHub

Conventional Commits: `<type>: <description> #<issue>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`

- Imperative mood, under 72 chars, no period
- Include issue number when related: `feat: add parser #5`
- No promotional or generated-by lines
- Add `Co-Authored-By: Mikita Taukachou <edloidas@gmail.com>` — commits here are
  pushed from the secondary `adiutriel` account, and the trailer attributes them
- Optional body: past tense, one line per change, backticks for code refs
- Use `Changelog: skip` body trailer to exclude a commit from release notes (honored by the `release-changelog` skill)
- PRs should contain a single commit on merge; squash locally and force-push before merging unless the PR combines work from several tasks

### Issues

- **Title**: `<type>: <description>`; `epic: <description>` for issues that aggregate sub-issues (never used in commits)
- **Body**: concisely explain what and why, end with a `Rationale` section; headers `####` for short issues (1–2 headers), `###` at 3+

### Pull Requests

- **Title**: `<type>: <description> #<number>`
- **Body**: concise, no emojis, separate all sections with one blank line
- Multiple issues go on one `Closes` line: `Closes #1 #23 #456`
- Never append a generated footer, `---` rule, session link, `<sub>` attribution,
  or promotional line. Applies to PRs created from the web too, where these
  instructions are the only source of truth.

  ```
  <summary of changes>

  Closes #<issue1> #<issue2>
  ```

`master` merges through a PR, must be up to date with it, and must pass every
context the `protect-master` ruleset requires — that ruleset is the source of
truth. Renaming a job leaves its old context pending forever.

## Releasing

Order: update `CHANGELOG.md` via the local `release-changelog` skill → bump
`package.json` → `bun run generate:version` → commit both plus the regenerated
`src/version.ts` as `chore: release v<version>` → tag that commit. Never tag a
pre-existing unrelated commit; if the version already matches the target, stop
and ask. `release:dry` gates on `check:changelog` and `check:version`.
