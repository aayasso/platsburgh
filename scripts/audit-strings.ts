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

/** Tokenize a source file into its string literals with positions. */
function tokenizeStrings(src: string): { value: string; pos: number }[] {
  const out: { value: string; pos: number }[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      i += 2;
      while (i < src.length - 1 && !(src[i] === "*" && src[i + 1] === "/")) i++;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const start = i;
      i++;
      let val = "";
      while (i < src.length && src[i] !== ch) {
        if (src[i] === "\\") {
          i++;
          if (src[i] === "n") val += " ";
          else if (src[i] === "'") val += "'";
          else if (src[i] === '"') val += '"';
          else if (src[i] === "\\") val += "\\";
          else val += src[i] ?? "";
          i++;
        } else {
          val += src[i];
          i++;
        }
      }
      i++;
      out.push({ value: val, pos: start });
      continue;
    }
    if (ch === "`") {
      const start = i;
      i++;
      let val = "";
      let depth = 0;
      while (i < src.length) {
        if (src[i] === "\\" && depth === 0) {
          i++;
          if (src[i] === "n") val += " ";
          else val += src[i] ?? "";
          i++;
        } else if (src[i] === "$" && src[i + 1] === "{" && depth === 0) {
          val += " ";
          i += 2;
          depth = 1;
        } else if (depth > 0) {
          if (src[i] === "{") depth++;
          else if (src[i] === "}") {
            depth--;
            if (depth === 0) { i++; continue; }
          }
          i++;
        } else if (src[i] === "`") {
          i++;
          break;
        } else {
          val += src[i];
          i++;
        }
      }
      const clean = val.replace(/\s+/g, " ").trim();
      if (clean) out.push({ value: clean, pos: start });
      continue;
    }
    i++;
  }
  return out;
}

function isSkipped(s: string): boolean {
  if (s.length < 2) return true;
  if (s === "use client" || s === "use server") return true;
  if (/^https?:/.test(s)) return true;
  if (s.startsWith("/")) return true;
  if (s.includes("hsl(") || s.includes("rgba(") || s.includes("var(--")) return true;
  if (/^(GET|POST|PUT|PATCH|DELETE)$/.test(s)) return true;
  if (/^(application|text|image)\//.test(s)) return true;
  // Single identifier-like token (no space, no consecutive caps)
  if (/^[\w./:@%+\-]+$/.test(s) && !/[A-Z]{3,}/.test(s) && !s.includes(" ")) return true;
  if (s.includes("font-") && s.includes("text-[")) return true;
  // CSS class strings: contain typical Tailwind tokens
  if (/\b(flex|grid|bg-|text-\[|border-|rounded|px-|py-|gap-|items-|justify-|w-|h-|min-|max-|z-\d|absolute|relative|overflow|whitespace|pointer-events|leading-|tracking-|data-slot|mt-|mb-|ml-|mr-|space-|fill-|stroke-|tabular-|font-mono|font-display|font-sans|font-semibold|font-bold|p-\d)/.test(s)) return true;
  // Code fragments: contain JS/TS syntax or operators
  if (/[(){};]/.test(s)) return true;
  if (/===|!==|=>|\|\||&&/.test(s)) return true;
  if (/\b(const |let |var |return |function |useRef|useState|useMemo|useEffect|useCallback|import |export |typeof |new |null|undefined)\b/.test(s)) return true;
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

/**
 * For JSX/TSX files: collect string literals in value position
 * (after : or = or , or [) that pass the isSkipped filter.
 */
function lastNonWhitespace(src: string, end: number): string {
  let i = end - 1;
  while (i >= 0 && /\s/.test(src[i])) i--;
  return i >= 0 ? src[i] : "";
}

function extractJsx(src: string): string[] {
  const stripped = src.replace(/^\s*import[\s\S]*?;$/gm, "");
  const tokens = tokenizeStrings(stripped);
  const strings: string[] = [];
  for (const tok of tokens) {
    const ch = lastNonWhitespace(stripped, tok.pos);
    if (ch !== ":" && ch !== "=" && ch !== "," && ch !== "[" && ch !== ">") continue;
    if (!isSkipped(tok.value)) strings.push(tok.value);
  }
  return strings;
}

/**
 * For lib files: only collect strings in value position.
 */
function extractLibValues(src: string): string[] {
  const stripped = src.replace(/^\s*import[\s\S]*?;$/gm, "");
  const tokens = tokenizeStrings(stripped);
  const strings: string[] = [];
  for (const tok of tokens) {
    const ch = lastNonWhitespace(stripped, tok.pos);
    if (ch !== ":" && ch !== "=" && ch !== "," && ch !== "[") continue;
    if (!isSkipped(tok.value)) strings.push(tok.value);
  }
  return strings;
}

const libFiles = [
  join(root, "lib/nextSteps.ts"),
  join(root, "lib/csvExport.ts"),
  join(root, "lib/rules.ts"),
  join(root, "lib/groundTruth.ts"),
  join(root, "lib/parcelSiteFacts.ts"),
];

const jsxFiles = [...walk(join(root, "app")), ...walk(join(root, "components"))];

const missing: { file: string; text: string }[] = [];

for (const file of jsxFiles) {
  const src = readFileSync(file, "utf8");
  for (const s of extractJsx(src)) {
    if (!inCopy(s)) missing.push({ file: relative(root, file), text: s });
  }
}

for (const file of libFiles) {
  const src = readFileSync(file, "utf8");
  for (const s of extractLibValues(src)) {
    if (!inCopy(s)) missing.push({ file: relative(root, file), text: s });
  }
}

const unique = [...new Map(missing.map((row) => [`${row.file}::${row.text}`, row])).values()];
for (const row of unique) {
  console.log(`${row.file}: ${JSON.stringify(row.text)}`);
}
if (unique.length) {
  console.error(`${unique.length} string(s) not found in COPY.md`);
  process.exit(1);
}
