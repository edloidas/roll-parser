# roll-parser

Dice roll notation parser. TypeScript library and CLI. Built with Bun.

## Commands

```bash
bun check:fix   # Typecheck + biome check --write (lint + format + import sort) — use during
                # iteration; the typecheck step rebuilds dist/ as a side effect
bun test        # Run tests
bun validate    # Full pre-release gate: check + build + check:package + check:size + test:ci
```

Demo site (`site/`, deployed to Cloudflare Pages by `.github/workflows/deploy-site.yml`):

```bash
bun site:dev     # Bun HTML dev server — no TypeDoc, so /docs/ is absent
bun site:build   # Full static build into site/dist/, including the TypeDoc reference
bun site:check   # Verify site/dist/ — asset references resolve, no dev paths leaked
bun site:preview # site:build, then serve site/dist/ locally with host-style routing
```

The site consumes the built package (`site/src` imports `'roll-parser'`, which
resolves to `dist/` via the self-reference) — site HTML/CSS/TS edits hot-reload
under `site:dev`, but library `src/` edits need a `bun run build` to show up.

A pre-commit hook auto-fixes staged `.ts`/`.tsx` files (nano-staged runs
`biome check --write` on them, then re-stages). It installs automatically on
`bun install` — the `prepare` script points `core.hooksPath` at `.githooks/`.
Commits with unfixable lint errors are blocked.

## Constraints

- Runtime: Bun — never use npm, yarn, or pnpm (the smoke CI jobs, which test the packed tarball the way consumers install it, and the release publish step are the only places npm runs)
- Target: ES2022, TypeScript only
- Library + CLI, ESM-only compiled JS (Node ≥22.12 consumes via `import` or `require(esm)` — 22.12 is where `require(esm)` is unflagged)
- `dist/` is a per-file `tsc` emit (`tsconfig.build.json`), not a bundle — JS, `.d.ts`, and both map kinds come from one compiler pass; `bun build` is not used for the package. Do not reintroduce a bundler: Bun ≤1.3.11 emits broken output for pure re-export entrypoints (e.g. `src/testing.ts`) and `--target browser` silently stubs `node:` builtins instead of erroring
- Relative imports in `src/` carry explicit `.js` extensions — enforced by `moduleResolution: nodenext` at typecheck time
- Library code must stay environment-neutral: no Node/Bun globals or `node:` imports outside `src/cli/` — enforced by Biome `noNodejsModules`, `types: []` in `tsconfig.build.json`, and the `browser-smoke` CI job
- `src/version.ts` is generated from `package.json` by `bun run generate:version` — never edit it by hand; `check:version` and the `index.test.ts` drift test gate the sync
- In `scripts/build-site.ts`, do not pass `sourcemap` with a single `outfile` to `Bun.build` — Bun 1.3.x silently writes nothing; use `outdir`
- TypeDoc lives in the `scripts/docs` workspace, not the root, and is invoked from
  `scripts/docs/node_modules/.bin/typedoc`. TypeDoc 0.28.x peers at TypeScript
  `<=6.0.x` and throws on the root `typescript@7`, so that workspace nests a
  `typescript@6` for it to resolve. Do not "simplify" it back to the root — the
  root install would hand TypeDoc TypeScript 7 and `site:build` would fail. Fold
  it back only once TypeDoc 1.0 ships TypeScript 7 support.

## Ad-hoc scripts

For one-off verification or sanity checks, create the file with the `Write` tool,
then run it with `bun run <file>` and delete it with `rm <file>`. Do NOT use shell
heredocs (`cat > file << 'EOF' ... EOF`) — braces, quotes, or `$` inside a heredoc
trigger Claude Code's expansion-obfuscation guard and force an approval prompt.
Prefer promoting recurring checks to a real `*.test.ts` file instead of a temp script.

## Git & GitHub

Conventional Commits: `<type>: <description> #<issue>`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `build`, `ci`

- Imperative mood, under 72 chars, no period
- Include issue number when related: `feat: add parser #5`
- `Co-Authored-By:` trailer only, no promotional lines
- Optional body: past tense, one line per change, backticks for code refs
- Use `Changelog: skip` body trailer to exclude a commit from release notes (honored by the `release-changelog` skill)
- PRs should contain a single commit on merge; squash locally and force-push before merging unless the PR combines work from several tasks

### Issues

- **Title**: `<type>: <description>`
- Use `epic: <description>` for issues that aggregate sub-issues and describe a long-form implementation plan. Not used in commits.
- **Body**: concisely explain what and why, skip trivial details
- **Headers**: use `####` (h4) for short issues (1–2 headers), `###` (h3) when there are 3 or more

  ```
  <4–8 sentence description: what, what's affected, how to reproduce, impact>

  #### Rationale
  <why this needs to be fixed or implemented>

  <sub>Drafted with AI assistance</sub>
  ```

### Pull Requests

- **Title**: `<type>: <description> #<number>`
- **Body**: concise, no emojis, separate all sections with one blank line

  ```
  <summary of changes>

  Closes #<number>

  [Claude Code session](<link>)

  <sub>Drafted with AI assistance</sub>
  ```

## Releasing

Use the `/npm-release` skill. Project-specific conventions the skill must honor:

- **Dedicated release commit**: bump `package.json`, run `bun run generate:version` and include the regenerated `src/version.ts` in the same commit, commit as `chore: release v<version>`, then tag that commit. Never tag a pre-existing unrelated commit — if the version already matches the target, stop and ask before proceeding. (`check:version` fails the release if `src/version.ts` is stale.)
- **CHANGELOG gate**: update `CHANGELOG.md` via the local `release-changelog` skill before bumping — `bun run release:dry` fails at `check:changelog` without it.
