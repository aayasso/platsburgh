import { describe, expect, it } from "vitest";
import { filterDistrictOptions } from "../lib/districtOptions";

describe("SITE zoning district picker", () => {
  it("filters district codes case-insensitively and keeps the full list when the query is empty", () => {
    const all = ["R1D-L", "R2-H", "UI", "GI"];
    expect(filterDistrictOptions(all, "")).toEqual(all);
    expect(filterDistrictOptions(all, "r1")).toEqual(["R1D-L"]);
    expect(filterDistrictOptions(all, "I")).toEqual(["UI", "GI"]);
  });
});
