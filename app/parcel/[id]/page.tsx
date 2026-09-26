import Link from "next/link";
import { buildableEnvelope, fit } from "@/lib/fit";
import { fmtInt, metersToFt } from "@/lib/format";
import { getLot } from "@/lib/lots-data";
import { dwellingUnits } from "@/lib/rules";
import { decodeView } from "@/lib/urlState";

function qs(sp: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => search.append(k, x));
    else if (v != null) search.set(k, v);
  }
  return search.toString();
}

export default async function ParcelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const query = qs(sp);
  const state = decodeView(query);
  const lot = getLot(id);
  if (!lot) {
    return (
      <main className="min-h-screen bg-limestone p-8 text-ink">
        <p className="font-sans text-[16px]">
          Parcel ID not found. Use the 16-character County ID, for example 0050M00032000000.
        </p>
        <Link href={query ? `/?${query}` : "/"} className="mt-4 inline-block font-display tracking-section">
          ← MAP
        </Link>
      </main>
    );
  }

  const result = fit(lot, state.regulations, state.construction, state.siteConditions);
  const envelope = buildableEnvelope(lot, state.regulations, state.construction);
  const units = dwellingUnits(state.construction);
  const parkingRequired = state.regulations.parkingPerUnit * state.construction.units;
  const check = (id: string) => result.checks.find((c) => c.id === id);
  const passFail = (ok: boolean) => (ok ? "PASS" : "FAIL");
  const siteCheck = check("site");
  const lotCheck = check("lotSize");
  const frontCheck = check("frontage");
  const envCheck = check("envelope");
  const unitsCheck = check("units");
  const aduCheck = check("adu");
  const heightCheck = check("stories");
  const parkCheck = check("parking");

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

  const siteRows: { label: string; value: string; source: string }[] = [
    {
      label: "Slope",
      value:
        typeof lot.slopeShare === "number"
          ? `${Math.round(lot.slopeShare * 100)}% of lot on 25%+ slope`
          : "Not available in open data.",
      source: "City of Pittsburgh · 2024-11",
    },
    {
      label: "Landslide-prone",
      value: lot.landslide === "unknown" ? "Not available in open data." : lot.landslide ? "Yes" : "No",
      source: "City of Pittsburgh · 2024-11",
    },
    {
      label: "Undermined",
      value: lot.undermined === "unknown" ? "Not available in open data." : lot.undermined ? "Yes" : "No",
      source: "City of Pittsburgh · 2024-11",
    },
    {
      label: "Flood zone",
      value: lot.flood === "unknown" ? "Not available in open data." : lot.flood ? "Yes" : "No (Zone X)",
      source: "FEMA NFHL · 2025-06",
    },
    {
      label: "Greenway",
      value: lot.greenway === "unknown" ? "Not available in open data." : lot.greenway ? "Yes" : "No",
      source: "City of Pittsburgh · 2024-11",
    },
    {
      label: "Water service",
      value: lot.water === "unknown" ? "Not available in open data." : lot.water ? "Yes (PWSA)" : "No",
      source: "PA DEP via WPRDC · 2025-03",
    },
    {
      label: "Sewer",
      value: "not available in open data — confirm with PWSA.",
      source: "no source",
    },
    {
      label: "Street access",
      value: lot.stepsOnly ? "stairs-only" : "street frontage",
      source: "City centerlines · 2025-01",
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
      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="flex items-start justify-between gap-8">
          <div>
            <h1 className="font-display text-[32px] font-bold tracking-heading">
              {lot.address}
            </h1>
            <p className="mt-2 font-sans text-[15px] text-moss">
              {lot.neighborhood} · Zoning district {lot.district} · {fmtInt(lot.lotSf)} sq ft ·{" "}
              {Math.round(lot.widthFt)} × {Math.round(lot.depthFt)} ft · {lot.empty ? "Vacant" : "Improved"}{" "}
              · {lot.owner === "city" ? "City-owned" : "Privately owned"} · Transit {transitFt} ft · {tax}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-[14px] font-bold tracking-section">
              {result.conforming ? "CONFORMING" : `NON-CONFORMING`}
              {result.constraint ? ` · ${result.constraint}` : ""}
            </div>
            <div className="mt-1 font-mono text-[12px] text-moss">
              at current parameters · {state.construction.widthFt} × {state.construction.depthFt} ·{" "}
              {state.construction.stories} stories · {units} units
              {state.construction.adu ? " + ADU" : ""}
            </div>
          </div>
        </div>

        <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">COMPLIANCE</h2>
        <div className="mt-2">
          {(
            [
              ["Site conditions", siteLine, siteCheck?.pass],
              [
                "Lot area",
                `${fmtInt(lot.lotSf)} sq ft — minimum ${fmtInt(state.regulations.minLotSf)}.`,
                lotCheck?.pass,
              ],
              [
                "Frontage",
                `${Math.round(lot.widthFt)} ft of frontage — minimum ${state.siteConditions.minFrontageFt}.`,
                frontCheck?.pass,
              ],
              [
                "Buildable area",
                `${Math.round(envelope.widthFt)} × ${Math.round(envelope.depthFt)} ft buildable after setbacks — building ${state.construction.widthFt} × ${state.construction.depthFt}.`,
                envCheck?.pass,
              ],
              [
                "Units",
                `${state.construction.units} units — ${state.regulations.unitsPerLot} permitted per parcel.`,
                unitsCheck?.pass,
              ],
              ["ADU", aduLine, aduCheck?.pass],
              [
                "Height",
                `${state.construction.stories} stories — maximum ${state.regulations.maxStories}.`,
                heightCheck?.pass,
              ],
              ["Parking", parkingLine, parkCheck?.pass],
            ] as const
          ).map(([label, wording, ok]) => (
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
              <span className="font-display text-[12px] tracking-section">{passFail(!!ok)}</span>
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

        <p className="mt-12 font-sans text-[13px] text-moss">
          Decision-support prototype built at the AI Horizons AI for Housing Hackathon, Sept 26–27,
          2026. Not legal, financial, or zoning advice. Sources and limitations: /docs.
        </p>
      </div>
    </main>
  );
}
