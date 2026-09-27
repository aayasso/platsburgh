import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { fit, fitAll } from "../lib/fit";
import { dumpRegulations, loadRegulations } from "../lib/params";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "../lib/rules";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];

const clean = lots.find((l) => l.id === "fixture-4000")!;
const flood = lots.find((l) => l.id === "fixture-flood")!;
const anchor = lots.find((l) => l.id === "0050M00032000000")!;
const unknownWater = lots.find((l) => l.id === "fixture-water-unknown")!;

const anchorBuilding = {
  widthFt: 16,
  depthFt: 64,
  stories: 3,
  units: 2,
  attached: false,
  adu: false,
};

function syntheticLot(i: number): Lot {
  return {
    ...clean,
    id: `syn-${i}`,
    lon: -80 + (i % 100) * 0.001,
    lat: 40.4 + Math.floor(i / 100) * 0.001,
  };
}

describe("§9 tests 1–8", () => {
  it("1. 40×100 4,000 sf parcel conforms at default building and regulations", () => {
    const result = fit(
      clean,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(result.conforming).toBe(true);
    expect(result.constraint).toBeNull();
  });

  it("2. minLotSf 5,000 → non-conforming, constraint lotSize", () => {
    const result = fit(
      clean,
      { ...DEFAULT_REGULATIONS, minLotSf: 5000 },
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(result.conforming).toBe(false);
    expect(result.constraint).toBe("Below minimum lot area");
    expect(result.checks.find((c) => c.id === "lotSize")?.pass).toBe(false);
  });

  it("3. 24×40 building with side setback 10 → envelope", () => {
    const result = fit(
      clean,
      { ...DEFAULT_REGULATIONS, sideSetbackFt: 10 },
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(result.conforming).toBe(false);
    expect(result.constraint).toBe("Setbacks exceed buildable area");
  });

  it("P, GI, and UI districts are excluded as non-residential when the site condition is on", () => {
    for (const district of ["P", "GI", "UI"] as const) {
      const lot = { ...clean, district };
      const excluded = fit(
        lot,
        DEFAULT_REGULATIONS,
        DEFAULT_CONSTRUCTION,
        DEFAULT_SITE_CONDITIONS,
      );
      expect(excluded.conforming).toBe(false);
      expect(excluded.constraint).toBe("Non-residential district");
      const included = fit(
        lot,
        DEFAULT_REGULATIONS,
        DEFAULT_CONSTRUCTION,
        { ...DEFAULT_SITE_CONDITIONS, skipNonResidential: false },
      );
      expect(included.constraint).not.toBe("Non-residential district");
    }
    expect(DEFAULT_SITE_CONDITIONS.skipNonResidential).toBe(true);
  });

  it("4. flood=true is site constraint while skipFlood on; conforms when off", () => {
    const excluded = fit(
      flood,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(excluded.conforming).toBe(false);
    expect(excluded.constraint).toBe("Flood zone");
    const included = fit(
      flood,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      { ...DEFAULT_SITE_CONDITIONS, skipFlood: false },
    );
    expect(included.conforming).toBe(true);
  });

  it("5. anchor parcel 0050M00032000000 matches calibration", () => {
    const storiesLimit = { ...DEFAULT_REGULATIONS, maxStories: 3 };
    const atDefaults = fit(
      anchor,
      storiesLimit,
      anchorBuilding,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(atDefaults.conforming).toBe(false);
    expect(atDefaults.constraint).toBe("Below minimum lot area");

    const minLotOnly = fit(
      anchor,
      { ...storiesLimit, minLotSf: 1200 },
      anchorBuilding,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(minLotOnly.conforming).toBe(false);
    expect(minLotOnly.constraint).toBe("Setbacks exceed buildable area");
    const env = minLotOnly.checks.find((c) => c.id === "envelope");
    expect(env?.pass).toBe(false);

    const rearOnly = fit(
      anchor,
      {
        ...storiesLimit,
        minLotSf: 1200,
        rearSetbackFt: 15,
        sideSetbackFt: 3,
        unitsPerLot: 2,
      },
      anchorBuilding,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(rearOnly.conforming).toBe(false);
    expect(rearOnly.constraint).toBe("Setbacks exceed buildable area");

    const yellow = fit(
      anchor,
      {
        ...storiesLimit,
        minLotSf: 1200,
        frontSetbackFt: 15,
        rearSetbackFt: 15,
        sideSetbackFt: 3,
        unitsPerLot: 2,
      },
      anchorBuilding,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(yellow.conforming).toBe(true);
    expect(yellow.checks.every((c) => c.pass)).toBe(true);
  });

  it("6. unknown water is listed, not a failure", () => {
    const result = fit(
      unknownWater,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(result.unknowns).toContain("water");
    expect(result.conforming).toBe(true);
    expect(result.checks.find((c) => c.id === "site")?.pass).toBe(true);
  });

  it("7. fitAll over 1,000 synthetic parcels < 50 ms", () => {
    const synthetic = Array.from({ length: 1000 }, (_, i) => syntheticLot(i));
    const start = performance.now();
    fitAll(
      synthetic,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      null,
    );
    expect(performance.now() - start).toBeLessThan(50);
  });

  it("8. regulations JSON round-trips with identical counts", () => {
    const original = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      null,
    );
    const loaded = loadRegulations(dumpRegulations(DEFAULT_REGULATIONS));
    const again = fitAll(
      lots,
      loaded,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      null,
    );
    expect(again.conformingParcels).toBe(original.conformingParcels);
    expect(again.conformingUnits).toBe(original.conformingUnits);
  });
});
