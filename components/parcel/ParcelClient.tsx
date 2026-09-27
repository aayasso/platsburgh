"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ParcelAerial } from "@/components/parcel/ParcelAerial";
import { ProForma } from "@/components/parcel/ProForma";
import { buildableEnvelope, fit } from "@/lib/fit";
import { fmtInt, metersToFt } from "@/lib/format";
import { zipHomeValuesFigure } from "@/lib/parcelRefs";
import { estimatedSiteAdders, proforma } from "@/lib/proforma";
import { dwellingUnits } from "@/lib/rules";
import { SITE_CITES } from "@/lib/sources";
import type { Lot } from "@/lib/types";
import {
  decodeParcelOverrides,
  decodeView,
  encodeParcelQuery,
  type WorkspaceState,
} from "@/lib/urlState";

export function ParcelClient(props: {
  lot: Lot;
  query: string;
  hasSummary: boolean;
}) {
  const { lot } = props;
  const [state, setState] = useState<WorkspaceState>(() => decodeView(props.query));
  const defaultSite = estimatedSiteAdders(lot, state.construction);
  const initial = decodeParcelOverrides(props.query, lot.assessedLand, defaultSite);
  const [land, setLand] = useState(initial.land);
  const [sitecost, setSitecost] = useState(initial.sitecost);

  const persist = useCallback(
    (next: WorkspaceState, nextLand = land, nextSite = sitecost) => {
      setState(next);
      const siteDefault = estimatedSiteAdders(lot, next.construction);
      const q = encodeParcelQuery(next, nextLand, nextSite, lot.assessedLand, siteDefault);
      window.history.replaceState(null, "", q ? `/parcel/${lot.id}?${q}` : `/parcel/${lot.id}`);
    },
    [land, sitecost, lot],
  );

  const result = fit(lot, state.regulations, state.construction, state.siteConditions);
  const envelope = buildableEnvelope(lot, state.regulations, state.construction);
  const units = dwellingUnits(state.construction);
  const pf = proforma(lot, state.construction, state.economics, state.household, {
    landOverride: land,
    siteOverride: sitecost,
  });
  const parkingRequired = state.regulations.parkingPerUnit * state.construction.units;
  const check = (id: string) => result.checks.find((c) => c.id === id);
  const siteCheck = check("site");
  const query = encodeParcelQuery(
    state,
    land,
    sitecost,
    lot.assessedLand,
    estimatedSiteAdders(lot, state.construction),
  );
  const back = query ? `/?${query}` : "/";
  const transitFt =
    lot.transitDistM === "unknown" ? "—" : String(Math.round(metersToFt(lot.transitDistM)));
  const tax =
    lot.foreclosure === true
      ? "In foreclosure"
      : lot.taxDelinquent === true
        ? "Tax-delinquent"
        : "Taxes current";
  const aduLine = !state.construction.adu
    ? "No ADU."
    : state.regulations.aduAllowed
      ? "ADU included — permitted."
      : "ADU included — not permitted.";
  const parkingLine =
    parkingRequired === 0
      ? "No parking required."
      : lot.widthFt >= 20
        ? `${parkingRequired} spaces required — ${Math.round(lot.widthFt)} ft of frontage accommodates a driveway.`
        : `${parkingRequired} spaces required — ${Math.round(lot.widthFt)} ft of frontage does not accommodate a driveway.`;
  const siteLine = siteCheck?.pass
    ? "None flagged."
    : `${siteCheck?.constraint ?? "Site conditions"} — excluded by site-condition settings.`;

  const compliance = useMemo(
    () =>
      [
        ["Site conditions", siteLine, siteCheck?.pass],
        [
          "Lot area",
          `${fmtInt(lot.lotSf)} sq ft — minimum ${fmtInt(state.regulations.minLotSf)}.`,
          check("lotSize")?.pass,
        ],
        [
          "Frontage",
          `${Math.round(lot.widthFt)} ft of frontage — minimum ${state.siteConditions.minFrontageFt}.`,
          check("frontage")?.pass,
        ],
        [
          "Buildable area",
          `${Math.round(envelope.widthFt * 100) / 100} × ${Math.round(envelope.depthFt * 100) / 100} ft buildable after setbacks — building ${state.construction.widthFt} × ${state.construction.depthFt}.`,
          check("envelope")?.pass,
        ],
        [
          "Units",
          `${state.construction.units} units — ${state.regulations.unitsPerLot} permitted per parcel.`,
          check("units")?.pass,
        ],
        ["ADU", aduLine, check("adu")?.pass],
        [
          "Height",
          `${state.construction.stories} stories — maximum ${state.regulations.maxStories}.`,
          check("stories")?.pass,
        ],
        ["Parking", parkingLine, check("parking")?.pass],
      ] as const,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, lot, envelope.widthFt, envelope.depthFt, siteLine, aduLine, parkingLine],
  );

  const status = result.conforming
    ? pf.affordable
      ? "CONFORMING · FEASIBLE · AFFORDABLE"
      : pf.feasible
        ? "CONFORMING · FEASIBLE"
        : "CONFORMING"
    : ["NON-CONFORMING", result.constraint ?? ""].filter(Boolean).join(" · ");

  const city = SITE_CITES.city;
  const fema = SITE_CITES.flood;
  const dep = SITE_CITES.water;
  const streets = SITE_CITES.streets;
  const yn = (v: boolean | "unknown") =>
    v === "unknown" ? "Not available in open data." : v ? "Yes" : "No";
  const siteRows: { label: string; value: string; source: string }[] = [
    {
      label: "Steep slope",
      value:
        typeof lot.slopeShare === "number"
          ? yn(lot.slopeShare > 0.3)
          : "Not available in open data.",
      source: city,
    },
    {
      label: "Landslide-prone",
      value: yn(lot.landslide),
      source: city,
    },
    {
      label: "Undermined",
      value: yn(lot.undermined),
      source: city,
    },
    {
      label: "Flood zone",
      value: yn(lot.flood),
      source: fema,
    },
    {
      label: "Greenway",
      value: yn(lot.greenway),
      source: city,
    },
    {
      label: "No water service",
      value: lot.water === "unknown" ? "Not available in open data." : yn(!lot.water),
      source: dep,
    },
    {
      label: "Sewer",
      value: "not available in open data — confirm with PWSA.",
      source: "",
    },
    {
      label: "Stairs-only access",
      value: yn(lot.stepsOnly),
      source: streets,
    },
    {
      label: "Condemned structure",
      value:
        lot.condemned === "unknown" || lot.condemned == null
          ? "Not available in open data."
          : yn(lot.condemned),
      source: SITE_CITES.condemned,
    },
    {
      label: "Open violations",
      value:
        lot.openViolations === "unknown" || lot.openViolations == null
          ? "Not available in open data."
          : String(lot.openViolations),
      source: SITE_CITES.violations,
    },
    {
      label: "Property tax abatement",
      value:
        lot.abatedThrough === "unknown"
          ? "Not available in open data."
          : typeof lot.abatedThrough === "number"
            ? `Yes, through ${lot.abatedThrough}`
            : "No",
      source: SITE_CITES.abatements,
    },
    {
      label: "ZIP home values, prior 12 months",
      value: zipHomeValuesFigure(lot.zhviChange12m),
      source: "Zillow ZHVI, ZIP",
    },
  ];

  return (
    <main className="min-h-screen bg-limestone text-ink">
      <header className="flex items-center justify-between bg-pine px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="font-display text-[18px] font-bold tracking-mark text-limestone">
            PLATSBURGH
          </span>
          <Link href={back} className="font-display text-[13px] tracking-section text-limestone">
            ← MAP
          </Link>
        </div>
        <span className="font-mono text-[12px] text-limestone/70">{lot.id}</span>
      </header>
      <div className="mx-auto max-w-6xl px-8 py-8">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="font-display text-[32px] font-bold tracking-heading">
              {lot.address}
            </h1>
            <p className="mt-2 font-sans text-[15px] text-moss">
              {lot.neighborhood} · Zoning district {lot.district} · {fmtInt(lot.lotSf)} sq ft ·{" "}
              {Math.round(lot.widthFt)} × {Math.round(lot.depthFt * 100) / 100} ft ·{" "}
              {lot.empty ? "Vacant" : "Improved"} ·{" "}
              {lot.owner === "city" ? "City-owned" : "Privately owned"} · Transit {transitFt} ft · {tax}
            </p>
            <div className="mt-3 text-right">
              <div className="font-display text-[14px] font-bold tracking-section">{status}</div>
              <div className="mt-1 font-mono text-[12px] text-moss">
                at current parameters · {state.construction.widthFt} × {state.construction.depthFt} ·{" "}
                {state.construction.stories} stories · {units} units
                {state.construction.adu ? " + ADU" : ""}
              </div>
            </div>
          </div>
          <ParcelAerial lot={lot} />
        </div>

        <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">COMPLIANCE</h2>
        <div className="mt-2">
          {compliance.map(([label, wording, ok]) => (
            <div
              key={label}
              className={`flex items-baseline justify-between border-b border-limestone-dark py-2 pl-3 ${
                ok ? "border-l-[6px] border-l-pine" : "border-l-[6px] border-l-brick"
              }`}
            >
              <div>
                <span className="mr-4 font-display text-[13px] tracking-heading">{label}</span>
                <span className="font-sans text-[14px]">{wording}</span>
              </div>
              <span className="font-display text-[12px] tracking-section">{ok ? "PASS" : "FAIL"}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">
          SITE CONDITIONS
        </h2>
        <div className="mt-2">
          {siteRows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between border-b border-limestone-dark py-2"
            >
              <span className="font-sans text-[14px]">
                {row.label}: {row.value}
              </span>
              <span className="font-mono text-[11px] text-moss">{row.source}</span>
            </div>
          ))}
        </div>

        <ProForma
          lot={lot}
          state={state}
          land={land}
          sitecost={sitecost}
          hasSummary={props.hasSummary}
          checkLines={compliance.map(([, wording]) => wording)}
          onEconomics={(key, n) =>
            persist({ ...state, economics: { ...state.economics, [key]: n } })
          }
          onHousehold={(household) => persist({ ...state, household })}
          onLand={(n) => {
            setLand(n);
            persist(state, n, sitecost);
          }}
          onSite={(n) => {
            setSitecost(n);
            persist(state, land, n);
          }}
        />

        <p className="mt-12 font-sans text-[13px] text-moss">
          Decision-support prototype built at the AI Horizons AI for Housing Hackathon, Sept 26–27,
          2026. Not legal, financial, or zoning advice. Sources and limitations: /docs.
        </p>
      </div>
    </main>
  );
}
