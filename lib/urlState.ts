import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_ECONOMICS,
  DEFAULT_HOUSEHOLD,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "./rules";
import type {
  Construction,
  Economics,
  HouseholdTerms,
  Regulations,
  SiteConditions,
  SiteFilters,
} from "./types";

export type MapView = {
  lat: number;
  lng: number;
  z: number;
};

export type OpenPanel = "reg" | "con" | "eco" | "site";
export type BarTab = "constraints" | "levers" | "parcels" | "sources" | "closed";

export type WorkspaceState = {
  regulations: Regulations;
  construction: Construction;
  economics: Economics;
  household: HouseholdTerms;
  siteConditions: SiteConditions;
  siteFilters: SiteFilters;
  map: MapView;
  open: OpenPanel[];
  bar: BarTab;
};

export const DEFAULT_MAP: MapView = { lat: 40.441, lng: -79.995, z: 11 };

export const DEFAULT_WORKSPACE: WorkspaceState = {
  regulations: DEFAULT_REGULATIONS,
  construction: DEFAULT_CONSTRUCTION,
  economics: DEFAULT_ECONOMICS,
  household: DEFAULT_HOUSEHOLD,
  siteConditions: DEFAULT_SITE_CONDITIONS,
  siteFilters: { ...DEFAULT_SITE_FILTERS, vacantOnly: true },
  map: DEFAULT_MAP,
  open: [],
  bar: "closed",
};

function setIfDiff(search: URLSearchParams, key: string, value: string | number | boolean, def: string | number | boolean) {
  if (String(value) !== String(def)) search.set(key, String(value));
}

export function encodeView(state: Partial<WorkspaceState> & { map?: MapView }): string {
  const s: WorkspaceState = {
    ...DEFAULT_WORKSPACE,
    ...state,
    regulations: { ...DEFAULT_WORKSPACE.regulations, ...state.regulations },
    construction: { ...DEFAULT_WORKSPACE.construction, ...state.construction },
    economics: { ...DEFAULT_WORKSPACE.economics, ...state.economics },
    household: { ...DEFAULT_WORKSPACE.household, ...state.household },
    siteConditions: { ...DEFAULT_WORKSPACE.siteConditions, ...state.siteConditions },
    siteFilters: { ...DEFAULT_WORKSPACE.siteFilters, ...state.siteFilters },
    map: state.map ?? DEFAULT_MAP,
    open: state.open ?? [],
    bar: state.bar ?? "closed",
  };
  const search = new URLSearchParams();
  const r = s.regulations;
  const d = DEFAULT_WORKSPACE;
  setIfDiff(search, "lot", r.minLotSf, d.regulations.minLotSf);
  setIfDiff(search, "front", r.frontSetbackFt, d.regulations.frontSetbackFt);
  setIfDiff(search, "rear", r.rearSetbackFt, d.regulations.rearSetbackFt);
  setIfDiff(search, "side", r.sideSetbackFt, d.regulations.sideSetbackFt);
  setIfDiff(search, "stories", r.maxStories, d.regulations.maxStories);
  setIfDiff(search, "upl", r.unitsPerLot, d.regulations.unitsPerLot);
  setIfDiff(search, "park", r.parkingPerUnit, d.regulations.parkingPerUnit);
  setIfDiff(search, "adu", r.aduAllowed ? 1 : 0, d.regulations.aduAllowed ? 1 : 0);
  const c = s.construction;
  setIfDiff(search, "w", c.widthFt, d.construction.widthFt);
  setIfDiff(search, "d", c.depthFt, d.construction.depthFt);
  setIfDiff(search, "st", c.stories, d.construction.stories);
  setIfDiff(search, "u", c.units, d.construction.units);
  setIfDiff(search, "att", c.attached ? 1 : 0, 0);
  setIfDiff(search, "cadu", c.adu ? 1 : 0, 0);
  const e = s.economics;
  setIfDiff(search, "cost", e.buildCostPerSf, d.economics.buildCostPerSf);
  setIfDiff(search, "price", e.salePricePerSf, d.economics.salePricePerSf);
  setIfDiff(search, "inc", e.buyerIncome, d.economics.buyerIncome);
  setIfDiff(search, "sub", e.subsidyPerUnit, d.economics.subsidyPerUnit);
  setIfDiff(search, "pace", e.buildingPace, d.economics.buildingPace);
  const h = s.household;
  setIfDiff(search, "rate", h.mortgageRate, d.household.mortgageRate);
  setIfDiff(search, "down", h.downPaymentPct, d.household.downPaymentPct);
  setIfDiff(search, "ratio", h.incomeToHousing, d.household.incomeToHousing);
  setIfDiff(search, "tax", h.propertyTaxRate, d.household.propertyTaxRate);
  setIfDiff(search, "ins", h.insurancePerMonth, d.household.insurancePerMonth);
  const sc = s.siteConditions;
  setIfDiff(search, "steep", sc.skipSteep ? 1 : 0, 1);
  setIfDiff(search, "flood", sc.skipFlood ? 1 : 0, 1);
  setIfDiff(search, "slide", sc.skipLandslide ? 1 : 0, 1);
  setIfDiff(search, "mine", sc.skipUndermined ? 1 : 0, 1);
  setIfDiff(search, "water", sc.skipNoWater ? 1 : 0, 1);
  setIfDiff(search, "steps", sc.skipStepsOnly ? 1 : 0, 1);
  setIfDiff(search, "frontage", sc.minFrontageFt, d.siteConditions.minFrontageFt);
  const f = s.siteFilters;
  setIfDiff(search, "vac", f.vacantOnly ? 1 : 0, 1);
  setIfDiff(search, "own", f.owner, "any");
  if (f.districts.length) search.set("dist", f.districts.join("."));
  setIfDiff(search, "transit", f.nearTransitOnly ? 1 : 0, 0);
  setIfDiff(search, "delinq", f.delinquentOrForeclosedOnly ? 1 : 0, 0);
  setIfDiff(search, "lat", s.map.lat, d.map.lat);
  setIfDiff(search, "lng", s.map.lng, d.map.lng);
  setIfDiff(search, "z", s.map.z, d.map.z);
  if (s.open.length) search.set("open", s.open.join(","));
  if (s.bar !== "closed") search.set("bar", s.bar);
  return search.toString();
}

