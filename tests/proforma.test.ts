import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { fitAll } from "../lib/fit";
import { formatPaceYears, yearsToBuild } from "../lib/pace";
import { dumpEconomics, loadEconomics } from "../lib/params";
import {
  affordablePrice,
  proforma,
} from "../lib/proforma";
import { formatPayback, paybackYears, annualTaxPerUnit } from "../lib/publicReturn";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_ECONOMICS,
  DEFAULT_HOUSEHOLD,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "../lib/rules";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];
const clean = lots.find((l) => l.id === "fixture-4000")!;
const anchor = lots.find((l) => l.id === "0050M00032000000")!;

const anchorBuilding = {
  widthFt: 16,
  depthFt: 64,
  stories: 3,
  units: 2,
  attached: false,
  adu: false,
};

describe("§9 tests 9–13, 17–18", () => {
  it("9. anchor cost within ±10% of documented total", () => {
    const pf = proforma(
      anchor,
      anchorBuilding,
      { ...DEFAULT_ECONOMICS, buildCostPerSf: 260 },
      DEFAULT_HOUSEHOLD,
    );
    expect(pf.finishedSf).toBe(3072);
    expect(pf.cost).toBe(260 * 3072 + 13000 + 20200);
    expect(pf.cost).toBe(831_920);
    expect(Math.abs(pf.cost - 853_890) / 853_890).toBeLessThanOrEqual(0.1);
  });

  it("10. pro forma gap, subsidy, and sale-price constraint", () => {
    const econ = { ...DEFAULT_ECONOMICS, buildCostPerSf: 260, salePricePerSf: 200 };
    const pf = proforma(clean, DEFAULT_CONSTRUCTION, econ, DEFAULT_HOUSEHOLD);
    expect(pf.finishedSf).toBe(1920);
    expect(pf.feasible).toBe(false);
    expect(pf.gapToFeasible).toBe(125_200);
    expect(pf.breakEvenSubsidyPerUnit).toBe(125_200);
    expect(pf.constraint).toBe("Not feasible — sale prices");

    const funded = proforma(
      clean,
      DEFAULT_CONSTRUCTION,
      { ...DEFAULT_ECONOMICS, buildCostPerSf: 260, salePricePerSf: 200, subsidyPerUnit: 130_000 },
      DEFAULT_HOUSEHOLD,
    );
    expect(funded.feasible).toBe(true);
  });

  it("11. affordability at 79,500 vs 200,000", () => {
    const highPrice = proforma(
      clean,
      DEFAULT_CONSTRUCTION,
      { ...DEFAULT_ECONOMICS, salePricePerSf: 300 },
      DEFAULT_HOUSEHOLD,
    );
    expect(highPrice.feasible).toBe(true);
    expect(highPrice.unitPrice).toBe(576_000);
    expect(highPrice.buyerMax).toBeLessThan(576_000);
    expect(highPrice.affordable).toBe(false);
    expect(highPrice.constraint).toBe("Not affordable at household income");
    expect(highPrice.subsidyForAffordable).toBeCloseTo(
      (highPrice.cost - highPrice.buyerMax) / 1,
      0,
    );
    expect(highPrice.subsidyForAffordable).toBeGreaterThan(0);

    const richer = proforma(
      clean,
      DEFAULT_CONSTRUCTION,
      {
        ...DEFAULT_ECONOMICS,
        salePricePerSf: 300,
        buyerIncome: 200_000,
      },
      DEFAULT_HOUSEHOLD,
    );
    expect(richer.affordable).toBe(true);

    const cap = affordablePrice(79_500, DEFAULT_HOUSEHOLD);
    expect(cap).toBeLessThan(576_000);
    expect(affordablePrice(200_000, DEFAULT_HOUSEHOLD)).toBeGreaterThan(576_000);
  });

  it("12. ladder is monotonic: conforming ≥ feasible ≥ affordable", () => {
    const all = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      null,
    );
    const units = DEFAULT_CONSTRUCTION.units;
    let conforming = 0;
    let feasible = 0;
    let affordable = 0;
    for (const row of all.results) {
      if (!row.inView || !row.fit.conforming) continue;
      conforming += units;
      const pf = proforma(
        row.lot,
        DEFAULT_CONSTRUCTION,
        DEFAULT_ECONOMICS,
        DEFAULT_HOUSEHOLD,
      );
      if (pf.feasible) feasible += units;
      if (pf.affordable) affordable += units;
    }
    expect(conforming).toBeGreaterThanOrEqual(feasible);
    expect(feasible).toBeGreaterThanOrEqual(affordable);
  });

  it("13. economics JSON round-trips", () => {
    const loaded = loadEconomics(dumpEconomics(DEFAULT_ECONOMICS));
    const a = proforma(clean, DEFAULT_CONSTRUCTION, DEFAULT_ECONOMICS, DEFAULT_HOUSEHOLD);
    const b = proforma(clean, DEFAULT_CONSTRUCTION, loaded, DEFAULT_HOUSEHOLD);
    expect(b.cost).toBe(a.cost);
    expect(b.feasible).toBe(a.feasible);
    expect(loaded).toEqual(DEFAULT_ECONOMICS);
  });

  it("17. pace 3,100 units at 500/yr is 6.2 years, shown as 6 YEARS", () => {
    expect(yearsToBuild(3100, 500)).toBeCloseTo(6.2);
    expect(formatPaceYears(yearsToBuild(3100, 500))).toBe("6 YEARS");
    expect(() => yearsToBuild(3100, 0)).toThrow();
  });

  it("18. public return payback rounding and zero subsidy", () => {
    const tax = annualTaxPerUnit(219_100, 0.015);
    expect(tax).toBeCloseTo(3286.5, 1);
    const years = paybackYears(31_400, tax);
    expect(years).toBeCloseTo(9.6, 1);
    expect(formatPayback(years)).toBe("10 YEARS");
    expect(formatPayback(paybackYears(0, tax))).toBe("no subsidy required");
  });
});
