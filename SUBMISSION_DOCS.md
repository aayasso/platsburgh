# SUBMISSION_DOCS — drafts the agent adapts on Sunday (Prompt 4)

Update every line to what was actually built. Remove anything that wasn't.

---

## docs/README.md

# Platsburgh
Built solo at the AI Horizons **AI for Housing Hackathon**, Sept 26–27, 2026 · Challenge 1: Development Feasibility & Pro Forma Navigator

**Live:** [vercel URL] · **Video:** [link] · **Limitations:** docs/LIMITATIONS.md · **Data sources:** docs/DATA_SOURCES.md · **Rules:** docs/RULES.md · **AI disclosure:** docs/AI_DISCLOSURE.md

### What it does
One page. Set the zoning regulations with sliders, describe a building with sliders — any housing type, from a detached single-family to an apartment building — set four economics sliders — construction cost per square foot, sale price per square foot, household income, subsidy per unit — choose where to look, and every vacant parcel in the City of Pittsburgh recolors as you move things. The results are a four-row table, one row per kind of user: **units on parcels conforming** (to the regulations set), **feasible** (a developer covers cost), **affordable** (a household at that income can carry the mortgage), and **subsidy required** for every conforming parcel to be feasible at a price that household can afford. Click any parcel for eight compliance checks with the actual numbers, site conditions with their sources, and a pro forma in three views — development, household, public support — each with its own sliders (land, mortgage rate, down payment, taxes, insurance), that says what it would take.

There are no fixed rule sets and no hidden financial assumptions. The parameters on the page are the only inputs; whatever you set is what the tool checks, in under a second, for whatever the map is showing.

- **Regulations** — eight sliders: minimum lot area, front, rear, and side setbacks, height limit, units per parcel, parking per unit, ADUs permitted. Each has an explanation and a code reference in the METHODOLOGY drawer.
- **Construction** — four sliders (width, depth, stories, units) and two checkboxes (Attached, ADU). One panel describes a detached house, a row house, a duplex, or an apartment building.
- **Economics** — five sliders: construction cost per square foot (developer; starts at a completed project's actual), sale price per square foot (market; starts at the citywide median of recent sales), household income (starts at 80% of area median for a three-person household), subsidy per unit (public), and building pace (starts at the city's recent permit rate). A parcel is feasible when value covers cost plus assessed land and site conditions; affordable when the unit price is within that household's borrowing capacity. Every parcel gets a "what it would take" number.
- **Site** — the map is the scope: every number on the page counts the parcels in the current view. Zoomed out, that's the whole city; zoomed in, that's the neighborhood. Filters: vacant parcels only or all, any owner or city-owned, optional zoning district, near transit only (a quarter mile of a PRT stop), tax-delinquent or foreclosed only (parcels with a public acquisition path). Site conditions: exclude steep slope, flood zone, landslide-prone, undermined, no water service, or stairs-only access; minimum frontage.
- **Results** — a four-row table (conforming, feasible, affordable, subsidy required — units, parcels, years), with two forward-looking figures: how many years the feasible units would take at the city's recent building pace, and how many years a subsidy takes to pay back in property tax; a map of every parcel in four states; **Levers** — for the current settings, the effect of moving every parameter one step — regulations, building, and economics — ranked, so the page tells you which slider is worth moving; a CONSTRAINTS list with a count beside each (tap one to see those parcels); a PARCELS list with CSV download; a METHODOLOGY drawer with every parameter's explanation, code reference or source, and a downloadable parameter file; the page address reproduces any view.

### Guiding principles
1. **Transparency** — the parameters are always visible and explained; every count opens to the parcels and every parcel to the arithmetic; only public data, named and dated; no hidden defaults; unavailable data shown, never filled in.
2. **Dynamic** — everything is recalculated from the current settings; nothing is pre-classified.
3. **Deterministic** — arithmetic, not model judgment; the model only summarizes numbers already on screen, optionally.
4. **Decision support, not advice.**

### Who it's for
Planners and council staff testing what a regulation change would open up; developers and modular manufacturers looking for parcels that fit what they build; households checking what they could afford and where; CDCs and neighbors who want to see the same thing the professionals see.

### How compliance works
See docs/RULES.md. Eight checks per parcel, in order: site conditions, lot area, frontage, buildable area after setbacks, units per parcel, ADU, height, parking. The first failure is the parcel's constraint; all eight appear on the parcel page with the numbers. Unavailable site data is listed, never counted as a failure.

### Run locally
```
npm i && cp .env.example .env.local     # ANTHROPIC_API_KEY optional (parcel-page summary only)
npm run build-lots                       # builds data/lots.json from public sources
npm run dev
```

### What we'd build next
1. District-aware starting positions: load the actual code values for each zoning district so the parameters start from the actual law for each parcel, and show "what the code says" beside "what you set."
2. PWSA sewer availability — the biggest known gap; not in open data.
3. Zoning Board of Adjustment history: how often parcels like this one sought the same relief, and the outcomes.
4. Cost registry: developers contribute actuals from completed projects and get calibrated estimates back.
5. A pilot with City Planning on the bill in front of Council now.

### Built with
Next.js, TypeScript, Tailwind, shadcn/ui, MapLibre GL, Turf.js, Vercel. Design: LaSalle Technologies brand system. Data in docs/DATA_SOURCES.md.

---

## docs/LIMITATIONS.md

# Limitations statement
This is a decision-support prototype built in 39 hours. It is not legal, financial, or zoning advice, and it does not replace review by the City of Pittsburgh Zoning Division, the Zoning Board of Adjustment, PWSA, or a licensed design professional.

