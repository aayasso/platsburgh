const WPRDC = "https://data.wprdc.org/api/3/action";
const UA = "Mozilla/5.0 (compatible; Platsburgh/1.0; research)";

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
  ) {
    super(message);
  }
}

export async function fetchJson<T = unknown>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json", ...init.headers },
  });
  if (!res.ok) {
    throw new HttpError(`${res.status} ${res.statusText}`, res.status, url);
  }
  return (await res.json()) as T;
}

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new HttpError(`${res.status} ${res.statusText}`, res.status, url);
  return res.text();
}

type CkanEnvelope<T> = { success: boolean; error?: unknown; result: T };

export type CkanResource = {
  id: string;
  name: string;
  description?: string;
  format?: string;
  url: string;
  datastore_active?: boolean;
};

export type CkanPackage = {
  id: string;
  name: string;
  title: string;
  resources: CkanResource[];
};

export async function packageShow(id: string): Promise<CkanPackage> {
  const data = await fetchJson<CkanEnvelope<CkanPackage>>(
    `${WPRDC}/package_show?id=${encodeURIComponent(id)}`,
  );
  if (!data.success) throw new Error(`package_show failed for ${id}: ${JSON.stringify(data.error)}`);
  return data.result;
}

export async function packageSearch(q: string): Promise<CkanPackage[]> {
  const data = await fetchJson<CkanEnvelope<{ results: CkanPackage[]; count: number }>>(
    `${WPRDC}/package_search?q=${encodeURIComponent(q)}&rows=20`,
  );
  if (!data.success) throw new Error(`package_search failed for ${q}`);
  return data.result.results;
}

export function pickResource(
  pkg: CkanPackage,
  pred: (r: CkanResource) => boolean,
): CkanResource | undefined {
  return pkg.resources.find(pred);
}

export function pickGeojsonResource(pkg: CkanPackage): CkanResource | undefined {
  const geo = pkg.resources.filter((r) =>
    /geojson/i.test(`${r.format ?? ""} ${r.name ?? ""} ${r.url ?? ""}`),
  );
  return geo[0] ?? pkg.resources.find((r) => /json/i.test(r.format ?? "") && /geo/i.test(r.url));
}

export function pickDatastoreResource(pkg: CkanPackage): CkanResource | undefined {
  return pkg.resources.find((r) => r.datastore_active) ?? pkg.resources.find((r) => /csv/i.test(r.format ?? ""));
}

export async function datastoreSearch(opts: {
  resourceId: string;
  limit?: number;
  offset?: number;
  filters?: Record<string, string | number>;
}): Promise<{ records: Record<string, unknown>[]; total: number }> {
  const params = new URLSearchParams({
    resource_id: opts.resourceId,
    limit: String(opts.limit ?? 32000),
    offset: String(opts.offset ?? 0),
  });
  if (opts.filters) params.set("filters", JSON.stringify(opts.filters));
  const data = await fetchJson<
    CkanEnvelope<{ records: Record<string, unknown>[]; total: number }>
  >(`${WPRDC}/datastore_search?${params.toString()}`);
  if (!data.success) throw new Error(`datastore_search failed: ${JSON.stringify(data.error)}`);
  return { records: data.result.records, total: data.result.total };
}

export async function ckanSql<T extends Record<string, unknown>>(
  sql: string,
): Promise<T[]> {
  const data = await fetchJson<CkanEnvelope<{ records: T[] }>>(
    `${WPRDC}/datastore_search_sql?sql=${encodeURIComponent(sql)}`,
  );
  if (!data.success) throw new Error(`CKAN SQL failed: ${JSON.stringify(data.error)}`);
  return data.result.records;
}

export function normalizePin(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[\s-]/g, "").toUpperCase();
}

export const CITY_MUNICODES = Array.from({ length: 32 }, (_, i) => String(101 + i));

