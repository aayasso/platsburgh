import { describe, expect, it } from "vitest";
import {
  OBSERVED_MARKS,
  economicsMarks,
  localCompsMedian,
  regulationMarks,
  salePriceMarks,
} from "../lib/observedMarks";
import type { Lot } from "../lib/types";

describe("§5g observed marks", () => {
  it("COPY.md stated values and labels", () => {
    expect(OBSERVED_MARKS.buildCostPerSf).toEqual([
      { value: 162, label: "site-built US avg $162" },
      { value: 260, label: "modular PGH $260" },
    ]);
    expect(OBSERVED_MARKS.salePriceCitywide).toEqual({ value: 160, label: "citywide $160" });
    expect(OBSERVED_MARKS.buyerIncome[0]).toEqual({ value: 79_500, label: "80% AMI $79,500" });
    expect(OBSERVED_MARKS.buildingPace[0]).toEqual({ value: 273, label: "2023–25 avg 273" });
    expect(OBSERVED_MARKS.mortgageRatePct[0]).toEqual({ value: 7.03, label: "PMMS 7.03%" });
    expect(OBSERVED_MARKS.minLotSf[0]).toEqual({ value: 3000, label: "code 3,000" });
    expect(OBSERVED_MARKS.frontSetbackFt[0]).toEqual({ value: 30, label: "code 30" });
    expect(OBSERVED_MARKS.rearSetbackFt[0]).toEqual({ value: 30, label: "code 30" });
    expect(OBSERVED_MARKS.sideSetbackFt[0]).toEqual({ value: 5, label: "code 5" });
    expect(OBSERVED_MARKS.maxStories[0]).toEqual({ value: 2, label: "code 2" });
  });

  it("sale-price local mark is the median compsPpsf of parcels in view", () => {
    const lots = [
      { compsPpsf: 100 },
      { compsPpsf: 200 },
      { compsPpsf: 300 },
    ] as Lot[];
    expect(localCompsMedian(lots)).toBe(200);
    const marks = salePriceMarks(200);
    expect(marks[0].label).toBe("citywide $160");
    expect(marks[1]).toEqual({ value: 200, label: "local 200" });
    expect(economicsMarks("salePricePerSf", null)?.map((m) => m.label)).toEqual(["citywide $160"]);
    expect(regulationMarks("minLotSf")?.[0].value).toBe(3000);
    expect(regulationMarks("unitsPerLot")).toBeUndefined();
  });
});
