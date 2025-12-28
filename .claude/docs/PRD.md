# Roll Parser — PRD & Implementation Plan

> High-performance dice notation parser for Bun runtime, TypeScript-first.

## 1. Project Overview

**Goal:** Build a market-leading dice parsing library that outperforms existing solutions (dice-roller, rpg-dice-roller) via Pratt Parser architecture.

**Target Runtime:** Bun (JavaScriptCore) — optimized for serverless/Discord bots  
**Language:** Strict TypeScript (no `any`, use `unknown` + type guards)  
**Output Formats:** ESM (.mjs) + CJS (.js)

### Why Pratt Parser?

| Approach | Problem |
|----------|---------|
| Recursive Descent | Left-recursion issues, verbose grammar for 20+ modifiers |
| PEG (PEG.js) | Memoization overhead, cold-start penalty |
| **Pratt Parser** | ✅ Token-centric, handles prefix/infix/postfix naturally, easy extensibility |

**Core Pratt Concepts:**
- **Binding Power (BP):** Operator precedence as numbers
- **NUD (Null Denotation):** Token at expression start (literals, prefix ops)
- **LED (Left Denotation):** Token between expressions (infix, postfix)

---

## 2. Three-Stage Roadmap

| Stage | Scope | Target Systems |
|-------|-------|----------------|
| **1** | Core Engine, Basic Arithmetic, Keep/Drop | D&D 5e MVP |
| **2** | Exploding, Reroll, Success Counting, Seeded RNG | Pathfinder, WoD |
| **3** | Groups, Variables, Math Functions, Rich JSON | Roll20 Parity |

---

## 3. Stage 1: Core Engine (D&D 5e MVP)

### 3.1 Lexer — Token Types

```typescript
enum TokenType {
  NUMBER,      // /[0-9]+(\.[0-9]+)?/
  DICE,        // 'd' or 'D'
  PLUS,        // '+'
  MINUS,       // '-'
  MULTIPLY,    // '*'
  DIVIDE,      // '/'
  MODULO,      // '%'
  POWER,       // '**' or '^'
  LPAREN,      // '('
  RPAREN,      // ')'
  KEEP_HIGH,   // 'kh' or 'k'
  KEEP_LOW,    // 'kl'
  DROP_HIGH,   // 'dh'
  DROP_LOW,    // 'dl'
  EOF,
}

interface Token {
  type: TokenType;
  value: string;
  position: number;
}
```

**Disambiguation Rules:**
- `dh`/`dl` → always DROP modifier (maximal munch)
- Bare `d` after dice expression + number → context-dependent (parser resolves)
- Case-insensitive (`D20` = `d20`)
- Whitespace-tolerant

### 3.2 AST Node Types

```typescript
type ASTNode =
  | LiteralNode
  | DiceNode
  | BinaryOpNode
  | UnaryOpNode
  | ModifierNode
  | GroupNode;

interface LiteralNode {
  type: 'Literal';
  value: number;
}

interface DiceNode {
  type: 'Dice';
  count: ASTNode;  // Allows (1+1)d6
  sides: ASTNode;  // Allows 1d(2*10)
}

interface BinaryOpNode {
  type: 'BinaryOp';
  operator: '+' | '-' | '*' | '/' | '%' | '**';
  left: ASTNode;
  right: ASTNode;
}

interface UnaryOpNode {
  type: 'UnaryOp';
  operator: '-';
  operand: ASTNode;
}

interface ModifierNode {
  type: 'Modifier';
  modifier: 'keep' | 'drop';
  selector: 'highest' | 'lowest';
  count: ASTNode;
  target: ASTNode;  // The dice/group being modified
}
```

### 3.3 Operator Precedence (Binding Power)

```typescript
const BINDING_POWER: Record<string, { left: number; right: number }> = {
  '+':  { left: 10, right: 11 },
  '-':  { left: 10, right: 11 },
  '*':  { left: 20, right: 21 },
  '/':  { left: 20, right: 21 },
  '%':  { left: 20, right: 21 },
  '**': { left: 31, right: 30 },  // Right-associative
  'd':  { left: 40, right: 41 },  // Dice operator binds tighter than math
  // Modifiers (kh, kl, dh, dl) bind tightest as postfix
};
```

