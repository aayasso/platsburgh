import { ParcelClient } from "@/components/parcel/ParcelClient";
import { getLot } from "@/lib/lots-data";
import { fetchParcelRing } from "@/lib/parcelBoundary";
import Link from "next/link";

function qs(sp: Record<string, string | string[] | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) v.forEach((x) => search.append(k, x));
    else if (v != null) search.set(k, v);
  }
  return search.toString();
}

export default async function ParcelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const query = qs(sp);
  const lot = getLot(id);
  if (!lot) {
    return (
      <main className="min-h-screen bg-limestone p-8 text-ink">
        <p className="font-sans text-[16px]">
          Parcel ID not found. Use the 16-character County ID, for example 0050M00032000000.
        </p>
        <Link href={query ? `/?${query}` : "/"} className="mt-4 inline-block font-display tracking-section">
          ← MAP
        </Link>
      </main>
    );
  }

  const ring = await fetchParcelRing(lot.id);
  return (
    <ParcelClient
      lot={ring ? { ...lot, ring } : lot}
      query={query}
      hasSummary={Boolean(process.env.ANTHROPIC_API_KEY)}
    />
  );
}
