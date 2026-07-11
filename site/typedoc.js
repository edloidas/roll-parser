/**
 * Bridges the TypeDoc API reference into the site-wide theme.
 *
 * The rest of the edloidas.io site stores its theme in `theme-preference`
 * (`auto` | `light` | `dark`); TypeDoc uses `tsd-theme` (`os` | `light` |
 * `dark`). This script keeps them in sync: it adopts the shared preference on
 * load, writes it back when the theme changes in the docs, and mirrors changes
 * made in other open tabs. It also expands the "Settings" sidebar panel so the
 * theme selector is visible by default.
 *
 * Injected via typedoc.json `customJs`; TypeDoc copies it to
 * `docs/assets/custom.js` and loads it deferred, after its own `main.js` (whose
 * theme init this script overrides).
 */
{
  const KEY = 'theme-preference';
  const toTsd = { auto: 'os', light: 'light', dark: 'dark' };
  const toPref = { os: 'auto', light: 'light', dark: 'dark' };

  const readPref = () => {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' || value === 'auto' ? value : 'auto';
  };

  const applyTsd = (tsd) => {
    document.documentElement.dataset.theme = tsd;
    localStorage.setItem('tsd-theme', tsd);
    const select = document.getElementById('tsd-theme');
    if (select) select.value = tsd;
  };

  // Adopt the shared preference on load, overriding TypeDoc's own init.
  applyTsd(toTsd[readPref()]);

  const select = document.getElementById('tsd-theme');
  if (select) {
    // Propagate a change made in the docs back to the shared preference.
    select.addEventListener('change', () => {
      localStorage.setItem(KEY, toPref[select.value] ?? 'auto');
    });

    // Expand the Settings panel by default so the theme control is visible,
    // unless the reader has already toggled the accordion themselves.
    const settings = select.closest('details.tsd-accordion');
    if (settings && localStorage.getItem('tsd-accordion-settings') === null) {
      settings.open = true;
    }
  }

  // Keep other open tabs (playground, reference, docs) in sync.
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) applyTsd(toTsd[readPref()]);
  });

  // Re-apply on back/forward cache restore — scripts don't re-run, so a theme
  // changed elsewhere would otherwise stay stale until a manual reload.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) applyTsd(toTsd[readPref()]);
  });
}
