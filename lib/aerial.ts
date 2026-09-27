import type { Lot } from "./types";
import type { LonLat } from "./parcelBoundary";

export const AERIAL_ESRI = "Esri World Imagery";
export const AERIAL_DATE = "2026-09-27";
export const ESRI_TILE_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile";
export const AERIAL_SIZE_PX = 320;
const TILE_PX = 256;
const MARGIN = 0.15;

export function lonToTileX(lon: number, z: number): number {
  return ((lon + 180) / 360) * 2 ** z;
}

export function latToTileY(lat: number, z: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    2 ** z
  );
}

export function esriTileUrl(z: number, y: number, x: number): string {
  return `${ESRI_TILE_BASE}/${z}/${y}/${x}`;
}

export function fallbackRing(lot: Lot): LonLat[] {
  const mLat = 111_320;
  const mLon = 111_320 * Math.cos((lot.lat * Math.PI) / 180);
  const halfLon = ((lot.widthFt * 0.3048) / 2) / mLon;
  const halfLat = ((lot.depthFt * 0.3048) / 2) / mLat;
  const { lon, lat } = lot;
  return [
    [lon - halfLon, lat - halfLat],
    [lon + halfLon, lat - halfLat],
    [lon + halfLon, lat + halfLat],
    [lon - halfLon, lat + halfLat],
    [lon - halfLon, lat - halfLat],
  ];
}

function closedRing(r: LonLat[]): LonLat[] {
  const first = r[0];
  const last = r[r.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return r;
  return [...r, first];
}

function ringBboxFt(ring: LonLat[]): { ewFt: number; nsFt: number } {
  const lons = ring.map(([lon]) => lon);
  const lats = ring.map(([, lat]) => lat);
  const lat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const mLat = 111_320;
  const mLon = 111_320 * Math.cos((lat * Math.PI) / 180);
  return {
    ewFt: ((Math.max(...lons) - Math.min(...lons)) * mLon) / 0.3048,
    nsFt: ((Math.max(...lats) - Math.min(...lats)) * mLat) / 0.3048,
  };
}

function ringMatchesLot(ring: LonLat[], lot: Lot): boolean {
  const { ewFt, nsFt } = ringBboxFt(ring);
  const a = [ewFt, nsFt].sort((x, y) => x - y);
  const b = [lot.widthFt, lot.depthFt].sort((x, y) => x - y);
  const close = (x: number, y: number) =>
    Math.abs(x - y) <= 0.3 * Math.max(y, 1);
  return close(a[0], b[0]) && close(a[1], b[1]);
}

export function ringOf(lot: Lot): LonLat[] {
  const r = lot.ring;
  if (r && r.length >= 4) {
    const closed = closedRing(r);
    if (ringMatchesLot(closed, lot)) return closed;
  }
  return fallbackRing(lot);
}

function ringBboxTiles(ring: LonLat[], z: number): {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
} {
  const xs = ring.map(([lon]) => lonToTileX(lon, z));
  const ys = ring.map(([, lat]) => latToTileY(lat, z));
  return {
    x0: Math.min(...xs),
    x1: Math.max(...xs),
    y0: Math.min(...ys),
    y1: Math.max(...ys),
  };
}

export function pickAerialZoom(ring: LonLat[], sizePx = AERIAL_SIZE_PX): number {
  for (const z of [19, 18, 17, 16, 15]) {
    const b = ringBboxTiles(ring, z);
    const w = (b.x1 - b.x0) * TILE_PX;
    const h = (b.y1 - b.y0) * TILE_PX;
    if (Math.max(w, h) * (1 + 2 * MARGIN) <= sizePx) return z;
  }
  return 15;
}

export type AerialTile = {
  x: number;
  y: number;
  left: number;
  top: number;
  width: number;
  height: number;
  src: string;
};

export type AerialPlan = {
  z: number;
  tiles: AerialTile[];
  outline: [number, number][];
  path: string;
};

export function lonLatToPixel(
  lon: number,
  lat: number,
  z: number,
  originX: number,
  originY: number,
  scale: number,
  offsetX: number,
  offsetY: number,
): [number, number] {
  return [
    (lonToTileX(lon, z) - originX) * TILE_PX * scale + offsetX,
    (latToTileY(lat, z) - originY) * TILE_PX * scale + offsetY,
  ];
}

export function aerialTilePlan(lot: Lot, sizePx = AERIAL_SIZE_PX): AerialPlan {
  const ring = ringOf(lot);
  const z = pickAerialZoom(ring, sizePx);
  const raw = ringBboxTiles(ring, z);
  const pad = MARGIN * Math.max(raw.x1 - raw.x0, raw.y1 - raw.y0);
  const x0 = raw.x0 - pad;
  const x1 = raw.x1 + pad;
  const y0 = raw.y0 - pad;
  const y1 = raw.y1 + pad;
  const bboxW = (x1 - x0) * TILE_PX;
  const bboxH = (y1 - y0) * TILE_PX;
  const scale = sizePx / Math.max(bboxW, bboxH);
  const offsetX = (sizePx - bboxW * scale) / 2;
  const offsetY = (sizePx - bboxH * scale) / 2;
  const worldPerPx = 1 / (TILE_PX * scale);
  const boxX0 = x0 + (0 - offsetX) * worldPerPx;
  const boxX1 = x0 + (sizePx - offsetX) * worldPerPx;
  const boxY0 = y0 + (0 - offsetY) * worldPerPx;
  const boxY1 = y0 + (sizePx - offsetY) * worldPerPx;
  const tx0 = Math.floor(Math.min(boxX0, boxX1));
  const tx1 = Math.floor(Math.max(boxX0, boxX1) - 1e-12);
  const ty0 = Math.floor(Math.min(boxY0, boxY1));
  const ty1 = Math.floor(Math.max(boxY0, boxY1) - 1e-12);
  const tiles: AerialTile[] = [];
  const tileSize = TILE_PX * scale;
  const nTiles = 2 ** z;
  for (let y = ty0; y <= ty1; y++) {
    for (let x = tx0; x <= tx1; x++) {
      const wrappedX = ((x % nTiles) + nTiles) % nTiles;
      tiles.push({
        x: wrappedX,
        y,
        left: (x - x0) * TILE_PX * scale + offsetX,
        top: (y - y0) * TILE_PX * scale + offsetY,
        width: tileSize,
        height: tileSize,
        src: esriTileUrl(z, y, wrappedX),
      });
    }
  }
  const outline = ring.map(([lon, lat]) =>
    lonLatToPixel(lon, lat, z, x0, y0, scale, offsetX, offsetY),
  );
  const path =
    outline
      .map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(2)} ${py.toFixed(2)}`)
      .join(" ") + " Z";
  return { z, tiles, outline, path };
}

export function outlinePixelAspect(plan: AerialPlan): number {
  const xs = plan.outline.map((p) => p[0]);
  const ys = plan.outline.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  const h = Math.max(...ys) - Math.min(...ys);
  return h / w;
}

export function aerialCaption(source: string, date: string): string {
  return `Aerial · ${source} · ${date}`;
}
