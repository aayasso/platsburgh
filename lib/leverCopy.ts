export const LEVER_LABEL: Record<string, string> = {
  minLotSf: "Minimum lot area",
  frontSetbackFt: "Front setback",
  rearSetbackFt: "Rear setback",
  sideSetbackFt: "Side setback",
  maxStories: "Height limit",
  unitsPerLot: "Units per parcel",
  parkingPerUnit: "Parking per unit",
  aduAllowed: "ADUs permitted",
  widthFt: "Width",
  depthFt: "Depth",
  stories: "Stories",
  units: "Units",
  attached: "Attached",
  adu: "ADU",
  buildCostPerSf: "Construction cost per sq ft",
  salePricePerSf: "Sale price per sq ft",
  subsidyPerUnit: "Subsidy per unit",
  buyerIncome: "Household income",
};

export const PANEL_WORD: Record<string, string> = {
  regulations: "REGULATIONS",
  construction: "CONSTRUCTION",
  economics: "ECONOMICS",
};

export const METRIC_WORD: Record<string, string> = {
  conforming: "conform",
  feasible: "feasible",
  affordable: "affordable",
};

export function formatLeverValue(lever: string, value: number | boolean): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (lever === "buyerIncome" || lever === "subsidyPerUnit") {
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }
  if (lever === "buildCostPerSf" || lever === "salePricePerSf") {
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }
  return String(value);
}
