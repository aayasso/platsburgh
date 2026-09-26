"use client";

import { TokenSlider } from "@/components/workspace/TokenSlider";
import { economicsSliders, regulationSliders } from "@/lib/rules";
import { fmtInt, fmtMoney } from "@/lib/format";
import type { WorkspaceState } from "@/lib/urlState";

function Section(props: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-limestone/15">
      <button
        type="button"
        onClick={props.onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-display text-[13px] font-semibold tracking-section text-limestone/85">
          {props.label}
        </span>
        <span className="font-mono text-limestone/60">{props.open ? "⌃" : "⌄"}</span>
      </button>
      {props.open ? <div className="px-4 pb-4">{props.children}</div> : null}
    </div>
  );
}

function SliderRow(props: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  numeric: number;
  role?: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mb-3">
      {props.role ? (
        <div className="font-display text-[10px] tracking-section text-limestone/50">
          {props.role}
        </div>
      ) : null}
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-display text-[13px] font-semibold tracking-heading text-limestone">
          {props.label}
        </span>
        <span className="font-mono text-[12px] text-limestone">{props.value}</span>
      </div>
      <TokenSlider
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.numeric}
        onValueChange={props.onChange}
      />
    </div>
  );
}

export function LeftPanel(props: {
  state: WorkspaceState;
  districts: string[];
  onChange: (next: WorkspaceState) => void;
}) {
  const { state, onChange } = props;
  const open = new Set(state.open);
  function toggle(id: "reg" | "con" | "eco" | "site") {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...state, open: [...next] });
  }

  const r = state.regulations;
  const c = state.construction;
  const e = state.economics;
  const f = state.siteFilters;
  const sc = state.siteConditions;
  const scale = 2.2;

  return (
    <aside className="pointer-events-auto absolute bottom-[52px] left-0 top-[var(--top-bar)] z-20 flex w-[380px] flex-col overflow-y-auto bg-pine">
      <Section label="REGULATIONS" open={open.has("reg")} onToggle={() => toggle("reg")}>
        {regulationSliders.map((s) => {
          const key = s.key as keyof typeof r;
          const numeric = key === "aduAllowed" ? (r.aduAllowed ? 1 : 0) : Number(r[key]);
          const value =
            key === "aduAllowed"
              ? r.aduAllowed
                ? "Yes"
                : "No"
              : key === "minLotSf"
                ? `${fmtInt(r.minLotSf)} sq ft`
                : key === "maxStories" || key === "unitsPerLot" || key === "parkingPerUnit"
                  ? String(numeric)
                  : `${numeric} ft`;
          return (
            <SliderRow
              key={s.key}
              label={s.label}
              value={value}
              min={s.min}
              max={s.max}
              step={s.step}
              numeric={numeric}
              onChange={(n) => {
                if (key === "aduAllowed") {
                  onChange({ ...state, regulations: { ...r, aduAllowed: n >= 1 } });
                } else {
                  onChange({ ...state, regulations: { ...r, [key]: n } });
                }
              }}
            />
          );
        })}
      </Section>
      <Section label="CONSTRUCTION" open={open.has("con")} onToggle={() => toggle("con")}>
        <SliderRow
          label="Width"
          value={`${c.widthFt} ft`}
          min={12}
          max={120}
          step={1}
          numeric={c.widthFt}
          onChange={(n) => onChange({ ...state, construction: { ...c, widthFt: n } })}
        />
        <SliderRow
          label="Depth"
          value={`${c.depthFt} ft`}
          min={20}
          max={150}
          step={1}
          numeric={c.depthFt}
          onChange={(n) => onChange({ ...state, construction: { ...c, depthFt: n } })}
        />
        <SliderRow
          label="Stories"
          value={String(c.stories)}
          min={1}
          max={12}
          step={1}
          numeric={c.stories}
          onChange={(n) => onChange({ ...state, construction: { ...c, stories: n } })}
        />
        <SliderRow
          label="Units"
          value={String(c.units)}
          min={1}
          max={60}
          step={1}
          numeric={c.units}
          onChange={(n) => onChange({ ...state, construction: { ...c, units: n } })}
        />
        <label className="mt-2 flex items-center gap-2 font-display text-[13px] tracking-heading text-limestone">
          <input
            type="checkbox"
            className="accent-brick"
            checked={c.attached}
            onChange={(ev) =>
              onChange({ ...state, construction: { ...c, attached: ev.target.checked } })
            }
          />
          Attached
        </label>
        <label className="mt-2 flex items-center gap-2 font-display text-[13px] tracking-heading text-limestone">
          <input
            type="checkbox"
            className="accent-brick"
            checked={c.adu}
            onChange={(ev) =>
              onChange({ ...state, construction: { ...c, adu: ev.target.checked } })
            }
          />
          ADU
        </label>
        <div className="mt-4 flex flex-col items-center">
          <div
            className="border border-limestone/55"
            style={{
              width: Math.min(c.widthFt * scale, 320),
              height: Math.min(c.depthFt * scale, 280),
            }}
          />
          <div className="mt-2 font-mono text-[11px] text-limestone/70">
            {c.widthFt} × {c.depthFt} ft · {c.stories} stories · {c.units} units
          </div>
        </div>
      </Section>
      <Section label="ECONOMICS" open={open.has("eco")} onToggle={() => toggle("eco")}>
        {economicsSliders.map((s) => {
          const key = s.key as keyof typeof e;
          const numeric = e[key];
          const value =
            key === "buyerIncome" || key === "subsidyPerUnit"
              ? fmtMoney(numeric)
              : key === "buildingPace"
                ? `${fmtInt(numeric)} / yr`
                : `${fmtMoney(numeric)} / sq ft`;
          return (
            <SliderRow
              key={s.key}
              role={s.role}
              label={s.label}
              value={value}
              min={s.min}
              max={s.max}
              step={s.step}
              numeric={numeric}
              onChange={(n) => onChange({ ...state, economics: { ...e, [key]: n } })}
            />
          );
        })}
      </Section>
      <Section label="SITE" open={open.has("site")} onToggle={() => toggle("site")}>
        <label className="mb-3 flex items-center gap-2 font-display text-[13px] tracking-heading text-limestone">
          <input
            type="checkbox"
            className="accent-brick"
            checked={f.vacantOnly}
            onChange={(ev) =>
              onChange({ ...state, siteFilters: { ...f, vacantOnly: ev.target.checked } })
            }
          />
          Vacant parcels only
        </label>
        <div className="mb-3 flex">
          {(["any", "city"] as const).map((own) => (
            <button
              key={own}
              type="button"
              className={`flex-1 px-2 py-1 font-display text-[12px] tracking-heading ${
                f.owner === own
                  ? "bg-brick text-limestone"
                  : "border border-limestone/25 text-limestone/80"
              }`}
              onClick={() => onChange({ ...state, siteFilters: { ...f, owner: own } })}
            >
              {own === "any" ? "Any owner" : "City-owned"}
            </button>
          ))}
        </div>
        <div className="mb-3 max-h-36 overflow-y-auto border border-limestone/15 p-2">
          <div className="mb-1 font-display text-[11px] tracking-heading text-limestone/70">
            Any district
          </div>
          {props.districts.map((d) => {
            const checked = f.districts.includes(d);
            return (
              <label
                key={d}
                className="flex items-center gap-2 py-0.5 font-mono text-[12px] text-limestone"
              >
                <input
                  type="checkbox"
                  className="accent-brick"
                  checked={checked}
                  onChange={() => {
                    const districts = checked
                      ? f.districts.filter((x) => x !== d)
                      : [...f.districts, d];
                    onChange({ ...state, siteFilters: { ...f, districts } });
                  }}
                />
                {d}
              </label>
            );
          })}
        </div>
        <label className="mb-2 flex items-center gap-2 font-display text-[13px] tracking-heading text-limestone">
          <input
            type="checkbox"
            className="accent-brick"
            checked={f.nearTransitOnly}
            onChange={(ev) =>
              onChange({
                ...state,
                siteFilters: { ...f, nearTransitOnly: ev.target.checked },
              })
            }
          />
          Near transit only
        </label>
        <label className="mb-3 flex items-center gap-2 font-display text-[13px] tracking-heading text-limestone">
          <input
            type="checkbox"
            className="accent-brick"
            checked={f.delinquentOrForeclosedOnly}
            onChange={(ev) =>
              onChange({
                ...state,
                siteFilters: { ...f, delinquentOrForeclosedOnly: ev.target.checked },
              })
            }
          />
          Tax-delinquent or foreclosed only
        </label>
        <details>
          <summary className="cursor-pointer font-display text-[13px] font-semibold tracking-section text-limestone/85">
            SITE CONDITIONS
          </summary>
          <div className="mt-2 space-y-2">
            {(
              [
                ["skipSteep", "Exclude steep slope"],
                ["skipFlood", "Exclude flood zone"],
                ["skipLandslide", "Exclude landslide-prone"],
                ["skipUndermined", "Exclude undermined"],
                ["skipNoWater", "Exclude no water service"],
                ["skipStepsOnly", "Exclude stairs-only access"],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 font-display text-[13px] text-limestone"
              >
                <input
                  type="checkbox"
                  className="accent-brick"
                  checked={sc[key]}
                  onChange={(ev) =>
                    onChange({
                      ...state,
                      siteConditions: { ...sc, [key]: ev.target.checked },
                    })
                  }
                />
                {label}
              </label>
            ))}
            <SliderRow
              label="Minimum frontage"
              value={`${sc.minFrontageFt} ft`}
              min={0}
              max={40}
              step={1}
              numeric={sc.minFrontageFt}
              onChange={(n) =>
                onChange({ ...state, siteConditions: { ...sc, minFrontageFt: n } })
              }
            />
          </div>
        </details>
      </Section>
    </aside>
  );
}
