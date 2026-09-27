import { describe, expect, it } from "vitest";
import { aerialTilePlan, outlinePixelAspect } from "../lib/aerial";
import type { Lot } from "../lib/types";

const base = {
  id: "fixture-24x100",
  address: "1",
  neighborhood: "Garfield",
  district: "R1D-L",
  lotSf: 2400,
  widthFt: 24,
  depthFt: 100,
  hasStreetFrontage: true,
  stepsOnly: false,
  slopeShare: 0 as const,
  landslide: false as const,
  undermined: false as const,
  flood: false as const,
  greenway: false as const,
  water: true as const,
  empty: true,
  owner: "other" as const,
  assessedLand: 1,
  lon: -79.97,
  lat: 40.45,
  transitDistM: 100,
  taxDelinquent: false as const,
  foreclosure: false as const,
};

describe("aerial outline", () => {
  it("a 24 × 100 ft parcel outline has pixel aspect ratio about 1:4", () => {
    const lot = { ...base } as Lot;
    const plan = aerialTilePlan(lot);
    const aspect = outlinePixelAspect(plan);
    expect(aspect).toBeGreaterThan(3.5);
    expect(aspect).toBeLessThan(4.8);
    expect(plan.tiles.length).toBeGreaterThan(0);
    expect(plan.path.startsWith("M")).toBe(true);
  });
});
