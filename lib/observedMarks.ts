import type { Lot } from "./types";

export type ObservedMark = { value: number; label: string };

/** Ticks listed in COPY.md "Observed marks on sliders". Clicking does nothing. */
export const OBSERVED_MARKS = {
  buildCostPerSf: [{ value: 260, label: "actual $260" }] as ObservedMark[],
  salePriceCitywide: { value: 160, label: "citywide $160" } as ObservedMark,
  buyerIncome: [{ value: 79_500, label: "80% AMI $79,500" }] as ObservedMark[],
  buildingPace: [{ value: 273, label: "2023–25 avg 273" }] as ObservedMark[],
  mortgageRatePct: [{ value: 7.03, label: "PMMS 7.03%" }] as ObservedMark[],
  minLotSf: [{ value: 3000, label: "code 3,000" }] as ObservedMark[],
  frontSetbackFt: [{ value: 30, label: "code 30" }] as ObservedMark[],
  rearSetbackFt: [{ value: 30, label: "code 30" }] as ObservedMark[],
  sideSetbackFt: [{ value: 5, label: "code 5" }] as ObservedMark[],
  maxStories: [{ value: 2, label: "code 2" }] as ObservedMark[],
};

export function salePriceMarks(localMedian: number | null): ObservedMark[] {
  const marks: ObservedMark[] = [OBSERVED_MARKS.salePriceCitywide];
  if (localMedian != null && Number.isFinite(localMedian)) {
    marks.push({ value: localMedian, label: `local ${Math.round(localMedian)}` });
  }
  return marks;
}

export function localCompsMedian(lots: Lot[]): number | null {
  const vals = lots
    .map((l) => l.compsPpsf)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));
  if (!vals.length) return null;
  const s = [...vals].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function regulationMarks(key: string): ObservedMark[] | undefined {
  if (key === "minLotSf") return OBSERVED_MARKS.minLotSf;
  if (key === "frontSetbackFt") return OBSERVED_MARKS.frontSetbackFt;
  if (key === "rearSetbackFt") return OBSERVED_MARKS.rearSetbackFt;
  if (key === "sideSetbackFt") return OBSERVED_MARKS.sideSetbackFt;
  if (key === "maxStories") return OBSERVED_MARKS.maxStories;
  return undefined;
}

export function economicsMarks(
  key: string,
  localSale: number | null,
): ObservedMark[] | undefined {
  if (key === "buildCostPerSf") return OBSERVED_MARKS.buildCostPerSf;
  if (key === "salePricePerSf") return salePriceMarks(localSale);
  if (key === "buyerIncome") return OBSERVED_MARKS.buyerIncome;
  if (key === "buildingPace") return OBSERVED_MARKS.buildingPace;
  return undefined;
}
