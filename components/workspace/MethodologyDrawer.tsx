"use client";

import { useRef } from "react";
import type { Evaluation } from "@/lib/evaluate";
import { fmtInt, fmtMoney } from "@/lib/format";
import { dumpParameters, loadParameters } from "@/lib/params";
import { affordablePrice } from "@/lib/proforma";
import { economicsSliders, householdSliders, regulationSliders } from "@/lib/rules";
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
  const h = state.household;

  function download() {
    const blob = new Blob([dumpParameters(state)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platsburgh-parameters.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadFile(file: File) {
    file.text().then((text) => {
      const parsed = loadParameters(text);
      props.onLoad({
        ...state,
        regulations: parsed.regulations,
        economics: parsed.economics,
        household: parsed.household ?? state.household,
        construction: parsed.construction ?? state.construction,
      });
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

  const termValues: Record<string, string> = {
    mortgageRate: `${(h.mortgageRate * 100).toFixed(2)}%`,
    downPaymentPct: `${(h.downPaymentPct * 100).toFixed(1)}%`,
    incomeToHousing: `${Math.round(h.incomeToHousing * 100)}%`,
    propertyTaxRate: `${(h.propertyTaxRate * 100).toFixed(1)}%`,
    insurancePerMonth: `${fmtMoney(h.insurancePerMonth)} / mo`,
  };

  return (
    <aside className="pointer-events-auto absolute bottom-[52px] right-0 top-[var(--top-bar)] z-30 flex w-[480px] flex-col overflow-y-auto border-l-2 border-brick bg-pine p-5">
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
          {householdSliders.map((s) => (
            <tr key={s.key} className="border-t border-limestone/10 align-top">
              <td className="py-2 font-display tracking-heading">{s.label}</td>
              <td className="py-2 font-mono">{termValues[s.key]}</td>
              <td className="py-2 font-sans text-[14px] text-limestone/70">{s.explanation}</td>
              <td className="py-2 font-mono text-[12px]">{s.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mb-2 font-mono text-[13px] text-limestone">
        Maximum price {fmtMoney(maxPrice)}
      </p>
      <p className="mb-4 font-mono text-[13px] text-limestone">
        Median subsidy {evaluation.ladder.subsidyPerUnit == null ? "—" : fmtMoney(evaluation.ladder.subsidyPerUnit)}
      </p>
      <p className="mb-4 font-sans text-[14px] text-limestone/70">
        A parcel is feasible when sale value plus subsidy covers construction cost, assessed land
        value, and site-condition costs. It is affordable when the unit price is within the
        household&apos;s borrowing capacity at the stated mortgage assumptions.
      </p>
      <p className="mb-2 font-sans text-[14px] text-limestone/70">
        Pace assumes the current parameters and the recent building rate hold.
      </p>
      <p className="mb-4 font-sans text-[14px] text-limestone/70">
        Public return is property tax only; no sales tax, wage tax, or transfer tax. Not discounted;
        simple payback.
      </p>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={download}
          className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section text-limestone"
        >
          DOWNLOAD PARAMETERS
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section text-limestone"
        >
          LOAD PARAMETERS
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="sr-only"
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
