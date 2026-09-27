import { sourceCite } from "./sources";
import type { Lot } from "./types";

export const OPEN_DATA_UNAVAILABLE = "Not available in open data.";

export function hydrantValue(hydrantDistFt: number | null | undefined): string {
  if (hydrantDistFt == null) return OPEN_DATA_UNAVAILABLE;
  return `${Math.round(hydrantDistFt)} ft`;
}

export function historicDesignation(
  historicDistrict: string | null | undefined,
  historicSite: boolean | null | undefined,
): string {
  if (historicDistrict) return historicDistrict;
  if (historicSite === true) return "Individual site";
  if (historicDistrict === null && historicSite === false) return "None";
  return OPEN_DATA_UNAVAILABLE;
}

export function yesNoOrUnavailable(v: boolean | null | undefined): string {
  if (v == null) return OPEN_DATA_UNAVAILABLE;
  return v ? "Yes" : "No";
}

export function namedDistanceValue(
  name: string | null | undefined,
  distFt: number | null | undefined,
): string {
  if (name == null || distFt == null) return OPEN_DATA_UNAVAILABLE;
  return `${name}, ${Math.round(distFt)} ft`;
}

export function countOrUnavailable(n: number | null | undefined): string {
  if (n == null) return OPEN_DATA_UNAVAILABLE;
  return String(n);
}

export function transitHeaderLine(
  transitFt: string,
  transitTripsPerHour: number | null | undefined,
): string {
  if (transitTripsPerHour == null) return `Transit ${transitFt} ft`;
  const t =
    Math.abs(transitTripsPerHour - Math.round(transitTripsPerHour)) < 1e-6
      ? String(Math.round(transitTripsPerHour))
      : transitTripsPerHour.toFixed(1);
  return `Transit ${transitFt} ft · ${t} buses/hr`;
}

export function extraSiteRows(lot: Lot): { label: string; value: string; source: string }[] {
  return [
    {
      label: "Nearest fire hydrant",
      value: hydrantValue(lot.hydrantDistFt),
      source: sourceCite("Hydrant") || "PWSA via WPRDC · 2026-09-27",
    },
    {
      label: "Historic designation",
      value: historicDesignation(lot.historicDistrict, lot.historicSite),
      source: sourceCite("Historic"),
    },
    {
      label: "Opportunity Zone",
      value: yesNoOrUnavailable(lot.opportunityZone),
      source: sourceCite("Opportunity"),
    },
    {
      label: "Nearest school",
      value: namedDistanceValue(lot.schoolName, lot.schoolDistFt),
      source: sourceCite("School"),
    },
    {
      label: "Nearest park",
      value: namedDistanceValue(lot.parkName, lot.parkDistFt),
      source: sourceCite("Park"),
    },
    {
      label: "Street trees on frontage",
      value: countOrUnavailable(lot.frontageTrees),
      source: sourceCite("Trees"),
    },
  ];
}
