import salesJson from "../data/sales_medians.json";

type NeighStats = { medianPerSf: number; n: number };

type SalesFile = {
  citywideMedianPerSf: number;
  saleCount: number;
  newConstructionMedianPerSf?: number;
  newConstructionSaleCount?: number;
  asOf: string;
  byNeighcode: Record<string, NeighStats>;
  byNeighborhood?: Record<string, NeighStats>;
};

const sales = salesJson as SalesFile;

const SALE_PRICE_STEP = 5;
const NEW_CONSTRUCTION_MIN_N = 50;

function roundToStep(n: number, step: number): number {
  return Math.round(n / step) * step;
}

export const CITYWIDE_MEDIAN_PER_SF = sales.citywideMedianPerSf;
export const CITYWIDE_SALE_COUNT = sales.saleCount;
export const NEW_CONSTRUCTION_MEDIAN_PER_SF = sales.newConstructionMedianPerSf ?? null;
export const NEW_CONSTRUCTION_SALE_COUNT = sales.newConstructionSaleCount ?? 0;

/** Slider default: new-construction median when n ≥ 50, else citywide; both rounded to $5. */
export const DEFAULT_SALE_PRICE_PER_SF =
  NEW_CONSTRUCTION_MEDIAN_PER_SF != null && NEW_CONSTRUCTION_SALE_COUNT >= NEW_CONSTRUCTION_MIN_N
    ? roundToStep(NEW_CONSTRUCTION_MEDIAN_PER_SF, SALE_PRICE_STEP)
    : roundToStep(sales.citywideMedianPerSf, SALE_PRICE_STEP);

export type NeighborhoodSales = {
  medianPerSf: number;
  n: number;
  asOf: string;
  local: boolean;
};

export function neighborhoodSales(name: string): NeighborhoodSales {
  const byName = sales.byNeighborhood?.[name];
  if (byName) {
    return { medianPerSf: byName.medianPerSf, n: byName.n, asOf: sales.asOf, local: true };
  }
  const lower = name.trim().toLowerCase();
  if (sales.byNeighborhood) {
    for (const [k, v] of Object.entries(sales.byNeighborhood)) {
      if (k.toLowerCase() === lower) {
        return { medianPerSf: v.medianPerSf, n: v.n, asOf: sales.asOf, local: true };
      }
    }
  }
  return {
    medianPerSf: sales.citywideMedianPerSf,
    n: sales.saleCount,
    asOf: sales.asOf,
    local: false,
  };
}
