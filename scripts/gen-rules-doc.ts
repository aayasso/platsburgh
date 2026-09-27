import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GROUND_TRUTH_FOOTER, GROUND_TRUTH_GROUPS, GROUND_TRUTH_INTRO } from "../lib/groundTruth";
import { economicsSliders, householdSliders, regulationSliders } from "../lib/rules";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "RULES.md");

const sliders = [...regulationSliders, ...economicsSliders, ...householdSliders];
const rows = sliders
  .map(
    (s) =>
      `| ${s.key} | ${s.label} | ${s.explanation} | ${s.min} | ${s.max} | ${s.step} | ${String(s.default)} | ${s.codeReference ?? s.source ?? ""} |`,
  )
  .join("\n");

const gt = GROUND_TRUTH_GROUPS.map((g) => {
  const rows = g.rows.map((r) => `| ${r.item} | ${r.figure} | ${r.source} | ${r.date} |`).join("\n");
  return `### ${g.heading}\n\n| Item | Figure | Source | Date |\n|---|---|---|---|\n${rows}`;
}).join("\n\n");

const md = `# Rules

Generated from \`lib/rules.ts\` and \`lib/groundTruth.ts\`. Do not edit by hand.

Eight checks per parcel, in order: site conditions, parcel area, frontage, buildable area after setbacks, units per parcel, ADU, height, parking. The first failure is the parcel's constraint; all eight appear on the parcel page with the numbers. Unavailable site data is listed, never counted as a failure.

| Key | Label | Explanation | Min | Max | Step | Default | Code or source |
|---|---|---|---|---|---|---|---|
${rows}

## GROUND TRUTH

${GROUND_TRUTH_INTRO}

${gt}

${GROUND_TRUTH_FOOTER}
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, md);
console.log(`wrote ${out}`);