### 3.4 Pratt Parser Algorithm

```typescript
class Parser {
  private tokens: Token[];
  private pos = 0;

  parseExpression(minBp = 0): ASTNode {
    let left = this.parseNud();  // Get prefix/atom
    
    while (this.hasTokens()) {
      const token = this.peek();
      const bp = this.getLeftBp(token);
      if (bp < minBp) break;
      
      this.advance();
      left = this.parseLed(left, token);  // Infix/postfix
    }
    return left;
  }

  private parseNud(): ASTNode {
    const token = this.advance();
    switch (token.type) {
      case TokenType.NUMBER:
        return { type: 'Literal', value: parseFloat(token.value) };
      case TokenType.MINUS:
        return { type: 'UnaryOp', operator: '-', operand: this.parseExpression(100) };
      case TokenType.DICE:
        // Prefix 'd' implies count of 1: d20 → 1d20
        return { type: 'Dice', count: { type: 'Literal', value: 1 }, sides: this.parseExpression(41) };
      case TokenType.LPAREN:
        const expr = this.parseExpression(0);
        this.expect(TokenType.RPAREN);
        return expr;
      default:
        throw new ParseError(`Unexpected token: ${token.value}`);
    }
  }

  private parseLed(left: ASTNode, token: Token): ASTNode {
    switch (token.type) {
      case TokenType.DICE:
        // Infix 'd': 4d6
        return { type: 'Dice', count: left, sides: this.parseExpression(41) };
      case TokenType.PLUS:
      case TokenType.MINUS:
      case TokenType.MULTIPLY:
      case TokenType.DIVIDE:
        return { type: 'BinaryOp', operator: token.value, left, right: this.parseExpression(this.getRightBp(token)) };
      case TokenType.KEEP_HIGH:
      case TokenType.KEEP_LOW:
      case TokenType.DROP_HIGH:
      case TokenType.DROP_LOW:
        return this.parseModifier(left, token);
      default:
        throw new ParseError(`Unexpected infix: ${token.value}`);
    }
  }
}
```

### 3.5 RNG Interface (Seedable)

```typescript
interface RNG {
  next(): number;  // Returns [0, 1)
  nextInt(min: number, max: number): number;  // Returns [min, max] inclusive
}

// Default: xorshift128+ or similar
class SeededRNG implements RNG {
  constructor(seed?: string | number) { /* ... */ }
}

// For testing determinism
const testRng = new SeededRNG('TEST_SEED');
```

### 3.6 Stage 1 Mechanics Checklist

| Feature | Syntax | Example | Notes |
|---------|--------|---------|-------|
| Basic roll | `NdX` | `2d6` | |
| Implicit count | `dX` | `d20` → `1d20` | |
| Arithmetic | `+`, `-`, `*`, `/`, `%`, `**` | `1d20+5` | Standard precedence |
| Parentheses | `(...)` | `(1d4+1)*2` | |
| Keep Highest | `khN` or `kN` | `2d20kh1` | Advantage |
| Keep Lowest | `klN` | `2d20kl1` | Disadvantage |
| Drop Lowest | `dlN` | `4d6dl1` | Stat generation |
| Drop Highest | `dhN` | `4d6dh1` | |
| Negative results | — | `1d4-5` → can be `-4` | **Critical: no clamping!** |
| Computed dice | `(expr)d(expr)` | `(1+1)d(3*2)` | |

### 3.7 Critical Test: Negative Numbers

```typescript
test('negative result not clamped', () => {
  const rng = createMockRng([1]);  // Force d4 to roll 1
  const result = roll('1d4 - 5', { rng });
  expect(result.total).toBe(-4);  // NOT 0!
});

test('unary vs binary minus', () => {
  const rng = createMockRng([3]);
  expect(roll('-1d4', { rng }).total).toBe(-3);
  expect(roll('0 - 1d4', { rng }).total).toBe(-3);
});
```

---

## 4. Stage 2: System Compatibility

### 4.1 Exploding Dice

