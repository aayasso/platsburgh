import { describe, expect, it } from "vitest";
import { layoutObservedMarks } from "../lib/observedMarkLayout";

describe("observed-mark label layout", () => {
  it("left-aligns in the first 15% and right-aligns in the last 15%", () => {
    const [left] = layoutObservedMarks(
      [{ value: 10, label: "L", width: 40 }],
      0,
      100,
      200,
    );
    expect(left.align).toBe("left");
    expect(left.labelLeft).toBe(20);
    expect(left.tickX).toBe(20);

    const [right] = layoutObservedMarks(
      [{ value: 90, label: "R", width: 40 }],
      0,
      100,
      200,
    );
    expect(right.align).toBe("right");
    expect(right.labelLeft).toBe(180 - 40);
    expect(right.tickX).toBe(180);
  });

  it("clamps labels to the track and drops a later overlapping label to row 1", () => {
    const [first, second] = layoutObservedMarks(
      [
        { value: 50, label: "aaaaaa", width: 80 },
        { value: 52, label: "bbbbbb", width: 80 },
      ],
      0,
      100,
      200,
    );
    expect(first.row).toBe(0);
    expect(second.row).toBe(1);
    expect(first.labelLeft).toBeGreaterThanOrEqual(0);
    expect(first.labelLeft + first.width).toBeLessThanOrEqual(200);
    expect(second.labelLeft).toBeGreaterThanOrEqual(0);
    expect(second.labelLeft + second.width).toBeLessThanOrEqual(200);
  });

  it("keeps separated labels on the first row", () => {
    const placed = layoutObservedMarks(
      [
        { value: 20, label: "a", width: 30 },
        { value: 80, label: "b", width: 30 },
      ],
      0,
      100,
      200,
    );
    expect(placed.every((p) => p.row === 0)).toBe(true);
  });
});
