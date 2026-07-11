/**
 * Interactive notation guide. Renders every supported feature as a live
 * widget: notation + explanation + an in-place roll that reuses the
 * playground's dice and result renderers. Widgets roll on click and once on
 * first scroll-into-view (motion permitting).
 *
 * @module reference
 */

import { isRollParserError, roll, VERSION } from '../../src/index.js';
import { renderTray } from './dice.js';
import { renderErrorSlot, renderResultPanel } from './render.js';
import { initTheme } from './theme.js';

type Example = {
  notation: string;
  note: string;
  /** Variable context for `@name` references — only the variables section uses it. */
  context?: Record<string, number>;
};

type Section = {
  id: string;
  title: string;
  examples: Example[];
};

const SECTIONS: Section[] = [
  {
    id: 'basics',
    title: 'Dice basics',
    examples: [
      { notation: '2d6', note: 'Two six-sided dice, summed.' },
      { notation: 'd20', note: 'A single die — the count defaults to 1.' },
      { notation: 'd%', note: 'Percentile die, shorthand for 1d100.' },
      { notation: '4dF', note: 'Four Fate/Fudge dice, each −1, 0, or +1.' },
    ],
  },
  {
    id: 'arithmetic',
    title: 'Arithmetic & math functions',
    examples: [
      { notation: '2d6+3', note: 'Add a flat modifier to a roll.' },
      { notation: '(1d6+2)*3', note: 'Parentheses group sub-expressions before scaling.' },
      { notation: 'floor(1d6/2)', note: 'Round down — floor, ceil, and round are built in.' },
      { notation: 'ceil(1d6/2)', note: 'Round up to the nearest integer.' },
      { notation: 'round(1d6/2)', note: 'Round to the nearest integer.' },
      { notation: 'abs(1d6-4)', note: 'Absolute value of the result.' },
      { notation: 'max(1d20,1d20)', note: 'Advantage as a function — the larger of two rolls.' },
      { notation: 'min(1d20,1d20)', note: 'Disadvantage — the smaller of two rolls.' },
      { notation: '(1d4)d6', note: 'Computed dice: roll 1d4, then roll that many d6.' },
    ],
  },
  {
    id: 'keep-drop',
    title: 'Keep & drop',
    examples: [
      { notation: '4d6kh3', note: 'Keep the highest 3 of 4 — classic ability scores.' },
      { notation: '2d20kl1', note: 'Keep the lowest 1 of 2 — disadvantage.' },
      { notation: '4d6dl1', note: 'Drop the lowest 1, keep the rest.' },
    ],
  },
  {
    id: 'explode',
    title: 'Exploding dice',
    examples: [
      { notation: '8d6!', note: 'Max rolls explode into an extra die.' },
      { notation: '8d6!!', note: 'Compound: exploded dice accumulate into one value.' },
      { notation: '8d6!p', note: 'Penetrating: each exploded die takes a −1 penalty.' },
      { notation: '1d6!>=5', note: 'Explode on a custom threshold, not just the max.' },
    ],
  },
  {
    id: 'reroll',
    title: 'Rerolls',
    examples: [
      { notation: '2d6r<2', note: 'Reroll anything under 2, repeatedly.' },
      { notation: '2d6ro<3', note: 'Reroll once only — the "o" caps it at a single retry.' },
    ],
  },
  {
    id: 'success',
    title: 'Success counting',
    examples: [
      { notation: '10d10>=6', note: 'Count dice that meet the threshold as successes.' },
      { notation: '10d10>=6f1', note: 'Add a failure threshold — 1s subtract from the tally.' },
    ],
  },
  {
    id: 'crits-sorting',
    title: 'Crits & sorting',
    examples: [
      { notation: '1d20cs>=19', note: 'Flag a critical success on 19 or 20.' },
      { notation: '4d6sd', note: 'Sort the dice descending — presentation only.' },
    ],
  },
  {
    id: 'checks',
    title: 'Checks & degrees',
    examples: [
      { notation: '1d20+7 vs 15', note: 'Compare against a DC for a PF2e degree of success.' },
    ],
  },
  {
    id: 'groups',
    title: 'Grouped rolls',
    examples: [
      { notation: '{1d8, 1d10}kh1', note: 'Keep the highest result across separate rolls.' },
    ],
  },
  {
    id: 'variables',
    title: 'Variables',
    examples: [
      {
        notation: '1d20+@str',
        note: 'Reference an external value. Evaluated here with a preset context of { str: 3 }.',
        context: { str: 3 },
      },
    ],
  },
  {
    id: 'systems',
    title: 'By system',
    examples: [
      { notation: '4d6kh3', note: 'D&D 5e — roll an ability score.' },
      { notation: '2d20kh1+7', note: 'D&D 5e — attack with advantage.' },
      { notation: '8d6', note: 'D&D 5e — a fireball’s worth of damage dice.' },
      { notation: '7d10>=6f1', note: 'World of Darkness — successes with a botch threshold.' },
      { notation: '5d10!=10>=8', note: 'World of Darkness — 10-again, successes on 8+.' },
      { notation: '12d6>=5', note: 'Shadowrun — count hits on 5 or 6.' },
      { notation: '4dF+2', note: 'Fate — four Fudge dice plus a skill.' },
      { notation: '1d20+12 vs 20', note: 'Pathfinder 2e — check against a DC.' },
      { notation: '{1d8!, 1d6!}kh1', note: 'Savage Worlds — trait vs. wild die, exploding.' },
      { notation: 'd%', note: 'Call of Cthulhu — a percentile roll.' },
    ],
  },
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Escapes the five HTML-significant characters for text and attribute contexts. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Playground deep-link for a notation, seedless so it rolls fresh. */
function playgroundHref(notation: string): string {
  return `./?d=${encodeURIComponent(notation)}`;
}

function widgetMarkup(example: Example): string {
  const safe = escapeHtml(example.notation);
  const contextAttr =
    example.context != null ? ` data-context="${escapeHtml(JSON.stringify(example.context))}"` : '';

  return [
    `<article class="widget" data-notation="${safe}"${contextAttr}>`,
    '<div class="widget-head">',
    `<code class="widget-notation">${safe}</code>`,
    '<button class="widget-roll" type="button" aria-label="Roll this notation">',
    // Lucide rotate-cw (https://lucide.dev, ISC license).
    '<svg class="widget-roll-glyph icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
    '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />',
    '</svg> roll',
    '</button>',
    '</div>',
    `<p class="widget-note">${escapeHtml(example.note)}</p>`,
    '<div class="widget-result" aria-live="polite"></div>',
    `<a class="widget-open" href="${playgroundHref(example.notation)}">open in playground ↗</a>`,
    '</article>',
  ].join('');
}

function sectionMarkup(section: Section): string {
  const widgets = section.examples.map(widgetMarkup).join('');

  return [
    `<section class="ref-section" id="${section.id}">`,
    `<h2 class="ref-section-title">${escapeHtml(section.title)}</h2>`,
    `<div class="widgets">${widgets}</div>`,
    '</section>',
  ].join('');
}

function tocMarkup(): string {
  const links = SECTIONS.map(
    (section) => `<a class="toc-link" href="#${section.id}">${escapeHtml(section.title)}</a>`,
  ).join('');

  return links;
}

/** Reads the optional preset context stashed on a widget element. */
function readContext(widget: HTMLElement): Record<string, number> | undefined {
  const raw = widget.dataset.context;
  if (raw == null) return undefined;

  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return undefined;
  }
}

