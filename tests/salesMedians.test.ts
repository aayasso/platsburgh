import { describe, expect, it } from "vitest";
import { DEFAULT_ECONOMICS } from "../lib/rules";
import {
  DEFAULT_SALE_PRICE_PER_SF,
  NEW_CONSTRUCTION_MEDIAN_PER_SF,
  NEW_CONSTRUCTION_SALE_COUNT,
} from "../lib/salesMedians";

describe("new-construction sale median", () => {
  it("count ≥ 50 sets the slider default to the median rounded to $5", () => {
    expect(NEW_CONSTRUCTION_SALE_COUNT).toBe(226);
    expect(NEW_CONSTRUCTION_MEDIAN_PER_SF).toBeCloseTo(336.2805642612209, 6);
    expect(DEFAULT_SALE_PRICE_PER_SF).toBe(335);
    expect(DEFAULT_ECONOMICS.salePricePerSf).toBe(335);
  });
});
