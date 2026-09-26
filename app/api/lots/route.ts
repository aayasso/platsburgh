import { NextResponse } from "next/server";
import { getLot, getLots } from "@/lib/lots-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (id) {
    const lot = getLot(id);
    if (!lot) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(lot);
  }
  return NextResponse.json(getLots());
}
