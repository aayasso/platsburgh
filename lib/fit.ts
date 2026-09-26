import { CONSTRAINT, dwellingUnits } from "./rules";
import type {
  Construction,
  FitCheck,
  FitResult,
  Lot,
  Regulations,
  SiteConditions,
  SiteFilters,
  ViewBounds,
} from "./types";

function siteUnknowns(lot: Lot): string[] {
  const unknowns: string[] = [];
  if (lot.flood === "unknown") unknowns.push("flood");
  if (lot.water === "unknown") unknowns.push("water");
  return unknowns;
}

function firstSiteConstraint(
  lot: Lot,
  site: SiteConditions,
): string | null {
  if (site.skipSteep && lot.slopeShare > 0.3) return CONSTRAINT.steep;
  if (site.skipFlood && lot.flood === true) return CONSTRAINT.flood;
  if (site.skipLandslide && lot.landslide) return CONSTRAINT.landslide;
  if (site.skipUndermined && lot.undermined) return CONSTRAINT.undermined;
  if (site.skipGreenway && lot.greenway) return "greenway";
  if (site.skipNoWater && lot.water === false) return CONSTRAINT.noWater;
  if (site.skipStepsOnly && lot.stepsOnly) return CONSTRAINT.stepsOnly;
  return null;
}

export function buildableEnvelope(
  lot: Lot,
  regulations: Regulations,
  construction: Construction,
): { widthFt: number; depthFt: number } {
  const sideDeduction = construction.attached
    ? regulations.sideSetbackFt
    : 2 * regulations.sideSetbackFt;
  return {
    widthFt: lot.widthFt - sideDeduction,
    depthFt:
      lot.depthFt - regulations.frontSetbackFt - regulations.rearSetbackFt,
  };
}

export function fit(
  lot: Lot,
  regulations: Regulations,
  construction: Construction,
  siteConditions: SiteConditions,
): FitResult {
  const unknowns = siteUnknowns(lot);
  const checks: FitCheck[] = [];

  const siteConstraint = firstSiteConstraint(lot, siteConditions);
  checks.push({
    id: "site",
    pass: siteConstraint === null,
    constraint: siteConstraint,
  });

  const lotSizePass = lot.lotSf >= regulations.minLotSf;
  checks.push({
    id: "lotSize",
    pass: lotSizePass,
    constraint: lotSizePass ? null : CONSTRAINT.lotSize,
  });

  const frontagePass =
    lot.widthFt >= siteConditions.minFrontageFt && lot.hasStreetFrontage;
  checks.push({
    id: "frontage",
    pass: frontagePass,
    constraint: frontagePass ? null : CONSTRAINT.frontage,
  });

  const envelope = buildableEnvelope(lot, regulations, construction);
  const envelopePass =
    envelope.widthFt >= construction.widthFt &&
    envelope.depthFt >= construction.depthFt;
  checks.push({
    id: "envelope",
    pass: envelopePass,
    constraint: envelopePass ? null : CONSTRAINT.envelope,
  });

  const unitsPass = construction.units <= regulations.unitsPerLot;
  checks.push({
    id: "units",
    pass: unitsPass,
    constraint: unitsPass ? null : CONSTRAINT.units,
  });

  const aduPass = !construction.adu || regulations.aduAllowed;
  checks.push({
    id: "adu",
    pass: aduPass,
    constraint: aduPass ? null : CONSTRAINT.adu,
  });

  const storiesPass = construction.stories <= regulations.maxStories;
  checks.push({
    id: "stories",
    pass: storiesPass,
    constraint: storiesPass ? null : CONSTRAINT.stories,
  });

  const parkingRequired = regulations.parkingPerUnit * construction.units;
  const parkingPass = parkingRequired === 0 || lot.widthFt >= 20;
  checks.push({
    id: "parking",
    pass: parkingPass,
    constraint: parkingPass ? null : CONSTRAINT.parking,
  });

  const firstFail = checks.find((c) => !c.pass);
  return {
    conforming: !firstFail,
    constraint: firstFail?.constraint ?? null,
    checks,
    unknowns,
  };
}

export function inViewBounds(lot: Lot, viewBounds: ViewBounds | null): boolean {
  if (!viewBounds) return true;
  return (
    lot.lon >= viewBounds.minLon &&
    lot.lon <= viewBounds.maxLon &&
    lot.lat >= viewBounds.minLat &&
    lot.lat <= viewBounds.maxLat
  );
}

export function passesSiteFilters(lot: Lot, filters: SiteFilters): boolean {
  if (filters.vacantOnly && !lot.empty) return false;
  if (filters.owner === "city" && lot.owner !== "city") return false;
  if (filters.districts.length > 0 && !filters.districts.includes(lot.district)) {
    return false;
  }
  if (filters.nearTransitOnly && lot.transitDistM > 400) return false;
  if (
    filters.delinquentOrForeclosedOnly &&
    !(lot.taxDelinquent || lot.foreclosure)
  ) {
    return false;
  }
  return true;
}

export type LotFit = {
  lot: Lot;
  fit: FitResult;
  inView: boolean;
};

export type FitAllResult = {
  results: LotFit[];
  inView: number;
  total: number;
  inViewLine: { n: number; total: number };
  conformingParcels: number;
  conformingUnits: number;
};

export function fitAll(
  lots: Lot[],
  regulations: Regulations,
  construction: Construction,
  siteConditions: SiteConditions,
  siteFilters: SiteFilters,
  viewBounds: ViewBounds | null,
): FitAllResult {
  const units = dwellingUnits(construction);
  const results: LotFit[] = lots.map((lot) => {
    const scoped =
      inViewBounds(lot, viewBounds) && passesSiteFilters(lot, siteFilters);
    return {
      lot,
      fit: scoped
        ? fit(lot, regulations, construction, siteConditions)
        : {
            conforming: false,
            constraint: null,
            checks: [],
            unknowns: [],
          },
      inView: scoped,
    };
  });

  const inViewResults = results.filter((r) => r.inView);
  const conforming = inViewResults.filter((r) => r.fit.conforming);

  return {
    results,
    inView: inViewResults.length,
    total: lots.length,
    inViewLine: { n: inViewResults.length, total: lots.length },
    conformingParcels: conforming.length,
    conformingUnits: conforming.length * units,
  };
}