/** Rolls one widget in place, catching parser errors so the page stays alive. */
function rollWidget(widget: HTMLElement): void {
  const notation = widget.dataset.notation ?? '';
  const resultEl = widget.querySelector<HTMLElement>('.widget-result');
  if (resultEl == null) return;

  const context = readContext(widget);

  try {
    const result = context != null ? roll(notation, { context }) : roll(notation);

    resultEl.innerHTML = [
      `<div class="widget-tray">${renderTray(result.rolls)}</div>`,
      `<div class="widget-panel">${renderResultPanel(result)}</div>`,
    ].join('');
    widget.classList.add('is-rolled');
  } catch (error) {
    resultEl.innerHTML = `<div class="widget-error">${renderErrorSlot(error, notation, isRollParserError)}</div>`;
    widget.classList.add('is-rolled');
  }
}

function mount(): void {
  const toc = document.getElementById('toc');
  const guide = document.getElementById('guide');
  const versionEl = document.getElementById('version');
  if (toc == null || guide == null) throw new Error('Missing #toc or #guide');

  toc.innerHTML = tocMarkup();
  guide.innerHTML = SECTIONS.map(sectionMarkup).join('');
  if (versionEl != null) versionEl.textContent = `v${VERSION}`;

  const widgets = Array.from(guide.querySelectorAll<HTMLElement>('.widget'));

  guide.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    // Let the playground link navigate instead of rolling.
    if (target.closest('.widget-open') != null) return;

    const widget = target.closest<HTMLElement>('.widget');
    if (widget == null) return;

    rollWidget(widget);
  });

  if (prefersReducedMotion) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const widget = entry.target as HTMLElement;
        if (!widget.classList.contains('is-rolled')) rollWidget(widget);
        observer.unobserve(widget);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );

  for (const widget of widgets) observer.observe(widget);
}

initTheme();
mount();
