# COPY — every word on the screen

Use these strings exactly. Planning and development vocabulary; no slang ("pencils," "lots" in the UI). Sentence case except tracked caps where the design system calls for them (product mark, section labels, buttons, ladder). The UI says **parcel**, never "lot" (file and variable names may keep `lot`).

## Header
- Mark: **PLATSBURGH**
- Ladder as a uniform table. Column headers once (small muted caps): **UNITS** · **PARCELS** · **YEARS**. Row labels are the outcome words; no role words:
  - **CONFORMING** · `{units}` · `{parcels}` · —
  - **FEASIBLE** · `{units}` · `{parcels}` · `{years}` TO BUILD
  - **AFFORDABLE** · `{units}` · `{parcels}` · —
  - **SUBSIDY / UNIT** · `${max}` · — · `{years}` PAYBACK (median across parcels requiring subsidy)

## Observed marks on sliders
A small tick on the track at a measured value, with a mono label under the tick (limestone at 60%): Construction cost `actual $260`; Sale price `citywide $160` and, when in view, `local ${n}`; Household income `80% AMI $79,500`; Building pace `2023–25 avg 273`; Mortgage rate `PMMS 7.03%`; Minimum lot area `code 3,000`; setbacks and height `code {value}`. Marks are facts with sources (in the drawer), never presets: clicking a mark does nothing.

## REGULATIONS (section label; collapsed by default, chevron at right)
On the panel when open: label and value only, plus observed marks where listed above. Explanation and code reference appear only in the METHODOLOGY drawer.

| Slider | Label | Explanation (drawer only) | Code reference (drawer only) |
|---|---|---|---|
| minLotSf | Minimum lot area | A parcel must be at least this large to be developed. | §903.03 |
| frontSetbackFt | Front setback | Required distance from the front property line. | §903.03 |
| rearSetbackFt | Rear setback | Required distance from the rear property line. | §903.03 |
| sideSetbackFt | Side setback | Required distance from each side property line. | §903.03 |
| maxStories | Height limit | Maximum building height, in stories. | §903.03 |
| unitsPerLot | Units per parcel | Maximum dwelling units on one parcel. | §911.02 |
| parkingPerUnit | Parking per unit | Off-street parking spaces required per dwelling unit. | Ch. 914 |
| aduAllowed | ADUs permitted | Whether an accessory dwelling unit is permitted on the parcel. | Ch. 912 |

## CONSTRUCTION (section label; collapsed by default, chevron at right)
On the panel when open: label and value only.

| Slider / box | Label | Explanation (drawer only) |
|---|---|---|
| widthFt | Width | Building width, feet. |
| depthFt | Depth | Building depth, feet. |
| stories | Stories | Number of stories. |
| units | Units | Dwelling units in the building. |
| attached | Attached | Shares a party wall with an adjacent building. |
| adu | ADU | Includes an accessory dwelling unit (counts as one additional unit). |

Footprint drawing caption (mono): `{width} × {depth} ft · {stories} stories · {units} units`

## ECONOMICS (section label; collapsed by default, chevron at right)
On the panel when open: role word, label, value only. Explanation and source appear only in the METHODOLOGY drawer.

| Role word | Slider | Label | Explanation (drawer only) | Source (drawer only) |
|---|---|---|---|---|
| DEVELOPER | buildCostPerSf | Construction cost per sq ft | Hard cost per finished square foot, excluding land. Land and site conditions are added from parcel records. | 237 N Aiken actual, 2023–24 |
| MARKET | salePricePerSf | Sale price per sq ft | Market value per finished square foot. | WPRDC sales, prior 24 months, retrieved {date} |
| HOUSEHOLD | buyerIncome | Household income | The household the units should be affordable to. | HUD FY2026, 80% of area median, 3-person household |
| PUBLIC | subsidyPerUnit | Subsidy per unit | Public capital contributed per unit. | user-defined |
| MARKET | buildingPace | Building pace | New residential units the city builds per year. | City of Pittsburgh PLI permits, last three full years (or Census Building Permits Survey) |

Drawer only: "A parcel is feasible when sale value plus subsidy covers construction cost, assessed land value, and site-condition costs. It is affordable when the unit price is within the household's borrowing capacity at the stated mortgage assumptions."

