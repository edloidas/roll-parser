/**
 * Consumer fixture for the TypeScript version-floor matrix.
 *
 * Typechecked against the packed tarball — never `src/` — by the `ts-compat`
 * and `ts-compat-floor` jobs in `.github/workflows/ci.yml`.
 *
 * A green `tsc` proves nothing on its own: when resolution fails every import
 * silently becomes `any`, and a plain smoke import still compiles. The
 * assertions below are what a passing run actually means.
 */

import type {
  ASTNode,
  DieResult,
  KeepDropSpec,
  RNG,
  RollPart,
  RollPartType,
  RollResult,
} from 'roll-parser';
import { DegreeOfSuccess, parse, RollParserError, roll, SeededRNG, VERSION } from 'roll-parser';
import { createMockRng, MockRNGExhaustedError } from 'roll-parser/testing';

type IsAny<T> = 0 extends 1 & T ? true : false;
type NotAny<T> = IsAny<T> extends true ? false : true;
/** Violates its own constraint — and so fails to compile — when `T` is `false`. */
type Assert<T extends true> = T;

export type ResultResolved = Assert<NotAny<RollResult>>;
export type PartResolved = Assert<NotAny<RollPart>>;
export type AstResolved = Assert<NotAny<ASTNode>>;
export type DieResolved = Assert<NotAny<DieResult>>;
export type SpecResolved = Assert<NotAny<KeepDropSpec>>;

const rng: RNG = createMockRng([3, 6, 2, 5]);
const result: RollResult = roll('4d6kh3', { rng });
const total: number = result.total;
const rendered: string = result.rendered;
const version: string = VERSION;
const seeded: RNG = new SeededRNG('ci');
const ast: ASTNode = parse('2d6');

/** Narrowing on the discriminant must survive resolution, not collapse to `any`. */
function describe(part: RollPart): string {
  switch (part.type) {
    case 'dice':
      return `${part.count}d${part.sides}:${part.rolls.length}`;
    case 'keepDrop':
      return `${describe(part.target)}:${part.specs.map((spec) => spec.kind).join()}`;
    case 'binaryOp':
      return `${describe(part.left)} ${part.operator} ${describe(part.right)}`;
    case 'literal':
      return String(part.value);
    default: {
      const rest: Exclude<RollPartType, 'dice' | 'keepDrop' | 'binaryOp' | 'literal'> = part.type;
      return rest;
    }
  }
}

// @ts-expect-error — a number is not an expression string
roll(42);

// @ts-expect-error — not one of the 16 RollPart discriminants
const unknownPartType: RollPartType = 'nope';

export const checks = [
  total,
  rendered,
  version,
  describe(result.parts),
  ast.type,
  seeded.next(),
  DegreeOfSuccess.CriticalSuccess,
  RollParserError.name,
  MockRNGExhaustedError.name,
  unknownPartType,
];
