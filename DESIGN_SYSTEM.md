# DESIGN_SYSTEM — LaSalle Technologies (for Platsburgh)

Source of truth: `lasalle-brand-specimen.html` (in this folder; put it in the repo at `/docs/brand/`). This file adds the one token the specimen lacks and the map-product layout pattern from the Advanced Aviation Map, which this product should match.

## Tokens (HSL in `index.css`, mirrored in `tailwind.config.ts`; never raw colors in components)
```
--pine:            152 32% 18%   /* #1B4332  navbar, footer, panel surfaces, verified state */
--pine-light:      152 28% 24%   /* #2A5A46  hover on pine, subtle depth */
--pine-foreground:  40 20% 92%   /* #E8E0CE  type on pine */
--limestone:        40 18% 88%   /* #E8E0CE  light surfaces */
--limestone-dark:   38 14% 78%   /* #D6CDB6  hairlines on light, muted, disabled */
--ink:             152 12%  9%   /* #141A17  body on limestone */
--moss:            150  6% 31%   /* #4A544E  secondary text, captions, meta */
--brick:             5 68% 32%   /* #8B2218  aged brick — constraints and failures; active segment; checked box; CONSTRAINTS tab underline; non-conforming dots at 55% */
--brick-light:      10 54% 50%   /* #C4553D  brick for TEXT on pine: constraint counts, non-conforming count (the parcels-in-view count beside it stays limestone) — NOT the left panel or the ladder */
--brick-dark:        4 72% 28%
--centerline:       43 78% 58%   /* #E7BA3F  NEW — the yellow rule; accent, focus, "conforming" */
--map-bg:            0  0% 20%   /* #333333  dark basemap tone */
--radius: 0.25rem
```
**Two accents, two meanings.** Centerline yellow (#E7BA3F) = what conforms: the 3px rules; slider filled track and thumb; focus rings; the conforming dot colors; the ladder numbers. Brick (#8B2218 / #C4553D for text) = constraints and results, never inputs: the CONSTRAINTS underline and counts, the non-conforming count and dots, the METHODOLOGY tab border, the DOWNLOAD CSV border, active segments, checked checkboxes, FAIL rows on the parcel page. The left input panel stays limestone and yellow — section labels limestone at 85%, economics role words limestone at 50%, footprint outline limestone at 55% — so brick never reads as an error next to a control. Neither accent is ever a background.

Map dot colors: conforming + feasible + affordable = solid `centerline`; conforming + feasible = `centerline` 2px ring, hollow; conforming only = `centerline` 1px thin ring at 60%; non-conforming = `brick` at 55% opacity; site-data-unknown = `limestone-dark` at 40% hollow. Neighborhood outlines = `limestone` at 16%; labels at 40%. Hover ring = `limestone`.

## Type
- Display / headings: **Barlow Condensed** 600–700, ALL CAPS, letter-spacing .12em on marks and section labels, .04–.05em on headings. The ladder headlines (e.g. "9,624 UNITS CONFORMING") are Barlow Condensed 700, 24px, limestone on pine, centerline for the number.
- Body: **Inter** 400, 15–17px / 1.65. Explanations appear only in the METHODOLOGY drawer and parcel-page sub-lines, Inter 14px moss on light / limestone at 70% on pine.
- Utility: **IBM Plex Mono** 400, 11–14px — parcel IDs, slider values, hex, dataset dates, code sections (§903.03).
- Never serif. Section labels ("REGULATIONS", "CONSTRUCTION", "ECONOMICS", "SITE", "CONSTRAINTS", "LEVERS", "PARCELS", "SOURCES") are Barlow Condensed 600, 13px, .12em tracking, limestone at 85%.

## Layout — match the Advanced Aviation Map
Full-bleed dark map is the page. Everything else floats over it in pine surfaces.
- **Top bar** (pine, 16px vertical padding): product mark "PLATSBURGH" (Barlow 700, .12em) at top-left; the **headline ladder** directly beneath it, left-aligned; nothing on the right. Four-column table: row label (outcome word, limestone Barlow 700 20px, .06em) · UNITS · PARCELS · YEARS (centerline Barlow 700 20px, tabular numerals, right-aligned) under a one-time header row (10px, .14em muted caps at 50%); 4px row gap; YEARS cell small-caps tag (TO BUILD / PAYBACK) in limestone at 70%. Height is the mark plus the four rows. No buttons. Below the bar: the 3px centerline rule.
- **Left panel** (floating pine card over the map, 380px, 16px inset from the top-left of the map area, height fitted to content, 24px padding at the bottom of its scroll area; never extends under the bottom bar; scrolls internally only when content exceeds the viewport): four stacked sections, each collapsed by default to a single row — section label left, chevron (⌄ closed / ⌃ open, mono, limestone 60%) right — that opens on click: — REGULATIONS (eight sliders), CONSTRUCTION (four sliders + two checkboxes + footprint drawing), ECONOMICS (five sliders with role words), SITE (vacant-only, owner, near-transit, tax-delinquent, SITE CONDITIONS expanded when SITE is open, zoning district as a compact "Any district ▾" multi-select with chips — no neighborhood picker). The map fills the area between the header rule and the bottom bar. Each slider row: label (Barlow 600 .04em), value (mono, right-aligned), the slider (centerline track). Observed-mark ticks sit on the track; one 9.5px mono legend line (limestone 60%) lists those marks under the slider. Section headers are section labels, not boxes; hairlines at limestone 15% separate sections — the recess does the containment, no borders around content.
- **Observed marks** on sliders: a 1px limestone-60% tick, 8px tall, centered on the measured value; never brick or centerline (they are facts, not results or inputs). Labels are not parked on the ticks — one 9.5px mono line under the slider lists them in ascending value order, separated by · (limestone 60%). Hovering a tick shows a small tooltip with that mark's label.
- **Right-edge vertical tab** (pine, brick border, rotated label): "METHODOLOGY" — opens a drawer over the map's right side with the parameter table (mono values, explanations, code references, sources), definitions, and DOWNLOAD / LOAD PARAMETERS.
- **Bottom bar** (pine, collapsed by default to its tab row, chevron at right, like "DATA LAYERS"): label "CONSTRAINTS" — expands to the constraints list with counts (mono) and tap-to-filter; second tab "LEVERS" (eighteen ranked rows with a muted panel word at left, deltas in centerline mono, "at limit" / "no change" rows muted); third tab "PARCELS" for the paginated list; fourth tab "SOURCES"; on the bar's right, the parcels-in-view count in limestone mono at 70% with the non-conforming count in brick-light after it, and a DOWNLOAD CSV outlined button. Above it: the 3px centerline rule. When the left panel is scrolling, a 1px limestone-15% top border on the bar marks the cut.
- **Parcel page** (`/parcel/[id]`): limestone background, ink body — the interior-page treatment from the specimen. Pine top bar persists. The eight COMPLIANCE checks are a two-column mono/Inter table with a 6px pine (pass) or brick (fail) left border per row. Pro forma as three side-by-side white panels with brick-course headers (DEVELOPMENT · HOUSEHOLD · PUBLIC SUPPORT); each line is label (Inter 13px ink) and amount (mono 13px ink) with, where the figure can be moved, a centerline track on a limestone-dark rail with a white-ringed thumb directly beneath and the slider's own value in brick mono at the track's end; source in mono 9.5px moss beneath; hairlines between lines; HOUSEHOLD's five terms as a compact two-column slider group; stack on narrow screens.

## Motion
One 400–600ms fade-up per primary element on load. Map recolor on slider drag is immediate (no transition on dot fill). Panels slide 240ms. Nothing else moves.

## Basemap
Dark, low-contrast, matching the screenshot: CARTO "Dark Matter" style on MapLibre (no token), or Protomaps dark. Labels at limestone 60%. Water slightly darker than land.

## Rules for the agent
- Everything routes through semantic tokens; no `text-white`, `bg-black`, or hex in components.
- Product mark and section labels ALL CAPS with tracking; body sentence case.
- Mono for every number a person might copy: parcel IDs, slider values, counts in lists, dates, code sections.
- Centerline is an accent, never a surface.
