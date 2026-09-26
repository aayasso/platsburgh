import * as turf from "@turf/turf";
import type { Feature, Geometry, LineString, MultiPolygon, Polygon, Position } from "geojson";

const FT_PER_M = 3.280839895;

export type PolyIndex = Map<string, Feature<Polygon>[]>;
export type StreetIndex = Map<string, Feature<LineString>[]>;

export function buildPolyIndex(
  polys: Feature<Polygon>[],
  cellSize = 0.004,
): PolyIndex {
  const index: PolyIndex = new Map();
  for (const poly of polys) {
    const bbox = turf.bbox(poly);
    const minX = Math.floor(bbox[0] / cellSize);
    const maxX = Math.floor(bbox[2] / cellSize);
    const minY = Math.floor(bbox[1] / cellSize);
    const maxY = Math.floor(bbox[3] / cellSize);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x}_${y}`;
        const bucket = index.get(key) ?? [];
        bucket.push(poly);
        index.set(key, bucket);
      }
    }
  }
  return index;
}

function nearbyPolys(index: PolyIndex, bbox: number[], cellSize = 0.004): Feature<Polygon>[] {
  const seen = new Set<Feature<Polygon>>();
  const minX = Math.floor(bbox[0] / cellSize) - 1;
  const maxX = Math.floor(bbox[2] / cellSize) + 1;
  const minY = Math.floor(bbox[1] / cellSize) - 1;
  const maxY = Math.floor(bbox[3] / cellSize) + 1;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (const p of index.get(`${x}_${y}`) ?? []) seen.add(p);
    }
  }
  return [...seen];
}

function cellKey(lon: number, lat: number, size: number): string {
  return `${Math.floor(lon / size)}_${Math.floor(lat / size)}`;
}

export function buildStreetIndex(
  lines: Feature<LineString>[],
  cellSize = 0.004,
): StreetIndex {
  const index: StreetIndex = new Map();
  for (const line of lines) {
    const bbox = turf.bbox(line);
    const minX = Math.floor(bbox[0] / cellSize);
    const maxX = Math.floor(bbox[2] / cellSize);
    const minY = Math.floor(bbox[1] / cellSize);
    const maxY = Math.floor(bbox[3] / cellSize);
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x}_${y}`;
        const bucket = index.get(key) ?? [];
        bucket.push(line);
        index.set(key, bucket);
      }
    }
  }
  return index;
}

function nearbyStreets(
  index: StreetIndex,
  bbox: number[],
  cellSize = 0.004,
): Feature<LineString>[] {
  const seen = new Set<Feature<LineString>>();
  const minX = Math.floor(bbox[0] / cellSize) - 1;
  const maxX = Math.floor(bbox[2] / cellSize) + 1;
  const minY = Math.floor(bbox[1] / cellSize) - 1;
  const maxY = Math.floor(bbox[3] / cellSize) + 1;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      for (const line of index.get(`${x}_${y}`) ?? []) seen.add(line);
    }
  }
  return [...seen];
}

function ringsOf(geom: Geometry): Position[][] {
  if (geom.type === "Polygon") return geom.coordinates as Position[][];
  if (geom.type === "MultiPolygon") {
    return (geom.coordinates as Position[][][]).flat();
  }
  return [];
}

function edgeNearStreet(
  a: Position,
  b: Position,
  streets: Feature<LineString>[],
  maxMeters: number,
): boolean {
  const mid: Position = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const pt = turf.point(mid);
  for (const street of streets) {
    const dist = turf.pointToLineDistance(pt, street, { units: "meters" });
    if (dist <= maxMeters) return true;
  }
  return false;
}

