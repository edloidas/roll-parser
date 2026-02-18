# Roll Parser v3 - Implementation Plan

## Decisions

- **Migration**: Delete v2 JavaScript immediately, start fresh
- **Tooling**: Biome (lint + format combined)
- **Testing**: Include fast-check for property-based tests from Phase 0
- **Scope**: Stage 1 only (core engine), plan Stage 2 separately

## Current State Analysis

**v3 Status**: Initialized (PRD + rules only), no TypeScript implementation yet.

### What Exists
- PRD.md with Stage 1/2/3 requirements
- Cursor rules: typescript.mdc, testing.mdc, npm-scripts.mdc, comments.mdc
- CLAUDE.md with project commands
- v2 JavaScript source (to be deleted)

### Critical Gaps
1. **Configuration**: tsconfig.json, bunfig.toml, biome.json missing
2. **Source**: No TypeScript files, no lexer/parser/evaluator
3. **Testing**: No mock RNG, no property-based testing setup

---

## Implementation Phases

### Phase 0: Project Infrastructure (Current Step - Blocking)

**Files to delete:**
- `/src/*.js` - All v2 JavaScript source files
- `/test/` - All v2 Jest test files
- `/.eslintrc.js`, `/.eslintignore` - Legacy ESLint config
- `/.jsdocrc` - Legacy JSDoc config
- `/.travis.yml`, `/appveyor.yml` - Legacy CI configs

**Files to create:**
- `/tsconfig.json` - TypeScript config (target ES2022, strict mode)
- `/bunfig.toml` - Bun runtime and test configuration
- `/biome.json` - Linting and formatting (Biome)
- `/.github/workflows/ci.yml` - GitHub Actions pipeline
- `/src/index.ts` - Entry point stub

**Files to update:**
- `/package.json` - Bun scripts, remove Jest/browserify/babel deps, add fast-check
- `/CLAUDE.md` - Add testing guidelines rule reference
- `/.cursor/rules/testing.mdc` - Add property-based testing patterns

**Dependencies to add:**
```json
{
  "devDependencies": {
    "@biomejs/biome": "^1.9",
    "@types/bun": "latest",
    "fast-check": "^3.22",
    "typescript": "^5.7"
  }
}
```

**Configuration targets:**
```
TypeScript: ES2022, strict, no any, declaration: true
Output: ESM (primary) + CJS (compat) via Bun build
Tests: Bun native runner + fast-check
Format: Biome (lint + format combined)
```

---

### Phase 1: Core Engine - Token System

**Goal**: Lexer that produces token stream from dice notation.

**Files:**
- `/src/lexer/tokens.ts` - TokenType enum, Token interface
- `/src/lexer/lexer.ts` - Lexer class (character-by-character scanning)
- `/src/lexer/lexer.test.ts` - Lexer unit tests

**Token Types (Stage 1):**
```typescript
enum TokenType {
  NUMBER,     // /[0-9]+(\.[0-9]+)?/
  DICE,       // 'd' or 'D'
  PLUS, MINUS, MULTIPLY, DIVIDE, MODULO, POWER,
  LPAREN, RPAREN,
  KEEP_HIGH, KEEP_LOW, DROP_HIGH, DROP_LOW,  // kh, k, kl, dh, dl
  EOF,
}
```

**Test Strategy:**
- Valid tokens: `"2d20+5"` → `[NUMBER(2), DICE, NUMBER(20), PLUS, NUMBER(5), EOF]`
- Case insensitivity: `"D20"` → `[DICE, NUMBER(20), EOF]`
- Whitespace handling: `"2 d 20"` → `[NUMBER(2), DICE, NUMBER(20), EOF]`
- Disambiguation: `"dh"` always DROP_HIGH (maximal munch)
- Invalid chars: `"2d20@"` → throws with position

---

### Phase 2: Core Engine - AST & Parser

**Goal**: Pratt parser producing AST from token stream.

