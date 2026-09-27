import { fmtInt, fmtMoney } from "./format";
import { PITTSBURGH_METRO_FMR_2BR } from "./fmr";
import salesJson from "../data/sales_medians.json";
import type { Lot } from "./types";

const sales = salesJson as { citywideMedianPerSf: number; saleCount: number };

export function salesWithinHalfMileLine(lot: Lot): string {
  const n = lot.compsN ?? 0;
  if (n >= 5 && lot.compsPpsf != null && Number.isFinite(lot.compsPpsf)) {
    return `Sales within ½ mile: median ${fmtMoney(Math.round(lot.compsPpsf))}/sq ft (${fmtInt(n)} sales, prior 24 months)`;
  }
  return `Sales within ½ mile: median ${fmtMoney(Math.round(sales.citywideMedianPerSf))}/sq ft (citywide, ${fmtInt(sales.saleCount)} sales, prior 24 months)`;
}

export function typicalRentLine(lot: Lot): string {
  const metro = lot.fmr2br == null || lot.fmrMetro === true;
  const amount = metro ? PITTSBURGH_METRO_FMR_2BR : lot.fmr2br!;
  if (metro) {
    return `Typical rent, metro: ${fmtMoney(amount)} for 2 bedrooms (HUD FY2026 Small Area FMR) — rental path not modeled`;
  }
  return `Typical rent, ZIP ${lot.zip}: ${fmtMoney(amount)} for 2 bedrooms (HUD FY2026 Small Area FMR) — rental path not modeled`;
}
