# Contributing

Thanks for helping out. Bug reports, notation gaps, and pull requests are all
welcome — open an [issue](https://github.com/edloidas/roll-parser/issues) first
for anything larger than a fix; the bug and feature forms collect what a report
needs.

## Toolchain

**[Bun](https://bun.sh) only.** Do not use npm, yarn, or pnpm in this
repository. Bun is the test runner (`bun test`), the script runner, and the
package manager whose lockfile (`bun.lock`) is committed — `dist/` itself is
a per-file `tsc` emit via `bun run build`, not a bundle. Installing with
another manager writes a competing lockfile and produces a different
dependency tree than CI resolves.

```bash
bun install     # also installs the pre-commit hook
bun check:fix   # typecheck + biome check --write (lint, format, import sort)
bun test        # full suite, ~5s
bun validate    # full gate: check, build, package checks, size budgets, site, coverage
```

Run `bun check:fix` and `bun test` while you work; run `bun validate` before
opening a pull request. `bun test:ci` adds coverage, gated at 98% lines and
100% functions per `bunfig.toml`, which is the only place those numbers live.

## Pre-commit hook

`bun install` runs the `prepare` script, which points `core.hooksPath` at
`.githooks/`. The hook runs [nano-staged](https://github.com/usmanyunusov/nano-staged),
which applies `biome check --write` to staged `.ts`/`.tsx` files and re-stages
the result. Formatting and lint fixes land automatically; anything Biome cannot
fix blocks the commit.

## Code conventions

Match the surrounding code. Style, naming, and type conventions are enforced by
`biome check` rather than written down; what cannot be linted lives in
`.claude/rules/`: `comments.md` (the `// !`, `// ?`, `// *`, `// TODO:` prefixes
and their colors), `project-testing.md` (error assertions, the error-code gate,
CLI test placement), and `rng.md` (the `RNG` contract). A few constraints worth
calling out:

- Relative imports inside `src/` carry explicit `.js` extensions — the repo
  typechecks under `moduleResolution: nodenext`, which rejects extensionless
  specifiers outright.
- No roll path may call `Math.random()` directly — dice are drawn only through
  the `RNG` interface. The single permitted use is seeding `SeededRNG` when the
  caller supplies no seed. Nothing outside
  `src/cli/` may import from `node:` — the library has to stay browser-safe.
- Every code sample in a JSDoc `@example` or in `README.md` must be executed
  and produce the output it claims.

## Commits and pull requests

[Conventional Commits](https://www.conventionalcommits.org/), with the issue
number appended:

```
<type>: <description> #<issue>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`,
`build`, `ci`. Imperative mood, under 72 characters, no trailing period. The
optional body is past tense, one line per change, backticks around code
references. Add a `Changelog: skip` trailer to keep a commit out of the release
notes.

A pull request should be a single commit when it merges — squash locally and
force-push rather than merging a chain of fixups. The pull request template
prefills the expected body shape.

## Site and API reference

The demo site in `site/` is deployed to Cloudflare Pages.

```bash
bun site:dev      # Bun HTML dev server (no TypeDoc, so /docs/ is absent). The site
                  # consumes built dist/ — rerun `bun run build` to see library edits
bun site:build    # full static build into site/dist/, including the TypeDoc reference
bun site:check    # verify site/dist/ — assets resolve, no dev paths leaked
bun site:preview  # build, then serve site/dist/ with host-style routing
```

TypeDoc lives in the `scripts/docs` workspace rather than the root, and
`site:build` invokes it from `scripts/docs/node_modules/.bin/typedoc`. TypeDoc
0.28.x peers at TypeScript `<=6.0.x` and throws on the root `typescript@7`, so
that workspace nests its own `typescript@6` for TypeDoc to resolve. Nesting is
required rather than a scoped republish, because TypeDoc imports the bare
`typescript` specifier. Do not fold the workspace back into the root — the root
install would hand TypeDoc TypeScript 7 and `site:build` would fail. It can go
away once TypeDoc 1.0 supports TypeScript 7.

## Publishing

`package.json`'s `files` ships `src/` alongside `dist/`. That is deliberate:
`declarationMap: true` emits `.d.ts.map` files pointing back at the TypeScript
sources, so a consumer's "go to definition" lands on real code instead of a
declaration stub. Removing `src/` from `files` breaks that silently — nothing
fails, the jumps just stop working.

## Releasing

Maintainers only.

1. Update `CHANGELOG.md` for the target version — `bun run check:changelog`
   fails without a section for it, and `release:dry` fails at that step.
   Sections are ordered Added, Changed, Deprecated, Removed, Fixed, Security,
   Documentation.
2. Bump `package.json`, run `bun run generate:version`, and commit both files
   on their own as `chore: release v<version>` — `check:version` fails the
   release if `src/version.ts` is stale. Never tag a pre-existing unrelated
   commit.
3. Push that commit to `master` **before** the tag. The workflow's `precheck`
   job resolves the tagged SHA with `git branch -r --contains` and refuses to
   release a commit that is not on `master` or a version branch, so a tag that
   arrives first fails the run.
4. Tag that commit `v<version>` and push the tag; `.github/workflows/release.yml`
   takes it from there.

`bun run release:dry` runs the whole gate locally first.

Both pushes need the admin bypass on the `protect-master` and `release-tags`
rulesets — `release-tags` restricts creating `refs/tags/v*`, so an account with
only write access cannot push a release tag at all.
