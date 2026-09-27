import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const copy = readFileSync(join(root, "COPY.md"), "utf8");

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "ui" || name === "api") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts)$/.test(name)) acc.push(p);
  }
  return acc;
}

function stripNoise(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\/\/.*$/gm, " ")
    .replace(/^\s*import[\s\S]*?;$/gm, " ")
    .replace(/className=\{?`[\s\S]*?`\}?/g, " ")
    .replace(/className=\{[\s\S]*?\}/g, " ")
    .replace(/className="[^"]*"/g, " ")
    .replace(/className='[^']*'/g, " ")
    .replace(/style=\{\{[\s\S]*?\}\}/g, " ")
    .replace(/headers:\s*\{[\s\S]*?\}/g, " ")
    .replace(/JSON\.stringify\([\s\S]*?\)/g, " ");
}

function isSkipped(s: string): boolean {
  if (s.length < 2) return true;
  if (s === "use client" || s === "use server") return true;
  if (/^https?:/.test(s)) return true;
  if (s.startsWith("/")) return true;
  if (s.includes("hsl(") || s.includes("rgba(") || s.includes("var(--")) return true;
  if (/^(GET|POST|PUT|PATCH|DELETE)$/.test(s)) return true;
  if (/^(application|text|image)\//.test(s)) return true;
  if (/^[\w./:@%+\-]+$/.test(s) && !/[A-Z]{3,}/.test(s) && !s.includes(" ")) return true;
  if (s.includes("??") || s.includes("const ") || s.includes("return ")) return true;
  if (s.includes("font-") && s.includes("text-[")) return true;
  if (s === "HOOD" || s === "==") return true;
  return false;
}

function copyHaystack(): string {
  return copy
    .replace(/\{[^}]+\}/g, " ")
    .replace(/[*`_$]/g, "")
    .replace(/\s+/g, " ");
}

const haystack = copyHaystack();

function inCopy(s: string): boolean {
  if (copy.includes(s)) return true;
  const collapsed = s.replace(/\s+/g, " ").trim();
  if (copy.includes(collapsed)) return true;
  const compact = collapsed.replace(/[$]/g, "").replace(/\s+/g, " ").trim();
  if (haystack.includes(collapsed) || haystack.includes(compact)) return true;
  return false;
}

function extract(src: string): string[] {
  const text = stripNoise(src);
  const found: string[] = [];
  const re = /(['"])((?:\\.|[^\\])*?)\1|`((?:\\.|[^`\\$]|\$\{[^}]*\})*)`/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const raw = (m[2] ?? m[3] ?? "").replace(/\\n/g, " ").replace(/\\'/g, "'");
    const s = raw.replace(/\$\{[^}]+\}/g, " ").replace(/\s+/g, " ").trim();
    if (!isSkipped(s)) found.push(s);
  }
  return found;
}

const files = [...walk(join(root, "app")), ...walk(join(root, "components"))];
const missing: { file: string; text: string }[] = [];
for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const s of extract(src)) {
    if (!inCopy(s)) missing.push({ file: relative(root, file), text: s });
  }
}

const unique = [...new Map(missing.map((row) => [`${row.file}::${row.text}`, row])).values()];
for (const row of unique) {
  console.log(`${row.file}: ${JSON.stringify(row.text)}`);
}
if (unique.length) {
  console.error(`${unique.length} string(s) not found in COPY.md`);
}
