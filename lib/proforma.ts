import { CONSTRAINT, dwellingUnits } from "./rules";
import type {
  Construction,
  Economics,
  HouseholdTerms,
  Lot,
} from "./types";

export type ProformaOverrides = {
  landOverride?: number;
  siteOverride?: number;
};

export type ProformaResult = {
  finishedSf: number;
  units: number;
  sfPerUnit: number;
  land: number;
  siteAdders: number;
  cost: number;
  unitPrice: number;
  value: number;
  feasible: boolean;
  gapToFeasible: number;
  breakEvenSalePricePerSf: number;
  breakEvenSubsidyPerUnit: number;
  buyerMax: number;
  affordable: boolean;
  subsidyForAffordable: number;
  constraint: string | null;
};

export function presentValue(rate: number, periods: number, payment: number): number {
  if (payment <= 0) return 0;
  if (rate === 0) return payment * periods;
  return (payment * (1 - Math.pow(1 + rate, -periods))) / rate;
}

export function estimatedSiteAdders(lot: Lot, construction: Construction): number {
  const footprint = construction.widthFt * construction.depthFt;
  const slope =
    typeof lot.slopeShare === "number" ? lot.slopeShare : 0;
  const slopeMult = slope > 0.3 ? 0.5 : slope > 0.1 ? 0.25 : 0;
  return (
    slopeMult * 50.7 * footprint +
    (lot.landslide === true || lot.undermined === true ? 8000 : 0) +
    (lot.widthFt < 25 ? 20200 : 0) +
    (lot.water === false ? 10000 : 0)
  );
}

export function buyerMaxPrice(
  buyerIncome: number,
  terms: HouseholdTerms,
  unitPrice: number,
): number {
  const monthlyBudget = (buyerIncome * terms.incomeToHousing) / 12;
  const loan = unitPrice * (1 - terms.downPaymentPct);
  const pmiMonthly =
    terms.downPaymentPct < 0.2 ? (0.005 * loan) / 12 : 0;
  const monthlyPI =
    monthlyBudget -
    (terms.propertyTaxRate * unitPrice) / 12 -
    terms.insurancePerMonth -
    pmiMonthly;
  const maxLoan = presentValue(terms.mortgageRate / 12, 360, monthlyPI);
  const denom = 1 - terms.downPaymentPct;
  if (denom <= 0) return 0;
  return maxLoan / denom;
}

export function affordablePrice(
  buyerIncome: number,
  terms: HouseholdTerms,
): number {
  let lo = 0;
  let hi = 2_000_000;
  for (let i = 0; i < 48; i++) {
    const mid = (lo + hi) / 2;
    if (mid <= buyerMaxPrice(buyerIncome, terms, mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function proforma(
  lot: Lot,
  construction: Construction,
  economics: Economics,
  terms: HouseholdTerms,
  overrides: ProformaOverrides = {},
): ProformaResult {
  const finishedSf =
    construction.widthFt * construction.depthFt * construction.stories;
  const units = dwellingUnits(construction);
  const sfPerUnit = finishedSf / units;
  const land = overrides.landOverride ?? lot.assessedLand;
  const siteAdders =
    overrides.siteOverride ?? estimatedSiteAdders(lot, construction);
  const cost = economics.buildCostPerSf * finishedSf + land + siteAdders;
  const unitPrice = economics.salePricePerSf * sfPerUnit;
  const value =
    unitPrice * units + economics.subsidyPerUnit * units;
  const feasible = value >= cost;
  const gapToFeasible = Math.max(0, cost - value);
  const breakEvenSalePricePerSf =
    finishedSf === 0
      ? 0
      : (cost - economics.subsidyPerUnit * units) / finishedSf;
  const breakEvenSubsidyPerUnit = Math.max(0, (cost - unitPrice * units) / units);
  const buyerMax = buyerMaxPrice(economics.buyerIncome, terms, unitPrice);
  const affordable = feasible && unitPrice <= buyerMax;
  const subsidyForAffordable = Math.max(
    0,
    (cost - Math.min(unitPrice, buyerMax) * units) / units,
  );

  let constraint: string | null = null;
  if (!feasible) {
    if (land >= 0.25 * cost) constraint = CONSTRAINT.notFeasibleLand;
    else if (siteAdders >= 0.15 * cost) constraint = CONSTRAINT.notFeasibleSite;
    else constraint = CONSTRAINT.notFeasiblePrice;
  } else if (!affordable) {
    constraint = CONSTRAINT.notAffordable;
  }

  return {
    finishedSf,
    units,
    sfPerUnit,
    land,
    siteAdders,
    cost,
    unitPrice,
    value,
    feasible,
    gapToFeasible,
    breakEvenSalePricePerSf,
    breakEvenSubsidyPerUnit,
    buyerMax,
    affordable,
    subsidyForAffordable,
    constraint,
  };
}