**Files:**
- `/src/parser/ast.ts` - AST node type definitions
- `/src/parser/parser.ts` - Pratt parser with NUD/LED handlers
- `/src/parser/parser.test.ts` - Parser unit tests

**AST Nodes:**
```typescript
type ASTNode =
  | LiteralNode      // { type: 'Literal', value: number }
  | DiceNode         // { type: 'Dice', count: ASTNode, sides: ASTNode }
  | BinaryOpNode     // { type: 'BinaryOp', operator, left, right }
  | UnaryOpNode      // { type: 'UnaryOp', operator: '-', operand }
  | ModifierNode     // { type: 'Modifier', modifier, selector, count, target }
```

**Binding Power Table:**
```
+/-   : 10/11 (left-associative)
*/%   : 20/21 (left-associative)
**    : 31/30 (right-associative)
d     : 40/41 (dice operator, highest math)
kh/kl : 50    (postfix modifiers, tightest)
```

**Test Strategy:**
- Precedence: `"1+2*3"` → `BinaryOp(+, 1, BinaryOp(*, 2, 3))`
- Parentheses: `"(1+2)*3"` → `BinaryOp(*, BinaryOp(+, 1, 2), 3)`
- Dice operator: `"2d6"` → `Dice(Literal(2), Literal(6))`
- Prefix dice: `"d20"` → `Dice(Literal(1), Literal(20))`
- Unary minus: `"-1d4"` → `UnaryOp(-, Dice(1, 4))`
- Modifiers: `"4d6kh3"` → `Modifier(keep, highest, 3, Dice(4, 6))`
- Computed: `"(1+1)d(3*2)"` → `Dice(BinaryOp, BinaryOp)`

---

### Phase 3: Core Engine - RNG System

**Goal**: Seedable RNG interface for deterministic testing.

**Files:**
- `/src/rng/interface.ts` - RNG interface definition
- `/src/rng/xorshift.ts` - SeededRNG implementation (xorshift128+)
- `/src/rng/mock.ts` - MockRNG for testing (returns predefined values)
- `/src/rng/rng.test.ts` - RNG tests

**Interface:**
```typescript
interface RNG {
  next(): number;                        // [0, 1)
  nextInt(min: number, max: number): number;  // [min, max] inclusive
}
```

**Test Strategy:**
- Seedable reproducibility: same seed → same sequence
- Distribution: nextInt(1, 6) produces all values 1-6
- MockRNG: `createMockRng([3, 5, 1])` → returns 3, 5, 1 in sequence

---

### Phase 4: Core Engine - Evaluator

**Goal**: AST evaluator producing roll results.

**Files:**
- `/src/evaluator/evaluator.ts` - AST visitor/evaluator
- `/src/evaluator/modifiers/keep-drop.ts` - Keep/drop modifier logic
- `/src/evaluator/evaluator.test.ts` - Evaluator tests
- `/src/types.ts` - Shared types (RollResult, DieResult)

**Result Types:**
```typescript
interface RollResult {
  total: number;
  notation: string;      // Original input
  expression: string;    // Normalized: "1d20 + 5"
  rendered: string;      // "1d20[15] + 5 = 20"
  rolls: DieResult[];
}

interface DieResult {
  sides: number;
  result: number;
  modifiers: ('dropped' | 'kept')[];
  critical: boolean;     // Rolled max
  fumble: boolean;       // Rolled 1
}
```

**Test Strategy (with MockRNG):**
- Basic: `roll("1d6", mockRng([4]))` → total: 4
- Arithmetic: `roll("1d6+3", mockRng([4]))` → total: 7
- Negative: `roll("1d4-5", mockRng([1]))` → total: -4 (NOT clamped!)
- Keep highest: `roll("4d6kh3", mockRng([3,1,4,2]))` → total: 9 (drop 1)
- Drop lowest: `roll("4d6dl1", mockRng([3,1,4,2]))` → total: 9

---

