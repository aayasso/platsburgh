# Rules

Generated from `lib/rules.ts` and `lib/groundTruth.ts`. Do not edit by hand.

Eight checks per parcel, in order: site conditions, parcel area, frontage, buildable area after setbacks, units per parcel, ADU, height, parking. The first failure is the parcel's constraint; all eight appear on the parcel page with the numbers. Unavailable site data is listed, never counted as a failure.

| Key | Label | Explanation | Min | Max | Step | Default | Code or source |
|---|---|---|---|---|---|---|---|
| minLotSf | Minimum lot area | A parcel must be at least this large to be developed. | 0 | 10000 | 100 | 3000 | §903.03 |
| frontSetbackFt | Front setback | Required distance from the front property line. | 0 | 40 | 1 | 30 | §903.03 |
| rearSetbackFt | Rear setback | Required distance from the rear property line. | 0 | 40 | 1 | 30 | §903.03 |
| sideSetbackFt | Side setback | Required distance from each side property line. | 0 | 20 | 1 | 5 | §903.03 |
| maxStories | Height limit | Maximum building height, in stories. | 1 | 12 | 1 | 2 | §903.03 |
| unitsPerLot | Units per parcel | Maximum dwelling units on one parcel. | 1 | 60 | 1 | 1 | §911.02 |
| parkingPerUnit | Parking per unit | Off-street parking spaces required per dwelling unit. | 0 | 2 | 1 | 1 | Ch. 914 |
| aduAllowed | ADUs permitted | Whether an accessory dwelling unit is permitted on the parcel. | 0 | 1 | 1 | false | Ch. 912 |
| buildCostPerSf | Construction cost per sq ft | Hard cost per finished square foot for any construction method, excluding land. Land and site conditions are added from parcel records. | 80 | 400 | 5 | 200 | default $200 (assumed) between NAHB 2024 site-built average $162 and an observed Pittsburgh modular build $260 |
| salePricePerSf | Sale price per sq ft | Market value per finished square foot. | 60 | 500 | 5 | 160 | WPRDC sales, prior 24 months, retrieved 2026-09-26 |
| buyerIncome | Household income | The household the units should be affordable to. | 30000 | 250000 | 1000 | 79500 | HUD FY2026, 80% of area median, 3-person household |
| subsidyPerUnit | Subsidy per unit | Public capital contributed per unit. | 0 | 150000 | 5000 | 0 | user-defined |
| buildingPace | Building pace | New residential units the city builds per year. | 50 | 3000 | 25 | 275 | City of Pittsburgh PLI permits, last three full years (2023–2025) |
| mortgageRate | Mortgage rate | Freddie Mac PMMS, week of Sept 24, 2026. | 4 | 9 | 0.05 | 7.03 | Freddie Mac PMMS 2026-09-24 |
| downPaymentPct | Down payment | Share of price paid in cash at purchase. | 3.5 | 25 | 0.5 | 3.5 | assumed |
| incomeToHousing | Income to housing | Share of household income spent on housing. | 25 | 40 | 1 | 30 | assumed |
| propertyTaxRate | Property tax rate | Effective rate on unit price. | 0.5 | 3 | 0.05 | 1.5 | assumed |
| insurancePerMonth | Insurance | Monthly homeowners insurance. | 50 | 300 | 5 | 125 | assumed |

## GROUND TRUTH

What building actually costs and takes in Pittsburgh, from public records and one completed project. Reference only; the tool is neutral on construction method.

### Any construction method

| Item | Figure | Source | Date |
|---|---|---|---|
| Building permit fee (two-unit, ~2,700 sq ft) | $1,970 | 237 N Aiken invoices | 2023 |
| Street staging permits (4) and street-opening permit | $1,072 + $543 | 237 N Aiken invoices | 2023–24 |
| PWSA development permit and fees | $979 | 237 N Aiken invoices | 2023 |
| PWSA stormwater review for a single infill lot | ~5 months; $11,737 engineering | 237 N Aiken invoices | Jun–Nov 2023 |
| Utility connections (excavation, storm, sanitary, water lines) | $19,500 | 237 N Aiken invoices | 2024 |
| Utility change orders (ACHD check valve, curb valve, storm core, road bond) | $4,670 | 237 N Aiken invoices | 2024 |
| Street repair after utility cut | $5,015 | 237 N Aiken invoices | 2024 |
| Electric service (two meters, two panels) | $5,350 | 237 N Aiken invoices | 2024 |
| Site prep and foundation (precast, 184 linear ft) | $49,486 (≈ $50.70 per footprint sq ft) | 237 N Aiken invoices | 2023–24 |
| Access, staging, and street logistics on a lot under 25 ft with no alley | $14,000 neighbor agreement + $8,920 street work | 237 N Aiken records | 2023–24 |
| Site work complete to certificate of occupancy | 229 days | 237 N Aiken records | 2023–24 |
| Construction interest | $33,269 on $537,600 over nine months at prime | 237 N Aiken loan statements | 2024 |
| Design, survey, appraisal, title, insurance | ≈ $23,400 combined | 237 N Aiken invoices | 2023–24 |
| Site-built construction cost, US average | $162 per finished sq ft | NAHB Cost of Constructing a Home | 2024 |
| Construction input prices since the observed build | +11.2% (Nov 2023–May 2024 avg to latest month) | BLS Producer Price Index, inputs to residential construction | retrieved 2026-09-27 |
| Citywide sale price, arm's-length, prior 24 months | $161 per finished sq ft median, 7,463 sales | WPRDC sales | retrieved 2026-09-26 |
| Appraised value, new two-unit, 2,667 sq ft | $865,000 (≈ $324 per sq ft) | FNB appraisal | Jan 2025 |
| New residential units permitted per year | 380 · 256 · 183 (avg 273) | City PLI permits | 2023–2025 |
| 30-year mortgage rate | 7.03% | Freddie Mac PMMS | Sept 24, 2026 |
| Area median income, three-person household | $99,400 (80%: $79,500) | HUD FY2026 | May 2026 |

### Observed on a modular build (method-specific)

| Item | Figure | Source | Date |
|---|---|---|---|
| Factory cost, volumetric modular, high-spec two-unit | $175 per finished sq ft; freight $10,668 for three modules from Strattanville, PA | 237 N Aiken final invoice | 2024 |
| Crane, set crew, toter, cones (three modules, 1.5 days) | $29,632 | 237 N Aiken invoices | Dec 2023 |
| Factory start to set day | 164 days (modules ~80% built in 30 days) | 237 N Aiken records | 2023 |
| Total documented cost, modular two-unit, 2,667 finished sq ft | $853,890 (≈ $320 per sq ft; ≈ $260 hard) | 237 N Aiken cost basis | 2024 |

The tool does not assume a construction method; the construction-cost slider is yours to set. The one observed project happened to be modular, so its method-specific figures are grouped separately. A contextual setback was approved administratively on that project with no Zoning Board case; the tool does not model approvals.
