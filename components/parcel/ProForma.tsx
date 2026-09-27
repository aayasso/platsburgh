"use client";

import { useState } from "react";
import { TokenSlider } from "@/components/workspace/TokenSlider";
import { fmtInt, fmtMoney } from "@/lib/format";
import {
  namedSiteConditions,
  proforma,
} from "@/lib/proforma";
import { annualTaxPerUnit, paybackYears } from "@/lib/publicReturn";
import { economicsMarks, OBSERVED_MARKS } from "@/lib/observedMarks";
import { salesWithinHalfMileLine, typicalRentLine } from "@/lib/parcelRefs";
import { economicsSliders } from "@/lib/rules";
import type { Lot } from "@/lib/types";
import type { WorkspaceState } from "@/lib/urlState";

function LineSlider(props: {
  valueLabel?: string;
  min: number;
  max: number;
  step: number;
  numeric: number;
  marks?: { value: number; label: string }[];
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-1 mb-1 flex items-center gap-2">
      <TokenSlider
        tone="light"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.numeric}
        marks={props.marks}
        onValueChange={props.onChange}
      />
      {props.valueLabel ? (
        <span className="shrink-0 font-mono text-[11px] text-brick">{props.valueLabel}</span>
      ) : null}
    </div>
  );
}

export function ProForma(props: {
  lot: Lot;
  state: WorkspaceState;
  land: number;
  sitecost: number;
  hasSummary: boolean;
  checkLines: string[];
  onEconomics: (key: "buildCostPerSf" | "salePricePerSf" | "buyerIncome" | "subsidyPerUnit", n: number) => void;
  onHousehold: (next: WorkspaceState["household"]) => void;
  onLand: (n: number) => void;
  onSite: (n: number) => void;
}) {
  const { lot, state, land, sitecost } = props;
  const pf = proforma(lot, state.construction, state.economics, state.household, {
    landOverride: land,
    siteOverride: sitecost,
  });
  const named = namedSiteConditions(lot);
  const construction = economicsSliders.find((s) => s.key === "buildCostPerSf")!;
  const sale = economicsSliders.find((s) => s.key === "salePricePerSf")!;
  const income = economicsSliders.find((s) => s.key === "buyerIncome")!;
  const subsidy = economicsSliders.find((s) => s.key === "subsidyPerUnit")!;
  const tax = annualTaxPerUnit(pf.unitPrice, state.household.propertyTaxRate);
  const years = paybackYears(pf.subsidyForAffordable, tax, lot.abatedThrough);
  const provided = state.economics.subsidyPerUnit;
  const meets = provided >= pf.subsidyForAffordable;
  const gap = Math.max(0, pf.subsidyForAffordable - provided);
  const h = state.household;
  const feasibleDiff = Math.abs(pf.value - pf.cost);
  const affordDiff = Math.abs(pf.buyerMax - pf.unitPrice);

  return (
    <div>
      <h2 className="mt-10 font-display text-[13px] font-semibold tracking-section">PRO FORMA</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-3">
        <section className="bg-limestone shadow-sm">
          <h3 className="bg-brick px-3 py-2 font-display text-[13px] font-semibold tracking-section text-limestone">
            DEVELOPMENT
          </h3>
          <div className="px-3 py-3 text-ink">
            <Row label="Construction cost" amount={fmtMoney(state.economics.buildCostPerSf * pf.finishedSf)}>
              <LineSlider
                valueLabel={`${fmtMoney(state.economics.buildCostPerSf)} / sq ft`}
                min={construction.min}
                max={construction.max}
                step={construction.step}
                numeric={state.economics.buildCostPerSf}
                marks={OBSERVED_MARKS.buildCostPerSf}
                onChange={(n) => props.onEconomics("buildCostPerSf", n)}
              />
              <Source>
                × {fmtInt(pf.finishedSf)} sq ft · any method; default assumed between NAHB 2024 and
                an observed modular build
              </Source>
            </Row>
            <Row label="Land" amount={fmtMoney(land)}>
              <LineSlider
                min={0}
                max={250_000}
                step={500}
                numeric={land}
                onChange={props.onLand}
              />
              <Source>County assessment {fmtMoney(lot.assessedLand)}</Source>
            </Row>
            <Row label="Site conditions" amount={fmtMoney(sitecost)}>
              <LineSlider
                min={0}
                max={100_000}
                step={100}
                numeric={sitecost}
                onChange={props.onSite}
              />
              <Source>
                estimated: {named} · observed on one Pittsburgh build
              </Source>
            </Row>
            <Row label="Total cost" amount={fmtMoney(pf.cost)} strong />
            <Row label="Sale value" amount={fmtMoney(pf.unitPrice * pf.units)}>
              <LineSlider
                valueLabel={`${fmtMoney(state.economics.salePricePerSf)} / sq ft`}
                min={sale.min}
                max={sale.max}
                step={sale.step}
                numeric={state.economics.salePricePerSf}
                marks={economicsMarks("salePricePerSf", lot.compsPpsf ?? null)}
                onChange={(n) => props.onEconomics("salePricePerSf", n)}
              />
              <Source>
                × {fmtInt(Math.round(pf.sfPerUnit))} sq ft × {pf.units} units · WPRDC sales
              </Source>
            </Row>
            <Row label="Total value" amount={fmtMoney(pf.value)} strong>
              <Source>sale value + subsidy</Source>
            </Row>
            <p className="mt-3 font-sans text-[14px]">
              {pf.feasible ? (
                <>
                  <span className="font-display font-semibold tracking-heading">FEASIBLE</span>
                  {" — "}value exceeds cost by {fmtMoney(feasibleDiff)}.
                </>
              ) : (
                <>
                  <span className="font-display font-semibold tracking-heading">NOT FEASIBLE</span>
                  {" — "}cost exceeds value by {fmtMoney(pf.gapToFeasible)}.
                </>
              )}
            </p>
            <p className="mt-1 font-sans text-[14px] text-moss">
              Feasible at {fmtMoney(Math.round(pf.breakEvenSalePricePerSf))} per square foot, or{" "}
              {fmtMoney(Math.round(pf.breakEvenSubsidyPerUnit))} per unit in subsidy.
            </p>
          </div>
        </section>

        <section className="bg-limestone shadow-sm">
          <h3 className="bg-brick px-3 py-2 font-display text-[13px] font-semibold tracking-section text-limestone">
            HOUSEHOLD
          </h3>
          <div className="px-3 py-3 text-ink">
            <Row label="Household income" amount={fmtMoney(state.economics.buyerIncome)}>
              <LineSlider
                min={income.min}
                max={income.max}
                step={income.step}
                numeric={state.economics.buyerIncome}
                marks={OBSERVED_MARKS.buyerIncome}
                onChange={(n) => props.onEconomics("buyerIncome", n)}
              />
              <Source>HUD FY2026 · 80% of area median · 3-person household</Source>
            </Row>
            <Row label="Maximum price" amount={fmtMoney(pf.buyerMax)} strong>
              <Source>
                {Math.round(h.incomeToHousing * 100)}% of income to housing at the terms below
              </Source>
            </Row>
            <Row label="Unit price" amount={fmtMoney(pf.unitPrice)}>
              <Source>
                {fmtMoney(state.economics.salePricePerSf)} / sq ft × {fmtInt(Math.round(pf.sfPerUnit))} sq ft
              </Source>
            </Row>
            <Row label="Monthly payment" amount={fmtMoney(pf.monthlyPayment)}>
              <Source>principal, interest, taxes, insurance</Source>
            </Row>
            <div className="mt-3 font-display text-[11px] tracking-section text-moss">TERMS</div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-2">
              <Term
                label="Mortgage rate"
                value={`${(h.mortgageRate * 100).toFixed(2)}%`}
                min={4}
                max={9}
                step={0.05}
                numeric={h.mortgageRate * 100}
                marks={OBSERVED_MARKS.mortgageRatePct}
                onChange={(n) => props.onHousehold({ ...h, mortgageRate: n / 100 })}
              />
              <Term
                label="Down payment"
                value={`${(h.downPaymentPct * 100).toFixed(1)}%`}
                min={3.5}
                max={25}
                step={0.5}
                numeric={h.downPaymentPct * 100}
                onChange={(n) => props.onHousehold({ ...h, downPaymentPct: n / 100 })}
              />
              <Term
                label="Income to housing"
                value={`${Math.round(h.incomeToHousing * 100)}%`}
                min={25}
                max={40}
                step={1}
                numeric={h.incomeToHousing * 100}
                onChange={(n) => props.onHousehold({ ...h, incomeToHousing: n / 100 })}
              />
              <Term
                label="Property tax rate"
                value={`${(h.propertyTaxRate * 100).toFixed(1)}%`}
                min={0.5}
                max={3}
                step={0.05}
                numeric={h.propertyTaxRate * 100}
                onChange={(n) => props.onHousehold({ ...h, propertyTaxRate: n / 100 })}
              />
              <Term
                label="Insurance"
                value={`${fmtMoney(h.insurancePerMonth)} / mo`}
                min={50}
                max={300}
                step={5}
                numeric={h.insurancePerMonth}
                onChange={(n) => props.onHousehold({ ...h, insurancePerMonth: n })}
              />
            </div>
            <p className="mt-3 font-sans text-[14px]">
              {pf.affordable ? (
                <>
                  <span className="font-display font-semibold tracking-heading">AFFORDABLE</span>
                  {" — "}
                  {fmtMoney(affordDiff)} below the household&apos;s maximum.
                </>
              ) : (
                <>
                  <span className="font-display font-semibold tracking-heading">NOT AFFORDABLE</span>
                  {" — "}
                  {fmtMoney(affordDiff)} above.
                </>
              )}
            </p>
            <p className="mt-1 font-mono text-[13px] text-moss">
              {salesWithinHalfMileLine(lot)}
            </p>
            <p className="mt-1 font-mono text-[13px] text-moss">
              {typicalRentLine(lot)}
            </p>
          </div>
        </section>

        <PublicBlock
          pfUnits={pf.units}
          subsidyPerUnit={provided}
          subsidyMin={subsidy.min}
          subsidyMax={subsidy.max}
          subsidyStep={subsidy.step}
          onSubsidy={(n) => props.onEconomics("subsidyPerUnit", n)}
          totalProvided={provided * pf.units}
          required={pf.subsidyForAffordable}
          years={years}
          tax={tax}
          rate={h.propertyTaxRate}
          meets={meets}
          gap={gap}
          abatedThrough={lot.abatedThrough}
          hasSummary={props.hasSummary}
          checkLines={props.checkLines}
          state={state}
          land={land}
        />
      </div>
    </div>
  );
}

