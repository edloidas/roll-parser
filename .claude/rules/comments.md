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

## Continuation lines

The highlighter colors **per line**, so a prefix on the first line only leaves the rest
of the block uncolored. Repeat the prefix on every line the block covers. Never continue
with a bare indented `//` — that line loses the color and stops looking like part of the
warning.

```ts
// ! Fate dice use `sides === 0` as a sentinel.
// ! A renderer that reads it as a real side count emits `d0`.

// Unrelated note: no prefix, no indent, blank line between the two blocks.
const sides = die.sides;
```

Wrong — line two loses the color, and line three reads as part of the warning:

```ts
// ! Fate dice use `sides === 0` as a sentinel.
//   A renderer that reads it as a real side count emits `d0`.
// Unrelated note.
```

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
headers. The `*` stays on the header line alone — the blank `//` lines carry no text, so
the continuation rule above does not apply to them.

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
