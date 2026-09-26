import { NextResponse } from "next/server";

const URL =
  "https://data.wprdc.org/dataset/e672f13d-71c4-4a66-8f38-710e75ed80a4/resource/4af8e160-57e9-4ebf-a501-76ca1b42fc99/download/neighborhoods.geojson";

let cache: unknown = null;

export async function GET() {
  if (!cache) {
    const res = await fetch(URL, { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ type: "FeatureCollection", features: [] });
    cache = await res.json();
  }
  return NextResponse.json(cache);
}
