import type { Economics, Regulations } from "./types";

export function dumpRegulations(regulations: Regulations): string {
  return JSON.stringify(regulations);
}

export function loadRegulations(json: string): Regulations {
  return JSON.parse(json) as Regulations;
}

export function dumpEconomics(economics: Economics): string {
  return JSON.stringify(economics);
}

export function loadEconomics(json: string): Economics {
  return JSON.parse(json) as Economics;
}
