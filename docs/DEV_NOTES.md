# Development notes

Retrieved 2026-09-26.

## 1. Assessments
Assessments resource: Property Assessments Parcel Data (for downloads) id=9a1c60bd-f9f7-4aba-aeb7-af8c3aaa44e5
City parcels (MUNICODE 101–132) scanned. Vacant-or-residential kept: 120881 (vacant USEDESC: 22354).
CLASSDESC counts (all city parcels scanned): {"RESIDENTIAL":118969,"COMMERCIAL":11378,"GOVERNMENT":10312,"OTHER":297,"UTILITIES":592,"INDUSTRIAL":840,"AGRICULTURAL":7}
Residential filter: CLASSDESC = RESIDENTIAL or USEDESC contains VACANT (CLASSDESC is present on the datastore; not in the BUILD_SPEC confirmed-field list).
Distinct USEDESC (all city parcels):
- 70708  SINGLE FAMILY
- 20443  VACANT LAND
- 8281  ROWHOUSE
- 7783  TWO FAMILY
- 7525  MUNICIPAL GOVERNMENT
- 4700  CONDOMINIUM
- 2400  TOWNHOUSE
- 2047  THREE FAMILY
- 1777  VACANT COMMERCIAL LAND
- 1427  RETL/APT'S OVER
- 1296  APART: 5-19 UNITS
- 1163  COMM AUX BUILDING
- 997  RES AUX BUILDING (NO HOUSE)
- 881  FOUR FAMILY
- 826  MUNICIPAL URBAN RENEWAL
- 624  CHURCHES, PUBLIC WORSHIP
- 562  PARKING GARAGE/LOTS
- 440  COUNTY GOVERNMENT
- 411  SMALL DETACHED RET(UNDER 10000)
- 408  OWNED BY COLLEGE/UNIV/ACADEMY
- 397  COMMERCIAL GARAGE
- 342  OFFICE/WAREHOUSE
- 337  WAREHOUSE
- 332  OWNED BY BOARD OF EDUCATION
- 311  OFFICE - 1-2 STORIES
- 291  CHARITABLE EXEMPTION/HOS/HOMES
- 269  R.R. - USED IN OPERATION
- 256  OFFICE/APARTMENTS OVER
- 234  CONDOMINIUM UNIT
- 233  RESTAURANT, CAFET AND/OR BAR
- 226  OWNED BY METRO HOUSING AU
- 225  COMMERCIAL/UTILITY
- 223  RETL/OFF OVER
- 217  PUBLIC PARK
- 210  APART:40+ UNITS
- 202  OFFICE-ELEVATOR -3 + STORIES
- 202  BUILDERS LOT
- 201  CONDOMINIUM COMMON PROPERTY
- 179  APART:20-39 UNITS
- 170  LIGHT MANUFACTURING
- 158  STATE GOVERNMENT
- 144  RETL/STOR OVER
- 127  VACANT INDUSTRIAL LAND
- 111  MEDICAL CLINICS/OFFICES
- 104  COMMUNITY URBAN RENEWAL
- 88  R.R. - NOT USED IN OPERATION
- 87  MOBILE HOME (IN PARK)
- 86  LODGE HALL/AMUSEMENT PARK
- 78  CONDOMINIUM OFFICE BUILDING
- 78  AUTO SALES & SERVICE
- 77  BANK
- 74  CONDO GARAGE UNITS
- 70  OFFICE-WALKUP -3 + STORIES
- 67  DAYCARE/PRIVATE SCHOOL
- 62  MOBILE HOME
- 58  CONVENIENCE STORE/GAS
- 57  BARS
- 56  OTHER
- 54  FUNERAL HOMES
- 50  MEDIUM MANUFACTURING
- 46  CONDO DEVELOPMENTAL LAND
- 45  HOTELS
- 45  INDEPENDENT LIVING (SENIORS)
- 45  CEMETERY/MONUMENTS
- 40  NEIGH SHOP CENTER
- 36  RIGHT OF WAY - RESIDENTIAL
- 34  FEDERAL GOVERNMENT
- 33  DWG USED AS OFFICE
- 32  WAREHOUSE/MULTI-TENANT
- 30  FAST FOOD/DRIVE THRU WINDOW
- 30  MINI WAREHOUSE
- 29  BOWLING ALLEYS/REC FACILITY
- 24  OFFICE/STORAGE OVER
- 23  NURSING HOME/PRIVATE HOS
- 22  GROUP HOME
- 22  PHARMACY (CHAIN)
- 21  DISTRIBUTION WAREHOUSE
- 20  COMMON AREA
- 20  SUPERMARKETS
- 18  CAR WASH
- 16  MUNICIPAL IMPROVEMENT
- 16  SMALL SHOP
- 15  DRY CLEANING PLANTS/LAUNDRIES
- 15  AIR RIGHTS
- 15  CONVENIENCE STORE
- 14  RIGHT OF WAY - COMMERCIAL
- 14  FOOD & DRINK PROCESSING
- 12  THEATER
- 12  DWG USED AS RETAIL
- 12  BED & BREAKFAST
- 11  COMMUNITY SHOPPING CENTER
- 11  DISCOUNT STORE
- 11  OFFICE/RETAIL OVER
- 10  OTHER RETAIL STRUCTURES
- 10  HUD PROJ #202
- 9  INDUSTRIAL/UTILITY
- 9  DRIVE IN REST OR FOOD SERVICE
- 8  CASINO
- 8  COMM APRTM CONDOS 5-19 UNITS
- 8  HEAVY MANUFACTURING
- 7  HUD PROJ #236
- 7  OTHER COMMERCIAL
- 7  INCOME PRODUCING PARKING LOT
- 7  AUTO SERV STATION
- 7  >10 ACRES VACANT
- 6  MARINA
- 5  FIRE DEPARTMENT/EMS
- 5  MOBILE HOMES/TRAILER PKS
- 4  DWG APT CONVERSION
- 4  COMM APRTM CONDOS 40+ UNITS
- 4  RECYCLING/SCRAP YARDS
- 3  HUD PROJ #221
- 3  GREENHOUSES, VEG & FLORACULTURE
- 3  HEAVY EQUIPMENT SALES/RENTAL
- 2  COUNTRY CLUBS
- 2  COMM APRTM CONDOS 20-39 UNITS
- 2  COMMON AREA OR GREENBELT
- 2  COMMERCIAL TRUCK TERMINAL
- 2  BIG BOX RETAIL
- 2  COAL RIGHTS, WORKING INTERESTS
- 2  MOTEL & TOURIST CABINS
- 1  OTHER COMMERCIAL HOUSING
- 1  HUD PROJ #213
- 1  HUD PROJ #232
- 1  COAL RIGHTS SEP. ROYALTY INTEREST
- 1  REGIONAL SHOPPING CENTER
- 1  HUD PROJ #207/223
- 1  OTHER FOOD SERVICE
- 1  RR-PP - USED IN OPERATION
- 1  COMMUNITY REINVESTMENT
- 1  CONVENIENCE STORE GAS/REPAIRS
- 1  MARINE SERV FACILITY
- 1  CONDEMNED/BOARDED-UP
- 1  DEPARTMENT STORE
- 1  H.O.A RECREATIONS AREA
- 1  RETENTION POND - RESIDENTIAL
- 1  TOWNSHIP GOVERNMENT
Capped at 40000 (vacant first).
Forced calibration PIN 0050M00032000000 into the 40000 cap (it is improved SINGLE FAMILY, so vacant-first cap had dropped it).
## 2. Geometry
Geometry cache: County gisdata OPENDATA/Parcels/MapServer/0, 39206 polygons, 106795 ms
Geometry cache missing 795 PINs; fetching from County.
PIN batch 0: +0
PIN batch 40: +0
PIN batch 80: +0
PIN batch 120: +1
PIN batch 160: +1
PIN batch 200: +1
PIN batch 240: +1
PIN batch 280: +1
PIN batch 320: +1
PIN batch 360: +1
PIN batch 400: +1
PIN batch 440: +1
PIN batch 480: +1
PIN batch 520: +1
PIN batch 560: +1
PIN batch 600: +1
PIN batch 640: +1
PIN batch 680: +1
PIN batch 720: +1
PIN batch 760: +2
Geometry after fill: 39208
## 3. Overlays
25%+ slope: package "25% or Greater Slope" resource GeoJSON https://data.wprdc.org/dataset/0f643c56-1c53-4c88-824d-3a3876c0d3a0/resource/5ce91a56-0799-46ea-9585-13fa8db5979e/download/slopes.geojson
25%+ slope: 1714 features after simplify
Landslide Prone Areas: package "Landslide Prone Areas" resource GeoJSON https://data.wprdc.org/dataset/6eb1be84-7abe-45c3-8a37-90db80ea6149/resource/b5b45ac6-f8ef-4805-b4e4-fc7c63fb4075/download/landslides.geojson
Landslide Prone Areas: 37 features after simplify
Undermined areas: package "Undermined Areas" resource GeoJSON https://data.wprdc.org/dataset/ea849f53-0aa9-4621-b9fb-e8dc323d3a9e/resource/e1d96015-818f-46fb-88dd-85c20eacb96c/download/undermined.geojson
Undermined areas: 47 features after simplify
Greenways (City): package "Greenways" resource GeoJSON https://data.wprdc.org/dataset/8820c384-1424-45dd-a2bb-366a6a7c6d1b/resource/7c2b901b-6328-4e40-99a3-4b5952cd6f31/download/greenways.geojson
Greenways (City): 10 features after simplify
Public Water Supplier Service Areas: package "Public Water Supplier Service Areas" resource Public Water Supplier Service Areas https://data.wprdc.org/dataset/a917bd77-69b0-4ac7-8304-73b4dcc65d61/resource/a7bd36fd-bf2d-4818-b6ef-a010cf039e31/download/public_water_systems_-_public_water_supplier_service_areas.geojson
Public Water Supplier Service Areas: 1792 features after simplify
Exact title "Allegheny County Street Centerlines" not found. Using Pittsburgh Street Centerline (city coverage).
Street centerlines: package "Pittsburgh Street Centerline" resource GeoJSON https://data.wprdc.org/dataset/9ebd073b-f637-4f33-a7c2-619d23dd085a/resource/8a38a51d-5000-4600-8114-3f9e92202a64/download/pgh_centerlines.geojson
Street centerlines: 19683 features after simplify
City steps: package "City of Pittsburgh Steps" resource City of Pittsburgh Steps https://data.wprdc.org/dataset/e9aa627c-cb22-4ba4-9961-56d9620a46af/resource/ff6dcffa-49ba-4431-954e-044ed519a4d7/download/___
City steps: 1128 features after simplify
Neighborhoods: package "Neighborhoods" resource GeoJSON https://data.wprdc.org/dataset/e672f13d-71c4-4a66-8f38-710e75ed80a4/resource/4af8e160-57e9-4ebf-a501-76ca1b42fc99/download/neighborhoods.geojson
Neighborhoods: 90 features after simplify
## FEMA flood (layer 28)
FEMA https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28 failed: 404 Not Found
FEMA SFHA polygons: 904 from https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28. Spec path /gis/nfhl/ 404s; working path is /arcgis/rest/services/public/NFHL/MapServer/28.
Zoning GeoJSON: 1069 features, zon_new present. Keys sample: OBJECTID, pghdb_sde_zoning_area, perimeter, zoning_, zoning_id, zon_new, shape_leng, correctionlabel, full_zoning_type, legendtype, municode, status, created_user, created_date, last_edited_user, last_edited_date, GlobalID, Shape__Area, Shape__Length
PRT stops: package "Pittsburgh Regional Transit Stops" resource PRT Stops (GeoJSON) https://data.wprdc.org/dataset/33d5f44b-5315-4374-b3e3-e4246e8ad5c9/resource/d6e6ed6e-9220-4a0e-9796-e72d83ce8e7a/download/stops.geojson
PRT stops: 6389 features after simplify
city-owned-properties: City-Owned Properties resource City-Owned Properties e1dcee82-9179-4306-8167-5891915b62a7
city-owned-properties: 12455 distinct PINs
NOT FOUND: allegheny-county-tax-delinquency: 404 NOT FOUND
city-of-pittsburgh-property-tax-delinquency: City of Pittsburgh Property Tax Delinquency resource Tax Delinquency ed0d1550-c300-4114-865c-82dc7c23235b
city-of-pittsburgh-property-tax-delinquency: 27527 distinct PINs
allegheny-county-mortgage-foreclosure-records: Allegheny County Mortgage Foreclosure Records resource Foreclosure Filings 859bccfd-0e12-4161-a348-313d734f25fd
allegheny-county-mortgage-foreclosure-records: 29821 distinct PINs
PRT stop points: 6389
## 4. Assemble lots.json
assembled 2000 in 10507 ms
assembled 4000 in 20257 ms
assembled 6000 in 30313 ms
assembled 8000 in 41460 ms
assembled 10000 in 51702 ms
assembled 12000 in 62415 ms
assembled 14000 in 73554 ms
assembled 16000 in 83721 ms
assembled 18000 in 95542 ms
assembled 20000 in 105895 ms
assembled 22000 in 119031 ms
assembled 24000 in 127847 ms
assembled 26000 in 135799 ms
assembled 28000 in 145389 ms
assembled 30000 in 154851 ms
assembled 32000 in 163736 ms
assembled 34000 in 172842 ms
assembled 36000 in 181704 ms
assembled 38000 in 190475 ms
assemble done in 195298 ms
Wrote data/lots.json: 39207 lots (39207 with geometry of 40000 vacant-or-residential).
Unknown counts: {"flood":0,"water":0,"landslide":0,"undermined":0,"greenway":0,"slopeShare":0,"transitDistM":0,"taxDelinquent":0,"foreclosure":0}
## Sales medians
Sales package title: Allegheny County Property Sale Transactions
No validation dictionary resource found; fallback SALEDESC = VALID SALE, else SALEPRICE ≥ 10000.
Sales price field: PRICE
Arm's-length sales last 24 months with living area: 7463. Citywide median $/sf: 161.14285714285714
## Building pace
PLI permits: PLI Permits f4d1177a-f597-4c32-8cbf-7885f56253f6
PLI permit fields: _id, permit_id, permit_type, owner_name, contractor_name, work_description, work_type, commercial_or_residential, total_project_value, issue_date, parcel_num, address, latitude, longitude, council_district, neighborhood, ward, zip_code, status
Pace from PLI: {"2023":380,"2024":256,"2025":183} avg 273
## 5. Anchor 0050M00032000000
{
  "id": "0050M00032000000",
  "address": "237 N AIKEN AVE, PITTSBURGH, PA 15206",
  "neighborhood": "Garfield",
  "district": "R2-H",
  "lotSf": 2129,
  "widthFt": 21.54,
  "depthFt": 98.84,
  "hasStreetFrontage": true,
  "stepsOnly": false,
  "slopeShare": 0,
  "landslide": false,
  "undermined": false,
  "flood": false,
  "greenway": false,
  "water": true,
  "empty": false,
  "owner": "other",
  "assessedLand": 25000,
  "lon": -79.935451,
  "lat": 40.466787,
  "transitDistM": 47.5,
  "taxDelinquent": false,
  "foreclosure": false
}
Anchor flood=false slopeShare=0 landslide=false undermined=false water=true
Citywide sale median $/sf: 161.14285714285714 from 7463 sales.

