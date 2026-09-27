import { buildableEnvelope } from "./fit";
import { DEFAULT_REGULATIONS } from "./rules";
import type { Construction, FitResult, Lot, Regulations } from "./types";

export type NextStep = {
  id: string;
  text: string;
  href: string;
};

export const NEXT_STEP_TEXT = {
  permit:
    "Building permit — City of Pittsburgh Permits, Licenses and Inspections, via OneStopPGH.",
  stormwater:
    "Stormwater review — Pittsburgh Water; a planning module was required on a single infill lot.",
  contextual:
    "Contextual setback — City Planning, Zoning Division; may be approved administratively.",
  variance: "Variance — Zoning Board of Adjustment; a hearing is required.",
  flood: "Floodplain permit — City Planning.",
  geotech: "Geotechnical report — required before foundation design.",
  grading: "Grading permit — PLI.",
  demolition: "Demolition permit — PLI.",
  cityOwned: "Acquisition — Urban Redevelopment Authority or City property disposition.",
  delinquent: "Acquisition — treasurer's sale or foreclosure process.",
} as const;

export const NEXT_STEP_HREF = {
  permit: "https://onestoppgh.pittsburghpa.gov/",
  stormwater: "https://www.pgh2o.com/business/development",
  contextual: "https://pittsburghpa.gov/dcp/zoning",
  variance: "https://pittsburghpa.gov/dcp/zba",
  flood: "https://pittsburghpa.gov/dcp/floodplain",
  geotech: "https://pittsburghpa.gov/pli/",
  grading: "https://pittsburghpa.gov/pli/",
  demolition: "https://pittsburghpa.gov/pli/",
  cityOwned: "https://www.ura.org/",
  delinquent: "https://pittsburghpa.gov/finance/",
} as const;

export const CONFIRM_BEFORE_YOU_ACT = [
  "Frontage and depth are measured from the County parcel polygon; the deed may differ by inches to a foot.",
  "Sewer availability is not in any open dataset — confirm with Pittsburgh Water.",
  "Contextual setbacks, variances, and overlays are decided case by case; the tool does not model approvals.",
  "Construction cost is your setting; comparable sales and rents are references, not appraisals.",
] as const;

function failed(fit: FitResult, id: FitResult["checks"][number]["id"]): boolean {
  return fit.checks.find((c) => c.id === id)?.pass === false;
}

function step(id: keyof typeof NEXT_STEP_TEXT): NextStep {
  return { id, text: NEXT_STEP_TEXT[id], href: NEXT_STEP_HREF[id] };
}

export function nextSteps(
  lot: Lot,
  fitResult: FitResult,
  construction: Construction,
  regulations: Regulations,
): NextStep[] {
  const envelope = buildableEnvelope(lot, regulations, construction);
  const widthShort = construction.widthFt - envelope.widthFt;
  const depthShort = construction.depthFt - envelope.depthFt;
  const envelopeFails = widthShort > 0 || depthShort > 0;
  const mildEnvelope = envelopeFails && widthShort <= 10 && depthShort <= 10;
  const severeEnvelope = widthShort > 10 || depthShort > 10;
  const frontageFails = failed(fitResult, "frontage");
  const otherRegFails =
    failed(fitResult, "lotSize") ||
    failed(fitResult, "stories") ||
    failed(fitResult, "units") ||
    failed(fitResult, "adu") ||
    failed(fitResult, "parking");
  const reducedSetbacks =
    regulations.frontSetbackFt < DEFAULT_REGULATIONS.frontSetbackFt ||
    regulations.rearSetbackFt < DEFAULT_REGULATIONS.rearSetbackFt ||
    regulations.sideSetbackFt < DEFAULT_REGULATIONS.sideSetbackFt;
  const tightPass =
    !envelopeFails &&
    !otherRegFails &&
    reducedSetbacks &&
    widthShort >= -10 &&
    depthShort >= -10;

  const rows: NextStep[] = [step("permit"), step("stormwater")];
  if (frontageFails || mildEnvelope || tightPass) rows.push(step("contextual"));
  if (otherRegFails || severeEnvelope) rows.push(step("variance"));
  if (lot.flood === true) rows.push(step("flood"));
  if (lot.landslide === true || lot.undermined === true) rows.push(step("geotech"));
  if (typeof lot.slopeShare === "number" && lot.slopeShare > 0.3) rows.push(step("grading"));
  if (lot.condemned === true) rows.push(step("demolition"));
  if (lot.owner === "city") rows.push(step("cityOwned"));
  if (lot.taxDelinquent === true || lot.foreclosure === true) rows.push(step("delinquent"));
  return rows;
}