### Phase 5: Public API & Integration

**Goal**: Expose clean API, wire all components.

**Files:**
- `/src/index.ts` - Public exports (roll, parse, evaluate)
- `/src/roll.ts` - Main roll() function
- `/src/integration.test.ts` - End-to-end tests

**Public API:**
```typescript
export function roll(notation: string, options?: RollOptions): RollResult;
export function parse(notation: string): ASTNode;
export function evaluate(ast: ASTNode, options?: EvalOptions): RollResult;

export interface RollOptions {
  rng?: RNG;
  seed?: string | number;
  maxIterations?: number;  // Safety limit (default: 1000)
}
```

**Test Strategy:**
- Full integration tests covering all Stage 1 features
- Regression tests from PRD 3.7 (negative numbers)
- Error handling tests (invalid notation, edge cases)

---

### Phase 6: CLI & Build (#8)

**Goal**: CLI binary and dual-format build output.

**Files:**
- `/src/cli/index.ts` - CLI entry point (main logic)
- `/src/cli/args.ts` - Argument parsing (pure, testable)
- `/src/cli/cli.test.ts` - Argument parser unit tests
- `/bin/roll-parser.ts` - Dev wrapper with Bun shebang

**Build Output:**
```
dist/
├── index.mjs    # ESM
├── index.js     # CJS
├── index.d.ts   # TypeScript declarations
└── cli.js       # CLI bundle (Node target, with #!/usr/bin/env node)
```

**Build Pipeline Changes:**
- Add `build:cli`: `bun build src/cli/index.ts --outfile dist/cli.js --target node`
- Prepend shebang: `sed -i '1i#!/usr/bin/env node' dist/cli.js`
- Chain into `build` script after existing steps

**CLI Interface:**

```
Usage: roll-parser <notation> [options]

Arguments:
  notation     Dice notation to evaluate (e.g., "2d6+3")

Options:
  -v, --verbose   Show detailed roll breakdown
  --seed <value>  Use seed for reproducible rolls
  -h, --help      Show help
  --version       Show version

Exit codes:
  0  Success
  1  Parse/evaluation error (bad notation)
  2  Usage error (missing notation, unknown flag)
```

**Normal output** (just the total):
```
$ roll-parser 2d6+3
11
```

**Verbose output** (full breakdown):
```
$ roll-parser 4d6kh3 --verbose
Notation:    4d6kh3
Expression:  4d6kh3
Rolls:       4d6kh3[~~1~~, 4, 5, ~~2~~]
Result:      4d6kh3[~~1~~, 4, 5, ~~2~~] = 9
Total:       9
```

**Argument Parsing Edge Cases:**
- `-1d4` starts with `-` but is valid notation → detect by checking
  if arg contains `d` or starts with digit after `-`
- `--` separator terminates flags: `roll-parser -- -1d4`
- Multiple positional args joined: `roll-parser 2d6 + 1d4`
  is treated as notation `2d6 + 1d4`

**Error Handling:**
- `LexerError`, `ParseError`, `EvaluatorError` → stderr + exit code 1
- Missing notation, unknown flags → stderr + exit code 2
- Error output format: `Error: <message>` (no stack traces)

**VERSION:** Import from `src/index.ts` (already exported as const)

---

## Testing Strategy (Cross-Phase)

### Test Categories

1. **Unit Tests** (co-located `*.test.ts`)
   - Fast, isolated, deterministic
   - MockRNG for all dice tests
   - Edge cases: 0d6, 1d0, 1d1, overflow

2. **Property-Based Tests** (fast-check)
   - Invariants: NdX total in range [N, N*X]
   - Roundtrip: parse(stringify(ast)) === ast
   - Commutativity: order of operations

3. **Integration Tests**
   - Full pipeline: notation → result
   - All PRD examples
   - Regression suite

### Property-Based Testing Patterns (fast-check)

