import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PITTSBURGH_METRO_FMR_2BR, SAFMR_FY2026_URL } from "../lib/fmr";
import * as turf from "@turf/turf";
import type { Feature, LineString, Polygon } from "geojson";
import { pageArcGisGeoJSON, queryArcGisCount } from "../lib/arcgis";
import {
  buildPolyIndex,
  buildStreetIndex,
  centroidLonLat,
  frontage,
  hitsOverlay,
  intersectionShare,
  nearestPointMeters,
} from "../lib/frontage";
import type { Lot } from "../lib/types";
import {
  isVacantUse,
  loadCityAssessments,
  normalizePin,
  packageSearch,
  packageShow,
  pickDatastoreResource,
  pickGeojsonResource,
  pickResource,
  fetchJson,
  fetchText,
  datastoreSearch,
  type AssessmentRow,
  type CkanPackage,
} from "../lib/wprdc";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, "data", "cache");
const notesPath = join(root, "docs", "DEV_NOTES.md");

const PASDA =
  "https://maps.pasda.psu.edu/server/rest/services/AlleghenyCountyParcels/MapServer/0";
const COUNTY =
  "https://gisdata.alleghenycounty.us/arcgis/rest/services/OPENDATA/Parcels/MapServer/0";
const ZONING_GEOJSON =
  "https://data.wprdc.org/dataset/01773197-baba-4f5e-aa77-ae87a04afafc/resource/6127f35e-f36b-4a53-80b3-f4409609e9df/download/pittsburghpazoning.geojson";
const FEMA_SPEC =
  "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28";
const FEMA_ARCGIS =
  "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28";
const ANCHOR_PIN = "0050M00032000000";
const CITY_BBOX = [-80.12, 40.36, -79.86, 40.51] as const;
const OWNER_RE = /CITY OF PITTSBURGH|URBAN REDEVELOPMENT/i;
const CAP = 40_000;
const AS_OF = new Date("2026-09-26T00:00:00Z");

const notes: string[] = ["# Development notes", "", `Retrieved ${AS_OF.toISOString().slice(0, 10)}.`, ""];

function log(line: string) {
  console.log(line);
  notes.push(line);
}

function saveNotes() {
  mkdirSync(dirname(notesPath), { recursive: true });
  writeFileSync(notesPath, notes.join("\n") + "\n");
}

function cachePath(name: string) {
  mkdirSync(cacheDir, { recursive: true });
  return join(cacheDir, name);
}

function readCache<T>(name: string): T | null {
  const p = cachePath(name);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as T;
}

function writeCache(name: string, data: unknown) {
  writeFileSync(cachePath(name), JSON.stringify(data));
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function zip5(raw: string): string {
  const d = (raw ?? "").replace(/\D/g, "");
  return d.slice(0, 5);
}

type SalePsf = { pin: string; ppsf: number };

/** Median $/finished sf of arm's-length sales within 800 m, via a 400 m spatial grid. */
function assignCompsByDistance(
  lots: Lot[],
  sales: SalePsf[],
  coords: Map<string, { lon: number; lat: number }>,
) {
  const pts: { lon: number; lat: number; ppsf: number }[] = [];
  for (const s of sales) {
    const loc = coords.get(s.pin);
    if (!loc) continue;
    pts.push({ lon: loc.lon, lat: loc.lat, ppsf: s.ppsf });
  }
  const CELL = 400;
  const R2 = 800 * 800;
  const mLat = 111_320;
  const mLon = 111_320 * Math.cos((40.44 * Math.PI) / 180);
  const grid = new Map<string, typeof pts>();
  const cellKey = (lon: number, lat: number) =>
    `${Math.floor((lon * mLon) / CELL)},${Math.floor((lat * mLat) / CELL)}`;
  for (const p of pts) {
    const k = cellKey(p.lon, p.lat);
    const arr = grid.get(k);
    if (arr) arr.push(p);
    else grid.set(k, [p]);
  }
  const t0 = Date.now();
  for (const lot of lots) {
    const cx = Math.floor((lot.lon * mLon) / CELL);
    const cy = Math.floor((lot.lat * mLat) / CELL);
    const vals: number[] = [];
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const cell = grid.get(`${cx + dx},${cy + dy}`);
        if (!cell) continue;
        for (const p of cell) {
          const dLat = (p.lat - lot.lat) * mLat;
          const dLon = (p.lon - lot.lon) * mLon;
          if (dLat * dLat + dLon * dLon <= R2) vals.push(p.ppsf);
        }
      }
    }
    lot.compsN = vals.length;
    lot.compsPpsf = median(vals);
  }
  log(
    `Comps by distance: ${pts.length} geocoded sales of ${sales.length}, ${lots.length} parcels, ${Date.now() - t0} ms (800 m, 400 m grid).`,
  );
}

async function coordsForSales(sales: SalePsf[], lots: Lot[]) {
  const coords = new Map<string, { lon: number; lat: number }>();
  for (const l of lots) coords.set(l.id, { lon: l.lon, lat: l.lat });
  const geom = readCache<{
    features: { id: string; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon }[];
  }>("geometry.json");
  if (geom) {
    for (const f of geom.features) {
      if (coords.has(f.id)) continue;
      const c = centroidLonLat(f.geometry);
      coords.set(f.id, { lon: c.lon, lat: c.lat });
    }
  }
  const missing = [...new Set(sales.map((s) => s.pin))].filter((p) => !coords.has(p));
  if (missing.length) {
    log(`Sale PINs missing geometry: ${missing.length}; fetching from County.`);
    const extra = await fetchPinsFromCounty(missing);
    for (const f of extra) {
      const c = centroidLonLat(f.geometry);
      coords.set(f.id, { lon: c.lon, lat: c.lat });
    }
    log(`Sale PINs geocoded after County fetch: ${sales.filter((s) => coords.has(s.pin)).length}`);
  }
  return coords;
}