export function frontage(opts: {
  geometry: Polygon | MultiPolygon;
  streetIndex: StreetIndex;
  lotSf: number;
}): { widthFt: number; depthFt: number; hasStreetFrontage: boolean } {
  const feature = turf.feature(opts.geometry);
  const bbox = turf.bbox(feature);
  const streets = nearbyStreets(opts.streetIndex, bbox);
  const rings = ringsOf(opts.geometry);
  let longestFt = 0;
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const a = ring[i];
      const b = ring[i + 1];
      if (!edgeNearStreet(a, b, streets, 10)) continue;
      const lenM = turf.distance(turf.point(a), turf.point(b), { units: "meters" });
      longestFt = Math.max(longestFt, lenM * FT_PER_M);
    }
  }
  let widthFt = longestFt;
  const hasStreetFrontage = longestFt > 0;
  if (!hasStreetFrontage) {
    const wFt = turf.distance(
      turf.point([bbox[0], bbox[1]]),
      turf.point([bbox[2], bbox[1]]),
      { units: "feet" },
    );
    const hFt = turf.distance(
      turf.point([bbox[0], bbox[1]]),
      turf.point([bbox[0], bbox[3]]),
      { units: "feet" },
    );
    widthFt = Math.max(1, Math.min(wFt, hFt));
  }
  const depthFt = widthFt > 0 ? opts.lotSf / widthFt : 0;
  return { widthFt: round2(widthFt), depthFt: round2(depthFt), hasStreetFrontage };
}

export function centroidLonLat(geometry: Geometry): { lon: number; lat: number } {
  const c = turf.centroid(turf.feature(geometry as Polygon));
  return { lon: round6(c.geometry.coordinates[0]), lat: round6(c.geometry.coordinates[1]) };
}

export function polygonAreaSf(geometry: Geometry): number {
  return turf.area(turf.feature(geometry as Polygon)) * 10.76391041671;
}

export function intersectionShare(
  lot: Polygon | MultiPolygon,
  overlays: Feature<Polygon>[],
  index?: PolyIndex,
): number {
  const lotF = turf.feature(lot);
  const lotArea = turf.area(lotF);
  if (lotArea <= 0) return 0;
  const bbox = turf.bbox(lotF);
  const candidates = index ? nearbyPolys(index, bbox) : overlays;
  let inter = 0;
  for (const ov of candidates) {
    const ob = turf.bbox(ov);
    if (ob[2] < bbox[0] || ob[0] > bbox[2] || ob[3] < bbox[1] || ob[1] > bbox[3]) continue;
    try {
      const clipped = turf.intersect(turf.featureCollection([lotF, ov]));
      if (clipped) inter += turf.area(clipped);
    } catch {
      // skip degenerate overlay
    }
  }
  return Math.min(1, inter / lotArea);
}

export function hitsOverlay(
  lot: Polygon | MultiPolygon,
  overlays: Feature[],
  point?: { lon: number; lat: number },
  index?: PolyIndex,
): boolean {
  const lotF = turf.feature(lot);
  const bbox = turf.bbox(lotF);
  const pt = point ? turf.point([point.lon, point.lat]) : turf.centroid(lotF);
  const polyOverlays = overlays.filter((o) => o.geometry.type === "Polygon" || o.geometry.type === "MultiPolygon") as Feature<Polygon>[];
  const lineOverlays = overlays.filter((o) => o.geometry.type === "LineString" || o.geometry.type === "MultiLineString");
  const candidates = index ? nearbyPolys(index, bbox) : polyOverlays;
  for (const ov of candidates) {
    try {
      if (turf.booleanPointInPolygon(pt, ov)) return true;
    } catch {
      continue;
    }
  }
  for (const ov of lineOverlays) {
    const ob = turf.bbox(ov);
    if (ob[2] < bbox[0] || ob[0] > bbox[2] || ob[3] < bbox[1] || ob[1] > bbox[3]) continue;
    try {
      if (turf.booleanIntersects(lotF, ov)) return true;
    } catch {
      continue;
    }
  }
  return false;
}

export function nearestPointMeters(
  lon: number,
  lat: number,
  points: { lon: number; lat: number }[],
): number {
  const origin = turf.point([lon, lat]);
  let best = Infinity;
  for (const p of points) {
    const d = turf.distance(origin, turf.point([p.lon, p.lat]), { units: "meters" });
    if (d < best) best = d;
  }
  return Number.isFinite(best) ? round1(best) : 99999;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

void cellKey;
