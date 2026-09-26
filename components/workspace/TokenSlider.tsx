"use client";

import { Slider } from "@/components/ui/slider";

export function TokenSlider(props: {
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (n: number) => void;
}) {
  return (
    <Slider
      min={props.min}
      max={props.max}
      step={props.step}
      value={[props.value]}
      onValueChange={(v) => {
        const n = Array.isArray(v) ? v[0] : v;
        if (typeof n === "number") props.onValueChange(n);
      }}
      className="w-full [&_[data-slot=slider-track]]:bg-limestone/20 [&_[data-slot=slider-range]]:bg-centerline [&_[data-slot=slider-thumb]]:border-centerline [&_[data-slot=slider-thumb]]:bg-centerline [&_[data-slot=slider-thumb]]:ring-centerline/40"
    />
  );
}
