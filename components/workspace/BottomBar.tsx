"use client";

import Papa from "papaparse";
import { useMemo, useState } from "react";
import type { Evaluation } from "@/lib/evaluate";
import { fmtInt, fmtMoney } from "@/lib/format";
import { formatLeverValue, LEVER_LABEL, METRIC_WORD, PANEL_WORD } from "@/lib/leverCopy";
import type { LeverRow } from "@/lib/levers";
import { SOURCES } from "@/lib/sources";
import type { BarTab } from "@/lib/urlState";

const PAGE = 40;

export function BottomBar(props: {
  bar: BarTab;
  evaluation: Evaluation;
  levers: LeverRow[];
  constraintFilter: string | null;
  onBar: (bar: BarTab) => void;
  onConstraint: (c: string | null) => void;
}) {
  const open = props.bar !== "closed";
  const [page, setPage] = useState(0);
  const parcels = props.evaluation.parcels;
  const pageCount = Math.max(1, Math.ceil(parcels.length / PAGE));
  const slice = useMemo(
    () => parcels.slice(page * PAGE, page * PAGE + PAGE),
    [parcels, page],
  );

  function setTab(tab: Exclude<BarTab, "closed">) {
    if (props.bar === tab) props.onBar("closed");
    else {
      setPage(0);
      props.onBar(tab);
    }
  }

  function downloadCsv() {
    const rows = parcels.map((p) => ({
      Address: p.lot.address,
      Neighborhood: p.lot.neighborhood,
      "Lot area (sq ft)": p.lot.lotSf,
      "Frontage (ft)": p.lot.widthFt,
      Status:
        p.status === "cfa"
          ? "Conforming · feasible · affordable"
          : p.status === "cf"
            ? "Conforming · feasible"
            : p.status === "c"
              ? "Conforming"
              : p.status === "unknown"
                ? "Site data unavailable"
                : (p.constraint ?? "Non-conforming"),
      "Subsidy required": p.subsidyRequired > 0 ? p.subsidyRequired : "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platsburgh-parcels.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tabClass = (id: BarTab) =>
    `font-display text-[13px] font-semibold tracking-section ${
      props.bar === id
        ? id === "constraints"
          ? "text-limestone underline decoration-brick decoration-2 underline-offset-8"
          : "text-limestone underline decoration-centerline decoration-2 underline-offset-8"
        : "text-limestone/85"
    }`;

  return (
    <div className="pointer-events-auto absolute bottom-0 left-0 right-0 z-30 bg-pine">
      <div className="h-[3px] bg-centerline" />
      {open ? (
        <div className="max-h-[40vh] overflow-y-auto px-6 py-4">
          {props.bar === "constraints" ? (
            <ul>
              {props.evaluation.constraintCounts.map((row) => (
                <li key={row.constraint}>
                  <button
                    type="button"
                    className={`flex w-full items-baseline justify-between py-1 text-left ${
                      props.constraintFilter === row.constraint ? "text-brick-light" : "text-limestone"
                    }`}
                    onClick={() =>
                      props.onConstraint(
                        props.constraintFilter === row.constraint ? null : row.constraint,
                      )
                    }
                  >
                    <span className="font-sans text-[14px]">{row.constraint}</span>
                    <span className="font-mono text-[13px] text-brick-light">{fmtInt(row.n)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {props.bar === "levers" ? (
            <div>
              <p className="mb-3 font-sans text-[14px] text-limestone/70">
                Effect of loosening each parameter one step from the current settings. Nothing moves
                until you move it.
              </p>
              <ul>
                {props.levers.map((row) => {
                  const muted = row.atLimit || row.delta === 0;
                  return (
                    <li
                      key={row.lever}
                      className={`flex items-baseline gap-3 py-1 font-mono text-[13px] ${
                        muted ? "text-limestone/45" : "text-limestone"
                      }`}
                    >
                      <span className="w-28 shrink-0 font-display text-[11px] tracking-section text-limestone/50">
                        {PANEL_WORD[row.panel]}
                      </span>
                      <span className="flex-1">
                        {LEVER_LABEL[row.lever] ?? row.lever} {formatLeverValue(row.lever, row.from)}{" "}
                        → {formatLeverValue(row.lever, row.to)}
                      </span>
                      <span className={muted ? "" : "text-centerline"}>
                        {row.atLimit
                          ? "at limit"
                          : row.delta === 0
                            ? "no change"
                            : `+${fmtInt(row.delta)} units ${METRIC_WORD[row.metric]}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
          {props.bar === "parcels" ? (
            parcels.length === 0 ? (
              <p className="font-sans text-[15px] text-limestone">
                No parcels match the current parameters.
              </p>
            ) : (
              <div>
                <table className="w-full text-left font-sans text-[13px] text-limestone">
                  <thead className="font-display text-[11px] tracking-heading text-limestone/70">
                    <tr>
                      <th className="py-1">Address</th>
                      <th>Neighborhood</th>
                      <th>Lot area (sq ft)</th>
                      <th>Frontage (ft)</th>
                      <th>Status</th>
                      <th>Subsidy required</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px]">
                    {slice.map((p) => (
                      <tr key={p.lot.id} className="border-t border-limestone/10">
                        <td className="py-1">{p.lot.address}</td>
                        <td>{p.lot.neighborhood}</td>
                        <td>{fmtInt(p.lot.lotSf)}</td>
                        <td>{Math.round(p.lot.widthFt)}</td>
                        <td>
                          {p.status === "cfa"
                            ? "Conforming · feasible · affordable"
                            : p.constraint ?? "Conforming"}
                        </td>
                        <td>{p.subsidyRequired > 0 ? fmtMoney(p.subsidyRequired) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 flex gap-2 font-mono text-[12px] text-limestone/70">
                  <button type="button" disabled={page === 0} onClick={() => setPage((n) => n - 1)}>
                    ←
                  </button>
                  <span>
                    {page + 1} / {pageCount}
                  </span>
                  <button
                    type="button"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((n) => n + 1)}
                  >
                    →
                  </button>
                </div>
              </div>
            )
          ) : null}
          {props.bar === "sources" ? (
            <ul className="space-y-2">
              {SOURCES.map((s) => (
                <li key={s.name} className="font-sans text-[14px] text-limestone">
                  <span>{s.name}</span>
                  <span className="text-limestone/70"> · {s.publisher}</span>
                  <span className="font-mono text-[12px] text-limestone/70">
                    {" "}
                    · retrieved {s.retrieved}
                  </span>
                  {" · "}
                  <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                    {s.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center gap-6 px-6 py-3">
        <button type="button" className={tabClass("constraints")} onClick={() => setTab("constraints")}>
          CONSTRAINTS
        </button>
        <button type="button" className={tabClass("levers")} onClick={() => setTab("levers")}>
          LEVERS
        </button>
        <button type="button" className={tabClass("parcels")} onClick={() => setTab("parcels")}>
          PARCELS
        </button>
        <button type="button" className={tabClass("sources")} onClick={() => setTab("sources")}>
          SOURCES
        </button>
        <button
          type="button"
          className="font-mono text-limestone/60"
          onClick={() => props.onBar(open ? "closed" : "constraints")}
        >
          {open ? "⌃" : "⌄"}
        </button>
        <div className="ml-auto flex items-center gap-4 font-mono text-[12px]">
          <span className="text-limestone/70">
            {fmtInt(props.evaluation.inView)} parcels in view
          </span>
          <span className="text-limestone/70"> · </span>
          <span className="text-brick-light">
            {fmtInt(props.evaluation.nonConforming)} non-conforming
          </span>
          <button
            type="button"
            onClick={downloadCsv}
            className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section text-limestone"
          >
            DOWNLOAD CSV
          </button>
        </div>
      </div>
    </div>
  );
}
