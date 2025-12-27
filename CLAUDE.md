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
- `testing.mdc` - Test patterns (Bun test runner)
- `comments.mdc` - Documentation style

## Skills

- `npm-release` - Release to npm
- `issue-writer` - Create or modify GitHub issues

## Release

Package: `roll-parser`. Published to npm via `bun publish`.

## External Docs

Use Context7 MCP for TypeScript, Bun documentation.
Request specific topics, not full manuals.

For large R&D tasks, use `docs-finder` skill to search documentation effectively.
