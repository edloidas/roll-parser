/**
 * Inline-SVG rendering for a single die, shaped by its side count, plus the
 * dice tray and its state legend.
 *
 * @module dice
 */

import type { DieResult } from '../../src/index.js';

/** Maximum dice drawn in the tray before collapsing into a `+N` overflow chip. */
export const MAX_TRAY_DICE = 6;

/** Escapes the characters that are unsafe inside an HTML attribute value. */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Builds the polygon `points` attribute for a regular N-gon centered at
 * (50, 50), oriented point-up.
 */
function polygonPoints(sides: number, radius: number): string {
  const points: string[] = [];

  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return points.join(' ');
}

/** SVG shape (outer silhouette only) for a die with the given side count. */
function shapeFor(sides: number): string {
  // ! Fate dice use sides === 0 as a sentinel — treat as a rounded square.
  if (sides === 0 || sides === 6) {
    return '<rect x="8" y="8" width="84" height="84" rx="16" />';
  }

  const polygonSides: Record<number, number> = { 12: 5, 20: 6 };

  switch (sides) {
    case 4:
      return '<polygon points="50,8 92,88 8,88" />';
    case 8:
      return '<polygon points="50,6 94,50 50,94 6,50" />';
    case 10:
      return '<polygon points="50,4 90,42 50,96 10,42" />';
    case 100:
      return '<circle cx="50" cy="50" r="44" />';
    default: {
      const n = polygonSides[sides];
      if (n != null) return `<polygon points="${polygonPoints(n, 46)}" />`;
      return '<circle cx="50" cy="50" r="44" />';
    }
  }
}

/** The d12 inner-pentagon facet impression: five corner spokes + inner pentagon. */
function pentagonFacets(): string {
  const outer = polygonPoints(5, 46).split(' ');
  const inner = polygonPoints(5, 30).split(' ');
  const spokes = outer.map((o, i) => `M${o} L${inner[i]}`).join(' ');

  return `<polygon points="${polygonPoints(5, 30)}" /><path d="${spokes}" />`;
}

/** The d20 facet pattern — reuses the logo's central-triangle geometry. */
const D20_FACETS =
  '<polygon points="50,26 72,64 28,64" />' +
  '<path d="M50,4 L50,26 M89.8,27 L72,64 M89.8,73 L72,64 M50,96 L50,64 M10.2,73 L28,64 M10.2,27 L28,64 M28,64 L50,64 M72,64 L50,64" />';

/**
 * Inner facet lines for a die, drawn behind the value at low opacity so each
 * solid reads as its real polyhedron. Empty string means "no facets".
 */
function facetsFor(sides: number): string {
  switch (sides) {
    case 4:
      // Three lines from each vertex meeting at the triangle centroid.
      return '<path d="M50,8 L50,61.3 M92,88 L50,61.3 M8,88 L50,61.3" />';
    case 8:
      // Horizontal equator, gapped so the centered digit stays clear.
      return '<path d="M6,50 L36,50 M64,50 L94,50" />';
    case 10:
      // Kite shoulders converging on (50,62), then down to the bottom vertex.
      return '<path d="M10,42 L50,62 M90,42 L50,62 M50,62 L50,96" />';
    case 12:
      return pentagonFacets();
    case 20:
      return D20_FACETS;
    default:
      return '';
  }
}

/** Human-facing label rendered inside the die shape. */
function labelFor(die: DieResult): string {
  if (die.sides === 0) {
    if (die.result > 0) return '+';
    if (die.result < 0) return '−';
    return '';
  }

  return String(die.result);
}

/** Whether the die needs a small `dN` badge because its shape is a fallback circle. */
function isFallbackShape(sides: number): boolean {
  return sides !== 0 && sides !== 100 && ![4, 6, 8, 10, 12, 20].includes(sides);
}

/**
 * State tokens shared by full dice and the breakdown's mini dice. Returned
 * without the base element class so both `.die` and `.mini-die` can reuse them.
 */
export function dieStates(die: DieResult): string[] {
  const states: string[] = [];
  const { modifiers } = die;

  if (modifiers.includes('dropped')) states.push('is-dropped');
  if (modifiers.includes('exploded')) states.push('is-exploded');
  if (modifiers.includes('rerolled')) states.push('is-rerolled');
  if (modifiers.includes('success')) states.push('is-success');
  if (modifiers.includes('failure')) states.push('is-failure');
  if (die.critical) states.push('is-critical');
  if (die.fumble) states.push('is-fumble');

  return states;
}

/** Human die name: `dF` for Fate, `d%` for percentile, `dN` otherwise. */
function dieName(sides: number): string {
  if (sides === 0) return 'dF';
  if (sides === 100) return 'd%';
  return `d${sides}`;
}

/** The rolled value phrased for humans (`+1`/`0`/`−1` for Fate dice). */
function valuePhrase(die: DieResult): string {
  if (die.sides === 0) {
    if (die.result > 0) return `+${die.result}`;
    if (die.result < 0) return `−${Math.abs(die.result)}`;
    return '0';
  }

  return String(die.result);
}

