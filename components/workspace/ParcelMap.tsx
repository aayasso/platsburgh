"use client";

import type { FeatureCollection } from "geojson";
import {
  GeoJSONSource,
  Map as MapLibreMap,
  setWorkerCount,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { EvaluatedParcel } from "@/lib/evaluate";
import { tokenPalette } from "@/lib/mapColors";
import type { MapView } from "@/lib/urlState";
import type { ViewBounds } from "@/lib/types";

const EMPTY_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "hsl(0 0% 20%)" },
    },
  ],
};

try {
  setWorkerUrl("/maplibre-gl-worker.mjs");
  setWorkerCount(1);
} catch {
  try {
    setWorkerCount(0);
  } catch {
    /* Map renders dots on the main thread if the worker bundle is missing */
  }
}

function viewBoundsOf(map: MapLibreMap): ViewBounds {
  const b = map.getBounds();
  return {
    minLon: b.getWest(),
    minLat: b.getSouth(),
    maxLon: b.getEast(),
    maxLat: b.getNorth(),
  };
}

function parcelsToGeoJSON(parcels: EvaluatedParcel[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: parcels.map((p) => ({
      type: "Feature",
      id: p.lot.id,
      geometry: { type: "Point", coordinates: [p.lot.lon, p.lot.lat] },
      properties: {
        id: p.lot.id,
        status: p.status,
        hover: p.hover,
        constraint: p.constraint ?? "",
      },
    })),
  };
}

export function ParcelMap(props: {
  parcels: EvaluatedParcel[];
  view: MapView;
  constraintFilter: string | null;
  onMoveEnd: (view: MapView, bounds: ViewBounds) => void;
  onParcelClick: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const readyRef = useRef(false);
  const onMoveEndRef = useRef(props.onMoveEnd);
  const onClickRef = useRef(props.onParcelClick);
  const parcelsRef = useRef(props.parcels);
  const filterRef = useRef(props.constraintFilter);
  onMoveEndRef.current = props.onMoveEnd;
  onClickRef.current = props.onParcelClick;
  parcelsRef.current = props.parcels;
  filterRef.current = props.constraintFilter;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const palette = tokenPalette();
    const styleCandidates = [
      "https://tiles.openfreemap.org/styles/dark",
      "https://tiles.openfreemap.org/styles/fiord",
    ];

    const map = new MapLibreMap({
      container: containerRef.current,
      style: styleCandidates[0],
      center: [props.view.lng, props.view.lat],
      zoom: props.view.z,
    });
    mapRef.current = map;

    const addOverlays = () => {
      if (map.getSource("parcels")) return;
      map.addSource("parcels", {
        type: "geojson",
        data: parcelsToGeoJSON(parcelsRef.current),
      });
      map.addLayer({
        id: "parcels-dots",
        type: "circle",
        source: "parcels",
        paint: {
          "circle-radius": 4,
          "circle-color": [
            "match",
            ["get", "status"],
            "cfa",
            palette.centerline,
            "cf",
            "rgba(0,0,0,0)",
            "c",
            "rgba(0,0,0,0)",
            "unknown",
            "rgba(0,0,0,0)",
            palette.brick,
          ],
          "circle-opacity": [
            "match",
            ["get", "status"],
            "nc",
            0.55,
            1,
          ],
          "circle-stroke-width": [
            "match",
            ["get", "status"],
            "cfa",
            0,
            "cf",
            2,
            "c",
            1,
            "unknown",
            1,
            0,
          ],
          "circle-stroke-color": [
            "match",
            ["get", "status"],
            "cf",
            palette.centerline,
            "c",
            palette.centerline,
            "unknown",
            palette.limestoneDark,
            palette.centerline,
          ],
          "circle-stroke-opacity": [
            "match",
            ["get", "status"],
            "c",
            0.6,
            "unknown",
            0.4,
            1,
          ],
        },
      });

      map.addSource("neighborhoods", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "neighborhood-line",
        type: "line",
        source: "neighborhoods",
        paint: {
          "line-color": palette.limestone,
          "line-opacity": 0.16,
          "line-width": 1,
        },
      });
      const glyphs = map.getStyle().glyphs;
      if (glyphs) {
        map.addLayer({
          id: "neighborhood-label",
          type: "symbol",
          source: "neighborhoods",
          layout: {
            "text-field": [
              "coalesce",
              ["get", "hood"],
              ["get", "HOOD"],
              ["get", "neighborhood"],
              ["get", "name"],
            ],
            "text-size": 12,
          },
          paint: {
            "text-color": palette.limestone,
            "text-opacity": 0.4,
          },
        });
      }

      fetch("/api/neighborhoods")
        .then((r) => r.json())
        .then((gj) => {
          const src = map.getSource("neighborhoods") as GeoJSONSource | undefined;
          src?.setData(gj);
        })
        .catch(() => undefined);

      readyRef.current = true;
      if (filterRef.current && map.getLayer("parcels-dots")) {
        map.setFilter("parcels-dots", ["==", ["get", "constraint"], filterRef.current]);
      }
      onMoveEndRef.current(
        {
          lat: map.getCenter().lat,
          lng: map.getCenter().lng,
          z: map.getZoom(),
        },
        viewBoundsOf(map),
      );
    };

    map.on("load", addOverlays);

    let fallback = false;
    map.on("error", (e) => {
      if (fallback || readyRef.current) return;
      const msg = `${(e as { error?: { message?: string } }).error?.message ?? ""}`;
      if (!msg.toLowerCase().includes("style") && map.isStyleLoaded()) return;
      fallback = true;
      map.setStyle(EMPTY_STYLE);
      map.once("style.load", addOverlays);
    });

    map.on("moveend", () => {
      const c = map.getCenter();
      onMoveEndRef.current({ lat: c.lat, lng: c.lng, z: map.getZoom() }, viewBoundsOf(map));
    });

    map.on("mousemove", "parcels-dots", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      const tip = tooltipRef.current;
      if (!f || !tip) return;
      tip.style.display = "block";
      tip.style.left = `${e.point.x + 12}px`;
      tip.style.top = `${e.point.y + 12}px`;
      tip.textContent = String(f.properties?.hover ?? "");
    });
    map.on("mouseleave", "parcels-dots", () => {
      map.getCanvas().style.cursor = "";
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    });
    map.on("click", "parcels-dots", (e) => {
      const id = e.features?.[0]?.properties?.id;
      if (typeof id === "string") onClickRef.current(id);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // view is initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("parcels") as GeoJSONSource | undefined;
      if (!src) return false;
      src.setData(parcelsToGeoJSON(parcelsRef.current));
      if (filterRef.current && map.getLayer("parcels-dots")) {
        map.setFilter("parcels-dots", ["==", ["get", "constraint"], filterRef.current]);
      }
      return true;
    };
    if (apply()) return;
    const id = window.setInterval(() => {
      if (apply()) window.clearInterval(id);
    }, 200);
    return () => window.clearInterval(id);
  }, [props.parcels, props.constraintFilter]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full bg-map-bg" />
      <div
        ref={tooltipRef}
        className="pointer-events-none absolute z-10 max-w-xs bg-pine px-2 py-1 font-sans text-[12px] text-limestone"
        style={{ display: "none" }}
      />
      <div className="pointer-events-none absolute bottom-16 left-[400px] z-10 flex gap-4 font-sans text-[12px] text-limestone/80">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-centerline" />
          Conforming · feasible · affordable
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full border-2 border-centerline" />
          Conforming · feasible
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full border border-centerline/60" />
          Conforming
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-brick/55" />
          Non-conforming
        </span>
      </div>
    </div>
  );
}
