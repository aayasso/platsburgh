"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BottomBar } from "@/components/workspace/BottomBar";
import { FirstVisitNote } from "@/components/workspace/FirstVisitNote";
import { Ladder } from "@/components/workspace/Ladder";
import { LeftPanel } from "@/components/workspace/LeftPanel";
import { MethodologyDrawer } from "@/components/workspace/MethodologyDrawer";
import { ParcelMap } from "@/components/workspace/ParcelMap";
import { evaluateWorkspace, type Evaluation } from "@/lib/evaluate";
import { levers, type LeverRow } from "@/lib/levers";
import { localCompsMedian } from "@/lib/observedMarks";
import type { Lot, ViewBounds } from "@/lib/types";
import {
  decodeView,
  DEFAULT_WORKSPACE,
  encodeView,
  type WorkspaceState,
} from "@/lib/urlState";

const EMPTY_EVAL: Evaluation = {
  ladder: {
    conformingUnits: null,
    conformingParcels: null,
    feasibleUnits: null,
    feasibleParcels: null,
    affordableUnits: null,
    affordableParcels: null,
    subsidyPerUnit: null,
    yearsToBuild: null,
    paybackYears: null,
    empty: true,
  },
  inView: 0,
  nonConforming: 0,
  parcels: [],
  constraintCounts: [],
  districts: [],
};

export function Workspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<WorkspaceState>(() =>
    decodeView(searchParams.toString()),
  );
  const [lots, setLots] = useState<Lot[] | null>(null);
  const [bounds, setBounds] = useState<ViewBounds | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation>(EMPTY_EVAL);
  const [leverRows, setLeverRows] = useState<LeverRow[]>([]);
  const [constraintFilter, setConstraintFilter] = useState<string | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const evalTimer = useRef<number | null>(null);
  const leverTimer = useRef<number | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty("--top-bar", `${el.offsetHeight}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const urls = ["/lots.json", "/api/lots"];
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const data = (await res.json()) as Lot[];
          if (!cancelled && Array.isArray(data)) {
            setLots(data);
            return;
          }
        } catch {
          /* try next */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: WorkspaceState) => {
    setState(next);
    const q = encodeView(next);
    window.history.replaceState(null, "", q ? `/?${q}` : "/");
  }, []);

  const runEval = useCallback(
    (next: WorkspaceState, viewBounds: ViewBounds | null, all: Lot[]) => {
      setEvaluation(evaluateWorkspace(all, next, viewBounds));
    },
    [],
  );

  useEffect(() => {
    if (!lots) return;
    if (evalTimer.current) window.clearTimeout(evalTimer.current);
    evalTimer.current = window.setTimeout(() => {
      runEval(state, bounds, lots);
    }, 60);
    return () => {
      if (evalTimer.current) window.clearTimeout(evalTimer.current);
    };
  }, [state, bounds, lots, runEval]);

  useEffect(() => {
    if (!lots) return;
    if (leverTimer.current) window.clearTimeout(leverTimer.current);
    leverTimer.current = window.setTimeout(() => {
      const rows = levers(lots, {
        regulations: state.regulations,
        construction: state.construction,
        economics: state.economics,
        siteConditions: state.siteConditions,
        siteFilters: state.siteFilters,
        viewBounds: bounds,
      });
      rows.sort((a, b) => {
        const am = a.atLimit || a.delta === 0;
        const bm = b.atLimit || b.delta === 0;
        if (am !== bm) return am ? 1 : -1;
        return Math.abs(b.delta) - Math.abs(a.delta);
      });
      setLeverRows(rows);
    }, 300);
    return () => {
      if (leverTimer.current) window.clearTimeout(leverTimer.current);
    };
  }, [state, bounds, lots]);

  const districts = useMemo(() => {
    if (!lots) return [];
    return [...new Set(lots.map((l) => l.district).filter(Boolean))].sort();
  }, [lots]);

  return (
    <div className="relative h-screen overflow-hidden bg-map-bg">
      <ParcelMap
        parcels={evaluation.parcels}
        view={state.map}
        constraintFilter={constraintFilter}
        onMoveEnd={(view, nextBounds) => {
          setBounds(nextBounds);
          persist({ ...stateRef.current, map: view });
        }}
        onParcelClick={(id) => {
          const q = encodeView(stateRef.current);
          router.push(q ? `/parcel/${id}?${q}` : `/parcel/${id}`);
        }}
      />
      <FirstVisitNote />
      <header ref={headerRef} className="fade-up pointer-events-auto absolute left-0 right-0 top-0 z-30 bg-pine px-6 py-[26px]">
        <div className="flex items-start justify-between gap-8">
          <h1 className="shrink-0 font-display text-[22px] font-bold tracking-mark text-limestone">
            PLATSBURGH
          </h1>
          <Ladder ladder={evaluation.ladder} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-centerline" />
      </header>
      {lots ? (
        <LeftPanel
          state={state}
          districts={districts}
          localSaleMedian={localCompsMedian(evaluation.parcels.map((p) => p.lot))}
          onChange={persist}
        />
      ) : (
        <aside className="pointer-events-none absolute bottom-[52px] left-0 top-[var(--top-bar)] z-20 w-[380px] bg-pine p-4 font-sans text-[15px] text-limestone">
          Loading parcels…
        </aside>
      )}
      <MethodologyDrawer
        open={methodOpen}
        onClose={() => setMethodOpen((v) => !v)}
        state={state}
        evaluation={evaluation}
        onLoad={(next) => persist({ ...DEFAULT_WORKSPACE, ...next })}
      />
      <BottomBar
        bar={state.bar}
        evaluation={evaluation}
        levers={leverRows}
        constraintFilter={constraintFilter}
        state={state}
        onBar={(bar) => persist({ ...state, bar })}
        onConstraint={setConstraintFilter}
      />
    </div>
  );
}