function parseSafmrXlsx(xlsxPath: string): Record<string, number> {
  const py = `
import json, sys, zipfile, xml.etree.ElementTree as ET
ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
z = zipfile.ZipFile(sys.argv[1])
ss = ET.fromstring(z.read("xl/sharedStrings.xml"))
strings = ["".join(t.text or "" for t in si.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t")) for si in ss.findall("m:si", ns)]
sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
out = {}
for i, row in enumerate(sheet.findall("m:sheetData/m:row", ns)):
    if i == 0:
        continue
    cells = {}
    for c in row.findall("m:c", ns):
        ref = c.get("r") or ""
        col = "".join(ch for ch in ref if ch.isalpha())
        v = c.find("m:v", ns)
        if v is None or v.text is None:
            continue
        cells[col] = strings[int(v.text)] if c.get("t") == "s" else v.text
    zc = (cells.get("A") or "").strip()[:5]
    try:
        br2 = float(cells.get("J") or "")
    except ValueError:
        continue
    if zc.isdigit() and len(zc) == 5:
        out[zc] = br2
print(json.dumps(out))
`;
  const raw = execFileSync("python3", ["-c", py, xlsxPath], {
    encoding: "utf8",
    maxBuffer: 80_000_000,
  });
  return JSON.parse(raw) as Record<string, number>;
}

