---
name: release-changelog
description: Generate or update CHANGELOG.md entries for roll-parser by summarizing conventional commits since the last release tag. Use when preparing a new alpha/beta/rc/stable release, or when `bun run check:changelog` fails because the version section is missing or stubbed.
---

# Release Changelog

Generate a `## [<version>] - <YYYY-MM-DD>` section in `CHANGELOG.md` by summarizing git history since the last release tag. Follow [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

## Inputs

- **Target version**: read from `package.json.version` unless the user specifies one.
- **Range base**: `git describe --tags --abbrev=0` on HEAD. For the very first entry on a new major line, use the earliest commit where the rewrite started (ask the user if unclear).

## Procedure

1. Run `git log <base>..HEAD --pretty='%h %s%n%b' --no-merges` and read every entry.
2. **Honor the `Changelog:` opt-out trailer.** For each commit, scan the body for a line matching `^Changelog:\s*(skip|none|no|false)\s*$` (case-insensitive). If present, drop the commit entirely — do not emit a bullet. Log each skipped commit hash + subject in your working output so the maintainer can verify intent. This overrides everything else in the mapping below; even a `feat:` or breaking change is suppressed when explicitly opted out.
3. Parse Conventional Commit types and map to Keep a Changelog sections:
   - `feat:` → **Added**
   - `fix:` → **Fixed**
   - `perf:` → **Changed** (prefix the bullet with "performance:")
   - `refactor:` → **Changed**
   - `docs:` → **Documentation**
   - `build:` / `ci:` / `chore:` / `style:` / `test:` → skip unless user-visible
   - `BREAKING CHANGE:` body or `!` marker → **Changed** with a leading **BREAKING:** label
4. For each commit, produce one bullet in present tense, user-facing voice (not "add X" — "X support", "Support for X"). Group bullets by section in this order: Added, Changed, Deprecated, Removed, Fixed, Security, Documentation.
5. When a commit title ends in ` #NN`, render the reference as ` ([#NN](https://github.com/edloidas/roll-parser/issues/NN))` at the end of the bullet.
6. Insert the new section **above** the most recent version section but **below** `## [Unreleased]`. Keep `## [Unreleased]` empty (or with pending entries only).
7. Update the `[Unreleased]` link footer to `.../compare/v<version>...HEAD`.
8. Append a new link footer: `[<version>]: https://github.com/edloidas/roll-parser/releases/tag/v<version>`.

## Don'ts

- Don't fabricate commits — every bullet must trace to a real commit in the range.
- Don't skip breaking changes silently, even for alpha.
- Don't re-summarize previously released sections.
- Don't include trivial `chore:`/`ci:`/`style:` churn unless it changes user-observable behavior.

## Verification

- `bun run check:changelog` must pass for the target version.
- `bun run check` must still pass (Biome formats markdown tables loosely but heading structure should be intact).
- Skim the output yourself — the file will go into the GitHub Release and onto npm.
