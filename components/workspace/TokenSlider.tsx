"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { layoutObservedMarks, type PlacedMark } from "@/lib/observedMarkLayout";

const LABEL_CLASS = "whitespace-nowrap font-mono text-[9.5px] text-limestone/60";
const ROW_PX = 12;

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [placed, setPlaced] = useState<PlacedMark[]>([]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const probe = probeRef.current;
    if (!wrap || !probe || !props.marks?.length) {
      setPlaced([]);
      return;
    }
    const layout = () => {
      const trackWidth = wrap.clientWidth;
      const measured = props.marks!.map((m) => {
        probe.textContent = m.label;
        return { value: m.value, label: m.label, width: probe.offsetWidth };
      });
      setPlaced(layoutObservedMarks(measured, props.min, props.max, trackWidth));
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [props.marks, props.min, props.max]);

  const maxRow = placed.reduce((n, m) => Math.max(n, m.row), 0);
  const padBottom = props.marks?.length ? 14 + maxRow * ROW_PX : 0;

  return (
    <div ref={wrapRef} className="relative" style={{ paddingBottom: padBottom }}>
      <span ref={probeRef} className={`pointer-events-none invisible absolute ${LABEL_CLASS}`} aria-hidden />
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
      {placed.map((m) => (
        <div key={`${m.label}-${m.value}`}>
          <div
            className="pointer-events-none absolute top-1/2 h-2 w-px -translate-x-1/2 -translate-y-1/2 bg-limestone/60"
            style={{ left: m.tickX }}
          />
          {m.row > 0 ? (
            <div
              className="pointer-events-none absolute w-px bg-limestone/40"
              style={{
                left: m.tickX,
                top: "50%",
                height: m.row * ROW_PX,
                transform: "translateY(4px)",
              }}
            />
          ) : null}
          <div
            data-observed-mark={m.label}
            className={`pointer-events-none absolute ${LABEL_CLASS}`}
            style={{
              left: m.labelLeft,
              top: `calc(50% + 6px + ${m.row * ROW_PX}px)`,
              width: m.width,
              textAlign: m.align,
            }}
          >
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
