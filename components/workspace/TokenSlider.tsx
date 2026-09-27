"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { observedMarkLegend } from "@/lib/observedMarkLayout";

export function TokenSlider(props: {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (n: number) => void;
  tone?: "pine" | "light";
  marks?: { value: number; label: string }[];
}) {
  const light = props.tone === "light";
  const span = props.max - props.min;
  const marks = props.marks ?? [];
  const legend = marks.length ? observedMarkLegend(marks) : "";
  const [tip, setTip] = useState<string | null>(null);

  return (
    <div className={marks.length ? "relative pb-4" : "relative"}>
      <Slider
        min={props.min}
        max={props.max}
        step={props.step}
        value={[props.value]}
        onValueChange={(v) => {
          const n = Array.isArray(v) ? v[0] : v;
          if (typeof n === "number") props.onValueChange(n);
        }}
        className={
          light
            ? "w-full [&_[data-slot=slider-track]]:bg-limestone-dark [&_[data-slot=slider-range]]:bg-centerline [&_[data-slot=slider-thumb]]:border-centerline [&_[data-slot=slider-thumb]]:bg-limestone [&_[data-slot=slider-thumb]]:ring-centerline/40"
            : "w-full [&_[data-slot=slider-track]]:bg-limestone/20 [&_[data-slot=slider-range]]:bg-centerline [&_[data-slot=slider-thumb]]:border-centerline [&_[data-slot=slider-thumb]]:bg-centerline [&_[data-slot=slider-thumb]]:ring-centerline/40"
        }
      />
      {span > 0
        ? marks.map((m) => {
            const pct = Math.min(100, Math.max(0, ((m.value - props.min) / span) * 100));
            return (
              <div
                key={`${m.label}-${m.value}`}
                data-observed-mark={m.label}
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
                onMouseEnter={() => setTip(m.label)}
                onMouseLeave={() => setTip((t) => (t === m.label ? null : t))}
              >
                <div className="flex h-3 w-3 cursor-default items-center justify-center">
                  <div className="h-2 w-px bg-limestone/60" />
                </div>
                {tip === m.label ? (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap bg-ink px-1.5 py-0.5 font-mono text-[9.5px] text-limestone">
                    {m.label}
                  </div>
                ) : null}
              </div>
            );
          })
        : null}
      {legend ? (
        <div className="mt-1 font-mono text-[9.5px] leading-tight text-limestone/60">{legend}</div>
      ) : null}
    </div>
  );
}
