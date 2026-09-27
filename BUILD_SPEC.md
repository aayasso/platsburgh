# BUILD_SPEC — Platsburgh

Name: **Platsburgh** — a plat (the recorded map of parcels) for Pittsburgh, one you can change. Product mark in the header: PLATSBURGH. Repo name, page title, and README title use it; no other name appears anywhere.

One page. Four panels of sliders — Regulations, Construction, Economics, Site — and every vacant parcel in Pittsburgh recolors as you move anything. The results are a four-row table, one row per kind of user: **units on parcels conforming** (to the regulations set), **feasible** (a developer covers cost), **affordable** (a household at the income set can carry the mortgage), and **subsidy required** (what the public would have to add). Click a parcel to see exactly why and what it would take. And the page tells you which slider is worth moving: **Levers** — for the current parameters, the effect of loosening each one by one step, ranked. Two more forward-looking figures sit in the ladder: **Pace** — how many years the feasible units would take at the city's recent building rate — and **Public return** — how many years a subsidy takes to pay back in property tax.

Vocabulary in the UI (see COPY.md): parcel, not lot; conforming, feasible, affordable; constraints, not reasons; DEVELOPER · MARKET · HOUSEHOLD · PUBLIC as the economics roles.

This is the single specification the coding agent builds from. Nothing here is code.

---

## 0. Principles (in order)
1. **Transparency.** The parameters on the page are the only rules. They're always visible, every one is explained in the METHODOLOGY drawer with its code reference or source, and the set you're looking at downloads as an open file. Only public data; every source named and dated on screen. Every count opens to the parcels; every parcel opens to the arithmetic. No hidden defaults. Unknowns are shown, never filled in.
2. **Dynamic.** Nothing is precomputed into fixed categories. Everything on screen is recalculated from the current parameters, in under a second. **The map is the scope:** every number on the page counts the parcels inside the current map view, within the Site filters. Zoomed out, that is the whole city; zoomed to a neighborhood, it is that neighborhood. Pan or zoom and everything recalculates.
3. **Deterministic.** Arithmetic, not model judgment. The LLM is optional and only writes a plain-language summary of numbers already on screen.
4. **Decision support, not advice.** On every page.

Stack: Next.js 15 App Router, TypeScript strict, Tailwind, shadcn/ui, MapLibre GL (no token; CARTO Dark Matter or Protomaps dark basemap), @turf/turf, vitest, papaparse. Deploy: Vercel. **Visual design: follow DESIGN_SYSTEM.md and docs/brand/lasalle-brand-specimen.html exactly** — pine surfaces over a dark map, centerline-yellow rules and accents, Barlow Condensed caps with tracking, Inter body, IBM Plex Mono for numbers. One repo. Secrets only in `.env.local` (ANTHROPIC_API_KEY, optional). Commit after every milestone; first commit at kickoff. Plain American English in all copy. When a field or URL doesn't match this spec, log the actual value and stop; never guess.

---

## 0.5 Not in this product (do not build, do not mention in the UI or docs)
No numeric score, grade, or tier for a parcel. No named rule sets, presets, scenarios, "before/after," or "current code vs. proposed" comparisons. No categories like "by right," "variance required," or "administrative relief." No quick-fill buildings. No compare page, area page, memo page, Reform Explorer, or Fit Finder pages. No Zoning Board case data. No margin slider — the Economics panel has exactly five sliders (§5b): construction cost, sale price, household income, subsidy, building pace; mortgage terms live on the parcel page. No forecasting beyond Pace (a division) and Public return (a payback); no Horizon, no market response, no uncertainty bands. No slang labels in the UI ("pencils," "lots," "why not," "show the rules"); no neighborhood selector or scope toggle; use COPY.md. No target-solver or optimizer ("reach 10,000 units") — Levers reports one-step effects only. The only outputs are: the four-row ladder table (conforming, feasible, affordable, subsidy required; units, parcels, years), the map, LEVERS, the CONSTRAINTS list with counts, the PARCELS tab, and the parcel page with COMPLIANCE, SITE CONDITIONS, and PRO FORMA.

## 1. Build order
1. The conformance calculation and pro forma as pure functions, tested against fixtures. No network.
2. Real data and the precomputed parcel file (§4). Three fallbacks; must never block.
3. The workspace: four panels, map, ladder, bottom bar (CONSTRAINTS, LEVERS, PARCELS, SOURCES). Parcel page.
4. METHODOLOGY drawer, DOWNLOAD CSV, SOURCES. Cache, polish, docs.

Naming: file and variable names may use `lot` (`data/lots.json`, `lotSf`); the UI never does — it says parcel. UI strings come only from COPY.md.