/**
 * Assembles a plain-language tooltip for a die, e.g.
 * `"d20 — rolled 20, critical"` or `"d6 — rolled 2, dropped"`.
 */
export function dieTitle(die: DieResult): string {
  const states: string[] = [];
  const { modifiers } = die;

  if (die.critical) states.push('critical');
  if (die.fumble) states.push('fumble');
  if (modifiers.includes('exploded')) states.push('exploded');
  if (modifiers.includes('rerolled')) states.push('rerolled');
  if (modifiers.includes('dropped')) states.push('dropped');
  if (modifiers.includes('success')) states.push('success');
  if (modifiers.includes('failure')) states.push('failure');

  const tail = states.length > 0 ? `, ${states.join(', ')}` : '';

  return `${dieName(die.sides)} — rolled ${valuePhrase(die)}${tail}`;
}

/**
 * Renders one die as an SVG element string. `index` drives the staggered
 * pop-in animation via a CSS custom property.
 */
export function renderDie(die: DieResult, index: number): string {
  const label = labelFor(die);
  const fontSize = label.length >= 3 ? 30 : 42;
  const badge = isFallbackShape(die.sides) ? `<span class="die-badge">d${die.sides}</span>` : '';
  const explodeBadge = die.modifiers.includes('exploded')
    ? '<span class="die-mark mark-explode">!</span>'
    : '';
  const rerollBadge = die.modifiers.includes('rerolled')
    ? '<span class="die-mark mark-reroll">↻</span>'
    : '';
  const facets = facetsFor(die.sides);
  const facetGroup = facets !== '' ? `<g class="die-facets">${facets}</g>` : '';
  const classes = ['die', ...dieStates(die)].join(' ');

  return [
    `<span class="${classes}" style="--i:${index}" title="${escapeAttr(dieTitle(die))}">`,
    '<svg viewBox="0 0 100 100" aria-hidden="true">',
    `<g class="die-shape">${shapeFor(die.sides)}</g>`,
    facetGroup,
    `<text class="die-value" x="50" y="50" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}">${label}</text>`,
    '</svg>',
    badge,
    explodeBadge,
    rerollBadge,
    '</span>',
  ].join('');
}

/**
 * Builds the tray markup from a result's dice, dropping `meta` dice and
 * capping at {@link MAX_TRAY_DICE} with a `+N` overflow chip.
 */
export function renderTray(rolls: DieResult[]): string {
  const visible = rolls.filter((die) => !die.modifiers.includes('meta'));
  const shown = visible.slice(0, MAX_TRAY_DICE);
  const overflow = visible.length - shown.length;

  const dice = shown.map((die, i) => renderDie(die, i)).join('');
  const overflowChip = overflow > 0 ? `<span class="die-overflow">+${overflow}</span>` : '';

  return dice + overflowChip;
}

/** A single legend entry: marker glyph or sample swatch + label. */
type LegendEntry = { present: (rolls: DieResult[]) => boolean; mark: string; label: string };

const LEGEND_ENTRIES: LegendEntry[] = [
  {
    present: (rolls) => rolls.some((d) => d.critical),
    mark: '<span class="lg-sample is-critical">✱</span>',
    label: 'critical',
  },
  {
    present: (rolls) => rolls.some((d) => d.fumble),
    mark: '<span class="lg-sample is-fumble">1</span>',
    label: 'fumble',
  },
  {
    present: (rolls) => rolls.some((d) => d.modifiers.includes('exploded')),
    mark: '<span class="die-mark mark-explode lg-badge">!</span>',
    label: 'exploded',
  },
  {
    present: (rolls) => rolls.some((d) => d.modifiers.includes('rerolled')),
    mark: '<span class="die-mark mark-reroll lg-badge">↻</span>',
    label: 'rerolled',
  },
  {
    present: (rolls) => rolls.some((d) => d.modifiers.includes('dropped')),
    mark: '<span class="lg-sample is-dropped">6</span>',
    label: 'dropped',
  },
  {
    present: (rolls) => rolls.some((d) => d.modifiers.includes('success')),
    mark: '<span class="lg-sample is-success">6</span>',
    label: 'success',
  },
  {
    present: (rolls) => rolls.some((d) => d.modifiers.includes('failure')),
    mark: '<span class="lg-sample is-failure">1</span>',
    label: 'failure',
  },
];

/**
 * Renders the tray legend for the current roll — one muted line naming only
 * the special states actually present. Returns `''` when the roll is plain,
 * so callers can append it unconditionally.
 */
export function renderLegend(rolls: DieResult[]): string {
  const visible = rolls.filter((die) => !die.modifiers.includes('meta'));
  const items = LEGEND_ENTRIES.filter((entry) => entry.present(visible)).map(
    (entry) =>
      `<span class="lg-item">${entry.mark}<span class="lg-label">${entry.label}</span></span>`,
  );

  if (items.length === 0) return '';

  return `<div class="tray-legend">${items.join('<span class="lg-sep">·</span>')}</div>`;
}
