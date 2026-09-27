# Data sources

Retrieved 2026-09-26 unless noted. Fallbacks that were actually used (not the spec's first-choice URL) are marked.

| Dataset | Publisher | Access | Used for |
|---|---|---|---|
| Property Assessments Parcel Data (for downloads) | Allegheny County via WPRDC | data.wprdc.org | parcel size, empty or not, owner type, assessed land value |
| Allegheny County Parcels (`OPENDATA/Parcels`) — **fallback; PASDA MapServer was not started** | Allegheny County GIS | openac-alcogis.opendata.arcgis.com | width and depth, overlays |
| Pittsburgh Zoning Districts | City of Pittsburgh via WPRDC | data.wprdc.org | shown per parcel; optional filter |
| Pittsburgh Zoning Code, Title 9 (§903.03, §911.02, Ch. 912, Ch. 914) | City of Pittsburgh | ecode360.com | code references beside each slider in METHODOLOGY |
| 25% or Greater Slope; Landslide Prone Areas; Undermined Areas; Greenways; Pittsburgh Steps | City of Pittsburgh via WPRDC | data.wprdc.org | site facts |
| FEMA National Flood Hazard Layer MapServer/28 — **fallback; `/gis/nfhl/` 404** | FEMA | hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28 | site fact |
| Public Water Supplier Service Areas | PA DEP via WPRDC | data.wprdc.org | site fact |
| Pittsburgh Street Centerline — **fallback; Allegheny County Street Centerlines title not found** | City of Pittsburgh via WPRDC | data.wprdc.org | frontage |
| Pittsburgh Neighborhoods | City of Pittsburgh via WPRDC | data.wprdc.org | map outlines and labels; neighborhood name per parcel |
| Allegheny County Property Sale Transactions | Allegheny County via WPRDC | data.wprdc.org | sale-price medians (Economics default $160 citywide; parcel-page reference is citywide because County NEIGHCODE does not join to City names) |
| City-Owned Properties | City of Pittsburgh via WPRDC | data.wprdc.org | owner filter |
| PRT stops | Pittsburgh Regional Transit via WPRDC | data.wprdc.org | near-transit filter |
| City of Pittsburgh Property Tax Delinquency — **fallback; `allegheny-county-tax-delinquency` 404** | City of Pittsburgh via WPRDC | data.wprdc.org | tax-delinquent filter |
| Allegheny County Mortgage Foreclosure Records | Allegheny County via WPRDC | data.wprdc.org | foreclosed filter |
| PLI Permits | City of Pittsburgh via WPRDC | data.wprdc.org | building pace 275 (2023=380, 2024=256, 2025=183, average 273, rounded to step 25) |
| HUD FY2026 Income Limits, Pittsburgh HUD Metro FMR Area (effective May 1, 2026) | HUD | huduser.gov | household-income default and affordability |
| Primary Mortgage Market Survey, 30-year fixed, week of Sept 24, 2026 | Freddie Mac | freddiemac.com/pmms | mortgage rate in the affordability calculation |
| Cost basis | 237 North Aiken LLC — completed modular two-unit, Pittsburgh (invoice-level cost build, 2023–2024) | private project records, summarized as unit costs in RULES.md | build-cost default and site adders |
