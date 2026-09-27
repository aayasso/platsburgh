import { describe, expect, it } from "vitest";
import { observedMarkLegend } from "../lib/observedMarkLayout";

describe("observed-mark legend", () => {
  it("lists labels in ascending value order separated by middots", () => {
    expect(
      observedMarkLegend([
        { value: 260, label: "2024 build $260" },
        { value: 162, label: "site-built $162" },
      ]),
    ).toBe("site-built $162 · 2024 build $260");
    expect(
      observedMarkLegend([
        { value: 335, label: "new construction $335" },
        { value: 113, label: "local $113" },
        { value: 160, label: "citywide $160" },
      ]),
    ).toBe("local $113 · citywide $160 · new construction $335");
  });
});