| Variant | Syntax | Behavior |
|---------|--------|----------|
| Standard | `NdX!` | Roll again on max, add to pool |
| Threshold | `NdX!>Y` | Explode when ≥Y |
| Compounding | `NdX!!` | Explosions add to single die value |
| Penetrating | `NdX!p` | Explosions subtract 1 |

**Safety:** Hard limit of 1000 iterations to prevent `1d1!` infinite loops.

```typescript
interface ExplodeModifier {
  type: 'Explode';
  variant: 'standard' | 'compound' | 'penetrating';
  threshold?: ComparePoint;  // { operator: '>' | '>=' | ..., value: number }
  target: ASTNode;
}
```

### 4.2 Reroll Mechanics

| Modifier | Syntax | Behavior |
|----------|--------|----------|
| Reroll | `rCOND` | Reroll matching dice recursively |
| Reroll Once | `roCOND` | Reroll once, keep second result |

```
2d6r<2   → reroll 1s until ≥2
2d6ro<3  → reroll 1-2 once, accept any result
```

### 4.3 Success Counting (Dice Pools)

```typescript
// Syntax: NdX>Y  or  NdX>=Y
// Returns count of successes, not sum

interface SuccessCountNode {
  type: 'SuccessCount';
  dice: DiceNode;
  threshold: ComparePoint;
  failOn?: number;  // Optional: subtract for this value (f1)
}

// Example: 10d10>=6f1 (WoD)
// - Each die ≥6: +1 success
// - Each die =1: -1 success
```

### 4.4 Pathfinder 2e Degrees of Success

```typescript
enum DegreeOfSuccess {
  CriticalFailure = 0,
  Failure = 1,
  Success = 2,
  CriticalSuccess = 3,
}

function calculateDegree(total: number, dc: number, natural: number): DegreeOfSuccess {
  let degree: DegreeOfSuccess;
  
  if (total >= dc + 10) degree = DegreeOfSuccess.CriticalSuccess;
  else if (total >= dc) degree = DegreeOfSuccess.Success;
  else if (total > dc - 10) degree = DegreeOfSuccess.Failure;
  else degree = DegreeOfSuccess.CriticalFailure;
  
  // Nat 20 upgrades, Nat 1 downgrades (by one step, not auto-crit)
  if (natural === 20 && degree < 3) degree++;
  if (natural === 1 && degree > 0) degree--;
  
  return degree;
}
```

**Syntax option:** `1d20+10 vs 25` → returns structured degree result

### 4.5 Math Functions

```typescript
// Supported: floor, ceil, round, abs, max, min
// Syntax: func(expr) or func(expr, expr)

floor(10/3)     → 3
max(1d6, 1d8)   → higher of two rolls
min(10, 1d20+5) → capped damage
```

---

## 5. Stage 3: Advanced Features

### 5.1 Variable/Macro Expansion

```typescript
// Syntax: @varName or @{variable name}
roll('1d20 + @strMod', { context: { strMod: 5 } });
roll('1d20 + @{Strength Modifier}', { context: { 'Strength Modifier': 3 } });

interface VariableNode {
  type: 'Variable';
  name: string;
}
```

**Error handling:** Configurable — throw or default to 0.

### 5.2 Grouped Rolls

```typescript
// Syntax: { expr1, expr2, ... }
// Operations on groups: kh, kl, sum

{ 1d8+4, 1d10+2 }kh1  → roll both, keep higher total
sum({ 1d6, 1d6 })     → sum of all sub-results
```

### 5.3 Structured Output Schema

```typescript
interface RollResult {
  total: number;
  notation: string;      // Original input
  expression: string;    // Normalized: "1d20 + 5"
  rendered: string;      // "1d20[15] + 5 = 20"
  
  rolls: DieResult[];
  
  // For PF2e
  degree?: DegreeOfSuccess;
  natural?: number;      // The raw d20 value
}

interface DieResult {
  sides: number;
  result: number;
  modifiers: ('dropped' | 'exploded' | 'rerolled' | 'kept')[];
  critical: boolean;   // Rolled max
  fumble: boolean;     // Rolled 1
}
```

### 5.4 Sorting & Critical Thresholds

