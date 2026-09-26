import { describe, expect, it } from "vitest";
import lotsJson from "../data/fixtures/lots.json";
import { fitAll } from "../lib/fit";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "../lib/rules";
import { decodeView, encodeView } from "../lib/urlState";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];

describe("§9 tests 16 and 19", () => {
  it("16. viewBounds scopes counts; map view is in the URL", () => {
    const city = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      null,
    );
    const cityBoxed = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      { minLon: -80.1, minLat: 40.4, maxLon: -79.8, maxLat: 40.5 },
    );
    expect(cityBoxed.conformingParcels).toBe(city.conformingParcels);
    expect(cityBoxed.inView).toBe(city.inView);

    const west = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      DEFAULT_SITE_FILTERS,
      { minLon: -80.1, minLat: 40.4, maxLon: -79.995, maxLat: 40.5 },
    );
    const westLots = lots.filter((l) => l.lon <= -79.995);
    expect(westLots).toHaveLength(3);
    expect(west.inView).toBe(3);
    expect(west.conformingParcels).toBe(
      fitAll(
        westLots,
        DEFAULT_REGULATIONS,
        DEFAULT_CONSTRUCTION,
        DEFAULT_SITE_CONDITIONS,
        DEFAULT_SITE_FILTERS,
        null,
      ).conformingParcels,
    );
    expect(west.inViewLine).toEqual({ n: 3, total: 6 });

    const query = encodeView({
      map: { lat: 40.44, lng: -80.0, z: 12 },
    });
    expect(query).toContain("lat=40.44");
    expect(query).toContain("lng=-80");
    expect(query).toContain("z=12");
    const decoded = decodeView(query);
    expect(decoded.map).toEqual({ lat: 40.44, lng: -80.0, z: 12 });
  });

  it("19. transit and delinquent/foreclosed filters compose with bounds", () => {
    const near = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      { ...DEFAULT_SITE_FILTERS, nearTransitOnly: true },
      null,
    );
    expect(near.inView).toBe(lots.filter((l) => l.transitDistM <= 400).length);
    expect(near.results.filter((r) => r.inView).every((r) => r.lot.transitDistM <= 400)).toBe(
      true,
    );

    const publicPath = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      { ...DEFAULT_SITE_FILTERS, delinquentOrForeclosedOnly: true },
      null,
    );
    expect(
      publicPath.results
        .filter((r) => r.inView)
        .every((r) => r.lot.taxDelinquent || r.lot.foreclosure),
    ).toBe(true);

    const both = fitAll(
      lots,
      DEFAULT_REGULATIONS,
      DEFAULT_CONSTRUCTION,
      DEFAULT_SITE_CONDITIONS,
      {
        ...DEFAULT_SITE_FILTERS,
        nearTransitOnly: true,
        delinquentOrForeclosedOnly: true,
      },
      { minLon: -80.1, minLat: 40.4, maxLon: -79.8, maxLat: 40.5 },
    );
    expect(
      both.results
        .filter((r) => r.inView)
        .every(
          (r) =>
            r.lot.transitDistM <= 400 &&
            (r.lot.taxDelinquent || r.lot.foreclosure),
        ),
    ).toBe(true);
  });
});