async function stepSafmr(): Promise<{
  byZip: Record<string, number>;
  usedMetro: boolean;
  url: string;
}> {
  log("## HUD FY2026 Small Area FMRs");
  const dest = cachePath("fy2026_safmrs.xlsx");
  try {
    if (!existsSync(dest)) {
      const res = await fetch(SAFMR_FY2026_URL, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Platsburgh/1.0; research)" },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    }
    const byZip = parseSafmrXlsx(dest);
    log(`SAFMR file ${SAFMR_FY2026_URL}: ${Object.keys(byZip).length} ZIP rows.`);
    return { byZip, usedMetro: false, url: SAFMR_FY2026_URL };
  } catch (e) {
    log(
      `SAFMR unreachable (${e instanceof Error ? e.message : e}); using Pittsburgh HUD Metro FMR Area 2-bedroom FMR ${PITTSBURGH_METRO_FMR_2BR}.`,
    );
    return { byZip: {}, usedMetro: true, url: SAFMR_FY2026_URL };
  }
}

function applyZipAndFmr(
  lots: Lot[],
  zipByPin: Map<string, string>,
  safmr: { byZip: Record<string, number>; usedMetro: boolean },
) {
  let withZip = 0;
  let withSafmr = 0;
  for (const lot of lots) {
    const z = zipByPin.get(lot.id) ?? lot.zip ?? "";
    if (z) {
      lot.zip = z;
      withZip++;
    }
    if (safmr.usedMetro) {
      lot.fmr2br = null;
      lot.fmrMetro = true;
      continue;
    }
    const n = z ? safmr.byZip[z] : undefined;
    if (typeof n === "number" && Number.isFinite(n)) {
      lot.fmr2br = n;
      lot.fmrMetro = false;
      withSafmr++;
    } else {
      lot.fmr2br = null;
      lot.fmrMetro = true;
    }
  }
  log(`ZIP on ${withZip} parcels; SAFMR 2BR on ${withSafmr}; metro flag when missing.`);
}

function addressOf(row: AssessmentRow): string {
  const num = (row.PROPERTYHOUSENUM ?? "").trim();
  const street = row.PROPERTYADDRESS.trim();
  const city = (row.PROPERTYCITY ?? "Pittsburgh").trim() || "Pittsburgh";
  const zip = (row.PROPERTYZIP ?? "").trim();
  const line = [num, street].filter(Boolean).join(" ");
  return [line, city, zip ? `PA ${zip}` : "PA"].filter(Boolean).join(", ");
}

async function resolveByTitle(title: string): Promise<CkanPackage | null> {
  const results = await packageSearch(title);
  const exact = results.find((p) => p.title === title);
  if (exact) return exact;
  const close = results.find((p) => p.title.toLowerCase() === title.toLowerCase());
  return close ?? null;
}

async function loadOverlay(label: string, finder: () => Promise<CkanPackage | null>) {
  try {
    const pkg = await finder();
    if (!pkg) {
      log(`NOT FOUND: ${label} (no matching WPRDC package). Fact marked unknown.`);
      return null;
    }
    const res = pickGeojsonResource(pkg);
    if (!res) {
      log(
        `NOT FOUND: ${label} GeoJSON resource. Package "${pkg.title}" resources: ${pkg.resources.map((r) => `${r.name} (${r.format})`).join("; ")}`,
      );
      return null;
    }
    log(`${label}: package "${pkg.title}" resource ${res.name} ${res.url}`);
    const gj = await fetchJson<{ features?: Feature[] }>(res.url);
    const features = (gj.features ?? []).map((f) => {
      try {
        return turf.simplify(f as Feature, { tolerance: 0.00008, highQuality: false, mutate: false });
      } catch {
        return f;
      }
    });
    log(`${label}: ${features.length} features after simplify`);
    return features;
  } catch (e) {
    log(`NOT FOUND: ${label} failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function asPolygons(features: Feature[] | null): Feature<Polygon>[] | null {
  if (!features) return null;
  const out: Feature<Polygon>[] = [];
  for (const f of features) {
    if (!f.geometry) continue;
    if (f.geometry.type === "Polygon") out.push(f as Feature<Polygon>);
    else if (f.geometry.type === "MultiPolygon") {
      for (const coords of f.geometry.coordinates) {
        out.push(turf.polygon(coords));
      }
    }
  }
  return out;
}

function asLines(features: Feature[] | null): Feature<LineString>[] | null {
  if (!features) return null;
  const out: Feature<LineString>[] = [];
  for (const f of features) {
    if (!f.geometry) continue;
    if (f.geometry.type === "LineString") out.push(f as Feature<LineString>);
    else if (f.geometry.type === "MultiLineString") {
      for (const coords of f.geometry.coordinates) {
        out.push(turf.lineString(coords));
      }
    }
  }
  return out;
}

async function stepAssessments() {
  log("## 1. Assessments");
  const pkg = await packageShow("property-assessments");
  const res =
    pickResource(pkg, (r) => r.name.includes("for downloads") && !!r.datastore_active) ??
    pickDatastoreResource(pkg);
  if (!res) throw new Error("No datastore resource on property-assessments");
  log(`Assessments resource: ${res.name} id=${res.id}`);
  const cached = readCache<{
    rows: AssessmentRow[];
    usedescCounts: Record<string, number>;
    classCounts: Record<string, number>;
  }>("assessments.json");
  const loaded = cached ?? (await loadCityAssessments(res.id));
  if (!cached) writeCache("assessments.json", loaded);
  const vacant = loaded.rows.filter((r) => isVacantUse(r.USEDESC)).length;
  log(
    `City parcels (MUNICODE 101–132) scanned. Vacant-or-residential kept: ${loaded.rows.length} (vacant USEDESC: ${vacant}).`,
  );
  log(`CLASSDESC counts (all city parcels scanned): ${JSON.stringify(loaded.classCounts)}`);
  log("Residential filter: CLASSDESC = RESIDENTIAL or USEDESC contains VACANT (CLASSDESC is present on the datastore; not in the BUILD_SPEC confirmed-field list).");
  log("Distinct USEDESC (all city parcels):");
  const usedesc = Object.entries(loaded.usedescCounts).sort((a, b) => b[1] - a[1]);
  for (const [k, n] of usedesc) log(`- ${n}  ${k || "(blank)"}`);
  const ranked = [...loaded.rows].sort((a, b) => {
    const av = isVacantUse(a.USEDESC) ? 0 : 1;
    const bv = isVacantUse(b.USEDESC) ? 0 : 1;
    return av - bv;
  });
  const capped = ranked.slice(0, CAP);
  if (ranked.length > CAP) log(`Capped at ${CAP} (vacant first).`);
  const anchorRow = loaded.rows.find((r) => r.PARID === ANCHOR_PIN);
  if (anchorRow && !capped.some((r) => r.PARID === ANCHOR_PIN)) {
    capped[capped.length - 1] = anchorRow;
    log(`Forced calibration PIN ${ANCHOR_PIN} into the ${CAP} cap (it is improved SINGLE FAMILY, so vacant-first cap had dropped it).`);
  }
  return capped;
}

async function fetchPinsFromCounty(pins: string[]) {
  const kept: { id: string; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon }[] = [];
  for (let i = 0; i < pins.length; i += 40) {
    const batch = pins.slice(i, i + 40);
    const where = `PIN IN (${batch.map((p) => `'${p}'`).join(",")})`;
    const page = await pageArcGisGeoJSON({
      layerUrl: COUNTY,
      where,
      outFields: "PIN,MUNICODE,CALCACREAGE",
      pageSize: 1000,
    });
    for (const f of page) {
      const id = normalizePin(String(f.properties?.PIN ?? ""));
      if (!id || !f.geometry) continue;
      if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
        kept.push({ id, geometry: f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon });
      }
    }
    console.log(`PIN batch ${i}: +${kept.length}`);
  }
  return kept;
}

async function stepGeometry(pins: Set<string>) {
  log("## 2. Geometry");
  const cached = readCache<{
    source: string;
    features: { id: string; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon }[];
    runtimeMs: number;
  }>("geometry.json");
  if (cached) {
    log(`Geometry cache: ${cached.source}, ${cached.features.length} polygons, ${cached.runtimeMs} ms`);
    const have = new Set(cached.features.map((f) => f.id));
    const missing = [...pins].filter((p) => !have.has(p));
    if (missing.length === 0) return cached;
    log(`Geometry cache missing ${missing.length} PINs; fetching from County.`);
    const extra = await fetchPinsFromCounty(missing);
    cached.features.push(...extra);
    writeCache("geometry.json", cached);
    log(`Geometry after fill: ${cached.features.length}`);
    return cached;
  }
  const where = "MUNICODE>=101 AND MUNICODE<=132";
  const t0 = Date.now();
  type Src = { url: string; pageSize: number; outFields: string; label: string };
  const sources: Src[] = [
    {
      url: PASDA,
      pageSize: 2000,
      outFields: "PIN,MUNICODE,CALCACREAG",
      label: "PASDA MapServer/0",
    },
    {
      url: COUNTY,
      pageSize: 1000,
      outFields: "PIN,MUNICODE,CALCACREAGE",
      label: "County gisdata OPENDATA/Parcels/MapServer/0",
    },
  ];
  let chosen: Src | null = null;
  for (const src of sources) {
    try {
      const n = await queryArcGisCount(src.url, where);
      log(`${src.label} count: ${n}`);
      if (n > 0) {
        chosen = src;
        break;
      }
      log(`${src.label} returned count 0 — trying fallback.`);
    } catch (e) {
      log(`${src.label} failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (!chosen) {
    log("County + PASDA geometry queries failed. Next fallback is WPRDC allegheny-county-parcel-boundaries.");
    try {
      const pkg = await packageShow("allegheny-county-parcel-boundaries");
      const res = pickGeojsonResource(pkg);
      if (!res) throw new Error("no geojson on allegheny-county-parcel-boundaries");
      log(`WPRDC parcel boundaries: ${res.url}`);
      const gj = await fetchJson<{ features?: { properties?: Record<string, unknown>; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null }[] }>(
        res.url,
      );
      const keptW: { id: string; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon }[] = [];
      for (const f of gj.features ?? []) {
        const id = normalizePin(String(f.properties?.PIN ?? f.properties?.pin ?? ""));
        if (!id || !pins.has(id) || !f.geometry) continue;
        if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
          keptW.push({ id, geometry: f.geometry });
        }
      }
      const runtimeMs = Date.now() - t0;
      const out = { source: "WPRDC allegheny-county-parcel-boundaries", features: keptW, runtimeMs };
      log(`Geometry source used: ${out.source}. Matched polygons: ${keptW.length}. Runtime ${runtimeMs} ms.`);
      writeCache("geometry.json", out);
      return out;
    } catch (e) {
      throw new Error(`All geometry sources failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  if (chosen.url === COUNTY) {
    log("County layer actual fields include PIN, MUNICODE, CALCACREAGE, MAPBLOCKLOT.");
  }
  const kept: { id: string; geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon }[] = [];
  await pageArcGisGeoJSON({
    layerUrl: chosen.url,
    where,
    outFields: chosen.outFields,
    pageSize: chosen.pageSize,
    onPage(features, offset) {
      for (const f of features) {
        const id = normalizePin(String(f.properties?.PIN ?? ""));
        if (!id || !pins.has(id) || !f.geometry) continue;
        if (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") {
          kept.push({
            id,
            geometry: f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon,
          });
        }
      }
      log(`geometry offset ${offset}: kept ${kept.length}`);
    },
  });
  const runtimeMs = Date.now() - t0;
  log(`Geometry source used: ${chosen.label}. Matched polygons: ${kept.length}. Runtime ${runtimeMs} ms.`);
  const out = { source: chosen.label, features: kept, runtimeMs };
  writeCache("geometry.json", out);
  return out;
}

async function loadFema(): Promise<Feature<Polygon>[] | null> {
  log("## FEMA flood (layer 28)");
  const urls = [FEMA_SPEC, FEMA_ARCGIS];
  for (const base of urls) {
    try {
      const params = new URLSearchParams({
        geometry: `${CITY_BBOX[0]},${CITY_BBOX[1]},${CITY_BBOX[2]},${CITY_BBOX[3]}`,
        geometryType: "esriGeometryEnvelope",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        outFields: "FLD_ZONE,SFHA_TF",
        outSR: "4326",
        f: "geojson",
        where: "SFHA_TF='T'",
        resultRecordCount: "2000",
      });
      const gj = await fetchJson<{ features?: Feature[] }>(`${base}/query?${params.toString()}`);
      const polys = asPolygons(gj.features ?? []);
      log(
        `FEMA SFHA polygons: ${polys?.length ?? 0} from ${base}. Spec path /gis/nfhl/ 404s; working path is /arcgis/rest/services/public/NFHL/MapServer/28.`,
      );
      return polys;
    } catch (e) {
      log(`FEMA ${base} failed: ${e instanceof Error ? e.message : e}`);
    }
  }
  log("Flood marked unknown for every parcel.");
  return null;
}

async function loadZoning() {
  try {
    const gj = await fetchJson<{ features?: Feature[]; error?: unknown }>(ZONING_GEOJSON);
    const feats = gj.features ?? [];
    const keys = new Set<string>();
    for (const f of feats.slice(0, 20)) {
      for (const k of Object.keys(f.properties ?? {})) keys.add(k);
    }
    if (feats.length && !(feats[0].properties && "zon_new" in (feats[0].properties ?? {}))) {
      log(`Zoning GeoJSON keys: ${[...keys].join(", ")}. zon_new missing — STOP.`);
      throw new Error("zon_new missing");
    }
    log(`Zoning GeoJSON: ${feats.length} features, zon_new present. Keys sample: ${[...keys].join(", ")}`);
    return asPolygons(feats) ?? [];
  } catch (e) {
    log(`Zoning GeoJSON failed: ${e instanceof Error ? e.message : e}. Trying Esri REST.`);
    const url =
      "https://services1.arcgis.com/YZCmUqbcsUpOKfj7/arcgis/rest/services/PGHWebZoning/FeatureServer/0/query?where=1%3D1&outFields=zon_new&outSR=4326&f=geojson";
    const gj = await fetchJson<{ features?: Feature[] }>(url);
    return asPolygons(gj.features ?? []) ?? [];
  }
}

async function pinSetFromDatastore(slug: string, pinFields: string[]): Promise<Set<string> | null> {
  try {
    const pkg = await packageShow(slug);
    const res = pickDatastoreResource(pkg);
    if (!res) {
      log(`NOT FOUND: datastore on ${slug}`);
      return null;
    }
    log(`${slug}: ${pkg.title} resource ${res.name} ${res.id}`);
    const ids = new Set<string>();
    let offset = 0;
    let total = Infinity;
    while (offset < total) {
      const page = await datastoreSearch({ resourceId: res.id, limit: 32000, offset });
      total = page.total;
      for (const rec of page.records) {
        for (const field of pinFields) {
          if (rec[field] != null) {
            const pin = normalizePin(String(rec[field]));
            if (pin.length >= 10) ids.add(pin);
          }
        }
      }
      offset += page.records.length;
      if (page.records.length === 0) break;
    }
    log(`${slug}: ${ids.size} distinct PINs`);
    return ids;
  } catch (e) {
    log(`NOT FOUND: ${slug}: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function districtAt(polys: Feature<Polygon>[], lon: number, lat: number): string {
  const pt = turf.point([lon, lat]);
  for (const p of polys) {
    try {
      if (turf.booleanPointInPolygon(pt, p)) {
        return String(p.properties?.zon_new ?? "");
      }
    } catch {
      continue;
    }
  }
  return "";
}

function neighborhoodAt(polys: Feature<Polygon>[] | null, lon: number, lat: number, fallback: string): string {
  if (!polys) return fallback;
  const pt = turf.point([lon, lat]);
  for (const p of polys) {
    try {
      if (turf.booleanPointInPolygon(pt, p)) {
        return String(
          p.properties?.hood ??
            p.properties?.HOOD ??
            p.properties?.name ??
            p.properties?.NAME ??
            fallback,
        );
      }
    } catch {
      continue;
    }
  }
  return fallback;
}

async function stepSales(
  livingArea: Map<string, number>,
  neighByPin: Map<string, string>,
) {
  log("## Sales medians");
  const pkg = await packageShow("real-estate-sales");
  log(`Sales package title: ${pkg.title}`);
  const dict = pickResource(pkg, (r) => /validation/i.test(`${r.name} ${r.description ?? ""}`));
  const keptCodes = new Set<string>(["0"]);
  if (dict) {
    log(`Sales validation dictionary: ${dict.name} ${dict.url}`);
    try {
      const text = await fetchText(dict.url);
      writeCache("sales-validation.txt", text.slice(0, 20000));
      for (const line of text.split(/\r?\n/)) {
        const m = line.match(/\b([0-9A-Z])\b.*VALID/i);
        if (m) keptCodes.add(m[1]);
      }
      log(`Kept SALECODE values from dictionary (plus 0): ${[...keptCodes].join(", ")}`);
    } catch (e) {
      log(`Could not parse validation dictionary (${e instanceof Error ? e.message : e}); using SALECODE 0 / SALEDESC VALID SALE.`);
    }
  } else {
    log("No validation dictionary resource found; fallback SALEDESC = VALID SALE, else SALEPRICE ≥ 10000.");
  }
  const res = pickDatastoreResource(pkg);
  if (!res) {
    log("NOT FOUND: sales datastore");
    return {
      citywide: null as number | null,
      count: 0,
      byNeigh: {} as Record<string, number>,
      sales: [] as SalePsf[],
    };
  }
  const cutoff = new Date("2024-09-26T00:00:00Z");
  const prices: number[] = [];
  const saleRows: SalePsf[] = [];
  const byNeigh: Record<string, number[]> = {};
  let priceField = "";
  let offset = 0;
  let total = Infinity;
  let sampleKeys: string[] = [];
  while (offset < total) {
    const page = await datastoreSearch({ resourceId: res.id, limit: 32000, offset });
    total = page.total;
    if (!sampleKeys.length && page.records[0]) sampleKeys = Object.keys(page.records[0]);
    if (!priceField && page.records[0]) {
      if ("PRICE" in page.records[0]) priceField = "PRICE";
      else if ("SALEPRICE" in page.records[0]) priceField = "SALEPRICE";
      else {
        log(`Sales keys: ${sampleKeys.join(", ")}. No PRICE or SALEPRICE — STOP.`);
        throw new Error("sales price field missing");
      }
      log(`Sales price field: ${priceField}`);
    }
    for (const rec of page.records) {
      const pin = normalizePin(String(rec.PARID ?? rec.parid ?? ""));
      const code = String(rec.SALECODE ?? rec.salecode ?? "");
      const desc = String(rec.SALEDESC ?? rec.saledesc ?? "").toUpperCase();
      const price = Number(rec[priceField]);
      const dateRaw = String(rec.SALEDATE ?? rec.saledate ?? rec.RECORDDATE ?? "");
      const dt = new Date(dateRaw);
      if (!pin || !Number.isFinite(price) || price <= 0 || Number.isNaN(dt.getTime()) || dt < cutoff) continue;
      const arms =
        keptCodes.has(code) ||
        desc.includes("VALID SALE") ||
        (!dict && price >= 10_000);
      if (!arms) continue;
      const sf = livingArea.get(pin) ?? 0;
      if (sf < 200) continue;
      const psf = price / sf;
      if (psf < 20 || psf > 800) continue;
      prices.push(psf);
      saleRows.push({ pin, ppsf: psf });
      const neigh = neighByPin.get(pin);
      if (neigh) {
        const list = byNeigh[neigh] ?? [];
        list.push(psf);
        byNeigh[neigh] = list;
      }
    }
    offset += page.records.length;
    if (page.records.length === 0) break;
  }
  const citywide = median(prices);
  const byNeighMed: Record<string, { medianPerSf: number; n: number }> = {};
  for (const [k, vals] of Object.entries(byNeigh)) {
    const m = median(vals);
    if (m != null) byNeighMed[k] = { medianPerSf: m, n: vals.length };
  }
  log(`Arm's-length sales last 24 months with living area: ${prices.length}. Citywide median $/sf: ${citywide}`);
  writeFileSync(
    join(root, "data", "sales_medians.json"),
    JSON.stringify(
      {
        citywideMedianPerSf: citywide,
        saleCount: prices.length,
        priceField,
        keptCodes: [...keptCodes],
        asOf: "2026-09-26",
        windowStart: "2024-09-26",
        byNeighcode: byNeighMed,
      },
      null,
      2,
    ),
  );
  return { citywide, count: prices.length, byNeigh: byNeighMed, sales: saleRows };
}

async function stepPace() {
  log("## Building pace");
  try {
    const pkg = await packageShow("pli-permits");
    const res = pickDatastoreResource(pkg);
    if (!res) throw new Error("no datastore");
    log(`PLI permits: ${pkg.title} ${res.id}`);
    const years = new Map<number, number>();
    let offset = 0;
    let total = Infinity;
    let keys: string[] = [];
    while (offset < total) {
      const page = await datastoreSearch({ resourceId: res.id, limit: 32000, offset });
      total = page.total;
      if (!keys.length && page.records[0]) {
        keys = Object.keys(page.records[0]);
        log(`PLI permit fields: ${keys.join(", ")}`);
      }
      for (const rec of page.records) {
        const type = String(rec.permit_type ?? rec.PERMITTYPE ?? "").toLowerCase();
        const work = String(rec.work_type ?? rec.WORKTYPE ?? "").toLowerCase();
        const occ = String(
          rec.commercial_or_residential ?? rec.OCCUPANCY ?? rec.occupancy ?? "",
        ).toLowerCase();
        const issued = String(rec.issue_date ?? rec.ISSUEDATE ?? rec.issued ?? "");
        const y = new Date(issued).getFullYear();
        if (![2023, 2024, 2025].includes(y)) continue;
        const isNew = work.includes("new construction") || type.includes("new construction");
        const isRes = occ === "residential" || occ.includes("resid");
        if (!isNew || !isRes) continue;
        const units = Number(rec.UNITS ?? rec.units ?? rec.UNITCOUNT ?? rec.unit_count ?? 1);
        years.set(y, (years.get(y) ?? 0) + (Number.isFinite(units) && units > 0 ? units : 1));
      }
      offset += page.records.length;
      if (page.records.length === 0) break;
    }
    const counts = [2023, 2024, 2025].map((y) => years.get(y) ?? 0);
    const avg = counts.reduce((a, b) => a + b, 0) / 3;
    const pace = {
      source: "pli-permits",
      years: { "2023": counts[0], "2024": counts[1], "2025": counts[2] },
      average: avg,
      buildingPaceDefault: Math.round(avg) || 500,
      note: "Counted permits whose type/occupancy looked like new residential; unit field used when present.",
    };
    log(`Pace from PLI: ${JSON.stringify(pace.years)} avg ${avg}`);
    writeFileSync(join(root, "data", "pace.json"), JSON.stringify(pace, null, 2));
    return pace;
  } catch (e) {
    log(`PLI permits failed: ${e instanceof Error ? e.message : e}. Trying Census BPS.`);
  }
  try {
    const url = "https://www2.census.gov/econ/bps/Place/Northeast%20Region/ne2025a.txt";
    const text = await fetchText(url);
    log(`Census BPS fetched ${url} length ${text.length}. Need Pittsburgh place row — parsing not confirmed; using 500 if no match.`);
    writeFileSync(
      join(root, "data", "pace.json"),
      JSON.stringify(
        {
          source: "assumed",
          years: { "2023": null, "2024": null, "2025": null },
          average: 500,
          buildingPaceDefault: 500,
          note: "Census BPS parsed insufficiently; slider default 500 assumed.",
        },
        null,
        2,
      ),
    );
  } catch (e) {
    log(`Census BPS failed: ${e instanceof Error ? e.message : e}. Pace assumed 500.`);
    writeFileSync(
      join(root, "data", "pace.json"),
      JSON.stringify(
        {
          source: "assumed",
          years: { "2023": null, "2024": null, "2025": null },
          average: 500,
          buildingPaceDefault: 500,
          note: "Neither PLI nor Census BPS usable; default 500 assumed.",
        },
        null,
        2,
      ),
    );
  }
}

async function main() {
  mkdirSync(join(root, "data"), { recursive: true });
  const assessments = await stepAssessments();
  const allAssess = readCache<{ rows: AssessmentRow[] }>("assessments.json");
  const livingAreaAll = new Map<string, number>();
  const neighByPin = new Map<string, string>();
  for (const row of allAssess?.rows ?? assessments) {
    if (row.FINISHEDLIVINGAREA && row.FINISHEDLIVINGAREA > 0) {
      livingAreaAll.set(row.PARID, row.FINISHEDLIVINGAREA);
    }
    if (row.NEIGHCODE) neighByPin.set(row.PARID, row.NEIGHCODE);
  }
  saveNotes();

  const pinSet = new Set(assessments.map((r) => r.PARID));
  const geom = await stepGeometry(pinSet);
  saveNotes();

  const geomById = new Map(geom.features.map((f) => [f.id, f.geometry]));

  log("## 3. Overlays");
  const slopeFeats = await loadOverlay("25%+ slope", () => packageShow("25-or-greater-slope"));
  const slideFeats = await loadOverlay("Landslide Prone Areas", () =>
    resolveByTitle("Landslide Prone Areas"),
  );
  const mineFeats = await loadOverlay("Undermined areas", () => packageShow("undermined-areas"));
  const greenFeats = await loadOverlay("Greenways (City)", async () => {
    const hits = await packageSearch("Greenways");
    return (
      hits.find(
        (p) =>
          p.title === "Greenways" ||
          (p.title.toLowerCase().includes("greenway") &&
            !p.title.toLowerCase().includes("allegheny county")),
      ) ?? null
    );
  });
  const waterFeats = await loadOverlay("Public Water Supplier Service Areas", () =>
    resolveByTitle("Public Water Supplier Service Areas"),
  );
  const streetFeats = await loadOverlay("Street centerlines", async () => {
    const exact = await resolveByTitle("Allegheny County Street Centerlines");
    if (exact) return exact;
    log(
      'Exact title "Allegheny County Street Centerlines" not found. Using Pittsburgh Street Centerline (city coverage).',
    );
    const hits = await packageSearch("Pittsburgh Street Centerline");
    return hits.find((p) => p.name === "pittsburgh-street-centerlines") ?? hits[0] ?? null;
  });
  const stepFeats = await loadOverlay("City steps", async () => {
    const hits = await packageSearch("City of Pittsburgh Steps");
    return hits.find((p) => /step/i.test(p.title)) ?? null;
  });
  const hoodFeats = await loadOverlay("Neighborhoods", async () => {
    const hits = await packageSearch("Neighborhoods");
    return (
      hits.find((p) => p.title === "Neighborhoods") ??
      hits.find((p) => /pittsburgh/i.test(p.title) && /neighborhood/i.test(p.title)) ??
      null
    );
  });
  const floodPolys = await loadFema();
  let zoningPolys: Feature<Polygon>[] = [];
  try {
    zoningPolys = await loadZoning();
  } catch (e) {
    log(`Zoning STOP: ${e instanceof Error ? e.message : e}`);
    saveNotes();
    throw e;
  }

  const prt = await loadOverlay("PRT stops", async () => {
    const hits = await packageSearch("Pittsburgh Regional Transit Stops");
    return (
      hits.find((p) => p.name === "prt-of-allegheny-county-transit-stops") ??
      hits.find((p) => /stop/i.test(p.title) && /transit|prt/i.test(p.title)) ??
      null
    );
  });

  const cityOwned = await pinSetFromDatastore("city-owned-properties", ["PIN", "PARID", "pin", "parid"]);
  const delinquent =
    (await pinSetFromDatastore("allegheny-county-tax-delinquency", [
      "PIN",
      "PARID",
      "pin",
      "parid",
    ])) ??
    (await pinSetFromDatastore("city-of-pittsburgh-property-tax-delinquency", [
      "PIN",
      "PARID",
      "pin",
      "parid",
    ]));
  const foreclosed = await pinSetFromDatastore("allegheny-county-mortgage-foreclosure-records", [
    "PIN",
    "PARID",
    "pin",
    "parid",
  ]);

  const slope = asPolygons(slopeFeats);
  const slide = asPolygons(slideFeats);
  const mine = asPolygons(mineFeats);
  const green = asPolygons(greenFeats);
  const water = asPolygons(waterFeats);
  const streets = asLines(streetFeats);
  const steps = [...(asLines(stepFeats) ?? []), ...(asPolygons(stepFeats) ?? [])];
  const hoods = asPolygons(hoodFeats);

  const streetIndex = streets
    ? buildStreetIndex(
        streets.filter((s) => {
          const b = turf.bbox(s);
          return b[2] >= CITY_BBOX[0] && b[0] <= CITY_BBOX[2] && b[3] >= CITY_BBOX[1] && b[1] <= CITY_BBOX[3];
        }),
      )
    : null;

  const slopeIndex = slope ? buildPolyIndex(slope) : undefined;
  const slideIndex = slide ? buildPolyIndex(slide) : undefined;
  const mineIndex = mine ? buildPolyIndex(mine) : undefined;
  const greenIndex = green ? buildPolyIndex(green) : undefined;
  const waterIndex = water ? buildPolyIndex(water) : undefined;
  const floodIndex = floodPolys ? buildPolyIndex(floodPolys) : undefined;

  const prtPoints: { lon: number; lat: number }[] = [];
  if (prt) {
    for (const f of prt) {
      if (f.geometry?.type === "Point") {
        const c = f.geometry.coordinates as number[];
        prtPoints.push({ lon: c[0], lat: c[1] });
      }
    }
    log(`PRT stop points: ${prtPoints.length}`);
  }

  saveNotes();

  log("## 4. Assemble lots.json");
  const lots: Lot[] = [];
  let withGeom = 0;
  const livingArea = new Map<string, number>();
  const tAssemble = Date.now();
  for (const row of assessments) {
    if (row.FINISHEDLIVINGAREA && row.FINISHEDLIVINGAREA > 0) {
      livingArea.set(row.PARID, row.FINISHEDLIVINGAREA);
    }
    const g = geomById.get(row.PARID);
    if (!g) continue;
    withGeom++;
    const { lon, lat } = centroidLonLat(g);
    const dim = streetIndex
      ? frontage({ geometry: g, streetIndex, lotSf: row.LOTAREA || 1 })
      : { widthFt: 0, depthFt: 0, hasStreetFrontage: false };
    const stepsHit = steps.length ? hitsOverlay(g, steps as Feature<Polygon | LineString>[], { lon, lat }) : false;
    const lot: Lot = {
      id: row.PARID,
      address: addressOf(row),
      neighborhood: neighborhoodAt(hoods, lon, lat, row.NEIGHDESC || row.NEIGHCODE),
      district: districtAt(zoningPolys, lon, lat),
      lotSf: row.LOTAREA,
      widthFt: dim.widthFt,
      depthFt: dim.depthFt,
      hasStreetFrontage: dim.hasStreetFrontage,
      stepsOnly: streetIndex ? stepsHit && !dim.hasStreetFrontage : stepsHit,
      slopeShare: slope ? intersectionShare(g, slope, slopeIndex) : "unknown",
      landslide: slide ? hitsOverlay(g, slide, { lon, lat }, slideIndex) : "unknown",
      undermined: mine ? hitsOverlay(g, mine, { lon, lat }, mineIndex) : "unknown",
      flood: floodPolys ? hitsOverlay(g, floodPolys, { lon, lat }, floodIndex) : "unknown",
      greenway: green ? hitsOverlay(g, green, { lon, lat }, greenIndex) : "unknown",
      water: water ? hitsOverlay(g, water, { lon, lat }, waterIndex) : "unknown",
      empty: isVacantUse(row.USEDESC),
      owner:
        OWNER_RE.test(row.PROPERTYOWNER) || (cityOwned?.has(row.PARID) ?? false)
          ? "city"
          : "other",
      assessedLand: row.FAIRMARKETLAND,
      lon,
      lat,
      transitDistM: prtPoints.length ? nearestPointMeters(lon, lat, prtPoints) : "unknown",
      taxDelinquent: delinquent ? delinquent.has(row.PARID) : "unknown",
      foreclosure: foreclosed ? foreclosed.has(row.PARID) : "unknown",
      zip: zip5(row.PROPERTYZIP),
    };
    lots.push(lot);
    if (lots.length % 2000 === 0) {
      log(`assembled ${lots.length} in ${Date.now() - tAssemble} ms`);
    }
  }
  log(`assemble done in ${Date.now() - tAssemble} ms`);

  log(`Assembled ${lots.length} lots (${withGeom} with geometry of ${assessments.length} vacant-or-residential).`);

  const unknownCounts: Record<string, number> = {};
  const keys = [
    "flood",
    "water",
    "landslide",
    "undermined",
    "greenway",
    "slopeShare",
    "transitDistM",
    "taxDelinquent",
    "foreclosure",
  ] as const;
  for (const k of keys) {
    unknownCounts[k] = lots.filter((l) => l[k] === "unknown").length;
  }
  log(`Unknown counts: ${JSON.stringify(unknownCounts)}`);

  const sales = await stepSales(livingAreaAll, neighByPin);
  assignCompsByDistance(lots, sales.sales, await coordsForSales(sales.sales, lots));
  const zipByPin = new Map<string, string>();
  for (const row of allAssess?.rows ?? assessments) {
    const z = zip5(row.PROPERTYZIP);
    if (z) zipByPin.set(row.PARID, z);
  }
  const safmr = await stepSafmr();
  applyZipAndFmr(lots, zipByPin, safmr);
  writeFileSync(join(root, "data", "lots.json"), JSON.stringify(lots));
  log(`Wrote data/lots.json: ${lots.length} lots.`);
  await stepPace();

  const anchor = lots.find((l) => l.id === "0050M00032000000");
  log("## 5. Anchor 0050M00032000000");
  if (!anchor) log("Anchor PIN not in lots.json.");
  else {
    log(JSON.stringify(anchor, null, 2));
    if (anchor.lotSf !== 2129) log(`Anchor lotSf is ${anchor.lotSf}, expected 2129 (assessment LOTAREA).`);
    if (Math.abs(anchor.widthFt - 22) > 3) {
      log(
        `Anchor widthFt is ${anchor.widthFt}, expected ≈22. Frontage uses the longest parcel edge within 10 m of a street centerline; if this is far from 22, the street layer or the 10 m rule is the likely cause.`,
      );
    }
    log(
      `Anchor flood=${anchor.flood} slopeShare=${anchor.slopeShare} landslide=${anchor.landslide} undermined=${anchor.undermined} water=${anchor.water}`,
    );
  }

  log(`Citywide sale median $/sf: ${sales.citywide} from ${sales.count} sales.`);
  saveNotes();
}

async function enrichExisting() {
  notes.length = 0;
  const lots = JSON.parse(readFileSync(join(root, "data", "lots.json"), "utf8")) as Lot[];
  const allAssess = readCache<{ rows: AssessmentRow[] }>("assessments.json");
  if (!allAssess?.rows?.length) throw new Error("assessments.json cache required for --enrich-only");
  const livingAreaAll = new Map<string, number>();
  const neighByPin = new Map<string, string>();
  const zipByPin = new Map<string, string>();
  for (const row of allAssess.rows) {
    if (row.FINISHEDLIVINGAREA && row.FINISHEDLIVINGAREA > 0) {
      livingAreaAll.set(row.PARID, row.FINISHEDLIVINGAREA);
    }
    if (row.NEIGHCODE) neighByPin.set(row.PARID, row.NEIGHCODE);
    const z = zip5(row.PROPERTYZIP);
    if (z) zipByPin.set(row.PARID, z);
  }
  const sales = await stepSales(livingAreaAll, neighByPin);
  assignCompsByDistance(lots, sales.sales, await coordsForSales(sales.sales, lots));
  const safmr = await stepSafmr();
  applyZipAndFmr(lots, zipByPin, safmr);
  writeFileSync(join(root, "data", "lots.json"), JSON.stringify(lots));
  log(`Wrote data/lots.json: ${lots.length} lots (enrich-only).`);
  const prev = existsSync(notesPath) ? readFileSync(notesPath, "utf8").trimEnd() : "";
  const added = notes.filter((l) => !prev.includes(l));
  writeFileSync(notesPath, `${prev}\n\n## Ground truth data (comps, ZIP, SAFMR)\n\n${added.join("\n")}\n`);
}

const enrichOnly = process.argv.includes("--enrich-only");
const run = enrichOnly ? enrichExisting : main;
run().catch((err) => {
  console.error(err);
  if (!enrichOnly) {
    notes.push(`FATAL: ${err instanceof Error ? err.stack ?? err.message : err}`);
    saveNotes();
  }
  process.exit(1);
});
