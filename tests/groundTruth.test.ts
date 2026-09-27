import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GROUND_TRUTH,
  GROUND_TRUTH_FOOTER,
  GROUND_TRUTH_GROUPS,
  GROUND_TRUTH_INTRO,
} from "../lib/groundTruth";

describe("§5g GROUND TRUTH", () => {
  it("rows match COPY.md verbatim", () => {
    const copy = readFileSync(join(process.cwd(), "COPY.md"), "utf8");
    expect(copy).toContain(GROUND_TRUTH_INTRO);
    expect(copy).toContain(GROUND_TRUTH_FOOTER);
    expect(GROUND_TRUTH_GROUPS.map((g) => g.heading)).toEqual([
      "Any construction method",
      "Observed on a modular build (method-specific)",
    ]);
    expect(GROUND_TRUTH).toHaveLength(23);
    for (const row of GROUND_TRUTH) {
      expect(copy).toContain(`| ${row.item} | ${row.figure} | ${row.source} | ${row.date} |`);
    }
  });
});
