export type MarkMeasure = { value: number; label: string; width: number };

export type PlacedMark = MarkMeasure & {
  tickX: number;
  labelLeft: number;
  row: number;
  align: "left" | "center" | "right";
};

function overlaps(aLeft: number, aWidth: number, bLeft: number, bWidth: number): boolean {
  return aLeft < bLeft + bWidth && bLeft < aLeft + aWidth;
}

export function layoutObservedMarks(
  marks: MarkMeasure[],
  min: number,
  max: number,
  trackWidth: number,
): PlacedMark[] {
  const span = max - min;
  if (span <= 0 || trackWidth <= 0) return [];
  const placed: PlacedMark[] = [];
  for (const m of marks) {
    const t = Math.min(1, Math.max(0, (m.value - min) / span));
    const tickX = t * trackWidth;
    const width = Math.min(m.width, trackWidth);
    let align: PlacedMark["align"] = "center";
    let labelLeft = tickX - width / 2;
    if (t <= 0.15) {
      align = "left";
      labelLeft = tickX;
    } else if (t >= 0.85) {
      align = "right";
      labelLeft = tickX - width;
    }
    labelLeft = Math.min(trackWidth - width, Math.max(0, labelLeft));
    let row = 0;
    while (placed.some((p) => p.row === row && overlaps(labelLeft, width, p.labelLeft, p.width))) {
      row += 1;
    }
    placed.push({ ...m, width, tickX, labelLeft, row, align });
  }
  return placed;
}
