"use client";

import {
  AERIAL_DATE,
  AERIAL_ESRI,
  AERIAL_SIZE_PX,
  aerialCaption,
  aerialTilePlan,
} from "@/lib/aerial";
import type { Lot } from "@/lib/types";

export function ParcelAerial(props: { lot: Lot }) {
  const plan = aerialTilePlan(props.lot);
  const caption = aerialCaption(AERIAL_ESRI, AERIAL_DATE);
  return (
    <figure className="w-[320px] shrink-0">
      <div
        className="relative overflow-hidden bg-limestone-dark"
        style={{ width: AERIAL_SIZE_PX, height: AERIAL_SIZE_PX }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            width: plan.mosaicW,
            height: plan.mosaicH,
            transform: `translate(${plan.translateX}px, ${plan.translateY}px) scale(${plan.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {plan.tiles.map((tile) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={tile.src}
              src={tile.src}
              alt=""
              width={256}
              height={256}
              className="absolute max-w-none"
              style={{ left: tile.left, top: tile.top }}
            />
          ))}
        </div>
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <rect
            x="14.3%"
            y="14.3%"
            width="71.4%"
            height="71.4%"
            className="fill-none stroke-centerline stroke-2"
          />
        </svg>
      </div>
      <figcaption className="mt-1 font-mono text-[11px] text-moss">{caption}</figcaption>
    </figure>
  );
}
