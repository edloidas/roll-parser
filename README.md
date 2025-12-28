<h1 align="center">Roll Parser</h1>

<p align="center">
High-performance dice notation parser for tabletop RPGs.<br>
TypeScript-first, Bun-optimized, Pratt parser architecture.
</p>

<p align="center">
  <a href="https://github.com/edloidas/roll-parser/actions"><img src="https://github.com/edloidas/roll-parser/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://www.npmjs.com/package/roll-parser"><img src="https://img.shields.io/npm/v/roll-parser.svg" alt="npm version"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-blue.svg" alt="TypeScript"></a>
  <a href="https://bun.sh/"><img src="https://img.shields.io/badge/Bun-1.0+-black.svg" alt="Bun"></a>
</p>

## Status

> **v3 in Development** - Complete architectural rewrite in progress.
>
> For production use, install [v2.3.2](https://www.npmjs.com/package/roll-parser/v/2.3.2).

## Features

### Stage 1: Core Engine (In Progress)

- Basic dice notation: `2d6`, `d20`, `4d6+4`
- Full arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Parentheses: `(1d4+1)*2`
- Keep/Drop modifiers: `4d6kh3`, `2d20kl1`, `4d6dl1`
- Computed dice: `(1+1)d(3*2)`
- Seedable RNG for reproducible rolls

### Stage 2: System Compatibility (Planned)

- Exploding dice: `1d6!`, `1d6!!`, `1d6!p`
- Reroll mechanics: `2d6r<2`, `2d6ro<3`
- Success counting: `10d10>=6`, `10d10>=6f1`
- Math functions: `floor()`, `ceil()`, `max()`, `min()`

### Stage 3: Advanced Features (Planned)

- Variables: `1d20+@str`, `1d20+@{modifier}`
- Grouped rolls: `{1d8, 1d10}kh1`
- Rich JSON output with roll breakdown

## Installation

```bash
# When v3 is released
bun add roll-parser
npm install roll-parser
```

## Usage (v3 API Preview)

```typescript
import { roll, parse } from 'roll-parser';

// Simple roll
const result = roll('4d6kh3');
console.log(result.total);      // e.g., 14
console.log(result.rolls);      // Individual die results
console.log(result.rendered);   // "4d6kh3[6,5,3,2] = 14"

// With seeded RNG for reproducibility
const seeded = roll('2d20', { seed: 'my-seed' });

// Parse without rolling (for inspection)
const ast = parse('2d6+5');
```

### CLI

```bash
# Roll dice from command line
roll-parser 2d6+3
roll-parser 4d6kh3
roll-parser --help
```

## Development

```bash
bun install          # Install dependencies
bun check:fix        # Type check + lint + format
bun test             # Run tests
bun run build        # Build library
bun release:dry      # Validate release
```

## Architecture

Built with a Pratt parser for:

- **Clean precedence handling** - Operator binding power, not grammar rules
- **Easy extensibility** - Add new modifiers without restructuring
- **Optimal performance** - Target <1ms for complex expressions
- **Type safety** - Strict TypeScript, no `any`

### Project Structure

```
src/
├── lexer/       # Tokenization (d, kh, kl, dh, dl, numbers, operators)
├── parser/      # Pratt parser with AST generation
├── evaluator/   # AST evaluation with modifier handling
├── rng/         # Seedable random number generation
├── cli/         # Command-line interface
└── index.ts     # Public API exports
```

## Supported Systems

| System | Notation Examples | Stage |
|--------|-------------------|-------|
| D&D 5e | `2d6`, `1d20+5`, `4d6kh3` | 1 |
| Pathfinder 2e | `1d20+10 vs 25` | 2 |
| World of Darkness | `10d10>=6f1` | 2 |
| Savage Worlds | `1d6!` | 2 |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.com)
