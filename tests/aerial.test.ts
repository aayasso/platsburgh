import { describe, expect, it } from "vitest";
import { AERIAL_SIZE_PX, aerialTilePlan, outlinePixelAspect } from "../lib/aerial";
import { geometryToRing } from "../lib/parcelBoundary";
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

  it("tiles cover the whole 320 px box, including side gutters", () => {
    const lot = { ...base } as Lot;
    const plan = aerialTilePlan(lot);
    const left = Math.min(...plan.tiles.map((t) => t.left));
    const right = Math.max(...plan.tiles.map((t) => t.left + t.width));
    const top = Math.min(...plan.tiles.map((t) => t.top));
    const bottom = Math.max(...plan.tiles.map((t) => t.top + t.height));
    expect(left).toBeLessThanOrEqual(0.5);
    expect(top).toBeLessThanOrEqual(0.5);
    expect(right).toBeGreaterThanOrEqual(AERIAL_SIZE_PX - 0.5);
    expect(bottom).toBeGreaterThanOrEqual(AERIAL_SIZE_PX - 0.5);
  });

  it("a 269 × 108 ft bbox ring fills at least 60% of the 320 px box width", () => {
    const lot = {
      ...base,
      id: "fixture-269x108",
      lotSf: 29210,
      widthFt: 269,
      depthFt: 108,
    } as Lot;
    const plan = aerialTilePlan(lot);
    const xs = plan.outline.map((p) => p[0]);
    const widthPx = Math.max(...xs) - Math.min(...xs);
    expect(widthPx / AERIAL_SIZE_PX).toBeGreaterThanOrEqual(0.6);
  });

  it("MultiPolygon outline uses the first polygon's outer ring", () => {
    const ring = geometryToRing({
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [-79.97, 40.45],
            [-79.969, 40.45],
            [-79.969, 40.451],
            [-79.97, 40.451],
            [-79.97, 40.45],
          ],
        ],
        [
          [
            [-79.98, 40.44],
            [-79.97, 40.44],
            [-79.97, 40.45],
            [-79.98, 40.45],
            [-79.98, 40.44],
          ],
        ],
      ],
    });
    expect(ring?.[0]).toEqual([-79.97, 40.45]);
    expect(ring?.[2]).toEqual([-79.969, 40.451]);
  });
});
