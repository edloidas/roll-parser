# Fonts

Self-hosted latin-subset woff2 files, downloaded from Google Fonts.

- **Cinzel** (`cinzel-latin.woff2`) — headings, wordmark, section titles, degree badges, example labels (`--font-head`). Variable weight axis 400–700. Source: <https://fonts.google.com/specimen/Cinzel>. License: SIL Open Font License 1.1.
- **IBM Plex Sans** (`ibm-plex-sans-latin.woff2`) — body text, notes, legend, footer, widget copy (`--font-body`). Variable weight axis 400–700. Source: <https://fonts.google.com/specimen/IBM+Plex+Sans>. License: SIL Open Font License 1.1.
- **JetBrains Mono** (`jetbrains-mono-latin.woff2`) — notation input, chips, breakdown labels/operators, error echo, expr-note, widget notation (`--font-mono`). Variable weight axis 400–700. Source: <https://fonts.google.com/specimen/JetBrains+Mono>. License: SIL Open Font License 1.1.
- **B612** (`b612-latin-400.woff2`, `b612-latin-700.woff2`) — dice values, mini-die values, the big total, and success/failure count numbers (`--font-num`). Static (non-variable): one file per weight, 400 and 700. Source: <https://fonts.google.com/specimen/B612>. License: SIL Open Font License 1.1.

Cinzel, IBM Plex Sans, and JetBrains Mono are variable fonts covering their weight axes in a single file each; their `@font-face` rules in `style.css` map the weight range to that one file. B612 is not offered as a variable font, so it ships as two static files.

The three variable files are axis-limited to **400–700** — the only weights the site uses. Google Fonts ships them wider (Cinzel 400–900, IBM Plex Sans 100–700, JetBrains Mono 400–800); after downloading, trim the unused range with fontTools before committing, e.g. `fonttools varLib.instancer <in>.woff2 wght=400:700 --output <out>.woff2` (requires `brotli` for woff2). This drops ~12 KB across the three with no visible change.
