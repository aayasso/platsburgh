import type { Lot } from "./types";

export const AERIAL_ESRI = "Esri World Imagery";
export const AERIAL_DATE = "2026-09-27";
export const ESRI_TILE_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile";
export const AERIAL_SIZE_PX = 320;
const TILE_PX = 256;

export function parcelBbox(lot: Lot): [number, number, number, number] {
  const mLat = 111_320;
  const mLon = 111_320 * Math.cos((lot.lat * Math.PI) / 180);
  const halfW = (Math.max(lot.widthFt, 20) * 0.3048 * 1.4) / 2;
  const halfD = (Math.max(lot.depthFt, 20) * 0.3048 * 1.4) / 2;
  return [
    lot.lon - halfW / mLon,
    lot.lat - halfD / mLat,
    lot.lon + halfW / mLon,
    lot.lat + halfD / mLat,
  ];
}

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

export type AerialTile = {
  x: number;
  y: number;
  left: number;
  top: number;
  src: string;
};

export type AerialTilePlan = {
  z: number;
  tiles: AerialTile[];
  mosaicW: number;
  mosaicH: number;
  translateX: number;
  translateY: number;
  scale: number;
};

export function aerialTilePlan(lot: Lot, sizePx = AERIAL_SIZE_PX): AerialTilePlan {
  const [minLon, minLat, maxLon, maxLat] = parcelBbox(lot);
  const measure = (z: number) => {
    const x0 = lonToTileX(minLon, z);
    const x1 = lonToTileX(maxLon, z);
    const y0 = latToTileY(maxLat, z);
    const y1 = latToTileY(minLat, z);
    const tx0 = Math.floor(x0);
    const tx1 = Math.floor(x1);
    const ty0 = Math.floor(y0);
    const ty1 = Math.floor(y1);
    return { x0, x1, y0, y1, tx0, tx1, ty0, ty1, n: (tx1 - tx0 + 1) * (ty1 - ty0 + 1) };
  };
  let z = 19;
  let m = measure(19);
  if (m.n > 16) {
    z = 18;
    m = measure(18);
  }
  const tiles: AerialTile[] = [];
  for (let y = m.ty0; y <= m.ty1; y++) {
    for (let x = m.tx0; x <= m.tx1; x++) {
      tiles.push({
        x,
        y,
        left: (x - m.tx0) * TILE_PX,
        top: (y - m.ty0) * TILE_PX,
        src: esriTileUrl(z, y, x),
      });
    }
  }
  const mosaicW = (m.tx1 - m.tx0 + 1) * TILE_PX;
  const mosaicH = (m.ty1 - m.ty0 + 1) * TILE_PX;
  const bboxW = (m.x1 - m.x0) * TILE_PX;
  const bboxH = (m.y1 - m.y0) * TILE_PX;
  const scale = sizePx / Math.max(bboxW, bboxH);
  const originX = (m.x0 - m.tx0) * TILE_PX;
  const originY = (m.y0 - m.ty0) * TILE_PX;
  const translateX = (sizePx - bboxW * scale) / 2 - originX * scale;
  const translateY = (sizePx - bboxH * scale) / 2 - originY * scale;
  return { z, tiles, mosaicW, mosaicH, translateX, translateY, scale };
}

export function aerialCaption(source: string, date: string): string {
  return `Aerial · ${source} · ${date}`;
}
