import ppiJson from "../data/ppi.json";
import { formatPpiDelta, type PpiFile } from "./ppi";

export type GroundTruthRow = {
  item: string;
  figure: string;
  source: string;
  date: string;
};

export type GroundTruthGroup = {
  heading: string;
  rows: GroundTruthRow[];
};

export const GROUND_TRUTH_INTRO =
  "What building actually costs and takes in Pittsburgh, from public records and one completed project. Reference only; the tool is neutral on construction method.";

export const GROUND_TRUTH_FOOTER =
  "The tool does not assume a construction method; the construction-cost slider is yours to set. The one observed project happened to be modular, so its method-specific figures are grouped separately. A contextual setback was approved administratively on that project with no Zoning Board case; the tool does not model approvals.";

export const GROUND_TRUTH_ANY: GroundTruthRow[] = [
  {
    item: "Building permit fee (two-unit, ~2,700 sq ft)",
    figure: "$1,970",
    source: "237 N Aiken invoices",
    date: "2023",
  },
  {
    item: "Street staging permits (4) and street-opening permit",
    figure: "$1,072 + $543",
    source: "237 N Aiken invoices",
    date: "2023–24",
  },
  {
    item: "PWSA development permit and fees",
    figure: "$979",
    source: "237 N Aiken invoices",
    date: "2023",
  },
  {
    item: "PWSA stormwater review for a single infill lot",
    figure: "~5 months; $11,737 engineering",
    source: "237 N Aiken invoices",
    date: "Jun–Nov 2023",
  },
  {
    item: "Utility connections (excavation, storm, sanitary, water lines)",
    figure: "$19,500",
    source: "237 N Aiken invoices",
    date: "2024",
  },
  {
    item: "Utility change orders (ACHD check valve, curb valve, storm core, road bond)",
    figure: "$4,670",
    source: "237 N Aiken invoices",
    date: "2024",
  },
  {
    item: "Street repair after utility cut",
    figure: "$5,015",
    source: "237 N Aiken invoices",
    date: "2024",
  },
  {
    item: "Electric service (two meters, two panels)",
    figure: "$5,350",
    source: "237 N Aiken invoices",
    date: "2024",
  },
  {
    item: "Site prep and foundation (precast, 184 linear ft)",
    figure: "$49,486 (≈ $50.70 per footprint sq ft)",
    source: "237 N Aiken invoices",
    date: "2023–24",
  },
  {
    item: "Access, staging, and street logistics on a lot under 25 ft with no alley",
    figure: "$14,000 neighbor agreement + $8,920 street work",
    source: "237 N Aiken records",
    date: "2023–24",
  },
  {
    item: "Site work complete to certificate of occupancy",
    figure: "229 days",
    source: "237 N Aiken records",
    date: "2023–24",
  },
  {
    item: "Construction interest",
    figure: "$33,269 on $537,600 over nine months at prime",
    source: "237 N Aiken loan statements",
    date: "2024",
  },
  {
    item: "Design, survey, appraisal, title, insurance",
    figure: "≈ $23,400 combined",
    source: "237 N Aiken invoices",
    date: "2023–24",
  },
  {
    item: "Site-built construction cost, US average",
    figure: "$162 per finished sq ft",
    source: "NAHB Cost of Constructing a Home",
    date: "2024",
  },
  {
    item: "Construction input prices since the observed build",
    figure: `${formatPpiDelta(ppiJson as PpiFile) ?? "not available"} (Nov 2023–May 2024 avg to latest month)`,
    source: "BLS Producer Price Index, inputs to residential construction",
    date: `retrieved ${(ppiJson as PpiFile).retrieved}`,
  },
  {
    item: "Citywide sale price, arm's-length, prior 24 months",
    figure: "$161 per finished sq ft median, 7,463 sales",
    source: "WPRDC sales",
    date: "retrieved 2026-09-26",
  },
  {
    item: "Appraised value, new two-unit, 2,667 sq ft",
    figure: "$865,000 (≈ $324 per sq ft)",
    source: "FNB appraisal",
    date: "Jan 2025",
  },
  {
    item: "New residential units permitted per year",
    figure: "380 · 256 · 183 (avg 273)",
    source: "City PLI permits",
    date: "2023–2025",
  },
  {
    item: "30-year mortgage rate",
    figure: "7.03%",
    source: "Freddie Mac PMMS",
    date: "Sept 24, 2026",
  },
  {
    item: "Area median income, three-person household",
    figure: "$99,400 (80%: $79,500)",
    source: "HUD FY2026",
    date: "May 2026",
  },
];

export const GROUND_TRUTH_MODULAR: GroundTruthRow[] = [
  {
    item: "Factory cost, volumetric modular, high-spec two-unit",
    figure:
      "$175 per finished sq ft; freight $10,668 for three modules from Strattanville, PA",
    source: "237 N Aiken final invoice",
    date: "2024",
  },
  {
    item: "Crane, set crew, toter, cones (three modules, 1.5 days)",
    figure: "$29,632",
    source: "237 N Aiken invoices",
    date: "Dec 2023",
  },
  {
    item: "Factory start to set day",
    figure: "164 days (modules ~80% built in 30 days)",
    source: "237 N Aiken records",
    date: "2023",
  },
  {
    item: "Total documented cost, modular two-unit, 2,667 finished sq ft",
    figure: "$853,890 (≈ $320 per sq ft; ≈ $260 hard)",
    source: "237 N Aiken cost basis",
    date: "2024",
  },
];

/** GROUND TRUTH table, verbatim from COPY.md, in two groups. */
export const GROUND_TRUTH_GROUPS: GroundTruthGroup[] = [
  { heading: "Any construction method", rows: GROUND_TRUTH_ANY },
  { heading: "Observed on a modular build (method-specific)", rows: GROUND_TRUTH_MODULAR },
];

export const GROUND_TRUTH: GroundTruthRow[] = GROUND_TRUTH_GROUPS.flatMap((g) => g.rows);
