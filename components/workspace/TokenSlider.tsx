"use client";

import { Slider } from "@/components/ui/slider";

export function TokenSlider(props: {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (n: number) => void;
  tone?: "pine" | "light";
  marks?: { value: number; label: string; note?: string }[];
}) {
  const light = props.tone === "light";
  const span = props.max - props.min;
  const hasNotes = props.marks?.some((m) => m.note);
  return (
    <div className={props.marks?.length ? (hasNotes ? "relative pb-7" : "relative pb-4") : "relative"}>
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
        ? props.marks?.map((m) => {
            const pct = Math.min(100, Math.max(0, ((m.value - props.min) / span) * 100));
            return (
              <div
                key={`${m.label}-${m.value}`}
                data-observed-mark={m.label}
                className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                <div className="mx-auto h-2 w-px bg-limestone/60" />
                <div className="mt-0.5 whitespace-nowrap text-center font-mono text-[9.5px] text-limestone/60">
                  {m.label}
                </div>
                {m.note ? (
                  <div className="whitespace-nowrap text-center font-mono text-[9.5px] text-limestone/60">
                    {m.note}
                  </div>
                ) : null}
              </div>
            );
          })
        : null}
    </div>
  );
}