function Row(props: {
  label: string;
  amount: string;
  strong?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-limestone-dark py-2">
      <div className="flex items-baseline justify-between">
        <span className={`font-sans text-[13px] ${props.strong ? "font-semibold" : ""}`}>
          {props.label}
        </span>
        <span className="font-mono text-[13px]">{props.amount}</span>
      </div>
      {props.children}
    </div>
  );
}

function Source({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[9.5px] text-moss">{children}</div>;
}

function Term(props: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  numeric: number;
  marks?: { value: number; label: string }[];
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-[12px]">{props.label}</span>
        <span className="font-mono text-[11px] text-brick">{props.value}</span>
      </div>
      <TokenSlider
        tone="light"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.numeric}
        marks={props.marks}
        onValueChange={props.onChange}
      />
    </div>
  );
}

function PublicBlock(props: {
  pfUnits: number;
  subsidyPerUnit: number;
  subsidyMin: number;
  subsidyMax: number;
  subsidyStep: number;
  onSubsidy: (n: number) => void;
  totalProvided: number;
  required: number;
  years: number | null;
  tax: number;
  rate: number;
  meets: boolean;
  gap: number;
  abatedThrough?: number | null | "unknown";
  hasSummary: boolean;
  checkLines: string[];
  state: WorkspaceState;
  land: number;
}) {
  return (
    <section className="bg-limestone shadow-sm">
      <h3 className="bg-brick px-3 py-2 font-display text-[13px] font-semibold tracking-section text-limestone">
        PUBLIC SUPPORT
      </h3>
      <div className="px-3 py-3 text-ink">
        <Row label="Subsidy provided" amount={fmtMoney(props.totalProvided)}>
          <LineSlider
            valueLabel={`${fmtMoney(props.subsidyPerUnit)} / unit`}
            min={props.subsidyMin}
            max={props.subsidyMax}
            step={props.subsidyStep}
            numeric={props.subsidyPerUnit}
            onChange={props.onSubsidy}
          />
          <Source>× {props.pfUnits} units</Source>
        </Row>
        <Row label="Subsidy required" amount={fmtMoney(props.required)} strong>
          <Source>for this parcel to be feasible at a price this household can afford</Source>
        </Row>
        <Row
          label="Public return"
          amount={
            props.years == null ? "no subsidy required" : `${Math.round(props.years)}-year payback`
          }
          strong
        >
          {props.years != null ? (
            <Source>
              {fmtMoney(props.tax)} per year in property tax at {(props.rate * 100).toFixed(1)}%
              {typeof props.abatedThrough === "number"
                ? ` abated through ${props.abatedThrough}; payback counted from then`
                : ""}
            </Source>
          ) : null}
        </Row>
        <p className="mt-3 font-display text-[13px] font-semibold tracking-heading">
          {props.meets ? "MEETS REQUIREMENT." : `SHORT BY ${fmtMoney(props.gap)} PER UNIT.`}
        </p>
        <AssumptionsAndSummary
          hasSummary={props.hasSummary}
          checkLines={props.checkLines}
          state={props.state}
          land={props.land}
        />
      </div>
    </section>
  );
}

