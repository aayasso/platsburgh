import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as turf from "@turf/turf";
import type { Feature, LineString, MultiPolygon, Polygon, Position } from "geojson";
import Papa from "papaparse";
import { pageArcGisGeoJSON } from "../lib/arcgis";
import {
  buildPolyIndex,
  buildStreetIndex,
  streetFacingEdges,
} from "../lib/frontage";
import {
  buildPointIndex,
  containingName,
  countTreesNearEdges,
  featureName,
  nearestNamed,
  type NamedPt,
} from "../lib/pointIndex";
import type { Lot } from "../lib/types";
import {
  fetchJson,
  packageSearch,
  packageShow,
  pickGeojsonResource,
  type CkanPackage,
} from "../lib/wprdc";

type Log = (line: string) => void;

function asPolygons(features: Feature[] | null): Feature<Polygon>[] | null {
  if (!features) return null;
  const out: Feature<Polygon>[] = [];
  for (const f of features) {
    if (!f.geometry) continue;
    if (f.geometry.type === "Polygon") out.push(f as Feature<Polygon>);
    else if (f.geometry.type === "MultiPolygon") {
      for (const coords of f.geometry.coordinates) out.push(turf.polygon(coords));
    }
  }
  return out;
}

function asPoints(features: Feature[] | null): NamedPt[] {
  if (!features) return [];
  const out: NamedPt[] = [];
  for (const f of features) {
    const name = featureName(f.properties as Record<string, unknown> | null) ?? undefined;
    if (f.geometry?.type === "Point") {
      const c = f.geometry.coordinates as number[];
      out.push({ lon: c[0], lat: c[1], name });
    } else if (f.geometry?.type === "Polygon" || f.geometry?.type === "MultiPolygon") {
      const c = turf.centroid(f as Feature<Polygon>);
      out.push({
        lon: c.geometry.coordinates[0],
        lat: c.geometry.coordinates[1],
        name,
      });
    }
  }
  return out;
}