```typescript
// Sorting (visual only, doesn't change total)
4d6s     → sort ascending
4d6sd    → sort descending

// Critical/Fumble thresholds (metadata only)
1d20cs>19    → mark 19-20 as critical
1d20cf<3     → mark 1-2 as fumble
```

---

## 6. Project Structure

```
roll-parser/
├── src/
│   ├── lexer/
│   │   ├── lexer.ts
│   │   ├── lexer.test.ts
│   │   └── tokens.ts
│   ├── parser/
│   │   ├── parser.ts
│   │   ├── parser.test.ts
│   │   └── ast.ts
│   ├── evaluator/
│   │   ├── evaluator.ts
│   │   ├── evaluator.test.ts
│   │   └── modifiers/
│   │       ├── keep-drop.ts
│   │       ├── explode.ts
│   │       └── reroll.ts
│   ├── rng/
│   │   ├── interface.ts
│   │   ├── xorshift.ts
│   │   └── mock.ts
│   ├── index.ts          // Public API
│   └── types.ts          // Shared types
├── package.json
├── tsconfig.json
├── bunfig.toml
└── README.md
```

---

## 7. Public API

```typescript
// Main entry point
export function roll(notation: string, options?: RollOptions): RollResult;
export function parse(notation: string): ASTNode;  // For inspection
export function evaluate(ast: ASTNode, options?: EvalOptions): RollResult;

export interface RollOptions {
  rng?: RNG;
  seed?: string | number;
  context?: Record<string, number>;  // Variables
  maxIterations?: number;            // Explosion safety (default: 1000)
}
```

---

## 8. Testing Strategy

### Unit Tests (co-located)
- Lexer: token stream verification
- Parser: AST structure verification  
- Evaluator: deterministic output with mock RNG

### Property-Based Tests (fast-check)
```typescript
// Invariants:
fc.assert(fc.property(
  fc.integer({ min: 1, max: 100 }),
  fc.integer({ min: 1, max: 100 }),
  (count, sides) => {
    const result = roll(`${count}d${sides}`);
    return result.total >= count && result.total <= count * sides;
  }
));
```

### Regression Tests
- **Negative number bug** (see 3.7)
- **Modifier chaining:** `4d6dl1kh3` 
- **Edge cases:** `0d6`, `1d1`, `1d1!` (infinite loop protection)

---

## 9. Performance Guidelines

1. **Minimize allocations** in hot path — reuse token objects where possible
2. **Use Map** for binding power lookups (not switch)
3. **Avoid regex** in lexer main loop — character-by-character scanning
4. **Benchmark with `bun:test`** — target <1ms for simple rolls

---

## 10. Implementation Order

### Phase 1 (MVP)
1. ✅ Token types & Lexer
2. ✅ AST node interfaces
3. ✅ Pratt Parser core (NUD/LED)
4. ✅ Basic arithmetic evaluation
5. ✅ Dice rolling with keep/drop
6. ✅ Seedable RNG
7. ✅ Negative number handling
8. ✅ Core test suite

### Phase 2 (Expanded)
1. Exploding dice variants
2. Reroll mechanics
3. Success counting
4. Compare points (`>`, `>=`, `<`, `<=`, `=`)
5. Math functions

### Phase 3 (Full)
1. Variable expansion
2. Grouped rolls
3. Rich JSON output
4. Sorting modifiers
5. Critical thresholds
6. Alias support (`adv` → `2d20kh1`)

---

## Quick Reference: Syntax Cheatsheet

```
BASIC
  d20, 2d6, 4d6+4, (1+1)d(2*3)

KEEP/DROP
  4d6kh3, 4d6dl1, 2d20kl1

EXPLODING (Stage 2)
  1d6!, 1d6!>5, 1d6!!, 1d6!p

REROLL (Stage 2)
  2d6r<2, 2d6ro<3

SUCCESS (Stage 2)
  10d10>=6, 10d10>=6f1

GROUPS (Stage 3)
  {1d8, 1d10}kh1

VARIABLES (Stage 3)
  1d20+@str, 1d20+@{modifier}

FUNCTIONS (Stage 2-3)
  floor(1d10/2), max(1d6, 1d8)
```
