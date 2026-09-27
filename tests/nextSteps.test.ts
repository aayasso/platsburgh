import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { fit } from "../lib/fit";
import { nextSteps } from "../lib/nextSteps";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
} from "../lib/rules";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];
const anchor = lots.find((l) => l.id === "0050M00032000000")!;
const flood = lots.find((l) => l.id === "fixture-flood")!;

const calibrationBuilding = {
  widthFt: 16,
  depthFt: 64,
  stories: 3,
  units: 2,
  attached: false,
  adu: false,
};

const calibrationRegs = {
  ...DEFAULT_REGULATIONS,
  minLotSf: 1200,
  frontSetbackFt: 15,
  rearSetbackFt: 15,
  sideSetbackFt: 3,
  unitsPerLot: 2,
  maxStories: 3,
};

describe("§9 test 22 next steps", () => {
  it("anchor at calibration parameters: permit, stormwater, contextual setback, not variance", () => {
    const result = fit(
      anchor,
      calibrationRegs,
      calibrationBuilding,
      DEFAULT_SITE_CONDITIONS,
    );
    expect(result.conforming).toBe(true);
    const texts = nextSteps(anchor, result, calibrationBuilding, calibrationRegs).map(
      (s) => s.text,
    );
    expect(texts.some((t) => t.startsWith("Building permit"))).toBe(true);
    expect(texts.some((t) => t.startsWith("Stormwater review"))).toBe(true);
    expect(texts.some((t) => t.startsWith("Contextual setback"))).toBe(true);
    expect(texts.some((t) => t.startsWith("Variance"))).toBe(false);
    expect(
      nextSteps(anchor, result, calibrationBuilding, calibrationRegs).every((s) => s.href),
    ).toBe(true);
  });

  it("anchor at defaults: variance", () => {
    const storiesLimit = { ...DEFAULT_REGULATIONS, maxStories: 3 };
    const result = fit(anchor, storiesLimit, calibrationBuilding, DEFAULT_SITE_CONDITIONS);
    const texts = nextSteps(anchor, result, calibrationBuilding, storiesLimit).map(
      (s) => s.text,
    );
    expect(texts.some((t) => t.startsWith("Variance"))).toBe(true);
  });

  it("flood fixture adds the floodplain line", () => {
    const result = fit(
      flood,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      { ...DEFAULT_SITE_CONDITIONS, skipFlood: false },
    );
    const texts = nextSteps(flood, result, DEFAULT_CONSTRUCTION, DEFAULT_REGULATIONS).map(
      (s) => s.text,
    );
    expect(texts.some((t) => t.startsWith("Floodplain permit"))).toBe(true);
  });
});
