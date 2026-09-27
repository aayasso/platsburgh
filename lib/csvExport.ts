import Papa from "papaparse";
import type { EvaluatedParcel } from "./evaluate";
import { SOURCES } from "./sources";
import type { SiteConditions } from "./types";
import type { WorkspaceState } from "./urlState";

function retrieved(needle: string): string {
  const row = SOURCES.find(
    (s) =>
      s.name.toLowerCase().includes(needle.toLowerCase()) ||
      s.publisher.toLowerCase().includes(needle.toLowerCase()),
  );
  return row?.retrieved ?? "not available";
}

function yn(v: boolean): string {
  return v ? "yes" : "no";
}

function asPct(n: number): string {
  const v = n > 0 && n <= 1 ? n * 100 : n;
  return `${parseFloat(v.toFixed(2))}`;
}

function money(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function exclusionsList(sc: SiteConditions): string {
  const items = [
    sc.skipSteep ? "steep slope" : null,
    sc.skipFlood ? "flood zone" : null,
    sc.skipLandslide ? "landslide-prone" : null,
    sc.skipUndermined ? "undermined" : null,
    sc.skipGreenway ? "greenway" : null,
    sc.skipNoWater ? "no water service" : null,
    sc.skipStepsOnly ? "stairs-only access" : null,
    sc.skipCondemned ? "condemned structures" : null,
  ].filter((x): x is string => x !== null);
  return items.length ? items.join(", ") : "none";
}

export function csvCommentRows(
  state: WorkspaceState,
  inView: number,
  now = new Date(),
): string[] {
  const r = state.regulations;
  const c = state.construction;
  const e = state.economics;
  const h = state.household;
  const f = state.siteFilters;
  const sc = state.siteConditions;
  const district = f.districts.length ? f.districts.join(", ") : "any";
  return [
    `# Platsburgh export · ${now.toISOString()}`,
    `# Map view: ${state.map.lat}, ${state.map.lng}, zoom ${state.map.z} · ${inView} parcels in view`,
    `# Regulations: minimum lot area ${r.minLotSf} · front ${r.frontSetbackFt} · rear ${r.rearSetbackFt} · side ${r.sideSetbackFt} · height ${r.maxStories} · units per parcel ${r.unitsPerLot} · parking per unit ${r.parkingPerUnit} · ADUs ${yn(r.aduAllowed)}`,
    `# Construction: ${c.widthFt} × ${c.depthFt} ft · ${c.stories} stories · ${c.units} units · attached ${yn(c.attached)} · ADU ${yn(c.adu)}`,
    `# Economics: construction cost $${money(e.buildCostPerSf)}/sq ft · sale price $${money(e.salePricePerSf)}/sq ft · household income $${money(e.buyerIncome)} · subsidy $${money(e.subsidyPerUnit)}/unit · building pace ${e.buildingPace}/yr`,
    `# Terms: mortgage ${asPct(h.mortgageRate)}% · down ${asPct(h.downPaymentPct)}% · income to housing ${asPct(h.incomeToHousing)}% · property tax ${asPct(h.propertyTaxRate)}% · insurance $${money(h.insurancePerMonth)}/mo`,
    `# Site: vacant only ${yn(f.vacantOnly)} · owner ${f.owner} · district ${district} · near transit ${yn(f.nearTransitOnly)} · delinquent/foreclosed ${yn(f.delinquentOrForeclosedOnly)} · exclusions ${exclusionsList(sc)} · min frontage ${sc.minFrontageFt}`,
    `# Sources retrieved: assessments ${retrieved("Assessments")} · parcels ${retrieved("Parcels")} · zoning ${retrieved("Zoning")} · sales ${retrieved("Sales")} · permits ${retrieved("Permits")} · HUD ${retrieved("HUD")}`,
    `# Decision support, not legal, financial, or zoning advice.`,
  ];
}

export function parcelCsvRows(parcels: EvaluatedParcel[]) {
  return parcels.map((p) => ({
    Address: p.lot.address,
    Neighborhood: p.lot.neighborhood,
    "Lot area (sq ft)": p.lot.lotSf,
    "Frontage (ft)": p.lot.widthFt,
    Status:
      p.status === "cfa"
        ? "Conforming · feasible · affordable"
        : p.status === "cf"
          ? "Conforming · feasible"
          : p.status === "c"
            ? "Conforming"
            : p.status === "unknown"
              ? "Site data unavailable"
              : (p.constraint ?? "Non-conforming"),
    "Subsidy required": p.subsidyRequired > 0 ? p.subsidyRequired : "",
  }));
}

export function buildParcelsCsv(
  parcels: EvaluatedParcel[],
  state: WorkspaceState,
  inView: number,
  now = new Date(),
): string {
  const comments = csvCommentRows(state, inView, now).join("\n");
  const body = Papa.unparse({
    fields: [
      "Address",
      "Neighborhood",
      "Lot area (sq ft)",
      "Frontage (ft)",
      "Status",
      "Subsidy required",
    ],
    data: parcelCsvRows(parcels),
  });
  return `${comments}\n${body}`;
}
