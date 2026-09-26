import type {
  Construction,
  Regulations,
  SiteConditions,
  SiteFilters,
  SliderDef,
} from "./types";

export const CONSTRAINT = {
  lotSize: "Below minimum lot area",
  envelope: "Setbacks exceed buildable area",
  frontage: "Insufficient frontage",
  units: "Exceeds units per parcel",
  adu: "ADU not permitted",
  stories: "Exceeds height limit",
  parking: "Parking cannot be accommodated",
  steep: "Steep slope",
  flood: "Flood zone",
  landslide: "Landslide-prone",
  undermined: "Undermined",
  noWater: "No water service",
  stepsOnly: "Stairs-only access",
  notFeasibleLand: "Not feasible — land cost",
  notFeasibleSite: "Not feasible — site conditions",
  notFeasiblePrice: "Not feasible — sale prices",
  notAffordable: "Not affordable at household income",
} as const;

export const regulationSliders: SliderDef[] = [
  {
    key: "minLotSf",
    label: "Minimum lot area",
    explanation: "A parcel must be at least this large to be developed.",
    min: 0,
    max: 10_000,
    step: 100,
    default: 3000,
    codeReference: "§903.03",
    panel: "regulations",
  },
  {
    key: "frontSetbackFt",
    label: "Front setback",
    explanation: "Required distance from the front property line.",
    min: 0,
    max: 40,
    step: 1,
    default: 30,
    codeReference: "§903.03",
    panel: "regulations",
  },
  {
    key: "rearSetbackFt",
    label: "Rear setback",
    explanation: "Required distance from the rear property line.",
    min: 0,
    max: 40,
    step: 1,
    default: 30,
    codeReference: "§903.03",
    panel: "regulations",
  },
  {
    key: "sideSetbackFt",
    label: "Side setback",
    explanation: "Required distance from each side property line.",
    min: 0,
    max: 20,
    step: 1,
    default: 5,
    codeReference: "§903.03",
    panel: "regulations",
  },
  {
    key: "maxStories",
    label: "Height limit",
    explanation: "Maximum building height, in stories.",
    min: 1,
    max: 12,
    step: 1,
    default: 2,
    codeReference: "§903.03",
    panel: "regulations",
  },
  {
    key: "unitsPerLot",
    label: "Units per parcel",
    explanation: "Maximum dwelling units on one parcel.",
    min: 1,
    max: 60,
    step: 1,
    default: 1,
    codeReference: "§911.02",
    panel: "regulations",
  },
  {
    key: "parkingPerUnit",
    label: "Parking per unit",
    explanation: "Off-street parking spaces required per dwelling unit.",
    min: 0,
    max: 2,
    step: 1,
    default: 1,
    codeReference: "Ch. 914",
    panel: "regulations",
  },
  {
    key: "aduAllowed",
    label: "ADUs permitted",
    explanation: "Whether an accessory dwelling unit is permitted on the parcel.",
    min: 0,
    max: 1,
    step: 1,
    default: false,
    codeReference: "Ch. 912",
    panel: "regulations",
  },
];

export const DEFAULT_REGULATIONS: Regulations = {
  minLotSf: 3000,
  frontSetbackFt: 30,
  rearSetbackFt: 30,
  sideSetbackFt: 5,
  maxStories: 2,
  unitsPerLot: 1,
  parkingPerUnit: 1,
  aduAllowed: false,
};

export const DEFAULT_CONSTRUCTION: Construction = {
  widthFt: 24,
  depthFt: 40,
  stories: 2,
  units: 1,
  attached: false,
  adu: false,
};

export const DEFAULT_SITE_CONDITIONS: SiteConditions = {
  skipSteep: true,
  skipFlood: true,
  skipLandslide: true,
  skipUndermined: true,
  skipGreenway: true,
  skipNoWater: true,
  skipStepsOnly: true,
  minFrontageFt: 20,
};

export const DEFAULT_SITE_FILTERS: SiteFilters = {
  vacantOnly: false,
  owner: "any",
  districts: [],
  nearTransitOnly: false,
  delinquentOrForeclosedOnly: false,
};

export function dwellingUnits(construction: Construction): number {
  return construction.units + (construction.adu ? 1 : 0);
}
