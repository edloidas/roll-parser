/**
 * URL query-param state — the sharing mechanism. `?d=<notation>&s=<seed>`
 * round-trips the exact roll: same seed + notation reproduces identical dice.
 *
 * @module url
 */

export type UrlState = {
  notation: string;
  seed: string;
};

/** Reads `?d`/`?s` from the current location. Missing params yield empty strings. */
export function readUrlState(): UrlState {
  const params = new URLSearchParams(window.location.search);

  return {
    notation: params.get('d') ?? '',
    seed: params.get('s') ?? '',
  };
}

/**
 * Writes `notation`/`seed` into the URL via `history.replaceState` (no history
 * entry per keystroke). Clears params when the notation is empty.
 */
export function writeUrlState(notation: string, seed: string): void {
  const url = new URL(window.location.href);

  if (notation.trim() === '') {
    url.search = '';
  } else {
    url.searchParams.set('d', notation);
    url.searchParams.set('s', seed);
  }

  window.history.replaceState(null, '', url.toString());
}
