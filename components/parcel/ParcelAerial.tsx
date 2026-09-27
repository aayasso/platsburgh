"use client";

import { useState } from "react";
import {
  AERIAL_COUNTY,
  AERIAL_DATE,
  AERIAL_ESRI,
  aerialCaption,
  countyAerialUrl,
  esriAerialUrl,
} from "@/lib/aerial";
import type { Lot } from "@/lib/types";

export function ParcelAerial(props: { lot: Lot }) {
  const { lot } = props;
  const [source, setSource] = useState<"county" | "esri">("county");
  const src = source === "county" ? countyAerialUrl(lot) : esriAerialUrl(lot);
  const caption = aerialCaption(source === "county" ? AERIAL_COUNTY : AERIAL_ESRI, AERIAL_DATE);
  return (
    <figure className="w-[320px] shrink-0">
      <div className="relative h-[320px] w-[320px] overflow-hidden bg-limestone-dark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={320}
          height={320}
          className="h-[320px] w-[320px] object-cover"
          onError={() => {
            if (source === "county") setSource("esri");
          }}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <rect
            x="30%"
            y="20%"
            width="40%"
            height="60%"
            className="fill-none stroke-centerline stroke-2"
          />
        </svg>
      </div>
      <figcaption className="mt-1 font-mono text-[11px] text-moss">{caption}</figcaption>
    </figure>
  );
}
