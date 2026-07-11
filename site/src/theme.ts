/**
 * Shared theme controller for the playground and reference pages.
 *
 * The preference (`auto` | `light` | `dark`) lives in the origin-wide
 * `theme-preference` localStorage key, so it stays in sync with the rest of the
 * `edloidas.io` site and with the TypeDoc API reference (which bridges
 * `auto` ↔ its own `os` value). The mode is mirrored onto `<html data-theme>`;
 * `style.css` resolves `auto` to the OS preference via `prefers-color-scheme`.
 *
 * A pre-paint inline script in each page's `<head>` sets `data-theme` first to
 * avoid a flash; this module re-applies it (idempotent), wires the toggle, and
 * keeps other open tabs in sync.
 *
 * @module theme
 */

export type ThemeMode = 'auto' | 'light' | 'dark';

const THEME_KEY = 'theme-preference';
const CYCLE: ThemeMode[] = ['auto', 'light', 'dark'];

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(THEME_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'auto' ? stored : 'auto';
}

function applyTheme(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
}

function nextTheme(mode: ThemeMode): ThemeMode {
  const index = CYCLE.indexOf(mode);
  return CYCLE[(index + 1) % CYCLE.length] ?? 'auto';
}

/**
 * Applies the stored theme, wires `#theme-toggle` to cycle auto → light → dark,
 * and mirrors changes made in other tabs (playground, reference, or docs) via
 * the `storage` event.
 */
export function initTheme(): void {
  applyTheme(getStoredTheme());

  const toggle = document.getElementById('theme-toggle');
  toggle?.addEventListener('click', () => {
    const next = nextTheme(getStoredTheme());
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  window.addEventListener('storage', (event) => {
    if (event.key === THEME_KEY) applyTheme(getStoredTheme());
  });

  // Re-apply when restored from the back/forward cache: bfcache restores a
  // frozen page without re-running scripts, so a theme changed on another page
  // (e.g. the docs) would otherwise stay stale until a manual reload.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) applyTheme(getStoredTheme());
  });
}
