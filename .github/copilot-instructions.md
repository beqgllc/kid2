# Copilot Instructions — ATTIKID Portfolio

These instructions apply to all code generated or reviewed in this repository.

## Design tokens

- Never hardcode hex color values or font-family strings directly in components or CSS. Always reference the custom properties defined in `attikid-tokens.css` (color) and `attikid-typography.css` (type).
- Color tokens: `--color-bg`, `--color-bg-elevated`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-accent-hover`, `--color-accent-secondary`, `--color-accent-secondary-hover`, `--color-bridge`, `--color-danger`, `--color-success`, `--color-section-bio`, `--color-section-discography`, `--color-section-merch-bridge`.
- Typography tokens: `--font-display` (Big Shoulders Display, headlines), `--font-body` (IBM Plex Sans, body/UI), `--font-mono` (IBM Plex Mono, metadata/timestamps/catalog numbers), `--font-marker` (Caveat, lyric/journal accents).
- Load fonts with `next/font/google`. Do not add a `<link>` tag or an `@import` in CSS for fonts.
- Do not introduce new brand colors or fonts outside this token set. If a design gap comes up, flag it as a design decision to make, not something to invent silently in code.

## Hard constraints — do not violate

- Never render `--color-accent` (orange) text on a `--color-accent-secondary` (violet) background. Measured contrast is 2.97:1, which fails WCAG AA.
- Never use `--color-danger` or `--color-success` as a standalone text color on `--color-bg`. Both fail AA as small text (2.96:1 and 3.33:1 respectively). Use them only as filled backgrounds or borders, with `--color-text` on top.
- `--font-marker` (Caveat) is used at most once per page, for a single pulled lyric or journal-style line in the bio section only. Never use it for buttons, navigation, or body copy.

## Page structure

- The site is a single-column, mobile-first vertical scroll. Do not add a persistent multi-item nav bar. If wayfinding is needed, use a single minimal mono-type current-section label only (e.g. `02 / STORY`).
- Sections, in this fixed order, do not reorder without an explicit request: Hero → Bio/artist story → Discography → "The Attic" (world-building) → Merch bridge → Fan capture → Footer.
- Section background tokens:
  - Hero: `--color-bg`
  - Bio/artist story: `--color-section-bio`
  - Discography: `--color-bg-elevated`
  - "The Attic": `--color-bg` (darkest section, image-led, minimal type)
  - Merch bridge: transitions toward `--color-bridge`
  - Fan capture: `--color-bg-elevated`
  - Footer: `--color-bg`
- Discography metadata (release dates, catalog numbers) always renders in `--font-mono`, never in body or display type.

## Accessibility

- Every interactive element (CTA buttons, the fan-capture input) needs a visible `:focus-visible` style.
- Respect `prefers-reduced-motion` for any scroll-triggered or section-transition animation.
- Preserve semantic heading order (`h1`–`h3`) in document order, even though there is no visual nav bar — screen reader users rely on this since the page has no jump links.