## SITE (section label; collapsed by default, chevron at right)
The map is the scope: every number on the page counts the parcels in the current map view that pass these filters.
- Checkbox: **Vacant parcels only**
- Owner: **Any owner** / **City-owned**
- Zoning district (optional): placeholder "Any district"
- Checkbox: **Near transit only** (within ¼ mile of a PRT stop)
- Checkbox: **Tax-delinquent or foreclosed only**
- **SITE CONDITIONS** (collapsed): checkboxes, label only — Exclude steep slope · Exclude flood zone · Exclude landslide-prone · Exclude undermined · Exclude no water service · Exclude stairs-only access · Minimum frontage (slider). Definitions in the drawer.

## RESULTS
- Map legend: **Conforming · feasible · affordable** (solid centerline) · **Conforming · feasible** (hollow centerline) · **Conforming** (thin centerline ring) · **Non-conforming** (brick) · **Site data unavailable** (gray hollow)
- Hover: `{address}` · `{constraint | "Conforming · feasible · affordable"}`
- Bottom bar, collapsed by default to the tab row; tabs: **CONSTRAINTS** · **LEVERS** · **PARCELS** · **SOURCES** — right side of the bar: `{inView} parcels in view` (limestone) · `{n} non-conforming` (brick-light) · **DOWNLOAD CSV** (the PARCELS list for the current view)

Constraints (exact wording; count in mono beside each; largest first):
- Below minimum lot area
- Setbacks exceed buildable area
- Insufficient frontage
- Exceeds units per parcel
- ADU not permitted
- Exceeds height limit
- Parking cannot be accommodated
- Steep slope
- Flood zone
- Landslide-prone
- Undermined
- No water service
- Stairs-only access
- Not feasible — land cost
- Not feasible — site conditions
- Not feasible — sale prices
- Not affordable at household income

LEVERS tab: eighteen lines — every slider and checkbox in Regulations, Construction, and Economics (building pace excluded) — each `{Lever} {from} → {to}` · `+{n} units {conform|feasible|affordable}` with a panel word at left (REGULATIONS · CONSTRUCTION · ECONOMICS), ranked; rows at the slider's limit read `at limit`; rows with no effect read `no change`. One line under the label: "Effect of loosening each parameter one step from the current settings. Nothing moves until you move it."

Parcels tab columns: Address · Neighborhood · Lot area (sq ft) · Frontage (ft) · Status · Subsidy required ($, blank when none)
Empty state: "No parcels match the current parameters."

SOURCES tab: one row per dataset — `{name}` · `{publisher}` · `retrieved {date}` · link

## METHODOLOGY drawer (right-edge tab)
Title: **METHODOLOGY**. First line: "Starting positions match the current code for a low-density residential district (§903.03)."
Table: every regulation and economics slider — parameter, current value, explanation, code reference or source. Also: the household's maximum price at the current income, and the median subsidy required across conforming parcels.
Definitions block: the feasible / affordable sentence above; the household assumptions with their current values.
Buttons: **DOWNLOAD** · **LOAD**
Last line: "These are the exact parameters that produced the results on this page. The page address reproduces this view."

## PARCEL PAGE
- Back link: **← MAP**
- Header: `{address}` · `{neighborhood}` · `Zoning district {code}` · `{lotSf} sq ft · {frontage} × {depth} ft` · `{Vacant | Improved}` · `{City-owned | Privately owned}` · `Transit {n} ft` · `{Taxes current | Tax-delinquent | In foreclosure}`
- Status line (right): **CONFORMING · FEASIBLE · AFFORDABLE** (or the subset that applies; **NON-CONFORMING** with the constraint) · mono: `at current parameters · {w} × {d} · {stories} stories · {units} units{ + ADU}`
- Section label: **COMPLIANCE** — no intro line.

| Check | Wording |
|---|---|
| Site conditions | "None flagged." / "{condition} — excluded by site-condition settings." |
| Lot area | "{lotSf} sq ft — minimum {min}." |
| Frontage | "{frontage} ft of frontage — minimum {min}." |
| Buildable area | "{w} × {d} ft buildable after setbacks — building {bw} × {bd}." |
| Units | "{units} units — {max} permitted per parcel." |
| ADU | "No ADU." / "ADU included — permitted." / "ADU included — not permitted." |
| Height | "{stories} stories — maximum {max}." |
| Parking | "No parking required." / "{n} spaces required — {frontage} ft of frontage accommodates a driveway." / "{n} spaces required — {frontage} ft of frontage does not accommodate a driveway." |
Result column: **PASS** / **FAIL**.

