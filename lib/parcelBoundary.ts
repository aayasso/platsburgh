import { fetchJson } from "./wprdc";

export const COUNTY_PARCELS =
  "https://gisdata.alleghenycounty.us/arcgis/rest/services/OPENDATA/Parcels/MapServer/0";

export type LonLat = [number, number];

type GeoJsonGeom = {
  type: string;
  coordinates: unknown;
};

export function geometryToRing(geom: GeoJsonGeom | null | undefined): LonLat[] | null {
  if (!geom) return null;
  if (geom.type === "Polygon") {
    const coords = geom.coordinates as number[][][];
    const ring = (coords[0] ?? []).map((c) => [c[0], c[1]] as LonLat);
    return ring.length >= 4 ? ring : null;
  }
  if (geom.type === "MultiPolygon") {
    const polys = geom.coordinates as number[][][][];
    const ring = (polys[0]?.[0] ?? []).map((c) => [c[0], c[1]] as LonLat);
    return ring.length >= 4 ? ring : null;
  }
  return null;
}

export async function fetchParcelRing(id: string): Promise<LonLat[] | null> {
  const pin = id.replace(/[\s-]/g, "").toUpperCase();
  const params = new URLSearchParams({
    where: `PIN='${pin}'`,
    outFields: "PIN",
    outSR: "4326",
    f: "geojson",
  });
  try {
    const data = await fetchJson<{
      features?: { geometry?: GeoJsonGeom | null }[];
    }>(`${COUNTY_PARCELS}/query?${params.toString()}`);
    return geometryToRing(data.features?.[0]?.geometry);
  } catch {
    return null;
  }
}