## Report

- **lots.json:** 39,207 parcels, all with geometry (of 40,000 vacant-or-residential after cap; 793 in the cap had no polygon). File 17 MB.
- **Unknown facts:** 0 for flood, water, landslide, undermined, greenway, slopeShare, transitDistM, taxDelinquent, foreclosure after fallbacks.
- **Sales:** price field is `PRICE`. No "Sales Validation Codes Dictionary" resource on the package; used `SALECODE` 0 / `SALEDESC` containing VALID SALE, else `PRICE` ≥ $10,000. Citywide median **$161.14 / sf** from **7,463** arm's-length sales in the prior 24 months joined to `FINISHEDLIVINGAREA`. Slider default rounded to step 5: **160**.
- **Pace:** PLI `work_type` = New Construction and `commercial_or_residential` = Residential, counted as one unit per permit (no unit-count field). Years 2023=380, 2024=256, 2025=183, average **273**. Slider default rounded to step 25: **275**.
- **fitAll** over the whole file: **22.1 ms** (under 200 ms).
- **Anchor width:** 21.54 ft vs calibration 22 ft. Not a frontage() bug — longest street-adjacent edge on the County polygon is 21.54 ft; depth 98.84 = 2129 / 21.54.
- **Anchor empty:** assessment `USEDESC` is SINGLE FAMILY, `YEARBLT` 2024, so `empty` is false in the live file. Calibration fixture models the lot before construction.
- **Anchor assessedLand:** live FAIRMARKETLAND is **25000** (calibration fixture used 13000).
- **PASDA** MapServer was not started / `/gis/nfhl/` FEMA path 404. Geometry from County `OPENDATA/Parcels` (fields `CALCACREAGE`, `MAPBLOCKLOT`). Flood from `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28`.
- **Streets:** exact title "Allegheny County Street Centerlines" not found; used **Pittsburgh Street Centerline**.
- **Delinquency:** slug `allegheny-county-tax-delinquency` 404; used `city-of-pittsburgh-property-tax-delinquency`.