**What the tool is and isn't**
- The parameters apply one set of rules to every parcel in scope, regardless of the parcel's actual zoning district. The district is shown on each parcel page for reference. The tool shows what a given parameter set would allow; it does not state the law for a particular parcel.
- Starting slider positions match the current code for a low-density residential district only as a convenience; move anything.
- Contextual setbacks, variances, overlays, historic review, and other case-by-case approvals are not modeled. A parcel shown as non-conforming at a given setting may be approvable in practice, and vice versa. 237 N Aiken Ave is the example: at standard setbacks the building there did not conform; it was approved without a Zoning Board case.

**Known gaps (shown as "unknown," never guessed)**
- Sewer tap availability and capacity — no open dataset.
- Soils and geotechnical conditions (only mapped landslide-prone and undermined status).
- Title, easements, deed restrictions.
- Any parcel outside the City of Pittsburgh.

**Approximations**
- Frontage and depth are estimated from parcel geometry and street centerlines; irregular parcels may be off.
- Slope share comes from the City's 25%-or-greater slope polygons, not a survey.
- The parking check is a simplification (a driveway needs roughly 10 ft of frontage beside the building).
- Years at recent pace is a division, not a forecast: feasible units over the building-pace setting, assuming current parameters hold. Payback counts property tax only, undiscounted.
- The pro forma is four parameters plus assessed land value: no margin, no timeline, no rental path, no soft costs beyond what's in the construction-cost number. "Feasible" means value covers cost, nothing more. "Affordable" uses one household size and the mortgage assumptions shown as sliders on the parcel page (defaults: 30% of income, 30-year fixed at the Freddie Mac PMMS rate for the week of the hackathon, 3.5% down); it is not a loan decision. The sale-price default is a citywide median; neighborhoods differ, and the parcel page shows the local median. Construction cost comes from one completed project (237 N Aiken, Pittsburgh, 2023–24).

**Data currency** — every parcel page shows each dataset's retrieved date. Assessment records lag the real world.

**Who could be harmed, and what we did about it** — a map full of gray dots in a disinvested neighborhood could read as "don't build here." The constraints list exists so the constraint is always visible, and site constraints are shown separately from regulatory ones. No personal data: private owner names are never displayed.

---

## docs/DATA_SOURCES.md

| Dataset | Publisher | Access | Used for |
|---|---|---|---|
| Allegheny County Property Assessments | Allegheny County via WPRDC | data.wprdc.org | lot size, empty or not, owner type, assessed land value |
| Parcel geometry (County parcel layer) | Allegheny County GIS | openac-alcogis.opendata.arcgis.com | lot width and depth, overlays |
| Pittsburgh Zoning Districts | City of Pittsburgh via WPRDC | data.wprdc.org | shown per lot; optional filter |
| Pittsburgh Zoning Code, Title 9 (§903.03, §911.02, Ch. 912, Ch. 914) | City of Pittsburgh | ecode360.com | code references shown beside each slider |
| 25% or Greater Slope; Landslide Prone Areas; Undermined Areas; Greenways; Pittsburgh Steps | City of Pittsburgh via WPRDC | data.wprdc.org | site facts |
| FEMA National Flood Hazard Layer | FEMA | hazards.fema.gov | site fact |
| Public Water Supplier Service Areas | PA DEP via WPRDC | data.wprdc.org | site fact |
| Street centerlines | City of Pittsburgh / Allegheny County via WPRDC | data.wprdc.org | frontage |
| Pittsburgh Neighborhoods | City of Pittsburgh via WPRDC | data.wprdc.org | map outlines and labels; neighborhood name per parcel |
| Allegheny County Property Sale Transactions | Allegheny County via WPRDC | data.wprdc.org | sale-price medians (Economics default; lot-page reference) |
| City-Owned Properties | City of Pittsburgh via WPRDC | data.wprdc.org | owner filter |
| PRT stops (GTFS) | Pittsburgh Regional Transit via WPRDC | data.wprdc.org | near-transit filter |
| Tax Delinquency; Mortgage Foreclosure Records | Allegheny County / City via WPRDC | data.wprdc.org | tax-delinquent or foreclosed filter |
| PLI Permits (or Census Building Permits Survey) | City of Pittsburgh via WPRDC (Census Bureau) | data.wprdc.org | recent building pace |
| PLI Permits (or Census Building Permits Survey) | City of Pittsburgh via WPRDC (Census Bureau) | data.wprdc.org | recent building pace |
| HUD FY2026 Income Limits, Pittsburgh HUD Metro FMR Area (effective May 1, 2026) | HUD | huduser.gov | household-income default and affordability |
| Primary Mortgage Market Survey, 30-year fixed, week of Sept 24, 2026 | Freddie Mac | freddiemac.com/pmms | mortgage rate in the affordability calculation |
| Cost basis | 237 North Aiken LLC — completed modular two-unit, Pittsburgh (invoice-level cost build, 2023–2024) | private project records, summarized as unit costs in docs/RULES.md | build-cost default and site adders |

Organizers' Data Catalog: the rows above that appear in it are used as listed; the site-fact layers not in the catalog (landslide, greenways, water service areas, neighborhoods, steps) are noted with provenance.

---

## docs/AI_DISCLOSURE.md
- **Claude Code** (Anthropic) for code generation, refactoring, and tests, working from a written specification and design system prepared before the event. All rules, checks, formulas, and copy were designed by the builder.
- **Anthropic Claude API** at runtime, optional, only for the one-paragraph summary on a parcel page. The model receives the eight check lines and may use nothing else; the output is validated to contain no numbers not in the checks and is labeled as generated. Counts, checks, and costs contain no model judgment.
- **Claude (claude.ai)** before the event for research and drafting these documents. No code was written before kickoff.
