import { fitAll } from "./fit";
import type {
  Construction,
  Economics,
  Lot,
  Regulations,
  SiteConditions,
  SiteFilters,
  ViewBounds,
} from "./types";

export type LeverPanel = "regulations" | "construction" | "economics";
export type LeverMetric = "conforming" | "feasible" | "affordable";

export type LeverRow = {
  lever: string;
  panel: LeverPanel;
  from: number | boolean;
  to: number | boolean;
  delta: number;
  metric: LeverMetric;
  atLimit: boolean;
};

export type LeverParams = {
  regulations: Regulations;
  construction: Construction;
  economics: Economics;
  siteConditions: SiteConditions;
  siteFilters: SiteFilters;
  viewBounds: ViewBounds | null;
};

export type LadderFn = (params: LeverParams, lots: Lot[]) => {
  conformingUnits: number;
  feasibleUnits: number;
  affordableUnits: number;
};

export function conformingLadder(params: LeverParams, lots: Lot[]) {
  const all = fitAll(
    lots,
    params.regulations,
    params.construction,
    params.siteConditions,
    params.siteFilters,
    params.viewBounds,
  );
  return {
    conformingUnits: all.conformingUnits,
    feasibleUnits: 0,
    affordableUnits: 0,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function metricValue(
  metric: LeverMetric,
  ladder: { conformingUnits: number; feasibleUnits: number; affordableUnits: number },
): number {
  if (metric === "conforming") return ladder.conformingUnits;
  if (metric === "feasible") return ladder.feasibleUnits;
  return ladder.affordableUnits;
}

type Spec = {
  lever: string;
  panel: LeverPanel;
  metric: LeverMetric;
  read: (p: LeverParams) => number | boolean;
  apply: (p: LeverParams, next: number | boolean) => void;
  loosened: (current: number | boolean) => { to: number | boolean; atLimit: boolean };
};

function cloneParams(params: LeverParams): LeverParams {
  return structuredClone(params);
}

const SPECS: Spec[] = [
  {
    lever: "minLotSf",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.minLotSf,
    apply: (p, v) => {
      p.regulations.minLotSf = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 0) return { to: n, atLimit: true };
      return { to: clamp(n - 500, 0, 10_000), atLimit: false };
    },
  },
  {
    lever: "frontSetbackFt",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.frontSetbackFt,
    apply: (p, v) => {
      p.regulations.frontSetbackFt = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 0) return { to: n, atLimit: true };
      return { to: clamp(n - 5, 0, 40), atLimit: false };
    },
  },
  {
    lever: "rearSetbackFt",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.rearSetbackFt,
    apply: (p, v) => {
      p.regulations.rearSetbackFt = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 0) return { to: n, atLimit: true };
      return { to: clamp(n - 5, 0, 40), atLimit: false };
    },
  },
  {
    lever: "sideSetbackFt",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.sideSetbackFt,
    apply: (p, v) => {
      p.regulations.sideSetbackFt = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 0) return { to: n, atLimit: true };
      return { to: clamp(n - 2, 0, 20), atLimit: false };
    },
  },
  {
    lever: "maxStories",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.maxStories,
    apply: (p, v) => {
      p.regulations.maxStories = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n >= 12) return { to: n, atLimit: true };
      return { to: clamp(n + 1, 1, 12), atLimit: false };
    },
  },
  {
    lever: "unitsPerLot",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.unitsPerLot,
    apply: (p, v) => {
      p.regulations.unitsPerLot = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n >= 60) return { to: n, atLimit: true };
      return { to: clamp(n + 1, 1, 60), atLimit: false };
    },
  },
  {
    lever: "parkingPerUnit",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.parkingPerUnit,
    apply: (p, v) => {
      p.regulations.parkingPerUnit = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 0) return { to: n, atLimit: true };
      return { to: clamp(n - 1, 0, 2), atLimit: false };
    },
  },
  {
    lever: "aduAllowed",
    panel: "regulations",
    metric: "conforming",
    read: (p) => p.regulations.aduAllowed,
    apply: (p, v) => {
      p.regulations.aduAllowed = v as boolean;
    },
    loosened: (c) => {
      if (c === true) return { to: true, atLimit: true };
      return { to: true, atLimit: false };
    },
  },
  {
    lever: "widthFt",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.widthFt,
    apply: (p, v) => {
      p.construction.widthFt = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 12) return { to: n, atLimit: true };
      return { to: clamp(n - 2, 12, 120), atLimit: false };
    },
  },
  {
    lever: "depthFt",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.depthFt,
    apply: (p, v) => {
      p.construction.depthFt = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 20) return { to: n, atLimit: true };
      return { to: clamp(n - 4, 20, 150), atLimit: false };
    },
  },
  {
    lever: "stories",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.stories,
    apply: (p, v) => {
      p.construction.stories = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 1) return { to: n, atLimit: true };
      return { to: clamp(n - 1, 1, 12), atLimit: false };
    },
  },
  {
    lever: "units",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.units,
    apply: (p, v) => {
      p.construction.units = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 1) return { to: n, atLimit: true };
      return { to: clamp(n - 1, 1, 60), atLimit: false };
    },
  },
  {
    lever: "attached",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.attached,
    apply: (p, v) => {
      p.construction.attached = v as boolean;
    },
    loosened: (c) => {
      if (c === true) return { to: true, atLimit: true };
      return { to: true, atLimit: false };
    },
  },
  {
    lever: "adu",
    panel: "construction",
    metric: "conforming",
    read: (p) => p.construction.adu,
    apply: (p, v) => {
      p.construction.adu = v as boolean;
    },
    loosened: (c) => {
      if (c === false) return { to: false, atLimit: true };
      return { to: false, atLimit: false };
    },
  },
  {
    lever: "buildCostPerSf",
    panel: "economics",
    metric: "feasible",
    read: (p) => p.economics.buildCostPerSf,
    apply: (p, v) => {
      p.economics.buildCostPerSf = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n <= 80) return { to: n, atLimit: true };
      return { to: clamp(n - 20, 80, 400), atLimit: false };
    },
  },
  {
    lever: "salePricePerSf",
    panel: "economics",
    metric: "feasible",
    read: (p) => p.economics.salePricePerSf,
    apply: (p, v) => {
      p.economics.salePricePerSf = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n >= 500) return { to: n, atLimit: true };
      return { to: clamp(n + 20, 60, 500), atLimit: false };
    },
  },
  {
    lever: "subsidyPerUnit",
    panel: "economics",
    metric: "feasible",
    read: (p) => p.economics.subsidyPerUnit,
    apply: (p, v) => {
      p.economics.subsidyPerUnit = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n >= 150_000) return { to: n, atLimit: true };
      return { to: clamp(n + 10_000, 0, 150_000), atLimit: false };
    },
  },
  {
    lever: "buyerIncome",
    panel: "economics",
    metric: "affordable",
    read: (p) => p.economics.buyerIncome,
    apply: (p, v) => {
      p.economics.buyerIncome = v as number;
    },
    loosened: (c) => {
      const n = c as number;
      if (n >= 250_000) return { to: n, atLimit: true };
      return { to: clamp(n + 10_000, 30_000, 250_000), atLimit: false };
    },
  },
];

export function levers(
  lots: Lot[],
  params: LeverParams,
  ladderFn: LadderFn = conformingLadder,
): LeverRow[] {
  const baseline = ladderFn(params, lots);
  const rows: LeverRow[] = SPECS.map((spec) => {
    const from = spec.read(params);
    const { to, atLimit } = spec.loosened(from);
    if (atLimit || to === from) {
      return {
        lever: spec.lever,
        panel: spec.panel,
        from,
        to: from,
        delta: 0,
        metric: spec.metric,
        atLimit: true,
      };
    }
    const next = cloneParams(params);
    spec.apply(next, to);
    const after = ladderFn(next, lots);
    return {
      lever: spec.lever,
      panel: spec.panel,
      from,
      to,
      delta: metricValue(spec.metric, after) - metricValue(spec.metric, baseline),
      metric: spec.metric,
      atLimit: false,
    };
  });

  rows.sort((a, b) => {
    if (a.atLimit !== b.atLimit) return a.atLimit ? 1 : -1;
    return Math.abs(b.delta) - Math.abs(a.delta);
  });
  return rows;
}
