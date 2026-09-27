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
        {plan.tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={tile.src}
            src={tile.src}
            alt=""
            width={256}
            height={256}
            className="absolute max-w-none"
            style={{
              left: tile.left,
              top: tile.top,
              width: tile.width,
              height: tile.height,
            }}
          />
        ))}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path d={plan.path} className="fill-none stroke-centerline stroke-2" />
        </svg>
      </div>
      <figcaption className="mt-1 font-mono text-[11px] text-moss">{caption}</figcaption>
    </figure>
  );
}