async function loadWprdcGeojson(label: string, slugOrSearch: string, log: Log): Promise<Feature[] | null> {
  try {
    let pkg: CkanPackage | null = null;
    try {
      pkg = await packageShow(slugOrSearch);
    } catch {
      const found = await packageSearch(slugOrSearch);
      pkg =
        found.find((p) => p.name === slugOrSearch || p.title.toLowerCase() === slugOrSearch.toLowerCase()) ??
        found[0] ??
        null;
    }
    if (!pkg) {
      log(`NOT FOUND: ${label} (no WPRDC package for "${slugOrSearch}").`);
      return null;
    }
    const res = pickGeojsonResource(pkg);
    if (!res) {
      log(`NOT FOUND: ${label} GeoJSON on "${pkg.title}".`);
      return null;
    }
    log(`${label}: "${pkg.title}" ${res.url}`);
    const gj = await fetchJson<{ features?: Feature[] }>(res.url);
    const n = gj.features?.length ?? 0;
    log(`${label}: ${n} features.`);
    return gj.features ?? [];
  } catch (e) {
    log(`NOT FOUND: ${label} failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

function distToPolygonFt(lon: number, lat: number, poly: Feature<Polygon>): number {
  const pt = turf.point([lon, lat]);
  try {
    if (turf.booleanPointInPolygon(pt, poly)) return 0;
    const line = turf.polygonToLine(poly);
    const lines =
      line.type === "FeatureCollection" ? line.features : [line];
    let best = Infinity;
    for (const lf of lines) {
      if (!lf.geometry) continue;
      const snapped = turf.nearestPointOnLine(lf as Feature<LineString>, pt);
      const d = turf.distance(pt, snapped, { units: "feet" });
      if (d < best) best = d;
    }
    return Number.isFinite(best) ? best : 99999;
  } catch {
    return 99999;
  }
}

export async function applyHydrants(lots: Lot[], log: Log): Promise<void> {
  try {
    const a = await packageSearch("hydrants");
    const b = await packageSearch("hydrant");
    const pkgs = [...a, ...b];
    const pkg = pkgs.find((p) => /hydrant/i.test(`${p.title} ${p.name}`));
    if (!pkg) {
      for (const lot of lots) lot.hydrantDistFt = null;
      log(
        "NOT FOUND: WPRDC package_search for hydrants/hydrant returned no hydrant point dataset. hydrantDistFt set null on all lots. City GIS Fire_Hydrants_PGH exists (~9,771 PWSA points) but was not used; the spec required the WPRDC dataset.",
      );
      return;
    }
    const feats = await loadWprdcGeojson("PWSA hydrants", pkg.name, log);
    const pts = asPoints(feats);
    if (!pts.length) {
      for (const lot of lots) lot.hydrantDistFt = null;
      log("NOT FOUND: hydrant GeoJSON had no points. hydrantDistFt set null.");
      return;
    }
    const index = buildPointIndex(pts);
    let n = 0;
    for (const lot of lots) {
      const hit = nearestNamed(lot.lon, lot.lat, index);
      lot.hydrantDistFt = hit ? Math.round(hit.distFt) : null;
      if (hit) n++;
    }
    log(`Hydrants: ${pts.length} points; nearest assigned on ${n} lots.`);
  } catch (e) {
    for (const lot of lots) lot.hydrantDistFt = null;
    log(`NOT FOUND: WPRDC hydrants unreachable (${e instanceof Error ? e.message : e}). hydrantDistFt set null.`);
  }
}

export async function applyHistoric(lots: Lot[], log: Log): Promise<void> {
  const distFeats = await loadWprdcGeojson(
    "City Designated Historic Districts",
    "city-designated-historic-districts",
    log,
  );
  const siteFeats = await loadWprdcGeojson(
    "City Designated Historic Sites",
    "city-designated-individual-historic-sites",
    log,
  );
  if (!distFeats && !siteFeats) {
    for (const lot of lots) {
      lot.historicDistrict = null;
      lot.historicSite = null;
    }
    log("NOT FOUND: historic districts and sites. Fields set null.");
    return;
  }
  const distPolys = asPolygons(distFeats) ?? [];
  const distIndex = buildPolyIndex(distPolys);
  const sitePolys = asPolygons(siteFeats) ?? [];
  const siteIndex = buildPolyIndex(sitePolys);
  const sitePts = asPoints(siteFeats).filter(
    (p) => siteFeats?.some((f) => f.geometry?.type === "Point"),
  );
  const sitePtIndex = buildPointIndex(sitePts);
  let nDist = 0;
  let nSite = 0;
  for (const lot of lots) {
    const name = distPolys.length
      ? containingName(lot.lon, lot.lat, distPolys, distIndex)
      : null;
    lot.historicDistrict = name;
    if (name) nDist++;
    let onSite = false;
    if (sitePolys.length) {
      const siteName = containingName(lot.lon, lot.lat, sitePolys, siteIndex);
      onSite = siteName != null;
    }
    if (!onSite && sitePts.length) {
      const near = nearestNamed(lot.lon, lot.lat, sitePtIndex, 4);
      onSite = near != null && near.distFt <= 50;
    }
    lot.historicSite = onSite;
    if (onSite) nSite++;
  }
  log(
    `Historic: ${distPolys.length} district polygons, ${siteFeats?.length ?? 0} site features; ${nDist} lots in a district; ${nSite} lots on a site.`,
  );
}

export async function applyOpportunityZone(lots: Lot[], log: Log): Promise<void> {
  let feats: Feature[] | null = null;
  try {
    const found = await packageSearch("opportunity zones");
    const pkg = found.find((p) => /opportunity\s*zone/i.test(`${p.title} ${p.name}`));
    if (pkg) feats = await loadWprdcGeojson("Opportunity Zones", pkg.name, log);
    else log("WPRDC search for opportunity zones returned no package; trying HUD FeatureServer.");
  } catch (e) {
    log(`WPRDC opportunity zones search failed (${e instanceof Error ? e.message : e}); trying HUD.`);
  }
  if (!feats?.length) {
    try {
      const layer =
        "https://services.arcgis.com/VTyQ9soqVukalItT/ArcGIS/rest/services/Opportunity_Zones/FeatureServer/13";
      const page = await pageArcGisGeoJSON({
        layerUrl: layer,
        where: "STATE='42' AND COUNTY='003'",
        outFields: "GEOID,TRACT,COUNTY,STATE",
        pageSize: 2000,
      });
      feats = page as Feature[];
      log(`HUD Opportunity Zones (Allegheny County STATE=42 COUNTY=003): ${feats.length} tracts.`);
    } catch (e) {
      log(`NOT FOUND: HUD Opportunity Zones (${e instanceof Error ? e.message : e}). opportunityZone set null.`);
      for (const lot of lots) lot.opportunityZone = null;
      return;
    }
  }
  const polys = asPolygons(feats) ?? [];
  if (!polys.length) {
    for (const lot of lots) lot.opportunityZone = null;
    log("NOT FOUND: Opportunity Zone polygons empty. opportunityZone set null.");
    return;
  }
  const index = buildPolyIndex(polys);
  let n = 0;
  for (const lot of lots) {
    const hit = containingName(lot.lon, lot.lat, polys, index);
    lot.opportunityZone = hit != null;
    if (lot.opportunityZone) n++;
  }
  log(`Opportunity Zone: ${polys.length} tracts; ${n} lots inside a zone.`);
}

export async function applySchoolsAndParks(lots: Lot[], log: Log): Promise<void> {
  let schoolFeats = await loadWprdcGeojson("Allegheny County Schools", "allegheny-county-schools", log);
  if (!schoolFeats?.length) {
    schoolFeats = await loadWprdcGeojson(
      "Pittsburgh Public School Locations",
      "pittsburgh-public-school-locations",
      log,
    );
  }
  const parkFeats = await loadWprdcGeojson("City of Pittsburgh Parks", "parks", log);
  const schoolPts = asPoints(schoolFeats);
  if (schoolPts.length) {
    const index = buildPointIndex(schoolPts);
    let n = 0;
    for (const lot of lots) {
      const hit = nearestNamed(lot.lon, lot.lat, index);
      if (hit) {
        lot.schoolDistFt = Math.round(hit.distFt);
        lot.schoolName = hit.name ?? null;
        n++;
      } else {
        lot.schoolDistFt = null;
        lot.schoolName = null;
      }
    }
    log(`Schools: ${schoolPts.length} points; nearest assigned on ${n} lots.`);
  } else {
    for (const lot of lots) {
      lot.schoolDistFt = null;
      lot.schoolName = null;
    }
    log("NOT FOUND: school points. schoolDistFt/schoolName set null.");
  }

  const parkPolys = asPolygons(parkFeats);
  if (parkPolys?.length) {
    const index = buildPolyIndex(parkPolys);
    let n = 0;
    for (const lot of lots) {
      const cell = 0.004;
      const cx = Math.floor(lot.lon / cell);
      const cy = Math.floor(lot.lat / cell);
      let best: { distFt: number; name: string | null } | null = null;
      for (let r = 0; r <= 12; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            if (r > 0 && Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
            for (const poly of index.get(`${cx + dx}_${cy + dy}`) ?? []) {
              const d = distToPolygonFt(lot.lon, lot.lat, poly);
              const name = featureName(poly.properties as Record<string, unknown> | null);
              if (!best || d < best.distFt) best = { distFt: d, name };
            }
          }
        }
        if (best && best.distFt === 0) break;
        if (best && r >= 2) break;
      }
      if (best) {
        lot.parkDistFt = Math.round(best.distFt);
        lot.parkName = best.name;
        n++;
      } else {
        lot.parkDistFt = null;
        lot.parkName = null;
      }
    }
    log(`Parks: ${parkPolys.length} polygons; nearest assigned on ${n} lots.`);
  } else {
    for (const lot of lots) {
      lot.parkDistFt = null;
      lot.parkName = null;
    }
    log("NOT FOUND: parks polygons. parkDistFt/parkName set null.");
  }
}

function parseGtfsTime(raw: string): number | null {
  const parts = raw.trim().split(":");
  if (parts.length < 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  const s = Number(parts[2] ?? 0);
  if (![h, m, s].every(Number.isFinite)) return null;
  return h * 3600 + m * 60 + s;
}

export async function applyTransitFrequency(
  lots: Lot[],
  cacheDir: string,
  log: Log,
): Promise<void> {
  const gtfsDir = join(cacheDir, "gtfs");
  const zipPath = join(cacheDir, "gtfs.zip");
  try {
    mkdirSync(gtfsDir, { recursive: true });
    if (!existsSync(join(gtfsDir, "stop_times.txt"))) {
      const url = "https://www.rideprt.org/developerresources/google_transit.zip";
      log(`Downloading PRT GTFS ${url}`);
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Platsburgh/1.0; research)" },
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      writeFileSync(zipPath, Buffer.from(await res.arrayBuffer()));
      execFileSync("unzip", ["-o", zipPath, "-d", gtfsDir], { stdio: "inherit" });
    }
    const stopsCsv = readFileSync(join(gtfsDir, "stops.txt"), "utf8");
    const tripsCsv = readFileSync(join(gtfsDir, "trips.txt"), "utf8");
    const timesCsv = readFileSync(join(gtfsDir, "stop_times.txt"), "utf8");
    const calCsv = readFileSync(join(gtfsDir, "calendar.txt"), "utf8");
    const routesCsv = existsSync(join(gtfsDir, "routes.txt"))
      ? readFileSync(join(gtfsDir, "routes.txt"), "utf8")
      : "";
    const stops = Papa.parse<Record<string, string>>(stopsCsv, { header: true, skipEmptyLines: true }).data;
    const trips = Papa.parse<Record<string, string>>(tripsCsv, { header: true, skipEmptyLines: true }).data;
    const times = Papa.parse<Record<string, string>>(timesCsv, { header: true, skipEmptyLines: true }).data;
    const cal = Papa.parse<Record<string, string>>(calCsv, { header: true, skipEmptyLines: true }).data;
    const routes = routesCsv
      ? Papa.parse<Record<string, string>>(routesCsv, { header: true, skipEmptyLines: true }).data
      : [];
    const weekday = new Set(
      cal.filter((r) => String(r.monday) === "1").map((r) => r.service_id),
    );
    const busRoutes = new Set(
      routes.filter((r) => String(r.route_type) === "3").map((r) => r.route_id),
    );
    const tripOk = new Set<string>();
    for (const t of trips) {
      if (!weekday.has(t.service_id)) continue;
      if (busRoutes.size && t.route_id && !busRoutes.has(t.route_id)) continue;
      tripOk.add(t.trip_id);
    }
    const start = 7 * 3600;
    const end = 9 * 3600;
    const tripsByStop = new Map<string, Set<string>>();
    for (const row of times) {
      if (!tripOk.has(row.trip_id)) continue;
      const t = parseGtfsTime(row.arrival_time || row.departure_time || "");
      if (t == null || t < start || t >= end) continue;
      let set = tripsByStop.get(row.stop_id);
      if (!set) {
        set = new Set();
        tripsByStop.set(row.stop_id, set);
      }
      set.add(row.trip_id);
    }
    const stopPts: (NamedPt & { id: string })[] = [];
    for (const s of stops) {
      const lon = Number(s.stop_lon);
      const lat = Number(s.stop_lat);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      stopPts.push({ lon, lat, name: s.stop_id, id: s.stop_id });
    }
    const index = buildPointIndex(stopPts);
    let n = 0;
    for (const lot of lots) {
      const hit = nearestNamed(lot.lon, lot.lat, index);
      const stopId = hit?.name;
      if (!stopId) {
        lot.transitTripsPerHour = null;
        continue;
      }
      const count = tripsByStop.get(stopId)?.size ?? 0;
      lot.transitTripsPerHour = Math.round((count / 2) * 10) / 10;
      n++;
    }
    log(
      `GTFS: ${stopPts.length} stops, ${tripOk.size} weekday bus trips, ${tripsByStop.size} stops with 7–9 a.m. trips; transitTripsPerHour on ${n} lots.`,
    );
  } catch (e) {
    for (const lot of lots) lot.transitTripsPerHour = null;
    log(`NOT FOUND: PRT GTFS (${e instanceof Error ? e.message : e}). transitTripsPerHour set null.`);
  }
}

export async function applyStreetTrees(
  lots: Lot[],
  cacheDir: string,
  log: Log,
): Promise<void> {
  const treeFeats = await loadWprdcGeojson("City Trees", "city-trees", log);
  const pts = asPoints(treeFeats);
  if (!pts.length) {
    for (const lot of lots) lot.frontageTrees = null;
    log("NOT FOUND: City Trees points. frontageTrees set null.");
    return;
  }
  const geomPath = join(cacheDir, "geometry.json");
  if (!existsSync(geomPath)) {
    for (const lot of lots) lot.frontageTrees = null;
    log("NOT FOUND: data/cache/geometry.json required for street-facing edges. frontageTrees set null.");
    return;
  }
  const streetFeats = await loadWprdcGeojson("Pittsburgh Street Centerline", "pittsburgh-street-centerline", log);
  const lines: Feature<LineString>[] = [];
  for (const f of streetFeats ?? []) {
    if (f.geometry?.type === "LineString") lines.push(f as Feature<LineString>);
    else if (f.geometry?.type === "MultiLineString") {
      for (const coords of f.geometry.coordinates) lines.push(turf.lineString(coords));
    }
  }
  if (!lines.length) {
    for (const lot of lots) lot.frontageTrees = null;
    log("NOT FOUND: street centerlines for frontage edges. frontageTrees set null.");
    return;
  }
  const streetIndex = buildStreetIndex(lines);
  const treeIndex = buildPointIndex(pts, 0.0004);
  const geomFile = JSON.parse(readFileSync(geomPath, "utf8")) as {
    features: { id: string; geometry: Polygon | MultiPolygon }[];
  };
  const byId = new Map(geomFile.features.map((f) => [f.id, f.geometry]));
  let n = 0;
  let withEdges = 0;
  for (const lot of lots) {
    const g = byId.get(lot.id);
    if (!g) {
      lot.frontageTrees = null;
      continue;
    }
    const edges = streetFacingEdges(g, streetIndex);
    if (!edges.length) {
      lot.frontageTrees = 0;
      n++;
      continue;
    }
    withEdges++;
    lot.frontageTrees = countTreesNearEdges(treeIndex, edges, 25);
    n++;
  }
  log(`Street trees: ${pts.length} trees; frontageTrees on ${n} lots (${withEdges} with a street-facing edge).`);
}

export async function applyFacts(
  lots: Lot[],
  which: string,
  cacheDir: string,
  log: Log,
): Promise<void> {
  const all = which === "all";
  if (all || which === "hydrants") await applyHydrants(lots, log);
  if (all || which === "historic") await applyHistoric(lots, log);
  if (all || which === "oz") await applyOpportunityZone(lots, log);
  if (all || which === "schools") await applySchoolsAndParks(lots, log);
  if (all || which === "transit") await applyTransitFrequency(lots, cacheDir, log);
  if (all || which === "trees") await applyStreetTrees(lots, cacheDir, log);
}
