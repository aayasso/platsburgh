# Engine implementation plan

**Goal:** Pure-function engine and fixtures so all nineteen BUILD_SPEC §9 tests pass, with no network and no parcel download.

**Authority:** COPY.md (words), DESIGN_SYSTEM.md (looks), BUILD_SPEC.md (behavior), CALIBRATION_237_N_AIKEN.md (known answer). Do not build or mention anything in BUILD_SPEC §0.5.

**This run does not download data.** Sale-price median is stubbed at 200. Building pace is stubbed at 500. Record both in `docs/DEV_NOTES.md`.

---

## Files

- Create: Next.js 15 App Router app (root), `.env.example`, `.gitignore`
- Create: `lib/rules.ts`, `lib/fit.ts`, `lib/levers.ts`, `lib/proforma.ts`, `lib/pace.ts`, `lib/publicReturn.ts`, `lib/params.ts`
- Create: `data/fixtures/lots.json`
- Create: `scripts/gen-rules-doc.ts` → `docs/RULES.md`
- Create: `tests/` vitest files covering §9
- Create: `docs/DEV_NOTES.md`

---

### Step 1: Scaffold

- Next.js 15 App Router, TypeScript strict, Tailwind
- shadcn/ui: button, card, slider, switch, input, select, sheet, table, tooltip, badge
- vitest, @turf/turf, papaparse, maplibre-gl
- `.env.example` with optional `ANTHROPIC_API_KEY`
- `.gitignore` includes `.env.local`
- `npm run build` passes
- Commit

### Step 2: Regulation sliders and fit

- `lib/rules.ts`: eight regulation sliders from §5 (key, label from COPY.md, explanation, min, max, step, default, code reference)
- `lib/fit.ts`: `fit()` and `fitAll()` exactly per §5; return `{ conforming, constraint, checks[], unknowns[] }`
- `scripts/gen-rules-doc.ts` writes `docs/RULES.md` from `lib/rules.ts`
- Commit

### Step 3: Fixture lots

- `data/fixtures/lots.json`: six lots covering tests 1–6, including anchor `0050M00032000000` with facts from CALIBRATION_237_N_AIKEN.md
- Commit

### Step 4: Levers and conformance tests

- `lib/levers.ts` per §5c
- Tests 1–8, 14, 15, 16, 19 from §9; all pass
- Commit

### Step 5: Pro forma, pace, public return

- `lib/proforma.ts` per §5b (development, household, public support)
- Citywide sale-price median stubbed at 200
- Economics slider definitions in `lib/rules.ts` beside regulation sliders
- `affordablePrice()` with the stated household assumptions
- `lib/pace.ts` and `lib/publicReturn.ts` per §5d–5e; `buildingPace` stubbed at 500
- Tests 9–13, 17, 18 pass
- Stop when all nineteen tests pass
- Summarize stubs and mismatches in `docs/DEV_NOTES.md`
- Commit