## 2. Uncertain details — try first, then fall back
| Item | Try first | If it fails |
|---|---|---|
| Parcel geometry for the whole city | **Verified Sept 24:** PASDA hosts the County parcel layer as an ArcGIS MapServer: `https://maps.pasda.psu.edu/server/rest/services/AlleghenyCountyParcels/MapServer/0` (layer name `AlleghenyCounty_Parcels2025xx`; fields `PIN` (string, the 16-char parcel ID), `MAPBLOCKLO`, `MUNICODE` (integer), `CALCACREAG`; MaxRecordCount 2000; supports `f=geojson`, `resultOffset`, statistics). Query `where=MUNICODE>=101 AND MUNICODE<=132` — **verified Sept 24 from the County's own code list (realestate.alleghenycounty.us/help.html): Pittsburgh wards are 101 (1st Ward) through 132 (32nd Ward); boroughs start with 8, townships with 9.** PIN `0050M00032000000` is in the 10th Ward = 110., `outFields=PIN,MUNICODE,CALCACREAG`, `outSR=4326`, `f=geojson`, page with `resultOffset` in steps of 2000. Also pre-downloadable in a browser before Saturday with WPRDC's Parcels n'at extractor (tools.wprdc.org/parcels-n-at; older link wprdc.github.io/property-information-extractor) filtered to the City — data exploration, allowed | County's own service `https://gisdata.alleghenycounty.us/arcgis/rest/services/OPENDATA/Parcels/MapServer` (same fields) → WPRDC `allegheny-county-parcel-boundaries` GeoJSON filtered to City PINs → cap to the 15 neighborhoods with the most vacant parcels and say so on screen |
| Property API parcel path | README at github.com/WPRDC/property-api; try `v1/parcels/<PARID>` | CKAN SQL on `property-assessments` |
| Zoning field name | **Verified Sept 24 from the City's feature service:** the district code is `zon_new` (string, the layer's display field; values like `R1D-L`); `full_zoning_type` (string 100) is the district name; `legendtype` groups districts. Layer last edited 2026-06-18. Same attributes in the WPRDC GeoJSON | If the GeoJSON lacks `zon_new`, log the keys and stop |
| FEMA NFHL layer | **Verified Sept 24:** base path is `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer` (note `/gis/nfhl/`), layer **28** = S_Fld_Haz_Ar (Flood Hazard Zones); fields `FLD_ZONE`, `ZONE_SUBTY`, `SFHA_TF` ('T' = in the Special Flood Hazard Area) | If rate-limited, mark flood unknown for the precompute and note it |
| Landslide / greenway / water / neighborhoods / steps / streets download URLs | The datasets exist under the exact titles in §3; `package_search?q=<title>` then take the GeoJSON resource | Mark that fact unknown for every parcel and write NOT FOUND in DEV_NOTES.md |
| Arm's-length sale codes | **Verified Sept 24:** the sales dataset slug is `real-estate-sales` (title "Allegheny County Property Sale Transactions"); fields `SALECODE` / `SALEDESC` are the County's validation code and description; the dataset page carries a "Sales Validation Codes Dictionary" resource — read it, keep the codes it marks valid (the description for code 0 is "VALID SALE"; multi-parcel deeds are coded `H` and are invalid), and record the kept codes in DEV_NOTES.md | Keep `SALEDESC` = 'VALID SALE' only; else SALEPRICE ≥ $10,000 |

---

## 3. Data sources
Resolve WPRDC download URLs with `GET https://data.wprdc.org/api/3/action/package_show?id=<slug>` → `result.resources[].url`; find unknown slugs with `…/package_search?q=<words>`.