- Section label: **SITE CONDITIONS** — each: `{condition}: {value}` · `{dataset} · {date}`. Unavailable: "Not available in open data." Sewer always present: "Sewer: not available in open data — confirm with PWSA."
- Section label: **PRO FORMA** — no intro line.
  - **DEVELOPMENT** block, lines (label · amount; slider beneath where marked, with its own value at the track's end; source in mono beneath):
    - Construction cost · ${total} · slider `${cost} / sq ft` · `× {sf} sq ft · 237 N Aiken actual`
    - Land · ${land} · slider `${land}` · `County assessment ${assessed}`
    - Site conditions · ${adders} · slider `${adders}` · `estimated: {named conditions} · 237 N Aiken actual`
    - **Total cost** · ${cost}
    - Sale value · ${value} · slider `${price} / sq ft` · `× {sfPerUnit} sq ft × {units} units · WPRDC sales`
    - **Total value** · ${value} · `sale value + subsidy`
    - Result: "**FEASIBLE** — value exceeds cost by ${diff}." / "**NOT FEASIBLE** — cost exceeds value by ${gap}." — "Feasible at ${breakEvenSalePrice} per square foot, or ${breakEvenSubsidy} per unit in subsidy."
  - **HOUSEHOLD** block, lines:
    - Household income · ${income} · slider `${income}` · `HUD FY2026 · 80% of area median · 3-person household`
    - **Maximum price** · ${buyerMax} · `{ratio}% of income to housing at the terms below`
    - Unit price · ${unitPrice} · `${price} / sq ft × {sfPerUnit} sq ft`
    - Monthly payment · ${monthly} · `principal, interest, taxes, insurance`
    - **TERMS** (small label), five compact sliders in two columns: Mortgage rate · Down payment · Income to housing · Property tax rate · Insurance
    - Result: "**AFFORDABLE** — ${diff} below the household's maximum." / "**NOT AFFORDABLE** — ${diff} above." — Reference lines (mono): `Sales within ½ mile: median ${local}/sq ft ({n} sales, prior 24 months)` (falls back to `citywide` when n < 5) · `Typical rent, ZIP {zip}: ${fmr2br} for 2 bedrooms (HUD FY2026 Small Area FMR) — rental path not modeled`
  - **PUBLIC SUPPORT** block:
    - Subsidy provided · ${total} · slider `${subsidy} / unit` · `× {units} units`
    - **Subsidy required** · ${subsidyForAffordable} · `for this parcel to be feasible at a price this household can afford`
    - **Public return** · {years}-year payback · `${annualTax} per year in property tax at {rate}%` (or `no subsidy required`)
    - Result: "**MEETS REQUIREMENT.**" / "**SHORT BY ${gap} PER UNIT.**" 
    - Buttons: **ASSUMPTIONS** · **SUMMARY**
  - Source tags (mono): `237 N Aiken actual` · `assumed` · `WPRDC sales` · `County assessment` · `HUD FY2026` · `Freddie Mac PMMS 2026-09-24`
  - Buttons: **ASSUMPTIONS** · **SUMMARY**
  - Assumptions drawer: every slider's current value with its source — mortgage rate (default 7.03%, Freddie Mac PMMS, Sept 24, 2026) · down payment (default 3.5%) · income to housing (default 30%) · property tax rate (default 1.5% effective, assumed from the County's roughly 1.47% effective rate) · insurance (default $125/mo, assumed) · PMI 0.5%/yr below 20% down (fixed) · 30-year term (fixed) · land (assessed value unless overridden). Footer: "Cost anchor: one completed modular two-unit at 237 N Aiken Ave, Pittsburgh (2023–24), documented at $853,890. Not an appraisal, underwriting, or a loan offer."
  - SUMMARY output label: "Generated from the checks above. It contains nothing that is not already on this page."

## Footer (every page)
"Decision-support prototype built at the AI Horizons AI for Housing Hackathon, Sept 26–27, 2026. Not legal, financial, or zoning advice. Sources and limitations: /docs."

## States
- Loading: "Loading parcels…"
- Coverage capped: "Showing {n} neighborhoods. Citywide coverage is in progress."
- Parcel not found: "Parcel ID not found. Use the 16-character County ID, for example 0050M00032000000."
- Source unavailable: "{dataset} unavailable. Showing the copy retrieved {date}."
