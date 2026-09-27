"use client";

import { useEffect, useState } from "react";

const KEY = "platsburgh.seen";

export function FirstVisitNote() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      return;
    }
    setOpen(true);
    const dismiss = () => {
      setOpen(false);
      try {
        window.localStorage.setItem(KEY, "1");
      } catch {
        /* ignore quota */
      }
    };
    const timer = window.setTimeout(dismiss, 12_000);
    window.addEventListener("click", dismiss);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("click", dismiss);
    };
  }, []);

  if (!open) return null;
  return (
    <div
      className="pointer-events-none absolute left-[400px] right-16 top-[calc(var(--top-bar)+16px)] z-[15] flex justify-center"
      aria-live="polite"
    >
      <div className="pointer-events-auto max-w-md bg-pine px-4 py-3 text-limestone shadow-sm">
        <p className="font-sans text-[14px]">Open a panel and move a slider.</p>
        <p className="font-sans text-[14px]">Every number counts what's on the map.</p>
        <p className="font-sans text-[14px]">Click a parcel for the details.</p>
        <p className="mt-2 font-mono text-[12px]">Dismiss</p>
      </div>
    </div>
  );
}