| Key | What | Where | Used for |
|---|---|---|---|
| assessments | Every parcel's attributes | slug `property-assessments` (CSV; or CKAN SQL) | lot area, vacant or not, owner, assessed land value |
| geometry | Parcel polygons | §2 row 1 | width, depth, overlays |
| zoning | Zoning districts | direct GeoJSON `https://data.wprdc.org/dataset/01773197-baba-4f5e-aa77-ae87a04afafc/resource/6127f35e-f36b-4a53-80b3-f4409609e9df/download/pittsburghpazoning.geojson`; district code in `zon_new`; fallback Esri REST `https://services1.arcgis.com/YZCmUqbcsUpOKfj7/arcgis/rest/services/PGHWebZoning/FeatureServer/0/query` (spatial ref 2272; ask for `outSR=4326`) | shown on the parcel page and as an optional filter |
| slope | 25%+ slope polygons | slug `25-or-greater-slope` | site fact |
| landslide | Landslide-prone areas | WPRDC dataset titled exactly "Landslide Prone Areas" (City of Pittsburgh) — confirmed to exist Sept 24; `package_search?q=Landslide Prone Areas` | site fact |
| undermined | Undermined areas | slug `undermined-areas` | site fact |
| flood | FEMA flood zones | Esri REST point query `https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query?geometry=<lon>,<lat>&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE,SFHA_TF&returnGeometry=false&f=json` — flood = (SFHA_TF === 'T') | site fact |
| greenways | Greenways | WPRDC dataset titled "Greenways" (City of Pittsburgh; not "Allegheny County Greenways") — confirmed | site fact |
| water | Public water supplier service areas | WPRDC dataset titled "Public Water Supplier Service Areas" (PA DEP data) — confirmed | site fact |
| streets | Street centerlines | WPRDC "Allegheny County Street Centerlines" (County dataset covering the City) — confirmed | frontage |
| steps | City steps | WPRDC "City of Pittsburgh Steps" (mirror of the City's "Pittsburgh Steps" hub dataset) — confirmed | site fact |
| neighborhoods | City neighborhood polygons | WPRDC dataset titled "Neighborhoods" (City of Pittsburgh) — confirmed | map outlines and labels; the `neighborhood` field on each parcel record |
| sales | Sale transactions | slug `real-estate-sales` (verified); fields include `PARID, SALEDATE, PRICE or SALEPRICE, SALECODE, SALEDESC, INSTRTYP` — confirm the price field name from the dictionary | sale-price medians for the Economics default and parcel-page reference |
| city_owned | City-owned property | slug `city-owned-properties` | owner filter |
| delinquency | Tax delinquency | slug `allegheny-county-tax-delinquency` (or the Property API `pgh_tax_delinquency` block) | Tax-delinquent filter |
| foreclosures | Mortgage foreclosure records | slug `allegheny-county-mortgage-foreclosure-records` | Foreclosed filter |
| permits | PLI permits | slug `pli-permits` (City of Pittsburgh); fallback Census Building Permits Survey, City of Pittsburgh place | recent building pace (§5d) |

Assessment fields (uppercase, confirmed): `PARID, PROPERTYOWNER, PROPERTYADDRESS, PROPERTYZIP, MUNICODE, NEIGHCODE, NEIGHDESC, USEDESC, LOTAREA (int sq ft), SALEDATE, SALEPRICE, SALEDESC, FAIRMARKETLAND, FAIRMARKETTOTAL, YEARBLT`.
Vacant = `USEDESC` contains VACANT. Owner type = `city` if `PROPERTYOWNER` matches /CITY OF PITTSBURGH|URBAN REDEVELOPMENT/i or the parcel is in city_owned; else `other`. Private owner names are never shown.
Parcel ID: 16 characters, e.g. `0050M00032000000`; accept dashes/spaces and normalize.

---

## 4. The parcel file (`data/lots.json`) — computed once
`scripts/build-lots.ts` produces one record per City of Pittsburgh parcel that is vacant or residential (cap 40,000):
```
{ id, address, neighborhood, district, lotSf, widthFt, depthFt, hasStreetFrontage, stepsOnly,
  slopeShare (0–1), landslide, undermined, flood (true/false/unknown), greenway, water (true/false/unknown),
  empty, owner ('city'|'other'), assessedLand, lon, lat,
  transitDistM (meters to nearest PRT stop), taxDelinquent (true/false), foreclosure (true/false),
  compsPpsf (median $/finished sq ft of arm's-length sales within 800 m, prior 24 months), compsN (count), zip, fmr2br (HUD FY2026 Small Area FMR, 2-bedroom, for the ZIP; null if unavailable) }
```
Geometry: width = longest parcel edge within 10 m of a street centerline (if none, `hasStreetFrontage=false` and width = short side of the minimum bounding rectangle); depth = area ÷ width. Prefilter every overlay by bounding box before intersecting; simplify polygons on load. Record source, count, runtime in `docs/DEV_NOTES.md`. Ship the file in the repo if under 50 MB (it will be far smaller — attributes and one lon/lat per lot).

Nothing in this file depends on any parameter. Parameters are applied live, in the browser, to these records.

---

## 5. The conformance calculation (`lib/fit.ts`) — pure, runs in the browser
Inputs: one parcel record, the current **regulations**, the current **construction**, the current **site conditions**.

```
Regulations (sliders):
  minLotSf            0–10,000   step 100
  frontSetbackFt      0–40       step 1
  rearSetbackFt       0–40       step 1
  sideSetbackFt       0–20       step 1      (applied to both sides)
  maxStories          1–12
  unitsPerLot         1–60       (how many units may be on one lot)
  parkingPerUnit      0–2
  aduAllowed     yes/no

Construction (sliders and checkboxes) — describes any housing type:
  widthFt         12–120  step 1
  depthFt         20–150  step 1
  stories         1–12
  units           1–60
  attached        checkbox — label "Attached" (shares one side wall with a neighbor)
  adu             checkbox — label "ADU" (includes an accessory dwelling unit; counts as +1 unit in the headline)
  modules = ceil(widthFt / 16) × ceil(depthFt / 64) × stories  (reference only; not a control)

Site conditions (checkboxes, all default on = exclude):
  skipSteep        (slopeShare > 0.30)
  skipFlood        (flood === true)
  skipLandslide
  skipUndermined
  skipGreenway     (always on; not shown as a toggle)
  skipNoWater      (water === false)
  skipStepsOnly
  minFrontageFt    0–40 (default 20)

Site filters (checkboxes, default off; narrow scope rather than exclude):
  nearTransitOnly       parcel within 400 m (¼ mile) of a PRT stop
  delinquentOrForeclosedOnly   taxDelinquent OR foreclosure — parcels with a public acquisition path
```
Checks, in order; the first failing check is the parcel's **constraint** (later checks still run so the parcel page can show all of them). UI wording for each is in COPY.md.
```
1. site       any enabled site-condition exclusion hit             → constraint: the specific condition
2. lotSize    lotSf >= minLotSf
3. frontage   widthFt >= minFrontageFt AND hasStreetFrontage
4. envelope   (widthFt − 2·side) >= building.widthFt  AND  (depthFt − front − rear) >= building.depthFt
              if building.attached: use (widthFt − side) — one shared wall
5. units      building.units <= unitsPerLot
6. adu        !building.adu OR aduAllowed
7. stories    building.stories <= maxStories
8. parking    parkingPerUnit × units == 0 OR widthFt >= 20      (a driveway needs ~10 ft beside the building; simplification, stated)
result: conforming (all pass) | non-conforming (constraint = first failure); unknowns: any site fact that is 'unknown' is listed, never counted as a failure
```
Performance: `fitAll(lots, regulations, construction, siteConditions, siteFilters, viewBounds)` over 40,000 records in under 200 ms. `viewBounds` is the map's current bounding box; a parcel is in scope when its lon/lat falls inside it and it passes the Site filters. On map `moveend` (pan or zoom), recalculate; on slider drag, recalculate with the same bounds.

## 5b. The pro forma (`lib/proforma.ts`) — four sliders, one per kind of user, runs on every parcel
The same idea as the regulations: the economics are sliders, always visible, and the calculation runs across every conforming parcel, live. Nobody is asked who they are; each slider is one audience's question.

```
Economics (sliders):
  buildCostPerSf     $80–$400      step 5      default 260    — DEVELOPER: 237 N Aiken hard cost per finished sf, rounded (source in drawer)
  salePricePerSf     $60–$500      step 5      default = citywide median of arm's-length sales, prior 24 months (from build-lots; date in drawer) — MARKET
  buyerIncome        $30,000–$250,000 step 1,000  default 79,500 — HOUSEHOLD: HUD FY2026 Pittsburgh HUD Metro FMR Area, 80% AMI, 3-person household, effective May 1, 2026 (source in drawer)
  subsidyPerUnit     $0–$150,000   step 5,000  default 0      — PUBLIC
  buildingPace       50–3,000 units/yr  step 25  default = observed recent pace (§5d) — MARKET (label "Building pace"; source in drawer)
```
Household assumptions — sliders on the parcel page (HOUSEHOLD block), part of the page state, applied everywhere, listed in METHODOLOGY:
```
  mortgageRate       4.0–9.0 %     step 0.05   default 7.03  — Freddie Mac PMMS, week of Sept 24, 2026 (cite; not "assumed")
  downPaymentPct     3.5–25 %      step 0.5    default 3.5
  incomeToHousing    25–40 %       step 1      default 30
  propertyTaxRate    0.5–3.0 %     step 0.05   default 1.5   (effective rate on unit price: County + City + Pittsburgh Public Schools millage × the County's common level ratio; Allegheny effective rate is about 1.47% — assumed 1.5%; one slider serves both the household payment and the public return)
  insurancePerMonth  $50–$300      step 5      default 125   (assumed)
```
PMI 0.5%/yr of the loan when down payment < 20% (fixed; stated in METHODOLOGY). Term fixed at 30 years.
Per-parcel overrides — sliders on the parcel page (DEVELOPMENT block) only, not shared state; they affect this parcel's pro forma and its dot: `landOverride` $0–$250,000, default = assessed land value; `siteOverride` $0–$100,000, default = the estimated siteAdders.

HUD FY2026 income limits, Pittsburgh HUD Metro FMR Area (Allegheny, Beaver, Butler, Fayette, Washington, Westmoreland), effective May 1, 2026 — verified from PHFA's 2026 limits table (Allegheny MFI $110,400) and a Fayette County Housing Authority notice of the same HUD limits:
```
size:   1        2        3        4        5        6
30%:    23,200   26,500   29,800   33,100   38,680   44,360
50%:    38,650   44,200   49,700   55,200   59,650   64,050
80%:    61,850   70,650   79,500   88,300   95,400   102,450
MFI (100%, 4-person): 110,400
```

Per parcel (only parcels that pass all eight checks):
```
finishedSf   = building.widthFt × building.depthFt × building.stories
units        = building.units + (building.adu ? 1 : 0)
sfPerUnit    = finishedSf / units
land         = lot.assessedLand
siteAdders   = (lot.slopeShare > 0.30 ? 0.5 : lot.slopeShare > 0.10 ? 0.25 : 0) × 50.70 × (building.widthFt × building.depthFt)
             + (lot.landslide || lot.undermined ? 8000 : 0)
             + (lot.widthFt < 25 ? 20200 : 0)
             + (lot.water === false ? 10000 : 0)
cost         = buildCostPerSf × finishedSf + land + siteAdders                      # builder
unitPrice    = salePricePerSf × sfPerUnit                                            # what a buyer pays per unit
value        = unitPrice × units + subsidyPerUnit × units                            # builder's revenue incl. public support
feasible     = value >= cost
monthlyBudget = buyerIncome × 0.30 / 12
monthlyBudget = buyerIncome × incomeToHousing / 12
monthlyPI     = monthlyBudget − (propertyTaxRate × unitPrice / 12) − insurancePerMonth − (downPaymentPct < 0.20 ? 0.005 × loan / 12 : 0)   # one-pass approximation is fine
maxLoan       = PV(mortgageRate / 12, 360, monthlyPI)
buyerMax      = maxLoan / (1 − downPaymentPct)
land          = landOverride ?? lot.assessedLand
affordable   = feasible && unitPrice <= buyerMax
gapToFeasible = max(0, cost − value)
breakEvenSalePricePerSf   = (cost − subsidyPerUnit × units) / finishedSf
breakEvenSubsidyPerUnit   = max(0, (cost − unitPrice × units) / units)              # to be feasible at this price
subsidyForAffordable      = max(0, (cost − min(unitPrice, buyerMax) × units) / units)  # to be feasible at a price this household can afford
```
Constraint when a conforming parcel fails (one per parcel, first that applies): not feasible → "Not feasible — land cost" (land ≥ 25% of cost) / "Not feasible — site conditions" (siteAdders ≥ 15% of cost) / "Not feasible — sale prices"; feasible but not affordable → "Not affordable at household income".
Citywide lines (over conforming parcels): `subsidyToFeasibleAll = max(breakEvenSubsidyPerUnit)`, `subsidyToAffordAll = max(subsidyForAffordable)`, with medians.
Performance: runs inside `fitAll`; total under 200 ms citywide.

## 5c. Levers (`lib/levers.ts`) — which slider is worth moving
For the current parameters, run the full calculation once more for each lever, moved one step in its loosening direction, and report the change in the relevant ladder line. Eighteen runs — every slider and checkbox on the page, regulations, construction, and economics — each is `fitAll`, so the whole set stays under 3 s citywide (recompute on a 300 ms debounce after the last slider move, not on every drag frame).

```
Lever              step (loosening)         reports Δ in
minLotSf           −500 sq ft               units conforming
frontSetbackFt     −5 ft                    units conforming
rearSetbackFt      −5 ft                    units conforming
sideSetbackFt      −2 ft                    units conforming
maxStories         +1                       units conforming
unitsPerLot        +1                       units conforming
parkingPerUnit     −1                       units conforming
aduAllowed         off → on                 units conforming
widthFt            −2 ft                    units conforming
depthFt            −4 ft                    units conforming
stories            −1                       units conforming
units              −1                       units conforming (units per building falls, so Δ can be negative even as parcels rise — report the net units)
attached           off → on                 units conforming
adu (construction) on → off                 units conforming (net units; the ADU itself is lost)
buildCostPerSf     −$20                     units feasible
salePricePerSf     +$20                     units feasible
subsidyPerUnit     +$10,000                 units feasible (and affordable, shown second)
buyerIncome        +$10,000                 units affordable
```
Rules:
- A lever already at its loosest position (parking 0, ADUs permitted, min lot 0, width 12, stories 1, units 1, attached on, ADU off) reports "at limit" and sorts to the bottom.
- Construction levers move the building being tested, so they answer the developer's question ("what should I build here?"); regulation levers answer the city's; economics levers answer the market's, the household's, and the public's. All eighteen appear in one ranked list; each row shows which panel it belongs to.
- Δ is computed against the current result with only that one lever changed; the step is clamped to the slider's range.
- Sort by absolute Δ, largest first; levers with Δ = 0 stay in the list, at the bottom, showing "no change" — that a lever does nothing is information.
- Units, not parcels: the number that moves is units (parcels × units per building, +1 with ADU).
- Levers never moves a slider. It reports; the person moves.
- Building pace is not a lever (it changes years, not units).

Output: `[{ lever, panel: 'regulations'|'construction'|'economics', from, to, delta, metric: 'conforming'|'feasible'|'affordable', atLimit }]`.

## 5d. Pace (`lib/pace.ts`) — how long the feasible units would take
```
recentPace   = average annual new residential units permitted in the City of Pittsburgh over the last three full calendar years
yearsToBuild = feasibleUnits / buildingPace           # buildingPace slider defaults to recentPace
```
Source, in order: (a) WPRDC "PLI Permits" (City of Pittsburgh): count permits whose type is new construction and whose occupancy/use is residential, by issue year, for the last three full years; if the data carries a unit count, sum units instead of permits and say so; (b) Census Bureau Building Permits Survey, annual units authorized for the City of Pittsburgh (place-level), last three years; (c) if neither is reachable, default the slider to 500 and label it "assumed." Record which source and the three yearly counts in DEV_NOTES.md; show the source in METHODOLOGY. Pace is a division, not a forecast; say so in METHODOLOGY: "assumes the current parameters and the recent building rate hold."

## 5e. Public return (`lib/publicReturn.ts`) — the subsidy's payback in property tax
```
annualTaxPerUnit  = unitPrice × propertyTaxRate           # same slider the household payment uses
paybackYears      = subsidyRequiredPerUnit / annualTaxPerUnit     # undefined when subsidy required is 0 → "no subsidy required"
citywide:  totalSubsidy = Σ subsidyForAffordable × units over conforming parcels in view
           annualTax    = Σ annualTaxPerUnit × units over those parcels
           medianPayback = median of paybackYears over parcels with subsidyRequired > 0
```
Property tax only; no sales tax, wage tax, or transfer tax — say so in METHODOLOGY. Not discounted; simple payback.

## 5f. URL state (so nothing is invented)
Every control is a query parameter; the address reproduces the view. Keys, in this order: regulations `lot, front, rear, side, stories, upl, park, adu`; construction `w, d, st, u, att, cadu`; economics `cost, price, inc, sub, pace`; terms `rate, down, ratio, tax, ins`; site `vac, own, dist, transit, delinq, steep, flood, slide, mine, water, steps, frontage`; map `lat, lng, z`; panels open `open=reg,con,eco,site` and bottom bar `bar=constraints|levers|parcels|sources|closed`. Omit a key when it equals the default so links stay short. Per-parcel overrides (`land`, `sitecost`) appear only on `/parcel/[id]` links.

Empty view: if the map view contains no parcels after filters, every ladder cell shows "—" and the bottom bar reads "0 parcels in view"; nothing errors.

## 5g. Ground truth layer
Three things that tell a newcomer what is normal here, all facts with sources, never advice:
1. **Observed marks on sliders** — a tick on the track at a measured value with a mono label (wording in COPY.md): construction cost at the 237 N Aiken actual; sale price at the citywide median and, when parcels are in view, the median of their compsPpsf; household income at 80% AMI; building pace at the 2023–25 average; mortgage rate at PMMS; regulation sliders at the current code value. Ticks are 1px limestone at 60%, 8px tall, centered on the value; clicking does nothing.
2. **GROUND TRUTH table in METHODOLOGY** — content verbatim from COPY.md; rendered from `lib/groundTruth.ts` so docs can be generated from it.
3. **Comps by distance and rent reference on the parcel page** — `compsPpsf`/`compsN` from the parcel file (computed once in build-lots with a spatial grid; fall back to citywide when compsN < 5) and `fmr2br` from HUD FY2026 Small Area FMRs by ZIP (fetch the FY2026 SAFMR file from huduser.gov; if unreachable, use the metro FMR for the Pittsburgh HUD Metro FMR Area and label it "metro"). Reference only; the rental path is not modeled.

## 6. The page (`/`)
Layout and styling per DESIGN_SYSTEM.md (top pine bar with the ladder, left pine panel with the four sections, right-edge METHODOLOGY tab, bottom pine bar with CONSTRAINTS / LEVERS / PARCELS / SOURCES and DOWNLOAD CSV, full-bleed dark map that pans and zooms freely). The content below is what goes where; the design file says how it looks.

**Header:** the product mark "PLATSBURGH" alone on the left (no subtitle, no scope line) · the ladder on the right. No buttons; no scope control. The URL carries the full state (the METHODOLOGY drawer says so).

**Left column, four panels** — REGULATIONS, CONSTRUCTION, ECONOMICS, SITE, each **collapsed by default** to a single row (section label at left, chevron at right); clicking the row opens it and its sliders appear; any number may be open at once; open/closed state is remembered in the URL. All live; every change recalculates.

*Regulations* — eight sliders from §5: label and value only. No explanation text, code reference, or source on the panel; those live in the METHODOLOGY drawer.

*Construction* — four sliders (width, depth, stories, units), label and value only, two checkboxes (**Attached**, **ADU**), and a small live footprint drawing (a rectangle to scale). Sliders start at 24 × 40, 2 floors, 1 unit, both boxes unchecked.

*Economics* — five sliders from §5b in this order, each with a small role word above it (DEVELOPER · MARKET · HOUSEHOLD · PUBLIC · MARKET), label and value only: construction cost, sale price, household income, subsidy, building pace. No explanations or sources on the panel; they live in the METHODOLOGY drawer. The household's maximum price and the median subsidy appear in the METHODOLOGY drawer, not in the ladder or under the slider.

*Site* — Vacant parcels only (on) / all; owner: Any owner / City-owned; zoning district (optional multi-select of codes present in the data); **Near transit only** (checkbox, off) — within a quarter mile of a PRT stop; **Tax-delinquent or foreclosed only** (checkbox, off) — parcels with a public acquisition path. *Site conditions* at the bottom of this panel, collapsed: the exclude checkboxes and the minimum frontage slider from §5, labels only. No neighborhood picker: the map is the scope. The ladder, LEVERS, CONSTRAINTS, PARCELS, and DOWNLOAD CSV all count the parcels inside the current map view that pass these filters.

**Right column, top to bottom:**
1. The headline ladder as a uniform table: one header row in small muted caps (UNITS · PARCELS · YEARS), then four rows with the same shape — outcome word as the row label (limestone 22px Barlow caps, left) · units · parcels · years (all centerline 24px Barlow, tabular numerals, right-aligned; the years cell carries a small caps tag: TO BUILD or PAYBACK). No role words in the ladder (they stay on the Economics sliders). Empty cells stay empty.
   ```
                   UNITS     PARCELS   YEARS
   CONFORMING      9,624     4,812
   FEASIBLE        3,100     1,550     6  TO BUILD
   AFFORDABLE      1,200       600
   SUBSIDY / UNIT  $64,000             12  PAYBACK
   ```
   Payback is the median across parcels requiring subsidy. Nothing else in the header: the product mark alone on the left, the table on the right.
2. **Map**, one dot per parcel in scope (in view and passing the Site filters); starts zoomed to the whole city: solid yellow (centerline) = conforming, feasible, affordable; hollow yellow = conforming and feasible, not affordable; thin yellow ring = conforming, not feasible; brick at 55% = non-conforming. Hover: address and constraint (or "Conforming · feasible · affordable"). Click: opens the parcel page. Neighborhood outlines and labels drawn for orientation only; not clickable. Dots recolor on every slider move; every count recalculates on every pan or zoom (`moveend`).
The **bottom bar** is collapsed by default to its tab row (CONSTRAINTS · LEVERS · PARCELS · SOURCES, the non-conforming count, DOWNLOAD CSV, and a chevron); clicking a tab or the chevron opens it; state in the URL.
3. **CONSTRAINTS** — one list with a count beside each constraint, largest first. Wording is in COPY.md and nowhere else. Tap a constraint: the map shows only those parcels; tap again to clear. No instruction text.
4. **LEVERS** tab (the only place Levers appears): all eighteen levers per §5c, one line each, ranked, with a small panel word (REGULATIONS · CONSTRUCTION · ECONOMICS) at left; "at limit" and "no change" rows at the bottom, muted.
5. **PARCELS** tab (collapsed): address, neighborhood, lot area, frontage, status, subsidy required; paginated. **DOWNLOAD CSV** on the bar's right downloads the current list.
6. **SOURCES** tab: each dataset, publisher, retrieved date, link.
- **METHODOLOGY** drawer (right-edge tab only): every regulation and economics value with its explanation and code reference or source (§903.03 lot area and setbacks, §911.02 units per parcel, Ch. 914 parking, Ch. 912 ADUs); the feasible/affordable definitions; the household assumptions (mortgage rate, down payment, income to housing, property tax rate, insurance) with their current values; the GROUND TRUTH table (§5g, content per COPY.md); DOWNLOAD PARAMETERS and LOAD PARAMETERS (JSON); last line per COPY.md.

Footer on every page: "Decision-support prototype built at the AI Horizons AI for Housing Hackathon, Sept 26–27, 2026. Not legal, financial, or zoning advice. Sources and limitations: /docs."

## 7. The parcel page (`/parcel/[id]`)
Opens with the same regulations/construction/economics/site settings the person had on the main page (from the URL). Shows:
- Header per COPY.md: address, neighborhood, zoning district, lot area, frontage × depth, vacant/improved, owner type, distance to nearest transit stop, tax status (current / delinquent / in foreclosure); status line (CONFORMING · FEASIBLE · AFFORDABLE, or the subset, or NON-CONFORMING with the constraint).
- **COMPLIANCE** (section label only, no intro sentence), all eight checks, one line each with the numbers, wording per COPY.md, e.g. "Lot area: 2,129 sq ft — minimum 3,000" with FAIL, "Frontage: 22 ft of frontage — minimum 20" with PASS. Fail rows get a brick left border, pass rows pine, per DESIGN_SYSTEM.md.
- **SITE CONDITIONS**: slope share, landslide, undermined, flood, greenway, water, steps — each with its source and date; unavailable ones say "Not available in open data"; sewer always: "not available in open data — confirm with PWSA".
- **PRO FORMA** for this building on this parcel (§5b), three blocks side by side. **The line is the slider:** a figure that can be moved has its track directly beneath it, with the computed amount at right and the slider's own value (e.g. "$260 / sq ft") small at the track's end. No separate slider lists; no figure appears twice. No intro sentence under the PRO FORMA label.
  - **DEVELOPMENT** — lines: Construction cost [slider $/sq ft, shared with the workspace] · Land [slider, per-parcel override, default assessed] · Site conditions [slider, per-parcel override, default = the estimated adders from the parcel's mapped conditions; sub-line names them] · **Total cost** · Sale value [slider $/sq ft, shared] · **Total value** (sale value + subsidy). Result: FEASIBLE / NOT FEASIBLE with the difference. "Feasible at ${breakEvenSalePricePerSf} per square foot, or ${breakEvenSubsidyPerUnit} per unit in subsidy."
  - **HOUSEHOLD** — lines: Household income [slider, shared] · **Maximum price** (derived) · Unit price · Monthly payment. Then a compact two-column TERMS group of five small sliders (shared state): Mortgage rate, Down payment, Income to housing, Property tax rate, Insurance. Result: AFFORDABLE / NOT AFFORDABLE with the difference. Reference lines per COPY.md: sales within ½ mile (median $/sq ft, count; citywide fallback) and the ZIP's HUD Small Area FMR for a 2-bedroom, labeled reference only.
  - **PUBLIC SUPPORT** — three lines: Subsidy provided [slider $/unit, shared] with the total (× units) · **Subsidy required** (derived: subsidyForAffordable) · **Public return** (derived: subsidy required ÷ annual property tax per unit, annual tax in the sub-line; "no subsidy required" when zero). Result: "MEETS REQUIREMENT." when provided ≥ required, else "SHORT BY ${gap} PER UNIT." ASSUMPTIONS and SUMMARY buttons at the bottom of this block.
  ASSUMPTIONS drawer with every input, its current value, and its source (contents per COPY.md). Every result on the page recalculates as any slider moves.
- Optional **SUMMARY** button: Claude writes ≤120 words from the check lines only; validated to contain no numbers not present in the checks.
- **← MAP** link back to the page with the same parameters.

## 8. Cost anchor (used by §5b defaults and adders)
237 North Aiken Ave, Pittsburgh: volumetric modular 3-story two-unit, 2,667 finished sf, 976 sf footprint, 3 modules, documented $853,889.66 (2023–24). Hard cost ≈ $722,393 → **$271 per finished sf all-in hard**; with soft costs and interest ≈ $310/sf. Default `buildCostPerSf` = 260, labeled "237 N Aiken actual, hard cost per finished sf, rounded." Site adders: slope multipliers on the $50.70/footprint-sf site line; $8,000 geotech (assumed); $20,200 narrow-lot staging and street logistics (actual); $10,000 no-water (assumed). Everything on screen says which.
Acceptance: the anchor building (16 × 64 × 3, 2 units, finishedSf 3,072) on the anchor parcel at the default construction cost gives cost = 260 × 3,072 + 13,000 + 20,200 = $831,920, within ±10% of $853,890.

## 9. Tests (write first)
1. Fixture parcel 40×100, 4,000 sf, no site issues → conforming at the default building (24×40, 2 stories, 1 unit) and default regulations.
2. Same parcel, minLotSf to 5,000 → non-conforming, constraint lotSize.
3. Same parcel, building 24×40 with side setback to 10 → width 40−20=20 < 24 → constraint envelope.
4. Parcel with flood=true → constraint site while skipFlood on; conforming when skipFlood off.
5. Anchor parcel 0050M00032000000 (22 × 96.79, 2,129 sf, water yes, no flood/slope) with building 16×64×3, 2 units, stories limit 3: with defaults → constraint lotSize (2,129 < 3,000); with minLot 1,200 and defaults otherwise → constraint envelope (12 × 36.79 vs 16 × 64); with minLot 1,200, front 15, rear 15, side 3, unitsPerLot 2 → conforming (16 × 66.79 ≥ 16 × 64). Must match CALIBRATION_237_N_AIKEN.md exactly.
6. Unknown water is listed, not counted as a failure.
7. `fitAll` over 1,000 synthetic parcels < 50 ms.
8. Regulations JSON round-trips: download → load → identical counts.
9. Cost: anchor reproduction within ±10% (§8).
10. Pro forma: a conforming fixture parcel with finishedSf 1,920, land 10,000, no adders, buildCost 260, salePrice 200, subsidy 0 → not feasible, gap = 260×1920+10000 − 200×1920 = 125,200; breakEvenSubsidyPerUnit = 125,200; raise subsidy to 130,000 → feasible. Constraint = "Not feasible — sale prices".
11. Affordability: same parcel is feasible at salePrice 300 (unitPrice 576,000); buyerIncome 79,500 → buyerMax well under 576,000 → not affordable, constraint "Not affordable at household income"; buyerIncome 200,000 → affordable. subsidyForAffordable at 79,500 = (cost − buyerMax) / 1, positive.
12. Ladder: conforming ≥ feasible ≥ affordable, always.
13. Economics JSON round-trips like regulations JSON.
14. Levers: on the fixture set with defaults, parkingPerUnit 1 → 0 reports Δ conforming equal to the number of fixture parcels that fail only the parking check, times units; widthFt 24 → 22 reports Δ equal to parcels that fail only the envelope check by ≤ 2 ft of width, times units; a lever at its limit reports atLimit; the list has eighteen rows sorted by |Δ| with atLimit last.
15. Levers never mutates the current parameters (the URL and all sliders are unchanged after it runs).
17. Pace: feasibleUnits 3,100 and buildingPace 500 → 6.2 years, displayed "6 YEARS"; buildingPace 0 is not allowed (slider min 50).
18. Public return: unitPrice 219,100, propertyTaxRate 0.015 → annual tax 3,287; subsidyRequired 31,400 → payback 9.6 years, displayed "10 YEARS"; subsidyRequired 0 → "no subsidy required."
20. Ground truth: every slider listed in COPY.md "Observed marks" renders a tick at the stated value; the GROUND TRUTH table renders all rows from lib/groundTruth.ts; a parcel with compsN < 5 shows the citywide median labeled citywide; a parcel with fmr2br null shows the metro figure labeled metro.
19. Filters: nearTransitOnly keeps only parcels with transitDistM ≤ 400; delinquentOrForeclosedOnly keeps only taxDelinquent or foreclosure parcels; both compose with the other Site filters and the map bounds.
16. Scope: with viewBounds covering the whole city, counts equal the citywide counts; with viewBounds covering half the fixture parcels, counts equal that half; the "in view" line reads `{n} of {total}`. The map view (center, zoom) is part of the URL state.

## 10. Docs (`/docs`)
README.md, LIMITATIONS.md, DATA_SOURCES.md, AI_DISCLOSURE.md, RULES.md (generated from the slider definitions with the plain explanations and code references). Drafts in `SUBMISSION_DOCS.md`; update to what was built.

Limitations must say plainly: the parameters apply one rule set to every parcel regardless of its actual zoning district (the district is shown for reference); the tool does not state the law, it shows what a given parameter set would allow; the pro forma is four parameters and assessed land value — no margin, no timeline, no rental path; "feasible" means value covers cost, nothing more; "affordable" uses stated mortgage assumptions and one household size; sale-price defaults are a citywide median and neighborhoods differ (the parcel page shows the local median); sewer is not in open data; site conditions are mapped, not surveyed; costs come from one completed project.

## 11. Definition of done (check before calling anything finished)
- Every user-facing string exists in COPY.md, verbatim. Run `scripts/audit-strings.ts` (extracts string literals from `app/` and `components/`, diffs against COPY.md, prints the ones not found). Anything not found is removed or added to COPY.md first, with a line in DEV_NOTES.md saying why.
- Every panel starts collapsed to one row with a chevron; no panel shows anything but labels, values, role words, and controls when open. Explanations, code references, sources, and definitions appear only in the METHODOLOGY drawer and the parcel page.
- The ladder is monotonic on every recalculation (test 12). Pace and payback recalculate with everything else and cite their sources in METHODOLOGY (tests 17–18). Levers recomputes after every change and never moves a slider (tests 14–15).
- Every count on the page uses the same scope: parcels inside the current map view that pass the Site filters. Zooming out to the full city reproduces the citywide numbers (test 16).
- Test 5 passes with the calibration parameters exactly as written in CALIBRATION_237_N_AIKEN.md.
- No word from §0.5 appears anywhere in `app/`, `components/`, or `docs/`: score, grade, tier, preset, scenario, "by right", variance, quick-fill, pencil, "why not", "show the rules", "parameters" (as a label), "share", "copy link", "export", "neighborhoods" (as a control), "lot" (as UI text), builder, buyer.
- `/api/health` reports every layer and the parcel count; DEV_NOTES.md says which geometry source was used.
- `npm run build` passes; `.env.local` untracked; no key strings in the repo.
- README, LIMITATIONS, DATA_SOURCES, AI_DISCLOSURE, RULES describe what was built, not what was planned.

When in doubt: the four files are authoritative in this order — COPY.md for words, DESIGN_SYSTEM.md for looks, BUILD_SPEC.md for behavior, CALIBRATION_237_N_AIKEN.md for the known answer. Do not invent a fifth source.
