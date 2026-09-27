import * as turf from "@turf/turf";
import type { Feature, Polygon, Position } from "geojson";

export type NamedPt = { lon: number; lat: number; name?: string };

export type PointIndex = {
  index: Map<string, NamedPt[]>;
  cellSize: number;
};

export function buildPointIndex(points: NamedPt[], cellSize = 0.002): PointIndex {
  const index = new Map<string, NamedPt[]>();
  for (const p of points) {
    const key = `${Math.floor(p.lon / cellSize)}_${Math.floor(p.lat / cellSize)}`;
    const bucket = index.get(key);
    if (bucket) bucket.push(p);
    else index.set(key, [p]);
  }
  return { index, cellSize };
}

export function nearestNamed(
  lon: number,
  lat: number,
  packed: PointIndex,
  maxRings = 16,
): { distFt: number; name?: string } | null {
  const origin = turf.point([lon, lat]);
  const { index, cellSize } = packed;
  const cx = Math.floor(lon / cellSize);
  const cy = Math.floor(lat / cellSize);
  let best: { distFt: number; name?: string } | null = null;
  const ftPerDeg = 328083.99 * Math.cos((lat * Math.PI) / 180);
  for (let r = 0; r <= maxRings; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (r > 0 && Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const bucket = index.get(`${cx + dx}_${cy + dy}`);
        if (!bucket) continue;
        for (const p of bucket) {
          const distFt = turf.distance(origin, turf.point([p.lon, p.lat]), { units: "feet" });
          if (!best || distFt < best.distFt) best = { distFt, name: p.name };
        }
      }
    }
    if (best && r > 0 && best.distFt < r * cellSize * ftPerDeg) return best;
  }
  return best;
}

export function pointsInRadius(
  lon: number,
  lat: number,
  packed: PointIndex,
  radiusFt: number,
): NamedPt[] {
  const { index, cellSize } = packed;
  const ftPerDeg = 328083.99 * Math.cos((lat * Math.PI) / 180);
  const rings = Math.max(1, Math.ceil(radiusFt / (cellSize * ftPerDeg)) + 1);
  const cx = Math.floor(lon / cellSize);
  const cy = Math.floor(lat / cellSize);
  const origin = turf.point([lon, lat]);
  const out: NamedPt[] = [];
  for (let dx = -rings; dx <= rings; dx++) {
    for (let dy = -rings; dy <= rings; dy++) {
      for (const p of index.get(`${cx + dx}_${cy + dy}`) ?? []) {
        const d = turf.distance(origin, turf.point([p.lon, p.lat]), { units: "feet" });
        if (d <= radiusFt) out.push(p);
      }
    }
  }
  return out;
}

export function countTreesNearEdges(
  trees: PointIndex,
  edges: [Position, Position][],
  radiusFt: number,
): number {
  const seen = new Set<NamedPt>();
  for (const [a, b] of edges) {
    const line = turf.lineString([a, b]);
    const mid: Position = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const candidates = pointsInRadius(mid[0], mid[1], trees, radiusFt + 200);
    for (const p of candidates) {
      if (seen.has(p)) continue;
      const d = turf.pointToLineDistance(turf.point([p.lon, p.lat]), line, { units: "feet" });
      if (d <= radiusFt) seen.add(p);
    }
  }
  return seen.size;
}

export function containingName(
  lon: number,
  lat: number,
  polys: Feature<Polygon>[],
  index: Map<string, Feature<Polygon>[]>,
  cellSize = 0.004,
): string | null {
  const cx = Math.floor(lon / cellSize);
  const cy = Math.floor(lat / cellSize);
  const pt = turf.point([lon, lat]);
  const seen = new Set<Feature<Polygon>>();
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (const poly of index.get(`${cx + dx}_${cy + dy}`) ?? []) {
        if (seen.has(poly)) continue;
        seen.add(poly);
        try {
          if (turf.booleanPointInPolygon(pt, poly)) {
            return featureName(poly.properties as Record<string, unknown> | null);
          }
        } catch {
          /* skip */
        }
      }
    }
  }
  void polys;
  return null;
}

export function featureName(props: Record<string, unknown> | null | undefined): string | null {
  if (!props) return null;
  const keys = [
    "NAME",
    "name",
    "Name",
    "SCHNAME",
    "School",
    "SCHOOL",
    "FACILITY",
    "park_name",
    "PARK_NAME",
    "ParkName",
    "HIST_NAME",
    "HISTNAME",
    "SITE_NAME",
    "DISTRICT",
    "HistoricNa",
    "LABEL",
  ];
  for (const k of keys) {
    const v = props[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}