function AssumptionsAndSummary(props: {
  hasSummary: boolean;
  checkLines: string[];
  state: WorkspaceState;
  land: number;
}) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const h = props.state.household;
  const e = props.state.economics;
  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section"
        >
          ASSUMPTIONS
        </button>
        {props.hasSummary ? (
          <button
            type="button"
            onClick={async () => {
              const res = await fetch("/api/summary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ checks: props.checkLines }),
              });
              const data = (await res.json()) as { text?: string };
              setSummary(data.text ?? null);
            }}
            className="border border-brick px-3 py-1 font-display text-[12px] font-semibold tracking-section"
          >
            SUMMARY
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="mt-3 font-sans text-[13px] text-moss">
          <p>Mortgage rate {(h.mortgageRate * 100).toFixed(2)}% · Freddie Mac PMMS, Sept 24, 2026</p>
          <p>Down payment {(h.downPaymentPct * 100).toFixed(1)}%</p>
          <p>Income to housing {Math.round(h.incomeToHousing * 100)}%</p>
          <p>
            Property tax rate {(h.propertyTaxRate * 100).toFixed(1)}% effective, assumed from the
            County&apos;s roughly 1.47% effective rate
          </p>
          <p>Insurance {fmtMoney(h.insurancePerMonth)}/mo, assumed</p>
          <p>PMI 0.5%/yr below 20% down (fixed)</p>
          <p>30-year term (fixed)</p>
          <p>Land {fmtMoney(props.land)} (assessed value unless overridden)</p>
          <p className="mt-2 font-mono text-[11px]">
            237 N Aiken actual · assumed · WPRDC sales · County assessment · HUD FY2026 · Freddie Mac
            PMMS 2026-09-24
          </p>
          <p className="mt-2">
            Site and regulatory figures come from one completed Pittsburgh project (237 N Aiken Ave,
            2023–24, documented at $853,890); construction cost is method-neutral and set by you. Not
            an appraisal, underwriting, or a loan offer.
          </p>
          <p className="mt-1 font-mono text-[11px]">
            Construction cost {fmtMoney(e.buildCostPerSf)} / sq ft · Sale price{" "}
            {fmtMoney(e.salePricePerSf)} / sq ft · Household income {fmtMoney(e.buyerIncome)} ·
            Subsidy per unit {fmtMoney(e.subsidyPerUnit)}
          </p>
        </div>
      ) : null}
      {summary ? (
        <div className="mt-3">
          <p className="font-sans text-[13px] text-moss">
            Generated from the checks above. It contains nothing that is not already on this page.
          </p>
          <p className="mt-2 font-sans text-[14px]">{summary}</p>
        </div>
      ) : null}
    </div>
  );
}