```typescript
import { describe, it, expect } from 'bun:test';
import fc from 'fast-check';

describe('roll invariants', () => {
  it('NdX total is always in valid range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),  // count
        fc.integer({ min: 1, max: 100 }),  // sides
        (count, sides) => {
          const result = roll(`${count}d${sides}`);
          return result.total >= count && result.total <= count * sides;
        }
      ),
      { numRuns: 1000 }  // Fast but thorough
    );
  });

  it('keep highest never exceeds dice pool size', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),   // count
        fc.integer({ min: 1, max: 100 }),  // sides
        fc.integer({ min: 1, max: 20 }),   // keep
        (count, sides, keep) => {
          const keepN = Math.min(keep, count);
          const result = roll(`${count}d${sides}kh${keepN}`);
          return result.rolls.filter(r => !r.modifiers.includes('dropped')).length === keepN;
        }
      )
    );
  });
});
```

### Edge Case Matrix

| Input | Expected | Notes |
|-------|----------|-------|
| `0d6` | Error or 0 | Zero dice count |
| `1d0` | Error | Zero sides |
| `1d1` | 1 | Trivial roll |
| `d20` | 1-20 | Implicit count |
| `1d4-5` | -4 to -1 | Negative result (NOT clamped) |
| `-1d4` | -4 to -1 | Unary minus |
| `2**3**2` | 512 | Right-associative |
| `4d6kh3` | Keep 3 highest | Modifier |
| `4d6dl1` | Drop 1 lowest | Equivalent to kh3 |

### Performance Benchmarks

```typescript
import { bench, run } from 'mitata';  // Or Bun's built-in bench

bench('simple roll: 2d6', () => roll('2d6'));
bench('modifier: 4d6kh3', () => roll('4d6kh3'));
bench('complex: (1d20+5)*2d6+3', () => roll('(1d20+5)*2d6+3'));
bench('parse only: 4d6kh3', () => parse('4d6kh3'));
bench('large pool: 100d6', () => roll('100d6'));
```

**Targets:**
- Simple rolls: <0.1ms
- Complex expressions: <1ms
- Parse only: <0.05ms

### Coverage Targets

- Statements: >90%
- Branches: >85%
- Functions: 100%

---

## Execution Order

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
   ↓         ↓         ↓         ↓         ↓         ↓         ↓
Config   Tokens    Parser    RNG      Eval     API      CLI
```

Each phase is independently testable. Phase 3 (RNG) can run in parallel with Phase 2.

---

## Files Summary

### Phase 0: Delete (Immediate) ✅
- `src/*.js` - All v2 JavaScript source
- `src/**/*.js` - Nested JS files
- `test/` - All Jest tests
- `.eslintrc.js`, `.eslintignore`
- `.jsdocrc`
- `.travis.yml`, `appveyor.yml`

### Phase 0: Create ✅
- `tsconfig.json`
- `bunfig.toml`
- `biome.json`
- `.github/workflows/ci.yml`
- `src/index.ts` (stub)

### Phase 0: Modify ✅
- `package.json` - Complete rewrite of scripts and deps
- `CLAUDE.md` - Add Phase 0 checklist
- `.cursor/rules/testing.mdc` - Add fast-check patterns

### Phase 1-6: Create
- `src/types.ts`
- `src/lexer/tokens.ts`
- `src/lexer/lexer.ts`
- `src/lexer/lexer.test.ts`
- `src/parser/ast.ts`
- `src/parser/parser.ts`
- `src/parser/parser.test.ts`
- `src/rng/interface.ts`
- `src/rng/xorshift.ts`
- `src/rng/mock.ts`
- `src/rng/rng.test.ts`
- `src/evaluator/evaluator.ts`
- `src/evaluator/modifiers/keep-drop.ts`
- `src/evaluator/evaluator.test.ts`
- `src/roll.ts`
- `src/integration.test.ts`
- `src/cli/index.ts`
- `src/cli/args.ts`
- `bin/roll-parser.ts`
