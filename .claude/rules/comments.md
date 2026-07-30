# Comments

Four single-line prefixes, picked so a comment-highlighter plugin colors each one
differently. The color is the point — it is what makes the prefix worth using over
a plain comment. Never combine two prefixes.

| Prefix | Color | Use for |
|--------|-------|---------|
| `// !` | red | Important enough to stop a reader: bug, security risk, breaking change, sharp edge. |
| `// *` | green | Section divider, or a header over a multi-line comment. |
| `// ?` | blue | **Not settled**: a hack, a temporary fix, a guess, something still in doubt. |
| `// TODO:` | — | Actionable follow-up. Imperative verb, `[#123]` when an issue exists. |

## `// ?` is for doubt, not for rationale

This is the one that gets misused. A finished decision with a non-obvious reason is
a plain comment. `// ?` means the code is still open — it is a flag to come back to,
not an explanation.

```ts
// Stable sort — ties resolve by original pool order.
const sorted = [...dice].sort(byResult);

// ? Above Bun 1.3's ~640k argument-list ceiling on Linux — revisit if that lifts.
const ast = buildLargeAst();
```

If removing the uncertainty would not change the comment, it should not be `// ?`.

## `// *` sections

Wrap in blank `//` lines. Header ≤ 4 words. Never `// ----`, `// ====`, or numbered
headers.

```ts
//
// * Node dispatch
//
```

## Placement

Default to no comment — the name should carry it. Comment the *why* only when it is
genuinely non-obvious, in 1–2 lines. Never reference the task, PR, or issue that
prompted the change; that belongs in the commit message. Prefer TSDoc over inline
prose on anything exported.
