import salesJson from "../data/sales_medians.json";

type NeighStats = { medianPerSf: number; n: number };

type SalesFile = {
  citywideMedianPerSf: number;
  saleCount: number;
  asOf: string;
  byNeighcode: Record<string, NeighStats>;
  byNeighborhood?: Record<string, NeighStats>;
};

const sales = salesJson as SalesFile;

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
