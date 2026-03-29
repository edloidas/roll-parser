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

> **v3 Alpha** — Stage 1 (Core Engine) is complete with 300+ tests.
> Stages 2–3 are planned.
>
> For production use, install [v2.3.2](https://www.npmjs.com/package/roll-parser/v/2.3.2).

## Features

### Stage 1: Core Engine (Complete)

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
bun add roll-parser
npm install roll-parser
```

## Usage

```typescript
import { roll } from 'roll-parser';

const result = roll('4d6kh3');
console.log(result.total);    // e.g., 14
console.log(result.notation); // "4d6kh3"
```

### CLI

```bash
roll-parser 2d6+3
roll-parser 4d6kh3
roll-parser --help
```

## Known Limitations

- **`4d6d1` parses as nested dice, not "drop 1".** The bare `d` token is always
  interpreted as the dice operator, so `4d6d1` becomes `(4d6)d1` (roll 4d6, then
  use the result as the count for d1). To drop dice, use the explicit `dl`
  (drop lowest) or `dh` (drop highest) modifiers: `4d6dl1`.

## License

[MIT](LICENSE) © [Mikita Taukachou](https://edloidas.com)
