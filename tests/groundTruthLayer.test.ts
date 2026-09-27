import { describe, expect, it } from "vitest";
import { PITTSBURGH_METRO_FMR_2BR } from "../lib/fmr";
import { GROUND_TRUTH } from "../lib/groundTruth";
import { OBSERVED_MARKS } from "../lib/observedMarks";
import { salesWithinHalfMileLine, typicalRentLine } from "../lib/parcelRefs";
import type { Lot } from "../lib/types";

const base = {
  id: "x",
  address: "1",
  neighborhood: "Garfield",
  district: "R1D-L",
  lotSf: 4000,
  widthFt: 40,
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
  lon: -80,
  lat: 40.4,
  transitDistM: 100,
  taxDelinquent: false as const,
  foreclosure: false as const,
};

describe("§9 test 20 ground truth", () => {
  it("observed-mark values match COPY.md", () => {
    expect(OBSERVED_MARKS.buildCostPerSf[0].value).toBe(260);
    expect(OBSERVED_MARKS.salePriceCitywide.value).toBe(160);
    expect(OBSERVED_MARKS.buyerIncome[0].value).toBe(79_500);
    expect(OBSERVED_MARKS.buildingPace[0].value).toBe(273);
    expect(OBSERVED_MARKS.mortgageRatePct[0].value).toBe(7.03);
    expect(OBSERVED_MARKS.minLotSf[0].value).toBe(3000);
    expect(OBSERVED_MARKS.frontSetbackFt[0].label).toBe("code 30");
    expect(OBSERVED_MARKS.maxStories[0].value).toBe(2);
  });

  it("GROUND TRUTH table is rendered from lib/groundTruth.ts", () => {
    expect(GROUND_TRUTH.length).toBe(24);
    expect(GROUND_TRUTH.map((r) => r.item).join("\n")).toContain("Building permit fee");
  });

  it("compsN < 5 shows the citywide median labeled citywide", () => {
    const lot = { ...base, compsN: 4, compsPpsf: 220 } as Lot;
    const line = salesWithinHalfMileLine(lot);
    expect(line).toContain("citywide");
    expect(line).toContain("Sales within ½ mile");
    expect(line).not.toContain("220");
  });

  it("fmr2br null shows the metro figure labeled metro", () => {
    const lot = { ...base, zip: "15206", fmr2br: null, fmrMetro: true } as Lot;
    const line = typicalRentLine(lot);
    expect(line).toContain("metro");
    expect(line).toContain(String(PITTSBURGH_METRO_FMR_2BR.toLocaleString("en-US")));
    expect(line).toContain("rental path not modeled");
  });
});