## Workspace UI (`/`)

- Design tokens live in `app/index.css` and `tailwind.config.ts` (HSL, including `--centerline`). Body fonts: Barlow Condensed, Inter, IBM Plex Mono.
- MapLibre style: OpenFreeMap `https://tiles.openfreemap.org/styles/dark`. On style error, falls back to a token `map-bg` empty style so dots and neighborhood outlines still draw.
- Client loads parcels from `/lots.json` (symlink `public/lots.json` → `data/lots.json`), then `/api/lots`.
- URL state keys per BUILD_SPEC §5f. `vacantOnly` defaults **on** in the workspace (engine default remains off for tests). Economics defaults: sale **160**, pace **275**.
- `fitAll` / ladder / LEVERS / CONSTRAINTS / PARCELS / CSV all use the map's current bounds plus Site filters. Recalc debounce 60 ms on sliders; levers 300 ms; map `moveend` updates `lat,lng,z` and bounds.
- Parcel page `/parcel/[id]` is the full COMPLIANCE + SITE CONDITIONS + PRO FORMA view per BUILD_SPEC §7 and COPY.md. Shared economics (cost, price, income, subsidy) and the five TERMS (`rate, down, ratio, tax, ins`) live in the URL with the workspace. `land` and `sitecost` are parcel-only overrides. SUMMARY is omitted unless `ANTHROPIC_API_KEY` is set; the route validates that Claude introduces no numbers absent from the COMPLIANCE lines.
- METHODOLOGY lists regulation sliders, economics sliders, and the five household terms from `lib/rules.ts`. Buttons are **DOWNLOAD** / **LOAD** (COPY.md). Pace and public-return sentences from §5d/§5e are in the drawer; those two sentences were added to COPY.md because they appear on screen.
- DOWNLOAD CSV writes the current PARCELS list (in-view, Site-filtered). SOURCES uses retrieved 2026-09-26 and the fallbacks actually used: County `OPENDATA/Parcels` (not PASDA), Pittsburgh Street Centerline, City of Pittsburgh property tax delinquency, FEMA `/arcgis/rest/services/public/NFHL/MapServer/28`.
- `data/sales_medians.json` is keyed by County `NEIGHCODE` (`byNeighcode`). `lots.neighborhood` is the City neighborhood name from the Neighborhoods GeoJSON. Those keys do not join without guessing a code, so the parcel-page reference line uses the citywide median **$161/sf** from **7,463** sales (COPY still reads “Sales in this neighborhood”).
- **Live 0050M00032000000 (237 N Aiken):** assessment `USEDESC` is SINGLE FAMILY, `YEARBLT` 2024, `empty` is false — it only appears on the map with **Vacant parcels only** unchecked. Width is **21.54 ft** (not the calibration 22 ft), so even at min lot 1,200 · front 15 · rear 15 · side 3 · units 2 the buildable width is 15.54 ft vs a 16 ft building and COMPLIANCE still fails setbacks. Test 5 still passes against `data/fixtures/lots.json` (22 × 96.79, vacant, land 13,000). Height limit must be 3 (`stories=3`) with the 3-story building or Height FAILs at the default limit of 2.

