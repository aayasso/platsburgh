import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { regulationSliders, economicsSliders } from "../lib/rules";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "docs", "RULES.md");

const sliders = [...regulationSliders, ...economicsSliders];
const rows = sliders
  .map(
    (s) =>
      `| ${s.key} | ${s.label} | ${s.explanation} | ${s.min} | ${s.max} | ${s.step} | ${String(s.default)} | ${s.codeReference ?? ""} |`,
  )
  .join("\n");

const md = `# Rules

Generated from \`lib/rules.ts\`. Do not edit by hand.

| Key | Label | Explanation | Min | Max | Step | Default | Code |
|---|---|---|---|---|---|---|---|
${rows}
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, md);
console.log(`wrote ${out}`);
