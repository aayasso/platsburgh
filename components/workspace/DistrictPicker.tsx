"use client";

import { useEffect, useRef, useState } from "react";
import { filterDistrictOptions } from "@/lib/districtOptions";

export function DistrictPicker(props: {
  districts: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const options = filterDistrictOptions(props.districts, query);

  useEffect(() => {
    if (!open) return;
    function onDoc(ev: MouseEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function toggle(code: string) {
    const on = props.selected.includes(code);
    props.onChange(on ? props.selected.filter((d) => d !== code) : [...props.selected, code]);
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[13px] font-semibold tracking-heading text-limestone">
          Zoning district:
        </span>
        <button
          type="button"
          className="font-display text-[13px] tracking-heading text-limestone/80"
          onClick={() => setOpen((v) => !v)}
        >
          Any district ▾
        </button>
      </div>
      {open ? (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto border border-limestone/15 bg-pine p-2">
          <input
            aria-label="Zoning district"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            className="mb-2 w-full border border-limestone/25 bg-pine px-2 py-1 font-mono text-[12px] text-limestone outline-none"
          />
          {options.map((d) => {
            const checked = props.selected.includes(d);
            return (
              <label
                key={d}
                className="flex items-center gap-2 py-0.5 font-mono text-[12px] text-limestone"
              >
                <input
                  type="checkbox"
                  className="accent-brick"
                  checked={checked}
                  onChange={() => toggle(d)}
                />
                {d}
              </label>
            );
          })}
        </div>
      ) : null}
      {props.selected.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {props.selected.map((d) => (
            <button
              key={d}
              type="button"
              className="border border-limestone/25 px-1.5 py-0.5 font-mono text-[11px] text-limestone"
              onClick={() => toggle(d)}
            >
              {d}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
