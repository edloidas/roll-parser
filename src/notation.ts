/**
 * Notation serialization shared by the two breakdown builders — the
 * evaluator's `expression`/`rendered` strings and `render.ts`.
 *
 * @module notation
 */

// ! `cs`, `cf`, `s`, and `sd` are the only codes ending in a letter the lexer
// ! scans as an identifier — maximal munch then swallows what follows, so
// ! `cs` + `cf` re-lexes as `cscf`. `4dF` and `!p` are their own tokens.
const BARE_MODIFIER_END = /(?:cs|cf|sd|s)$/;

const STARTS_WITH_LETTER = /^[A-Za-z]/;

/**
 * Appends a modifier code to the expression built so far, separating the two
 * with a space when concatenating them would re-lex as a single identifier.
 * The space is the same separator the input used to make them parse.
 */
export function joinModifierCode(expression: string, code: string): string {
  return BARE_MODIFIER_END.test(expression) && STARTS_WITH_LETTER.test(code)
    ? `${expression} ${code}`
    : `${expression}${code}`;
}
