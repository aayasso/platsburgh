import { SOURCES } from "@/lib/sources";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-limestone p-8 text-ink">
      <h1 className="font-display text-[28px] font-bold tracking-mark">PLATSBURGH</h1>
      <p className="mt-4 max-w-3xl font-sans text-[16px] text-moss">
        Decision-support prototype built at the AI Horizons AI for Housing Hackathon, Sept 26–27,
        2026. Not legal, financial, or zoning advice. Sources and limitations: /docs.
      </p>
      <h2 className="mt-8 font-display text-[13px] tracking-section">SOURCES</h2>
      <ul className="mt-3 space-y-2">
        {SOURCES.map((s) => (
          <li key={s.name} className="font-sans text-[15px]">
            {s.name} · {s.publisher} · retrieved {s.retrieved} ·{" "}
            <a className="underline" href={s.url}>
              {s.url}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
