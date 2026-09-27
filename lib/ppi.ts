export type PpiFile = {
  seriesId: string;
  latestMonth: string;
  baseMonths: string[];
  latest: number;
  baseAverage: number;
  ppiRatio: number;
  retrieved: string;
};

export function ppiPercent(ppi: PpiFile): number {
  return (ppi.ppiRatio - 1) * 100;
}

export function formatPpiDelta(ppi: PpiFile | null): string | null {
  if (!ppi || !Number.isFinite(ppi.ppiRatio)) return null;
  const pct = ppiPercent(ppi);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}
