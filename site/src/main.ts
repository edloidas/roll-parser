/**
 * Entry point: wires the input, dice tray, result panel, and shareable URL
 * state together around the roll-parser library.
 *
 * @module main
 */

import { isRollParserError, roll, VERSION } from 'roll-parser';
import { initTrayToggle, renderLegend, renderTray } from './dice.js';
import { renderErrorSlot, renderResultPanel } from './render.js';
import { initTheme } from './theme.js';
import { readUrlState, writeUrlState } from './url.js';

const ROLL_DEBOUNCE_MS = 200;
const COUNT_UP_MS = 450;

/**
 * Placeholder hints — one picked per load. Everyday D&D rolls, kept to seven
 * characters or fewer so the hint never truncates on a narrow phone; the
 * example chips below the input carry the breadth.
 */
const PLACEHOLDER_ROLLS = [
  'd20',
  '1d20+5',
  '2d20kh1',
  '2d20kl1',
  '4d6kh3',
  '2d6+3',
  '1d8+4',
  '8d6',
] as const;

const app = requireEl('app');
const input = requireEl<HTMLInputElement>('notation');
const inputWrap = requireEl('input-wrap');
const tray = requireEl('tray');
const legend = requireEl('legend');
const result = requireEl('result');
const errorSlot = requireEl('error');
const rerollBtn = requireEl<HTMLButtonElement>('reroll');
const copyBtn = requireEl<HTMLButtonElement>('copy');
const clearBtn = requireEl('clear');
const copiedFlag = requireEl('copied');
const examples = requireEl('examples');
const versionEl = requireEl('version');

function requireEl<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (el == null) throw new Error(`Missing #${id}`);
  return el as T;
}

/** Short base36 seed for a fresh random roll. */
function freshSeed(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** One {@link PLACEHOLDER_ROLLS} hint at random. Falls back to the markup's own. */
function randomPlaceholder(): string {
  const pick = PLACEHOLDER_ROLLS[Math.floor(Math.random() * PLACEHOLDER_ROLLS.length)];

  return pick != null ? `Try ${pick}` : input.placeholder;
}

/** Previous numeric total, so the count-up eases from the last value. */
let lastTotal = 0;

/** Whether the user asked to minimize motion — re-read live per call. */
function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Eases the big total from {@link lastTotal} up to `to` over {@link COUNT_UP_MS}.
 * Skips (sets the final value immediately) under reduced motion or for
 * non-integer totals, and no-ops when the panel shows counts instead of a sum.
 */
function animateTotal(to: number): void {
  const el = result.querySelector<HTMLElement>('.total');
  const from = Number.isInteger(lastTotal) ? lastTotal : 0;
  lastTotal = to;

  if (el == null) return;

  if (prefersReducedMotion() || !Number.isInteger(to) || from === to) {
    el.textContent = String(to);
    return;
  }

  const start = performance.now();

  const step = (now: number): void => {
    const t = Math.min((now - start) / COUNT_UP_MS, 1);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = String(Math.round(from + (to - from) * eased));
    if (t < 1) requestAnimationFrame(step);
  };

  el.textContent = String(from);
  requestAnimationFrame(step);
}

/** Re-triggers the result panel's fade+rise by replaying its animation. */
function replayPanelAnimation(): void {
  result.classList.remove('is-fresh');
  // Force a reflow so removing then re-adding the class restarts the animation.
  void result.offsetWidth;
  result.classList.add('is-fresh');
}

function setActive(active: boolean): void {
  app.classList.toggle('is-active', active);
  tray.setAttribute('aria-hidden', active ? 'false' : 'true');
  legend.setAttribute('aria-hidden', active ? 'false' : 'true');
}

/** Shows the clear (×) button only while the input holds text. */
function syncClear(): void {
  inputWrap.classList.toggle('has-value', input.value !== '');
}

/**
 * Gates reroll and copy on there being a roll on screen — with nothing rolled
 * there is no result to redo and no notation in the URL to share. Parse errors
 * leave the flag alone: the previous result and its link are still current.
 */
function setRollActions(enabled: boolean): void {
  rerollBtn.disabled = !enabled;
  copyBtn.disabled = !enabled;
}

/**
 * Rolls `notation` with `seed` and paints the UI. On parser errors the
 * previous successful result stays put; only the error slot updates.
 */
function performRoll(notation: string, seed: string): void {
  const trimmed = notation.trim();

  if (trimmed === '') {
    setActive(false);
    tray.classList.remove('is-expanded');
    tray.innerHTML = '';
    legend.innerHTML = '';
    result.innerHTML = '';
    errorSlot.innerHTML = '';
    input.classList.remove('is-invalid');
    writeUrlState('', '');
    setRollActions(false);
    lastTotal = 0;
    return;
  }

  setActive(true);

  try {
    const rolled = roll(notation, { seed });

    // Every roll starts folded — the fresh chip is rendered in its `+N` state.
    tray.classList.remove('is-expanded');
    tray.innerHTML = renderTray(rolled.rolls);
    legend.innerHTML = renderLegend(rolled.rolls);
    result.innerHTML = renderResultPanel(rolled);
    replayPanelAnimation();
    animateTotal(rolled.total);
    errorSlot.innerHTML = '';
    input.classList.remove('is-invalid');
    writeUrlState(notation, seed);
    setRollActions(true);
  } catch (error) {
    input.classList.add('is-invalid');
    errorSlot.innerHTML = renderErrorSlot(error, notation, isRollParserError);
  }
}

type Debounced<A extends unknown[]> = ((...args: A) => void) & { cancel(): void };

function debounce<A extends unknown[]>(fn: (...args: A) => void, ms: number): Debounced<A> {
  let handle: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: A) => {
    if (handle != null) clearTimeout(handle);
    handle = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => {
    if (handle != null) clearTimeout(handle);
    handle = undefined;
  };

  return debounced;
}

const debouncedRoll = debounce((notation: string) => {
  performRoll(notation, freshSeed());
}, ROLL_DEBOUNCE_MS);

/** Rolls right now, discarding any pending debounced roll that would override it. */
function rollNow(notation: string): void {
  debouncedRoll.cancel();
  performRoll(notation, freshSeed());
}

async function copyLink(): Promise<void> {
  const url = window.location.href;

  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Clipboard API rejects on insecure or permission-denied contexts.
    input.focus();
  }

  copiedFlag.classList.add('is-visible');
  setTimeout(() => copiedFlag.classList.remove('is-visible'), 1200);
}

/** Empties the input, returns focus, and resets to the idle state. */
function clearInput(): void {
  input.value = '';
  syncClear();
  input.focus();
  rollNow('');
}

//
// * Wiring
//

input.addEventListener('input', () => {
  syncClear();
  debouncedRoll(input.value);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    clearInput();
    return;
  }
  if (event.key !== 'Enter') return;
  event.preventDefault();
  rollNow(input.value);
});

rerollBtn.addEventListener('click', () => {
  rollNow(input.value);
});

copyBtn.addEventListener('click', () => {
  void copyLink();
});

clearBtn.addEventListener('click', () => {
  clearInput();
});

examples.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.chip');
  if (target == null) return;

  input.value = target.dataset.notation ?? '';
  syncClear();
  input.focus();
  rollNow(input.value);
});

//
// * Bootstrap
//

initTheme();
initTrayToggle();

input.placeholder = randomPlaceholder();
versionEl.textContent = `v${VERSION}`;

const initial = readUrlState();

if (initial.notation !== '') {
  input.value = initial.notation;
  syncClear();
  performRoll(initial.notation, initial.seed !== '' ? initial.seed : freshSeed());
}
