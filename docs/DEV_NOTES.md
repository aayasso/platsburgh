# Development notes

This run did not download data.

## Stubs (no live sources)

- **Sale price per sq ft default = 200.** BUILD_SPEC §5b sets the default to the citywide median of arm’s-length sales over the prior 24 months. Sales were not loaded. The slider default is 200 until `scripts/build-lots.ts` exists and `real-estate-sales` is read. The price field name on that dataset was not confirmed.
- **Building pace default = 500.** BUILD_SPEC §5d would take the average annual new residential units permitted over the last three full calendar years (PLI permits, then Census BPS). Permits were not loaded. §5d fallback: slider default 500, labeled assumed. Yearly counts: not retrieved.

## Geometry / parcels

Citywide `data/lots.json` was not built. Engine tests use `data/fixtures/lots.json` only (six records), including PIN `0050M00032000000` with lot facts from CALIBRATION_237_N_AIKEN.md (`assessedLand` fixture value 13000).

## Copy gap

`skipGreenway` is always on in §5. COPY.md has no constraint line for greenway. `fit()` returns the key `greenway` if that exclusion hits. Fixtures have `greenway: false`, so tests do not surface it.

## Anchor cost

Test 9: 16 × 64 × 3 on the calibration parcel at $260/sf + land 13,000 + width-under-25 adder 20,200 = **$831,920**, within ±10% of $853,890 (BUILD_SPEC §8 / test 9).
