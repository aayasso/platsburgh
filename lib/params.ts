import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_ECONOMICS,
  DEFAULT_HOUSEHOLD,
  DEFAULT_REGULATIONS,
} from "./rules";
import type { Construction, Economics, HouseholdTerms, Regulations } from "./types";
import type { WorkspaceState } from "./urlState";

export function dumpRegulations(regulations: Regulations): string {
  return JSON.stringify(regulations);
}

export function loadRegulations(json: string): Regulations {
  return JSON.parse(json) as Regulations;
}

export function dumpEconomics(economics: Economics): string {
  return JSON.stringify(economics);
}

export function loadEconomics(json: string): Economics {
  return JSON.parse(json) as Economics;
}

export type ParametersFile = {
  regulations: Regulations;
  economics: Economics;
  household: HouseholdTerms;
  construction: Construction;
};

export function dumpParameters(state: Pick<WorkspaceState, "regulations" | "economics" | "household" | "construction">): string {
  const payload: ParametersFile = {
    regulations: JSON.parse(dumpRegulations(state.regulations)) as Regulations,
    economics: JSON.parse(dumpEconomics(state.economics)) as Economics,
    household: state.household,
    construction: state.construction,
  };
  return JSON.stringify(payload, null, 2);
}

export function loadParameters(json: string): ParametersFile {
  const parsed = JSON.parse(json) as Partial<ParametersFile> &
    Partial<Regulations> &
    Partial<Economics>;
  if (parsed.regulations != null || parsed.economics != null) {
    return {
      regulations: parsed.regulations
        ? loadRegulations(JSON.stringify(parsed.regulations))
        : DEFAULT_REGULATIONS,
      economics: parsed.economics
        ? loadEconomics(JSON.stringify(parsed.economics))
        : DEFAULT_ECONOMICS,
      household: parsed.household ?? DEFAULT_HOUSEHOLD,
      construction: parsed.construction ?? DEFAULT_CONSTRUCTION,
    };
  }
  if ("minLotSf" in parsed) {
    return {
      regulations: loadRegulations(json),
      economics: DEFAULT_ECONOMICS,
      household: DEFAULT_HOUSEHOLD,
      construction: DEFAULT_CONSTRUCTION,
    };
  }
  if ("buildCostPerSf" in parsed) {
    return {
      regulations: DEFAULT_REGULATIONS,
      economics: loadEconomics(json),
      household: DEFAULT_HOUSEHOLD,
      construction: DEFAULT_CONSTRUCTION,
    };
  }
  return {
    regulations: DEFAULT_REGULATIONS,
    economics: DEFAULT_ECONOMICS,
    household: DEFAULT_HOUSEHOLD,
    construction: DEFAULT_CONSTRUCTION,
  };
}
