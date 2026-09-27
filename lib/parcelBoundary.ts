import { fetchJson } from "./wprdc";

export const COUNTY_PARCELS =
  "https://gisdata.alleghenycounty.us/arcgis/rest/services/OPENDATA/Parcels/MapServer/0";

export type LonLat = [number, number];

type GeoJsonGeom = {
  type: string;
  coordinates: unknown;
};

function ringArea(ring: LonLat[]): number {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(a / 2);
}

export function geometryToRing(geom: GeoJsonGeom | null | undefined): LonLat[] | null {
  if (!geom) return null;
  if (geom.type === "Polygon") {
    const coords = geom.coordinates as number[][][];
    const ring = (coords[0] ?? []).map((c) => [c[0], c[1]] as LonLat);
    return ring.length >= 4 ? ring : null;
  }
  if (geom.type === "MultiPolygon") {
    const polys = geom.coordinates as number[][][][];
    let best: LonLat[] | null = null;
    let bestA = 0;
    for (const poly of polys) {
      const ring = (poly[0] ?? []).map((c) => [c[0], c[1]] as LonLat);
      if (ring.length < 4) continue;
      const a = ringArea(ring);
      if (a >= bestA) {
        bestA = a;
        best = ring;
      }
    }
    return best;
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
