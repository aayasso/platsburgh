import { describe, expect, it } from "vitest";
import {
  AERIAL_SIZE_PX,
  aerialTilePlan,
  fallbackRing,
  geometryMismatch,
  outlinePixelAspect,
} from "../lib/aerial";
import { geometryToRing } from "../lib/parcelBoundary";
import { confirmBeforeYouAct } from "../lib/nextSteps";
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
    const sized = { ...base, id: "fixture-269x108", lotSf: 29210, widthFt: 269, depthFt: 108 } as Lot;
    const ring = fallbackRing(sized);
    const lot = { ...sized, widthFt: 43, depthFt: 267, ring } as Lot;
    const plan = aerialTilePlan(lot);
    const xs = plan.outline.map((p) => p[0]);
    const widthPx = Math.max(...xs) - Math.min(...xs);
    expect(widthPx / AERIAL_SIZE_PX).toBeGreaterThanOrEqual(0.6);
    expect(geometryMismatch(ring, lot.widthFt, lot.depthFt)).toBe(true);
  });

  it("draws the County ring even when it disagrees with the lot record", () => {
    const sliverLot = { ...base, widthFt: 43, depthFt: 267 } as Lot;
    const ring = fallbackRing(sliverLot);
    const lot = { ...base, widthFt: 269, depthFt: 108, lotSf: 29210, ring } as Lot;
    const plan = aerialTilePlan(lot);
    expect(outlinePixelAspect(plan)).toBeGreaterThan(5);
  });

  it("geometryMismatch is true when either bbox side differs by more than 25%", () => {
    const ring = fallbackRing({ ...base, widthFt: 24, depthFt: 100 } as Lot);
    expect(geometryMismatch(ring, 24, 100)).toBe(false);
    expect(geometryMismatch(ring, 269, 108)).toBe(true);
  });

  it("CONFIRM BEFORE YOU ACT prepends the mapped-shape line when the flag is set", () => {
    const lines = confirmBeforeYouAct({ ...base, geometryMismatch: true } as Lot);
    expect(lines[0]).toBe(
      "The County's mapped parcel shape does not match its assessed lot area; verify the boundary before relying on frontage or buildable area.",
    );
    expect(confirmBeforeYouAct({ ...base } as Lot)[0]).toMatch(/^Frontage and depth/);
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
