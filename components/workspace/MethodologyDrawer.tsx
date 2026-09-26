"use client";

import { useRef } from "react";
import type { Evaluation } from "@/lib/evaluate";
import { fmtInt, fmtMoney } from "@/lib/format";
import { affordablePrice } from "@/lib/proforma";
import { economicsSliders, regulationSliders } from "@/lib/rules";
import type { WorkspaceState } from "@/lib/urlState";

export function MethodologyDrawer(props: {
  open: boolean;
  onClose: () => void;
  state: WorkspaceState;
  evaluation: Evaluation;
  onLoad: (next: WorkspaceState) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { state, evaluation } = props;
  const maxPrice = affordablePrice(state.economics.buyerIncome, state.household);

  function download() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platsburgh-parameters.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFile(file: File) {
    file.text().then((text) => {
      const parsed = JSON.parse(text) as Partial<WorkspaceState>;
      props.onLoad({ ...state, ...parsed });
    });
  }

  if (!props.open) {
    return (
      <button
        type="button"
        onClick={() => props.onClose()}
        className="pointer-events-auto absolute right-0 top-[40%] z-30 border-l-2 border-brick bg-pine px-2 py-6 font-display text-[13px] font-semibold tracking-section text-limestone"
        style={{ writingMode: "vertical-rl" }}
      >
        METHODOLOGY
      </button>
    );
  }

  return (
    <aside className="pointer-events-auto absolute bottom-[52px] right-0 top-[var(--top-bar)] z-30 flex w-[440px] flex-col overflow-y-auto border-l-2 border-brick bg-pine p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-[13px] font-semibold tracking-section text-limestone">
          METHODOLOGY
        </h2>
        <button type="button" className="font-mono text-limestone/60" onClick={() => props.onClose()}>
          ⌃
        </button>
      </div>
      <p className="mb-4 font-sans text-[14px] text-limestone/70">
        Starting positions match the current code for a low-density residential district (§903.03).
      </p>
      <table className="mb-4 w-full text-left text-[13px] text-limestone">
        <tbody>
          {regulationSliders.map((s) => {
            const key = s.key as keyof typeof state.regulations;
            const raw = state.regulations[key];
            const value = typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw);
            return (
              <tr key={s.key} className="border-t border-limestone/10 align-top">
                <td className="py-2 font-display tracking-heading">{s.label}</td>
                <td className="py-2 font-mono">{value}</td>
                <td className="py-2 font-sans text-[14px] text-limestone/70">{s.explanation}</td>
                <td className="py-2 font-mono text-[12px]">{s.codeReference}</td>
              </tr>
            );
          })}
          {economicsSliders.map((s) => {
            const key = s.key as keyof typeof state.economics;
            const raw = state.economics[key];
            return (
              <tr key={s.key} className="border-t border-limestone/10 align-top">
                <td className="py-2 font-display tracking-heading">{s.label}</td>
                <td className="py-2 font-mono">{fmtInt(raw)}</td>
                <td className="py-2 font-sans text-[14px] text-limestone/70">{s.explanation}</td>
                <td className="py-2 font-mono text-[12px]">{s.source}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mb-2 font-mono text-[13px] text-limestone">
        Maximum price {fmtMoney(maxPrice)}
      </p>
      <p className="mb-4 font-mono text-[13px] text-limestone">
        Median subsidy {dash(evaluation.ladder.subsidyPerUnit)}
      </p>
      <p className="mb-4 font-sans text-[14px] text-limestone/70">
        A parcel is feasible when sale value plus subsidy covers construction cost, assessed land
        value, and site-condition costs. It is affordable when the unit price is within the
        household&apos;s borrowing capacity at the stated mortgage assumptions.
      </p>
      <p className="mb-4 font-sans text-[14px] text-limestone/70">
        Mortgage rate {(state.household.mortgageRate * 100).toFixed(2)}% · Down payment{" "}
        {(state.household.downPaymentPct * 100).toFixed(1)}% · Income to housing{" "}
        {Math.round(state.household.incomeToHousing * 100)}% · Property tax rate{" "}
        {(state.household.propertyTaxRate * 100).toFixed(1)}% · Insurance{" "}
        {fmtMoney(state.household.insurancePerMonth)} / mo
      </p>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={download}
          className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section text-limestone"
        >
          DOWNLOAD
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section text-limestone"
        >
          LOAD
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadFile(file);
          }}
        />
      </div>
      <p className="font-sans text-[14px] text-limestone/70">
        These are the exact parameters that produced the results on this page. The page address
        reproduces this view.
      </p>
    </aside>
  );
}

function dash(n: number | null) {
  return n == null ? "—" : fmtMoney(n);
}
