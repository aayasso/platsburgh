# CALIBRATION — 237 North Aiken Ave (the lot Evan actually built on)

One lot where the real answer is known. It is a fixture, a test, and the credibility moment in the video. Facts come from the project's own documents.

## Lot facts (goes into `data/fixtures/lots.json` as the anchor record)
```
id:                0050M00032000000
address:           237 N Aiken Ave, Pittsburgh, PA 15206
neighborhood:      Garfield
district:          R2-H
lotSf:             2129
widthFt:           22
depthFt:           96.79
hasStreetFrontage: true
stepsOnly:         false
slopeShare:        0
landslide:         false
undermined:        false
flood:             false        (FEMA Zone X)
greenway:          false
water:             true         (PWSA)
empty:             true         (as of the build; today it is improved — the fixture models the lot before construction)
owner:             'other'
assessedLand:      use the live assessment value; fixture may use 13000
```

## The building that was actually built there
Volumetric modular, three 16×64 modules stacked, so: **width 16, depth 64, floors 3, units 2**, Attached unchecked, ADU checked is also valid (the ground floor is an ADU-style unit — either way, 2 units in the headline).
Footprint 15'5" × 63'4" ≈ 976 sq ft. Finished area 2,667 sq ft (marketed). Documented total cost $853,889.66.

## What COMPLIANCE must show (this is test 5)
With the Construction sliders at 16 × 64 × 3, 2 units, and the height limit at 3:
| Parameters | Check | Numbers on the parcel page | Result |
|---|---|---|---|
| Defaults (min lot 3,000) | Lot area | 2,129 sq ft vs minimum 3,000 | non-conforming — constraint: Below minimum lot area |
| Min lot 1,200; everything else default (rear 30, side 5) | Room after setbacks | width 22 − 2×5 = 12 ft vs building 16; depth 96.79 − 30 − 30 = 36.79 ft vs building 64 | non-conforming — constraint: Setbacks exceed buildable area |
| Min lot 1,200; rear 15; side 3; units per lot 2 | Room after setbacks | width 22 − 6 = 16 ft ≥ 16; depth 96.79 − 30 − 15 = 51.79 — still < 64 | non-conforming — constraint: Setbacks exceed buildable area (front setback is the remaining blocker) |
| Min lot 1,200; front 15; rear 15; side 3; units per lot 2 | all eight | width 16 ≥ 16; depth 66.79 ≥ 64; units 2 ≤ 2; frontage 22 ≥ 20; parking: 22 ≥ 20 | **conforming** |

So the settings that turn 237 N Aiken yellow are: minimum lot size ≤ 2,100, front ≤ 32, rear ≤ 32 with front + rear ≤ 32.79, side ≤ 3, units per lot ≥ 2, floors ≥ 3. The video uses: min lot 1,200 · front 15 · rear 15 · side 3 · units 2.

The parcel page must show all eight COMPLIANCE lines with these numbers, PASS or FAIL, and SITE CONDITIONS all clear except sewer: "not available in open data — confirm with PWSA."

## Cost check (test 9)
Building 16 × 64 × 3, 2 units, on this lot: `lib/cost.ts` must return a total within ±8% of $853,890 with the anchor unit costs and the width-under-25 staging and street adders applied (this lot is 22 ft wide; the real project paid $14,000 for neighbor staging and ~$6,200 for street permits and cones).

## What this lot teaches (for LIMITATIONS.md and the video)
1. Under the code as written, this building did not conform to its parcel at standard setbacks; it was approved anyway with no Zoning Board case — narrow-lot infill in Pittsburgh often gets a contextual setback. The tool shows what a parameter set allows; it does not predict approvals. Say so.
2. The expensive surprises were not zoning: a five-month stormwater review ($12,716), utility change orders ($4,670), street logistics (~$6,200), and a $14,000 neighbor staging agreement. Those are the cost adders the tool carries, labeled with their source.
3. Finished square footage has five different values across the project's own documents. The tool uses 2,667 and says so.

## Video use (20–30 seconds)
"This is the parcel I actually built on. At the default parameters it's gray — 2,129 square feet against a 3,000 minimum. Set the minimum to 1,200, front and rear to 15, side to 3, units to 2 — it turns yellow, and now you see every other parcel in the city where that same building conforms. The construction cost in its pro forma comes from this project's own invoices: $854,000 documented."
