# TypeScript Coding Standards

## Code Style

```typescript
// Check for both null and undefined with `!= null`
if (response != null) {
  // safe to use response
}

// No nested ternaries — extract to function with if/else or switch/case
const status = isLoading ? 'loading' : isError ? 'error' : 'idle'; // Bad
const status = getStatus(); // Good

// Leverage modern TypeScript syntax
const len = items?.length ?? 0;
settings.debug ||= false;
cache?.clear();
const size = 1_000;

// Prefer destructuring assignment
const [body, headers = {}] = request;
const { signal } = new AbortController();

// Single-line guard clauses without braces
if (element == null) return;
if (!isSupported) return false;

// Insert exactly one blank line between logically distinct operations
const result = doSomething();

updateAnotherThing();
```

## Naming Standards

```typescript
// Standalone booleans: is/has/can/should/will prefixes
const isEnabled = true;
const hasFocus = false;
const canEdit = permissions.includes('edit');

// Object props: drop boolean prefixes
const state = { enabled: true };

// Arrays use plural forms
const users: User[] = [];

// Functions use verb prefixes
function getUserById(id: string) {}  // get/fetch/load/parse
function isValidEmail(email: string) {}  // is/has for boolean returns

// Constants: UPPERCASE with underscores
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;
```

## Type Definitions

```typescript
// Prefer types for object shapes
type User = {
  id: string;
  name: string;
};

// Use type aliases for unions/primitives
type UserStatus = 'active' | 'inactive' | 'pending';

// Use T[] syntax, not Array<T>
type Users = User[];

// Avoid type assertions with 'as' — use type guards or proper typing
const user = {} as User; // Bad
const user: Partial<User> = {}; // Good

// Use `satisfies` for precise literal types without widening
const options = {
  retry: 3,
  timeout: 5000,
} satisfies RequestOptions;

// Use `Maybe<T>` for nullish values
type Maybe<T> = T | null | undefined;
function findUser(id: string): Maybe<User> { /* ... */ }

// Prefer `undefined` over `null` for unset values
const activeId: string | undefined = undefined;
```

## Type Composition

```typescript
// Prefer composition: define base types, then extend
type RollOwnProps = {
  count?: number;
  sides?: number;
  modifier?: number;
};

// Internal type combines base + dependencies
type RollInternalProps = RollOwnProps & ParserContext;

// Consumer type uses base directly — avoid Omit gymnastics
export type RollProps = RollOwnProps;
```

**Rationale:** IDE hover shows actual properties; TypeScript errors reference real names.

## Function Signatures

```typescript
// Explicit return types for exported functions
export function calculateTotal(items: number[]): number {
  return items.reduce((sum, item) => sum + item, 0);
}

// Use generic constraints
function updateEntity<T extends { id: string }>(entity: T, updates: Partial<T>): T {
  return { ...entity, ...updates };
}
```

## Import/Export

```typescript
// Named exports only — no default exports
export { RollParser, DiceRoller };

// Use `import type` for type-only imports (required by verbatimModuleSyntax)
import type { RollResult, DiceConfig } from '../types';

// Use path aliases for imports outside the current directory
import { createMockRng } from '@/rng/mock';
import { utils } from './utils'; // Same directory: relative paths are fine
```
