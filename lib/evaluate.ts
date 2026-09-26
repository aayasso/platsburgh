import { fitAll } from "./fit";
import { formatPaceYears, yearsToBuild } from "./pace";
import { proforma } from "./proforma";
import { paybackYears } from "./publicReturn";
import { dwellingUnits } from "./rules";
import type { Lot, ViewBounds } from "./types";
import type { WorkspaceState } from "./urlState";

export type DotStatus = "cfa" | "cf" | "c" | "nc" | "unknown";

export type EvaluatedParcel = {
  lot: Lot;
  conforming: boolean;
  feasible: boolean;
  affordable: boolean;
  constraint: string | null;
  subsidyRequired: number;
  status: DotStatus;
  hover: string;
};

export type LadderModel = {
  conformingUnits: number | null;
  conformingParcels: number | null;
  feasibleUnits: number | null;
  feasibleParcels: number | null;
  affordableUnits: number | null;
  affordableParcels: number | null;
  subsidyPerUnit: number | null;
  yearsToBuild: number | null;
  paybackYears: number | null;
  empty: boolean;
};

export type Evaluation = {
  ladder: LadderModel;
  inView: number;
  nonConforming: number;
  parcels: EvaluatedParcel[];
  constraintCounts: { constraint: string; n: number }[];
  districts: string[];
};

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function evaluateWorkspace(
  lots: Lot[],
  state: WorkspaceState,
  viewBounds: ViewBounds | null,
): Evaluation {
  const fit = fitAll(
    lots,
    state.regulations,
    state.construction,
    state.siteConditions,
    state.siteFilters,
    viewBounds,
  );
  const units = dwellingUnits(state.construction);
  const inViewRows = fit.results.filter((r) => r.inView);
  const constraintMap = new Map<string, number>();
  const parcels: EvaluatedParcel[] = [];
  let feasibleParcels = 0;
  let affordableParcels = 0;
  const subsidies: number[] = [];
  const paybacks: number[] = [];
  const districtSet = new Set<string>();

  for (const row of inViewRows) {
    if (row.lot.district) districtSet.add(row.lot.district);
    let feasible = false;
    let affordable = false;
    let subsidyRequired = 0;
    let constraint = row.fit.constraint;
    let status: DotStatus = "nc";
    if (row.fit.unknowns.length > 0 && !row.fit.conforming) {
      status = row.fit.unknowns.length && !row.fit.checks.some((c) => !c.pass && c.id !== "site")
        ? "unknown"
        : "nc";
    }
    if (row.fit.conforming) {
      const pf = proforma(
        row.lot,
        state.construction,
        state.economics,
        state.household,
      );
      feasible = pf.feasible;
      affordable = pf.affordable;
      subsidyRequired = pf.subsidyForAffordable;
      if (!feasible || !affordable) constraint = pf.constraint;
      if (feasible) feasibleParcels += 1;
      if (affordable) affordableParcels += 1;
      if (subsidyRequired > 0) {
        subsidies.push(subsidyRequired);
        const tax = pf.unitPrice * state.household.propertyTaxRate;
        const years = paybackYears(subsidyRequired, tax);
        if (years != null) paybacks.push(years);
      }
      if (affordable) status = "cfa";
      else if (feasible) status = "cf";
      else status = "c";
    } else if (row.fit.unknowns.length > 0 && row.fit.checks.every((c) => c.pass || c.id === "site")) {
      status = "unknown";
    }

    if (constraint) constraintMap.set(constraint, (constraintMap.get(constraint) ?? 0) + 1);

    const hoverStatus =
      status === "cfa"
        ? "Conforming · feasible · affordable"
        : constraint ?? "Conforming · feasible · affordable";
    parcels.push({
      lot: row.lot,
      conforming: row.fit.conforming,
      feasible,
      affordable,
      constraint,
      subsidyRequired,
      status,
      hover: `${row.lot.address} · ${hoverStatus}`,
    });
  }

  const empty = inViewRows.length === 0;
  const conformingParcels = inViewRows.filter((r) => r.fit.conforming).length;
  const feasibleUnits = feasibleParcels * units;
  const years =
    feasibleUnits > 0 && state.economics.buildingPace >= 50
      ? yearsToBuild(feasibleUnits, state.economics.buildingPace)
      : null;

  const ladder: LadderModel = empty
    ? {
        conformingUnits: null,
        conformingParcels: null,
        feasibleUnits: null,
        feasibleParcels: null,
        affordableUnits: null,
        affordableParcels: null,
        subsidyPerUnit: null,
        yearsToBuild: null,
        paybackYears: null,
        empty: true,
      }
    : {
        conformingUnits: conformingParcels * units,
        conformingParcels,
        feasibleUnits,
        feasibleParcels,
        affordableUnits: affordableParcels * units,
        affordableParcels,
        subsidyPerUnit: median(subsidies),
        yearsToBuild: years,
        paybackYears: median(paybacks),
        empty: false,
      };

  return {
    ladder,
    inView: fit.inView,
    nonConforming: inViewRows.length - conformingParcels,
    parcels,
    constraintCounts: [...constraintMap.entries()]
      .map(([constraint, n]) => ({ constraint, n }))
      .sort((a, b) => b.n - a.n),
    districts: [...districtSet].sort(),
  };
}

export { formatPaceYears };
