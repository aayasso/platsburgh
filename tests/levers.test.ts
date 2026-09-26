import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { buildableEnvelope, fit } from "../lib/fit";
import { levers, type LeverParams } from "../lib/levers";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "../lib/rules";
import type { Economics, Lot } from "../lib/types";

const lots = lotsJson as Lot[];

const economics: Economics = {
  buildCostPerSf: 260,
  salePricePerSf: 200,
  buyerIncome: 79_500,
  subsidyPerUnit: 0,
  buildingPace: 500,
};

const baseParams: LeverParams = {
  regulations: { ...DEFAULT_REGULATIONS },
  construction: { ...DEFAULT_CONSTRUCTION },
  economics: { ...economics },
  siteConditions: { ...DEFAULT_SITE_CONDITIONS },
  siteFilters: { ...DEFAULT_SITE_FILTERS },
  viewBounds: null,
};

function failsOnlyParking(lot: Lot): boolean {
  const result = fit(
    lot,
    baseParams.regulations,
    baseParams.construction,
    baseParams.siteConditions,
  );
  const failed = result.checks.filter((c) => !c.pass);
  return failed.length === 1 && failed[0].id === "parking";
}

function failsEnvelopeByAtMost2ftWidth(lot: Lot): boolean {
  const result = fit(
    lot,
    baseParams.regulations,
    baseParams.construction,
    baseParams.siteConditions,
  );
  const failed = result.checks.filter((c) => !c.pass);
  if (!(failed.length === 1 && failed[0].id === "envelope")) return false;
  const env = buildableEnvelope(
    lot,
    baseParams.regulations,
    baseParams.construction,
  );
  const shortfall = baseParams.construction.widthFt - env.widthFt;
  return shortfall > 0 && shortfall <= 2;
}

describe("§9 tests 14–15", () => {
  it("14. eighteen ranked levers; parking and width deltas; atLimit last", () => {
    const rows = levers(lots, baseParams);
    expect(rows).toHaveLength(18);

    const parking = rows.find((r) => r.lever === "parkingPerUnit")!;
    expect(parking.from).toBe(1);
    expect(parking.to).toBe(0);
    const parkingParcels = lots.filter(failsOnlyParking).length;
    expect(parking.delta).toBe(parkingParcels * DEFAULT_CONSTRUCTION.units);

    const width = rows.find((r) => r.lever === "widthFt")!;
    expect(width.from).toBe(24);
    expect(width.to).toBe(22);
    const widthParcels = lots.filter(failsEnvelopeByAtMost2ftWidth).length;
    expect(width.delta).toBe(widthParcels * DEFAULT_CONSTRUCTION.units);

    const unitsLever = rows.find((r) => r.lever === "units")!;
    expect(unitsLever.atLimit).toBe(true);
    const aduLever = rows.find((r) => r.lever === "adu")!;
    expect(aduLever.atLimit).toBe(true);

    const limitIndex = rows.findIndex((r) => r.atLimit);
    expect(rows.slice(0, limitIndex).every((r) => !r.atLimit)).toBe(true);
    expect(rows.slice(limitIndex).every((r) => r.atLimit)).toBe(true);

    const movable = rows.filter((r) => !r.atLimit);
    for (let i = 1; i < movable.length; i++) {
      expect(Math.abs(movable[i].delta)).toBeLessThanOrEqual(
        Math.abs(movable[i - 1].delta),
      );
    }
  });

  it("15. levers never mutates the current parameters", () => {
    const snapshot = structuredClone(baseParams);
    levers(lots, baseParams);
    expect(baseParams).toEqual(snapshot);
  });
});
