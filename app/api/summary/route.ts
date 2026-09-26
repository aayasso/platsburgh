import { NextResponse } from "next/server";

function numbersIn(text: string): string[] {
  return text.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
}

function normalize(n: string): string {
  return n.replace(/,/g, "").replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function allowed(checks: string[]): Set<string> {
  return new Set(checks.flatMap(numbersIn).map(normalize));
}

function valid(summary: string, checks: string[]): boolean {
  const ok = allowed(checks);
  return numbersIn(summary).every((n) => ok.has(normalize(n)));
}

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ text: null }, { status: 404 });
  const body = (await req.json()) as { checks?: string[] };
  const checks = body.checks ?? [];
  const prompt = `Write at most 120 words using only the facts in these compliance lines. Do not introduce any number that is not already in the lines.\n\n${checks.join("\n")}`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return NextResponse.json({ text: null }, { status: 502 });
  const data = (await res.json()) as { content?: { text?: string }[] };
  const text = data.content?.[0]?.text ?? "";
  if (!valid(text, checks)) return NextResponse.json({ text: null });
  return NextResponse.json({ text });
}
