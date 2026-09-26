import { performance } from "node:perf_hooks";
import lotsJson from "../data/lots.json";
import { fitAll } from "../lib/fit";
import {
  DEFAULT_CONSTRUCTION,
  DEFAULT_REGULATIONS,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
} from "../lib/rules";
import type { Lot } from "../lib/types";

const lots = lotsJson as Lot[];
const start = performance.now();
const result = fitAll(
  lots,
  DEFAULT_REGULATIONS,
  DEFAULT_CONSTRUCTION,
  DEFAULT_SITE_CONDITIONS,
  DEFAULT_SITE_FILTERS,
  null,
);
const ms = performance.now() - start;
console.log(
  JSON.stringify(
    {
      n: lots.length,
      ms: Math.round(ms * 10) / 10,
      inView: result.inView,
      conformingParcels: result.conformingParcels,
      conformingUnits: result.conformingUnits,
    },
    null,
    2,
  ),
);
if (ms >= 200) process.exit(2);
