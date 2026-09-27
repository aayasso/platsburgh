# Platsburgh

Built solo at the AI Horizons **AI for Housing Hackathon**, Sept 26–27, 2026 · Challenge 1: Development Feasibility & Pro Forma Navigator

**Run locally** (no hosted URL) · **Limitations:** [LIMITATIONS.md](LIMITATIONS.md) · **Data sources:** [DATA_SOURCES.md](DATA_SOURCES.md) · **Rules:** [RULES.md](RULES.md) · **AI disclosure:** [AI_DISCLOSURE.md](AI_DISCLOSURE.md)

Screenshots: [workspace](img/workspace.png) · [METHODOLOGY](img/methodology.png) · [parcel 0050M00032000000](img/parcel-0050M00032000000.png) · [map filtered to one constraint](img/constraint-filter.png)

### What it does

One page. Set zoning regulations with sliders, describe a building with sliders, set five economics sliders — construction cost per square foot, sale price per square foot, household income, subsidy per unit, building pace — and every parcel in the current map view that passes the Site filters recolors as you move things. The results are a four-row table: **units on parcels conforming** (to the regulations set), **feasible** (value covers cost), **affordable** (a household at that income can carry the mortgage), and **subsidy required**. Click any parcel for eight compliance checks with the actual numbers, site conditions with their sources, and a pro forma in three views — development, household, public support.

There are no fixed rule sets and no hidden financial assumptions. The sliders on the page are the only inputs. The tool is neutral on construction method: construction cost is user-set, with observed marks for the NAHB 2024 site-built average and one Pittsburgh modular build; site and regulatory figures come from that build's invoices.

- **Regulations** — eight sliders: minimum lot area, front, rear, and side setbacks, height limit, units per parcel, parking per unit, ADUs permitted. Each has an explanation and a code reference in the METHODOLOGY drawer.
- **Construction** — four sliders (width, depth, stories, units) and two checkboxes (Attached, ADU).
- **Economics** — five sliders: construction cost per square foot (method-neutral; starts at **$200**, an assumed midpoint, with observed marks for the NAHB 2024 site-built US average **$162** and one Pittsburgh modular build **$260**), sale price per square foot (starts at **$160**, the citywide median of recent sales rounded to the slider step), household income (starts at 80% of area median for a three-person household), subsidy per unit, and building pace (**275**, from City of Pittsburgh PLI new residential construction permits, 2023–2025). A parcel is feasible when value covers cost plus assessed land and site conditions; affordable when the unit price is within that household's borrowing capacity.
- **Site** — the map is the scope. Filters: vacant parcels only or all, any owner or city-owned, optional zoning district, near transit only (a quarter mile of a PRT stop), tax-delinquent or foreclosed only. Site conditions: exclude steep slope, flood zone, landslide-prone, undermined, no water service, stairs-only access, or condemned structures (off by default); minimum frontage.
- **Results** — the four-row table (units, parcels, years), with years-to-build at the recent pace and subsidy payback in property tax; a map of every parcel in view; **Levers**; a CONSTRAINTS list; a PARCELS list with CSV download; a METHODOLOGY drawer; the page address reproduces any view.

### Guiding principles

1. **Transparency** — the sliders are always visible and explained; every count opens to the parcels and every parcel to the arithmetic; only public data, named and dated; no hidden defaults; unavailable data shown, never filled in.
2. **Dynamic** — everything is recalculated from the current settings; nothing is pre-classified.
3. **Deterministic** — arithmetic, not model judgment; the model only summarizes numbers already on screen, and only when an API key is set.
4. **Decision support, not advice.**

### Who it's for

Planners and council staff testing what a regulation change would open up; people who build housing looking for parcels that fit what they build; households checking what they could afford and where; CDCs and neighbors who want to see the same thing the professionals see.

### How compliance works

See [RULES.md](RULES.md). Eight checks per parcel, in order: site conditions, parcel area, frontage, buildable area after setbacks, units per parcel, ADU, height, parking. The first failure is the parcel's constraint; all eight appear on the parcel page with the numbers. Unavailable site data is listed, never counted as a failure.

### Run locally

```
npm i && cp .env.example .env.local     # ANTHROPIC_API_KEY optional (parcel-page SUMMARY only)
npm run build-lots                       # builds data/lots.json from public sources (already in the repo)
npm run dev
```

Open `http://localhost:3000`. There is no hosted deployment. SUMMARY on the parcel page appears only when `ANTHROPIC_API_KEY` is set in `.env.local`.

### Built with

Next.js, TypeScript, Tailwind, shadcn/ui, MapLibre GL, Turf.js. Design: LaSalle Technologies brand system. Data in [DATA_SOURCES.md](DATA_SOURCES.md).

### Sources considered and not used

- Zoning Board of Adjustment decisions — PDF parsing; deliberate
- USGS 3DEP — marginal over City slope polygons
- HMDA — complex, low marginal value
- PA DEP eMapPA — manual access
- OneStopPGH — portal, not data
- Redfin / Realtor.com — parcel-level comps used instead
- PennDOT
- ResStock
- Historical PLI
