# Limitations statement

This is a decision-support prototype built in 39 hours. It is not legal, financial, or zoning advice, and it does not replace review by the City of Pittsburgh Zoning Division, PWSA, or a licensed design professional.

**What the tool is and isn't**

- The sliders apply one set of rules to every parcel in scope, regardless of the parcel's actual zoning district. The district is shown on each parcel page for reference. The tool shows what a given slider set would allow; it does not state the law for a particular parcel.
- Starting slider positions match the current code for a low-density residential district only as a convenience; move anything.
- Contextual setbacks, overlays, historic review, and other case-by-case approvals are not modeled. A parcel shown as non-conforming at a given setting may be approvable in practice, and vice versa. 237 N Aiken Ave is the example: at standard setbacks the building there did not conform; it was approved without a Zoning Board case.
- **NEXT STEPS** on the parcel page is derived from the compliance checks and mapped facts at the current sliders. It is not a permit determination and does not replace review by the City of Pittsburgh Zoning Division, PLI, PWSA, or a licensed design professional.

**Known gaps (shown as "unknown," never guessed)**

- Sewer tap availability and capacity — no open dataset.
- Soils and geotechnical conditions (only mapped landslide-prone and undermined status).
- Title, easements, deed restrictions.
- Any parcel outside the City of Pittsburgh.

**Approximations**

- Frontage and depth are estimated from parcel geometry and street centerlines; irregular parcels may be off. On 237 N Aiken (PIN `0050M00032000000`) the County polygon's street edge is **21.54 ft**; the deed/calibration figure is **22 ft**. Live assessment now records the parcel as improved (SINGLE FAMILY, YEARBLT 2024), so it only appears on the map with **Vacant parcels only** unchecked.
- Slope share comes from the City's 25%-or-greater slope polygons, not a survey.
- The parking check is a simplification (a driveway needs roughly 10 ft of frontage beside the building).
- Years at recent pace is a division, not a forecast: feasible units over the building-pace setting, assuming current sliders hold. Payback counts property tax only, undiscounted.
- The pro forma is four economics sliders plus assessed land value: no margin, no timeline, no rental path, no extra soft costs beyond what's in the construction-cost number. "Feasible" means value covers cost, nothing more. "Affordable" uses one household size and the mortgage assumptions shown as sliders on the parcel page (defaults: 30% of income, 30-year fixed at the Freddie Mac PMMS rate for the week of the hackathon, 3.5% down); it is not a loan decision. The sale-price default is a citywide median of **$160 / sf** (rounded from $161.14). The parcel page shows the median of arm's-length sales within ½ mile (800 m) over the prior 24 months, and falls back to that citywide median when fewer than 5 such sales exist. Typical rent is HUD FY2026 Small Area FMR for a 2-bedroom in the parcel's ZIP (metro FMR if the ZIP has no SAFMR) and is labeled reference only — the rental path is not modeled. The tool is neutral on construction method: the construction-cost slider is user-set (default $200) with observed marks for the NAHB 2024 site-built average ($162) and one Pittsburgh modular build ($260). Site and regulatory figures come from that build's invoices.

**Data currency** — every parcel page shows each dataset's retrieved date. Assessment records lag the real world.

### Sources considered and not used

- Zoning Board of Adjustment decisions — PDF parsing; deliberate
- USGS 3DEP — marginal over City slope polygons
- HMDA — complex, low marginal value
- PA DEP eMapPA — manual access
- OneStopPGH — portal, not data
- Redfin / Realtor.com — parcel-level comps used instead
- PennDOT
- ResStock
- Historical PLI

**Who could be harmed, and what we did about it** — a map full of gray dots in a disinvested neighborhood could read as "don't build here." The constraints list exists so the constraint is always visible, and site constraints are shown separately from regulatory ones. No personal data: private owner names are never displayed.
