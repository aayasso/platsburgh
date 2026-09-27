# AI disclosure

- **Cursor** with **Cursor Grok 4.6** (Grok 4.6) for code generation, refactoring, tests, and these documents, working from a written specification and design system prepared before the event. All rules, checks, formulas, and copy were designed by the author.
- **Anthropic Claude API** at runtime, optional, only for the one-paragraph summary on a parcel page, and only when `ANTHROPIC_API_KEY` is set. The model receives the eight check lines and may use nothing else; the output is validated to contain no numbers not in the checks and is labeled as generated. Counts, checks, and costs contain no model judgment. If the key is not set, the SUMMARY button is not shown.
- No code was written before kickoff.
