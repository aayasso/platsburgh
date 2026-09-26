# Rules

Generated from `lib/rules.ts`. Do not edit by hand.

| Key | Label | Explanation | Min | Max | Step | Default | Code |
|---|---|---|---|---|---|---|---|
| minLotSf | Minimum lot area | A parcel must be at least this large to be developed. | 0 | 10000 | 100 | 3000 | §903.03 |
| frontSetbackFt | Front setback | Required distance from the front property line. | 0 | 40 | 1 | 30 | §903.03 |
| rearSetbackFt | Rear setback | Required distance from the rear property line. | 0 | 40 | 1 | 30 | §903.03 |
| sideSetbackFt | Side setback | Required distance from each side property line. | 0 | 20 | 1 | 5 | §903.03 |
| maxStories | Height limit | Maximum building height, in stories. | 1 | 12 | 1 | 2 | §903.03 |
| unitsPerLot | Units per parcel | Maximum dwelling units on one parcel. | 1 | 60 | 1 | 1 | §911.02 |
| parkingPerUnit | Parking per unit | Off-street parking spaces required per dwelling unit. | 0 | 2 | 1 | 1 | Ch. 914 |
| aduAllowed | ADUs permitted | Whether an accessory dwelling unit is permitted on the parcel. | 0 | 1 | 1 | false | Ch. 912 |
