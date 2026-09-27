import { describe, expect, it } from "vitest";
import { countyAerialUrl, esriAerialUrl } from "../lib/aerial";
import { fit } from "../lib/fit";
import { zipHomeValuesFigure } from "../lib/parcelRefs";
import { annualTaxPerUnit, paybackYears } from "../lib/publicReturn";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
} from "../lib/rules";
import { decodeView, encodeView } from "../lib/urlState";
import type { Lot } from "../lib/types";
import lotsJson from "../data/fixtures/lots.json";

const clean = lotsJson.find((l) => l.id === "fixture-4000") as Lot;

describe("§9 test 21 Sunday sources", () => {
  it("condemned=true is excluded when skipCondemned is on", () => {
    const lot = { ...clean, condemned: true as const };
    const excluded = fit(
      lot,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      { ...DEFAULT_SITE_CONDITIONS, skipCondemned: true },
    );
    expect(excluded.conforming).toBe(false);
    expect(excluded.constraint).toBe("Condemned structure");
    const included = fit(
      lot,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(included.conforming).toBe(true);
    expect(DEFAULT_SITE_CONDITIONS.skipCondemned).toBe(false);
  });

  it("abatedThrough 2030 adds (2030 − current year) to payback", () => {
    const tax = annualTaxPerUnit(219_100, 0.015);
    const currentYear = 2026;
    const base = paybackYears(31_400, tax, null, currentYear);
    const shifted = paybackYears(31_400, tax, 2030, currentYear);
    expect(base).not.toBeNull();
    expect(shifted).toBeCloseTo(base! + (2030 - currentYear), 5);
  });

  it('zhviChange12m null renders "not available"', () => {
    expect(zipHomeValuesFigure(null)).toBe("not available");
  });

  it("the aerial renders with a fallback tile source", () => {
    expect(countyAerialUrl(clean)).toContain("AlleghenyCountyImagery2021");
    expect(esriAerialUrl(clean)).toContain("World_Imagery");
  });

  it("skipCondemned is in the URL as cond", () => {
    const q = encodeView({
      siteConditions: { ...DEFAULT_SITE_CONDITIONS, skipCondemned: true },
    });
    expect(q).toContain("cond=1");
    expect(decodeView(q).siteConditions.skipCondemned).toBe(true);
  });
});
