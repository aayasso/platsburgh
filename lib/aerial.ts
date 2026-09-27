import type { Lot } from "./types";

const COUNTY_EXPORT =
  "https://imagery.pasda.psu.edu/arcgis/rest/services/pasda/AlleghenyCountyImagery2021/ImageServer/exportImage";
const ESRI_EXPORT =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export";

export const AERIAL_COUNTY = "County orthoimagery";
export const AERIAL_ESRI = "Esri World Imagery";
export const AERIAL_DATE = "2026-09-27";

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

export function aerialExportUrl(base: string, bbox: [number, number, number, number]): string {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const params = new URLSearchParams({
    bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
    bboxSR: "4326",
    imageSR: "3857",
    size: "320,320",
    format: "jpg",
    f: "image",
  });
  return `${base}?${params.toString()}`;
}

export function countyAerialUrl(lot: Lot): string {
  return aerialExportUrl(COUNTY_EXPORT, parcelBbox(lot));
}

export function esriAerialUrl(lot: Lot): string {
  return aerialExportUrl(ESRI_EXPORT, parcelBbox(lot));
}

export function aerialCaption(source: string, date: string): string {
  return `Aerial · ${source} · ${date}`;
}
