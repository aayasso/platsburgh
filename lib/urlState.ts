import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
} from "./rules";
import type { Construction, Regulations, SiteConditions } from "./types";

export type MapView = {
  lat: number;
  lng: number;
  z: number;
};

const REG_KEYS = {
  lot: "minLotSf",
  front: "frontSetbackFt",
  rear: "rearSetbackFt",
  side: "sideSetbackFt",
  stories: "maxStories",
  upl: "unitsPerLot",
  park: "parkingPerUnit",
  adu: "aduAllowed",
} as const;

const CON_KEYS = {
  w: "widthFt",
  d: "depthFt",
  st: "stories",
  u: "units",
  att: "attached",
  cadu: "adu",
} as const;

export function encodeView(params: {
  regulations?: Regulations;
  construction?: Construction;
  siteConditions?: SiteConditions;
  map?: MapView;
}): string {
  const regulations = params.regulations ?? DEFAULT_REGULATIONS;
  const construction = params.construction ?? DEFAULT_CONSTRUCTION;
  const search = new URLSearchParams();

  (Object.entries(REG_KEYS) as [keyof typeof REG_KEYS, keyof Regulations][]).forEach(
    ([q, key]) => {
      const value = regulations[key];
      const def = DEFAULT_REGULATIONS[key];
      if (value !== def) search.set(q, String(value));
    },
  );
  (Object.entries(CON_KEYS) as [keyof typeof CON_KEYS, keyof Construction][]).forEach(
    ([q, key]) => {
      const value = construction[key];
      const def = DEFAULT_CONSTRUCTION[key];
      if (value !== def) search.set(q, String(value));
    },
  );
  if (params.map) {
    search.set("lat", String(params.map.lat));
    search.set("lng", String(params.map.lng));
    search.set("z", String(params.map.z));
  }
  return search.toString();
}

export function decodeView(query: string): {
  regulations: Regulations;
  construction: Construction;
  siteConditions: SiteConditions;
  map: MapView | null;
} {
  const search = new URLSearchParams(query);
  const regulations = { ...DEFAULT_REGULATIONS };
  const construction = { ...DEFAULT_CONSTRUCTION };
  (Object.entries(REG_KEYS) as [keyof typeof REG_KEYS, keyof Regulations][]).forEach(
    ([q, key]) => {
      const raw = search.get(q);
      if (raw === null) return;
      if (key === "aduAllowed") regulations.aduAllowed = raw === "true";
      else (regulations[key] as number) = Number(raw);
    },
  );
  (Object.entries(CON_KEYS) as [keyof typeof CON_KEYS, keyof Construction][]).forEach(
    ([q, key]) => {
      const raw = search.get(q);
      if (raw === null) return;
      if (key === "attached" || key === "adu") construction[key] = raw === "true";
      else (construction[key] as number) = Number(raw);
    },
  );
  const lat = search.get("lat");
  const lng = search.get("lng");
  const z = search.get("z");
  const map =
    lat !== null && lng !== null && z !== null
      ? { lat: Number(lat), lng: Number(lng), z: Number(z) }
      : null;
  return {
    regulations,
    construction,
    siteConditions: { ...DEFAULT_SITE_CONDITIONS },
    map,
  };
}
