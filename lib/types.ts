export type OwnerType = "city" | "other";

export type Lot = {
  id: string;
  address: string;
  neighborhood: string;
  district: string;
  lotSf: number;
  widthFt: number;
  depthFt: number;
  hasStreetFrontage: boolean;
  stepsOnly: boolean;
  slopeShare: number | "unknown";
  landslide: boolean | "unknown";
  undermined: boolean | "unknown";
  flood: boolean | "unknown";
  greenway: boolean | "unknown";
  water: boolean | "unknown";
  empty: boolean;
  owner: OwnerType;
  assessedLand: number;
  lon: number;
  lat: number;
  transitDistM: number | "unknown";
  taxDelinquent: boolean | "unknown";
  foreclosure: boolean | "unknown";
  compsPpsf?: number | null;
  compsN?: number;
  zip?: string;
  fmr2br?: number | null;
  fmrMetro?: boolean;
  condemned?: boolean | "unknown";
  openViolations?: number | "unknown";
  abatedThrough?: number | null | "unknown";
  zhviChange12m?: number | null;
  /** Outer ring [lon, lat][], closed or open. */
  ring?: [number, number][];
};

export type Regulations = {
  minLotSf: number;
  frontSetbackFt: number;
  rearSetbackFt: number;
  sideSetbackFt: number;
  maxStories: number;
  unitsPerLot: number;
  parkingPerUnit: number;
  aduAllowed: boolean;
};

export type Construction = {
  widthFt: number;
  depthFt: number;
  stories: number;
  units: number;
  attached: boolean;
  adu: boolean;
};

export type SiteConditions = {
  skipSteep: boolean;
  skipFlood: boolean;
  skipLandslide: boolean;
  skipUndermined: boolean;
  skipGreenway: boolean;
  skipNoWater: boolean;
  skipStepsOnly: boolean;
  skipCondemned: boolean;
  minFrontageFt: number;
};

export type Economics = {
  buildCostPerSf: number;
  salePricePerSf: number;
  buyerIncome: number;
  subsidyPerUnit: number;
  buildingPace: number;
};

export type HouseholdTerms = {
  mortgageRate: number;
  downPaymentPct: number;
  incomeToHousing: number;
  propertyTaxRate: number;
  insurancePerMonth: number;
};

export type SiteFilters = {
  vacantOnly: boolean;
  owner: "any" | "city";
  districts: string[];
  nearTransitOnly: boolean;
  delinquentOrForeclosedOnly: boolean;
};

export type ViewBounds = {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
};

export type CheckId =
  | "site"
  | "lotSize"
  | "frontage"
  | "envelope"
  | "units"
  | "adu"
  | "stories"
  | "parking";

export type FitCheck = {
  id: CheckId;
  pass: boolean;
  constraint: string | null;
};

export type FitResult = {
  conforming: boolean;
  constraint: string | null;
  checks: FitCheck[];
  unknowns: string[];
};

export type SliderDef = {
  key: string;
  label: string;
  explanation: string;
  min: number;
  max: number;
  step: number;
  default: number | boolean;
  codeReference?: string;
  source?: string;
  panel: "regulations" | "construction" | "economics";
  role?: string;
};
