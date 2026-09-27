import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { fit } from "../lib/fit";
import { nextSteps } from "../lib/nextSteps";
import {
  extraSiteRows,
  historicDesignation,
  OPEN_DATA_UNAVAILABLE,
  transitHeaderLine,
  yesNoOrUnavailable,
  namedDistanceValue,
  countOrUnavailable,
} from "../lib/parcelSiteFacts";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
} from "../lib/rules";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];
const historic = lots.find((l) => l.id === "fixture-historic")!;
const nullFacts = lots.find((l) => l.id === "fixture-null-facts")!;

describe("§9 test 24 parcel facts", () => {
  it("fixture with historicDistrict set yields the HRC next step", () => {
    const result = fit(
      historic,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
    );
    const texts = nextSteps(historic, result, DEFAULT_CONSTRUCTION, DEFAULT_REGULATIONS).map(
      (s) => s.text,
    );
    expect(texts.some((t) => t.startsWith("Historic Review Commission approval"))).toBe(true);
  });

  it("historic designation shows the district name", () => {
    expect(historicDesignation("Mexican War Streets", false)).toBe("Mexican War Streets");
  });

  it("historic designation shows Individual site", () => {
    expect(historicDesignation(null, true)).toBe("Individual site");
  });

  it("historic designation shows None when both are definitively set", () => {
    expect(historicDesignation(null, false)).toBe("None");
  });

  it("fixture with null facts renders Not available in open data", () => {
    const rows = extraSiteRows(nullFacts);
    const hydrantRow = rows.find((r) => r.label === "Nearest fire hydrant");
    expect(hydrantRow?.value).toBe(OPEN_DATA_UNAVAILABLE);

    const historicRow = rows.find((r) => r.label === "Historic designation");
    expect(historicRow?.value).toBe(OPEN_DATA_UNAVAILABLE);

    const ozRow = rows.find((r) => r.label === "Opportunity Zone");
    expect(ozRow?.value).toBe(OPEN_DATA_UNAVAILABLE);

    const schoolRow = rows.find((r) => r.label === "Nearest school");
    expect(schoolRow?.value).toBe(OPEN_DATA_UNAVAILABLE);

    const parkRow = rows.find((r) => r.label === "Nearest park");
    expect(parkRow?.value).toBe(OPEN_DATA_UNAVAILABLE);

    const treesRow = rows.find((r) => r.label === "Street trees on frontage");
    expect(treesRow?.value).toBe(OPEN_DATA_UNAVAILABLE);
  });

  it("opportunity zone shows Yes/No", () => {
    expect(yesNoOrUnavailable(true)).toBe("Yes");
    expect(yesNoOrUnavailable(false)).toBe("No");
    expect(yesNoOrUnavailable(null)).toBe(OPEN_DATA_UNAVAILABLE);
  });

  it("named distance shows name and distance", () => {
    expect(namedDistanceValue("Westinghouse Academy", 1200)).toBe("Westinghouse Academy, 1200 ft");
    expect(namedDistanceValue(null, null)).toBe(OPEN_DATA_UNAVAILABLE);
  });

  it("transit header includes buses/hr when available", () => {
    expect(transitHeaderLine("500", 4.5)).toBe("Transit 500 ft · 4.5 buses/hr");
    expect(transitHeaderLine("500", 3)).toBe("Transit 500 ft · 3 buses/hr");
    expect(transitHeaderLine("500", null)).toBe("Transit 500 ft");
  });

  it("count or unavailable works", () => {
    expect(countOrUnavailable(3)).toBe("3");
    expect(countOrUnavailable(0)).toBe("0");
    expect(countOrUnavailable(null)).toBe(OPEN_DATA_UNAVAILABLE);
  });
});
