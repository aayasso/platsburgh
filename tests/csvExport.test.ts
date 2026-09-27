import { describe, expect, it } from "vitest";
import { buildParcelsCsv, csvCommentRows } from "../lib/csvExport";
import { decodeView, DEFAULT_WORKSPACE, encodeView } from "../lib/urlState";

describe("§9 test 23 CSV provenance", () => {
  it("begins with the comment block and parameter values match the URL state", () => {
    const query = encodeView({
      ...DEFAULT_WORKSPACE,
      regulations: { ...DEFAULT_WORKSPACE.regulations, minLotSf: 1200, frontSetbackFt: 15 },
      construction: { ...DEFAULT_WORKSPACE.construction, widthFt: 16, depthFt: 64, stories: 3, units: 2 },
      map: { lat: 40.44, lng: -80, z: 12 },
    });
    const state = decodeView(query);
    const now = new Date("2026-09-27T12:00:00.000Z");
    const comments = csvCommentRows(state, 42, now);
    expect(comments[0]).toBe("# Platsburgh export · 2026-09-27T12:00:00.000Z");
    expect(comments[1]).toContain("40.44");
    expect(comments[1]).toContain("-80");
    expect(comments[1]).toContain("zoom 12");
    expect(comments[1]).toContain("42 parcels in view");
    expect(comments[2]).toContain("minimum lot area 1200");
    expect(comments[2]).toContain("front 15");
    expect(comments[3]).toContain("16 × 64 ft");
    expect(comments[3]).toContain("3 stories");
    expect(comments[3]).toContain("2 units");
    expect(comments[8]).toBe("# Decision support, not legal, financial, or zoning advice.");
    expect(comments.every((line) => line.startsWith("#"))).toBe(true);

    const csv = buildParcelsCsv([], state, 42, now);
    const lines = csv.split("\n");
    expect(lines[0].startsWith("# Platsburgh export")).toBe(true);
    const header = lines.find((line) => !line.startsWith("#"));
    expect(header).toContain("Address");
    expect(header).toContain("Neighborhood");
    expect(csv.indexOf("# Platsburgh export")).toBeLessThan(csv.indexOf("Address"));
  });
});
