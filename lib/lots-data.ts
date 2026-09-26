import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Lot } from "./types";

let cache: Lot[] | null = null;

export function getLots(): Lot[] {
  if (!cache) {
    const path = join(process.cwd(), "data", "lots.json");
    cache = JSON.parse(readFileSync(path, "utf8")) as Lot[];
  }
  return cache;
}

export function getLot(id: string): Lot | undefined {
  const pin = id.replace(/[\s-]/g, "").toUpperCase();
  return getLots().find((l) => l.id === pin);
}
