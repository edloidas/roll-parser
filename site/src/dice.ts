/**
 * Inline-SVG rendering for a single die, shaped by its side count.
 *
 * @module dice
 */

import type { DieResult } from '../../src/index.js';

/** Maximum dice drawn in the tray before collapsing into a `+N` overflow chip. */
export const MAX_TRAY_DICE = 24;

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

/** SVG shape (outline only) for a die with the given side count. */
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

/** State-driven CSS class list for a die element. */
function classesFor(die: DieResult): string {
  const classes = ['die'];
  const { modifiers } = die;

  if (modifiers.includes('dropped')) classes.push('is-dropped');
  if (modifiers.includes('exploded')) classes.push('is-exploded');
  if (modifiers.includes('rerolled')) classes.push('is-rerolled');
  if (modifiers.includes('success')) classes.push('is-success');
  if (modifiers.includes('failure')) classes.push('is-failure');
  if (die.critical) classes.push('is-critical');
  if (die.fumble) classes.push('is-fumble');

  return classes.join(' ');
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

  return [
    `<span class="${classesFor(die)}" style="--i:${index}">`,
    '<svg viewBox="0 0 100 100" aria-hidden="true">',
    `<g class="die-shape">${shapeFor(die.sides)}</g>`,
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
