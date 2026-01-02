# roll-parser

Dice roll notation parser. TypeScript library and CLI. Built with Bun.

## Commands

```bash
bun check:fix    # Verify changes: typecheck + lint + format (with auto-fix)
bun run build    # Build library
bun test         # Run tests
bun release:dry  # Validate release (dry run)
```

Individual checks:

```bash
bun typecheck    # TypeScript only
bun lint:fix     # Linting with fixes
bun format       # Format code
bun run coverage # Tests with coverage
```

## Critical Constraints

- Runtime: Bun
- Target: ES2022
- TypeScript required for all code
- Library + CLI dual output (ESM + CJS compiled JS)

## Code Standards

Detailed rules in `.cursor/rules/`:

- `npm-scripts.mdc` - Available scripts reference (Bun)
- `typescript.mdc` - Type definitions and coding style
- `testing.mdc` - Test patterns (Bun test runner, fast-check)
- `rng.mdc` - RNG interface and MockRNG usage
- `comments.mdc` - Documentation style
- `git-conventions.mdc` - Commit, issue, and PR naming

## Testing Standards

- Use MockRNG for deterministic dice tests (see `rng.mdc`)
- Use fast-check for property-based invariant testing (see `testing.mdc`)
- Co-locate tests with source: `foo.ts` → `foo.test.ts`
- Target >90% statement coverage, 100% function coverage

## Validation

During iteration:

```bash
bun check:fix    # Typecheck + lint + format (with auto-fix)
bun test         # Run tests
```

Before commit (mirrors CI):

```bash
bun validate     # typecheck + lint + format:check + build + test
```

Task is complete when `bun validate` passes with no errors.

## Planning

For complex tasks, start with plan mode. Ask clarifying questions before implementation.

## Skills

- `npm-release` - Release to npm
- `issue-writer` - Create or modify GitHub issues

## Release

Package: `roll-parser`. Published to npm via `bun publish`.

## External Docs

Use Context7 MCP for TypeScript, Bun documentation.
Request specific topics, not full manuals.

For large R&D tasks, use `docs-finder` skill to search documentation effectively.
