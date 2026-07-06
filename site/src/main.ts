/**
 * Entry point: wires the input, dice tray, result panel, and shareable URL
 * state together around the roll-parser library.
 *
 * @module main
 */

import { isRollParserError, roll, VERSION } from '../../src/index.js';
import { renderTray } from './dice.js';
import { renderErrorSlot, renderResultPanel } from './render.js';
import { readUrlState, writeUrlState } from './url.js';

const ROLL_DEBOUNCE_MS = 200;

const app = requireEl('app');
const input = requireEl<HTMLInputElement>('notation');
const tray = requireEl('tray');
const result = requireEl('result');
const errorSlot = requireEl('error');
const rerollBtn = requireEl('reroll');
const copyBtn = requireEl('copy');
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

function setActive(active: boolean): void {
  app.classList.toggle('is-active', active);
  tray.setAttribute('aria-hidden', active ? 'false' : 'true');
}

/**
 * Rolls `notation` with `seed` and paints the UI. On parser errors the
 * previous successful result stays put; only the error slot updates.
 */
function performRoll(notation: string, seed: string): void {
  const trimmed = notation.trim();

  if (trimmed === '') {
    setActive(false);
    tray.innerHTML = '';
    result.innerHTML = '';
    errorSlot.innerHTML = '';
    input.classList.remove('is-invalid');
    writeUrlState('', '');
    return;
  }

  setActive(true);

  try {
    const rolled = roll(notation, { seed });

    tray.innerHTML = renderTray(rolled.rolls);
    result.innerHTML = renderResultPanel(rolled);
    errorSlot.innerHTML = '';
    input.classList.remove('is-invalid');
    writeUrlState(notation, seed);
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
    // ? Clipboard API can reject on insecure/denied contexts — fall back to select.
    input.focus();
  }

  copiedFlag.classList.add('is-visible');
  setTimeout(() => copiedFlag.classList.remove('is-visible'), 1200);
}

//
// * Wiring
//

input.addEventListener('input', () => {
  debouncedRoll(input.value);
});

input.addEventListener('keydown', (event) => {
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

examples.addEventListener('click', (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>('.chip');
  if (target == null) return;

  input.value = target.dataset.notation ?? '';
  input.focus();
  rollNow(input.value);
});

//
// * Bootstrap
//

versionEl.textContent = `v${VERSION}`;

const initial = readUrlState();

if (initial.notation !== '') {
  input.value = initial.notation;
  performRoll(initial.notation, initial.seed !== '' ? initial.seed : freshSeed());
}