## Performance (2026-09-26, Node, 39,207 parcels)

- `fitAll` citywide: **17.7 ms** (budget 200 ms).
- `evaluateWorkspace` (slider-drag path, citywide bounds): **18 ms** vacant-only, **23 ms** all parcels (budget 100 ms for recolor compute; MapLibre `setData` is the remaining paint).
- `levers` citywide bounds: **161 ms** (budget 3 s).

`scripts/audit-strings.ts` walks `app/` and `components/` except `app/api` (not on-screen) and `components/ui` (Tailwind/shadcn). Template placeholders in COPY.md are stripped before the diff.

## Not built

- `/api/health` (BUILD_SPEC §11).
- Hosted/Vercel URL; run `npm run dev` locally.
- Parcel-page neighborhood sale median by City name (sales file is County NEIGHCODE only).
- Footer line on the map workspace (it would sit under the bottom bar); parcel page and `/docs` show it.
- `docs/brand/lasalle-brand-specimen.html` is the upstream brand file and still contains LaSalle product names with “Score”; it is not UI copy.

- Basemap is OpenFreeMap dark (no token). MapLibre's worker is served from `/maplibre-gl-worker.mjs` (copied into `public/` with `maplibre-gl-shared.mjs`) because Next/Turbopack does not load the default worker URL. If the style fails, a plain `map-bg` canvas still shows dots and neighborhood outlines.

## Ground truth data (comps, ZIP, SAFMR)

- **Comps by distance:** median $/finished sq ft of arm's-length sales within 800 m over the prior 24 months. Spatial grid 400 m; **7286** of **7463** sales geocoded (County PIN fetch for sales not in the 40k lots file). Assigned on **39,207** parcels in **445 ms**.
- **ZIP:** `PROPERTYZIP` from assessments, five digits, on every parcel in lots.json.
- **HUD FY2026 Small Area FMRs:** `https://www.huduser.gov/portal/datasets/fmr/fmr2026/fy2026_safmrs.xlsx` (38,601 ZIP rows). 2-bedroom column `SAFMR 2BR`. Every parcel in this file matched a ZIP. If the file is unreachable, use Pittsburgh HUD Metro FMR Area 2-bedroom FMR **$1,299** and set `fmrMetro` so the parcel page reads "metro".