function num(search: URLSearchParams, key: string, fallback: number): number {
  const raw = search.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function flag(search: URLSearchParams, key: string, fallback: boolean): boolean {
  const raw = search.get(key);
  if (raw === null) return fallback;
  return raw === "1" || raw === "true";
}

export function decodeView(query: string): WorkspaceState {
  const search = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const d = DEFAULT_WORKSPACE;
  const openRaw = search.get("open");
  const open = (openRaw ? openRaw.split(",") : []) as OpenPanel[];
  const bar = (search.get("bar") as BarTab | null) ?? "closed";
  const dist = search.get("dist");
  return {
    regulations: {
      minLotSf: num(search, "lot", d.regulations.minLotSf),
      frontSetbackFt: num(search, "front", d.regulations.frontSetbackFt),
      rearSetbackFt: num(search, "rear", d.regulations.rearSetbackFt),
      sideSetbackFt: num(search, "side", d.regulations.sideSetbackFt),
      maxStories: num(search, "stories", d.regulations.maxStories),
      unitsPerLot: num(search, "upl", d.regulations.unitsPerLot),
      parkingPerUnit: num(search, "park", d.regulations.parkingPerUnit),
      aduAllowed: flag(search, "adu", d.regulations.aduAllowed),
    },
    construction: {
      widthFt: num(search, "w", d.construction.widthFt),
      depthFt: num(search, "d", d.construction.depthFt),
      stories: num(search, "st", d.construction.stories),
      units: num(search, "u", d.construction.units),
      attached: flag(search, "att", false),
      adu: flag(search, "cadu", false),
    },
    economics: {
      buildCostPerSf: num(search, "cost", d.economics.buildCostPerSf),
      salePricePerSf: num(search, "price", d.economics.salePricePerSf),
      buyerIncome: num(search, "inc", d.economics.buyerIncome),
      subsidyPerUnit: num(search, "sub", d.economics.subsidyPerUnit),
      buildingPace: num(search, "pace", d.economics.buildingPace),
    },
    household: {
      mortgageRate: num(search, "rate", d.household.mortgageRate),
      downPaymentPct: num(search, "down", d.household.downPaymentPct),
      incomeToHousing: num(search, "ratio", d.household.incomeToHousing),
      propertyTaxRate: num(search, "tax", d.household.propertyTaxRate),
      insurancePerMonth: num(search, "ins", d.household.insurancePerMonth),
    },
    siteConditions: {
      skipSteep: flag(search, "steep", true),
      skipFlood: flag(search, "flood", true),
      skipLandslide: flag(search, "slide", true),
      skipUndermined: flag(search, "mine", true),
      skipGreenway: true,
      skipNoWater: flag(search, "water", true),
      skipStepsOnly: flag(search, "steps", true),
      minFrontageFt: num(search, "frontage", d.siteConditions.minFrontageFt),
    },
    siteFilters: {
      vacantOnly: flag(search, "vac", true),
      owner: search.get("own") === "city" ? "city" : "any",
      districts: dist ? dist.split(".").filter(Boolean) : [],
      nearTransitOnly: flag(search, "transit", false),
      delinquentOrForeclosedOnly: flag(search, "delinq", false),
    },
    map: {
      lat: num(search, "lat", d.map.lat),
      lng: num(search, "lng", d.map.lng),
      z: num(search, "z", d.map.z),
    },
    open: open.filter((p) => ["reg", "con", "eco", "site"].includes(p)),
    bar: ["constraints", "levers", "parcels", "sources", "closed"].includes(bar)
      ? bar
      : "closed",
  };
}

export function encodeViewFromSearch(state: WorkspaceState): string {
  return encodeView(state);
}

export function decodeParcelOverrides(
  query: string,
  assessedLand: number,
  defaultSite: number,
): { land: number; sitecost: number } {
  const search = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  return {
    land: num(search, "land", assessedLand),
    sitecost: num(search, "sitecost", defaultSite),
  };
}

export function encodeParcelQuery(
  state: WorkspaceState,
  land: number,
  sitecost: number,
  assessedLand: number,
  defaultSite: number,
): string {
  const search = new URLSearchParams(encodeView(state));
  if (land !== assessedLand) search.set("land", String(Math.round(land)));
  if (sitecost !== defaultSite) search.set("sitecost", String(Math.round(sitecost)));
  return search.toString();
}
