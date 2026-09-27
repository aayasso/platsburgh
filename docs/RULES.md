# Rules

Generated from `lib/rules.ts`. Do not edit by hand.

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
| buildCostPerSf | Construction cost per sq ft | Hard cost per finished square foot, excluding land. Land and site conditions are added from parcel records. | 80 | 400 | 5 | 260 | 237 N Aiken actual, 2023–24 |
| salePricePerSf | Sale price per sq ft | Market value per finished square foot. | 60 | 500 | 5 | 160 | WPRDC sales, prior 24 months, retrieved 2026-09-26 |
| buyerIncome | Household income | The household the units should be affordable to. | 30000 | 250000 | 1000 | 79500 | HUD FY2026, 80% of area median, 3-person household |
| subsidyPerUnit | Subsidy per unit | Public capital contributed per unit. | 0 | 150000 | 5000 | 0 | user-defined |
| buildingPace | Building pace | New residential units the city builds per year. | 50 | 3000 | 25 | 275 | City of Pittsburgh PLI permits, last three full years (2023–2025) |
| mortgageRate | Mortgage rate | Freddie Mac PMMS, week of Sept 24, 2026. | 4 | 9 | 0.05 | 7.03 | Freddie Mac PMMS 2026-09-24 |
| downPaymentPct | Down payment | Share of price paid in cash at purchase. | 3.5 | 25 | 0.5 | 3.5 | assumed |
| incomeToHousing | Income to housing | Share of household income spent on housing. | 25 | 40 | 1 | 30 | assumed |
| propertyTaxRate | Property tax rate | Effective rate on unit price. | 0.5 | 3 | 0.05 | 1.5 | assumed |
| insurancePerMonth | Insurance | Monthly homeowners insurance. | 50 | 300 | 5 | 125 | assumed |
