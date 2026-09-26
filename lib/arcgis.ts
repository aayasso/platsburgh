import { HttpError, fetchJson } from "./wprdc";

export type GeoJSONFeature = {
  type: "Feature";
  properties: Record<string, unknown> | null;
  geometry: GeoJSONGeometry | null;
};

export type GeoJSONGeometry = {
  type: string;
  coordinates: unknown;
};

export type FeatureCollection = {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
  exceededTransferLimit?: boolean;
};

export async function queryArcGisGeoJSON(opts: {
  layerUrl: string;
  where: string;
  outFields: string;
  resultOffset: number;
  resultRecordCount: number;
}): Promise<FeatureCollection> {
  const params = new URLSearchParams({
    where: opts.where,
    outFields: opts.outFields,
    outSR: "4326",
    f: "geojson",
    resultOffset: String(opts.resultOffset),
    resultRecordCount: String(opts.resultRecordCount),
  });
  return fetchJson<FeatureCollection>(`${opts.layerUrl}/query?${params.toString()}`);
}

export async function queryArcGisCount(layerUrl: string, where: string): Promise<number> {
  const params = new URLSearchParams({
    where,
    returnCountOnly: "true",
    f: "json",
  });
  const data = await fetchJson<{ count?: number; error?: { message?: string } }>(
    `${layerUrl}/query?${params.toString()}`,
  );
  if (data.error) throw new Error(data.error.message ?? JSON.stringify(data.error));
  if (typeof data.count !== "number") throw new Error("no count in ArcGIS response");
  return data.count;
}

export async function pageArcGisGeoJSON(opts: {
  layerUrl: string;
  where: string;
  outFields: string;
  pageSize: number;
  onPage?: (features: GeoJSONFeature[], offset: number) => void;
}): Promise<GeoJSONFeature[]> {
  const all: GeoJSONFeature[] = [];
  let offset = 0;
  for (;;) {
    const page = await queryArcGisGeoJSON({
      layerUrl: opts.layerUrl,
      where: opts.where,
      outFields: opts.outFields,
      resultOffset: offset,
      resultRecordCount: opts.pageSize,
    });
    const features = page.features ?? [];
    if (opts.onPage) opts.onPage(features, offset);
    all.push(...features);
    if (features.length < opts.pageSize) break;
    offset += features.length;
  }
  return all;
}

export { HttpError };