export type AssessmentRow = {
  PARID: string;
  PROPERTYOWNER: string;
  PROPERTYADDRESS: string;
  PROPERTYHOUSENUM?: string;
  PROPERTYCITY?: string;
  PROPERTYZIP: string;
  MUNICODE: string | number;
  NEIGHCODE: string;
  NEIGHDESC: string;
  USEDESC: string;
  CLASSDESC?: string;
  LOTAREA: number;
  SALEDATE?: string;
  SALEPRICE?: number;
  SALEDESC?: string;
  FAIRMARKETLAND: number;
  FAIRMARKETTOTAL?: number;
  YEARBLT?: number;
  FINISHEDLIVINGAREA?: number;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function isCityMunicode(muni: string | number): boolean {
  const n = Number(muni);
  return n >= 101 && n <= 132;
}

export function isVacantUse(usedesc: string | undefined): boolean {
  return (usedesc ?? "").toUpperCase().includes("VACANT");
}

export function isResidentialRow(row: AssessmentRow): boolean {
  return (row.CLASSDESC ?? "").toUpperCase() === "RESIDENTIAL" || isVacantUse(row.USEDESC);
}

export async function loadCityAssessments(resourceId: string): Promise<{
  rows: AssessmentRow[];
  usedescCounts: Record<string, number>;
  classCounts: Record<string, number>;
}> {
  const usedescCounts: Record<string, number> = {};
  const classCounts: Record<string, number> = {};
  const rows: AssessmentRow[] = [];

  for (const muni of CITY_MUNICODES) {
    let offset = 0;
    let total = Infinity;
    while (offset < total) {
      const page = await datastoreSearch({
        resourceId,
        limit: 32000,
        offset,
        filters: { MUNICODE: muni },
      });
      total = page.total;
      for (const rec of page.records) {
        const usedesc = String(rec.USEDESC ?? "");
        const classdesc = String(rec.CLASSDESC ?? "");
        usedescCounts[usedesc] = (usedescCounts[usedesc] ?? 0) + 1;
        classCounts[classdesc] = (classCounts[classdesc] ?? 0) + 1;
        const row: AssessmentRow = {
          PARID: normalizePin(String(rec.PARID ?? "")),
          PROPERTYOWNER: String(rec.PROPERTYOWNER ?? ""),
          PROPERTYADDRESS: String(rec.PROPERTYADDRESS ?? ""),
          PROPERTYHOUSENUM: rec.PROPERTYHOUSENUM != null ? String(rec.PROPERTYHOUSENUM) : "",
          PROPERTYCITY: rec.PROPERTYCITY != null ? String(rec.PROPERTYCITY) : "",
          PROPERTYZIP: String(rec.PROPERTYZIP ?? ""),
          MUNICODE: rec.MUNICODE as string | number,
          NEIGHCODE: String(rec.NEIGHCODE ?? ""),
          NEIGHDESC: String(rec.NEIGHDESC ?? ""),
          USEDESC: usedesc,
          CLASSDESC: classdesc,
          LOTAREA: num(rec.LOTAREA),
          SALEDATE: rec.SALEDATE != null ? String(rec.SALEDATE) : undefined,
          SALEPRICE: rec.SALEPRICE != null ? num(rec.SALEPRICE) : undefined,
          SALEDESC: rec.SALEDESC != null ? String(rec.SALEDESC) : undefined,
          FAIRMARKETLAND: num(rec.FAIRMARKETLAND),
          FAIRMARKETTOTAL: rec.FAIRMARKETTOTAL != null ? num(rec.FAIRMARKETTOTAL) : undefined,
          YEARBLT: rec.YEARBLT != null ? num(rec.YEARBLT) : undefined,
          FINISHEDLIVINGAREA:
            rec.FINISHEDLIVINGAREA != null ? num(rec.FINISHEDLIVINGAREA) : undefined,
        };
        if (row.PARID && isResidentialRow(row)) rows.push(row);
      }
      offset += page.records.length;
      if (page.records.length === 0) break;
    }
  }

  const byId = new Map<string, AssessmentRow>();
  for (const row of rows) byId.set(row.PARID, row);
  return { rows: [...byId.values()], usedescCounts, classCounts };
}
