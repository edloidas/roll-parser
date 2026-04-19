# roll-parser

Dice roll notation parser. TypeScript library and CLI. Built with Bun.

## Commands

```bash
bun check:fix   # Typecheck + lint + format with auto-fix — use during iteration
bun test        # Run tests
bun validate    # Full check before commit: typecheck + lint + format:check + build + test
```

## Constraints

- Runtime: Bun — never use npm, yarn, or pnpm
- Target: ES2022, TypeScript only
- Library + CLI dual output (ESM + CJS compiled JS)

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

- **Release commit message**: `chore: release v<version>`.
- **CHANGELOG gate**: update `CHANGELOG.md` via the local `release-changelog` skill before bumping — `bun run release:dry` fails at `check:changelog` without it.
