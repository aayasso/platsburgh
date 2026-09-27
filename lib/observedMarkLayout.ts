export type ObservedMarkLabel = { value: number; label: string };

export function observedMarkLegend(marks: ObservedMarkLabel[]): string {
  return [...marks]
    .sort((a, b) => a.value - b.value || a.label.localeCompare(b.label))
    .map((m) => m.label)
    .join(" · ");
}
