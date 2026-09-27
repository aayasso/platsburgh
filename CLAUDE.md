---
description: Platsburgh standing instructions — spec authority, copy, secrets, commits
alwaysApply: true
---

# Platsburgh

Always read `BUILD_SPEC.md`, `DESIGN_SYSTEM.md`, `COPY.md`, and `CALIBRATION_237_N_AIKEN.md` before any task.

## Authority when they disagree

- `COPY.md` for words
- `DESIGN_SYSTEM.md` for looks
- `BUILD_SPEC.md` for behavior
- `CALIBRATION_237_N_AIKEN.md` for the known answer

## Out of scope

`BUILD_SPEC` §0.5 lists what is not in this product. Do not build or propose any of it.

## Copy

Every user-facing string comes from `COPY.md` verbatim. Never invent UI text.

## Secrets

No secrets in the repo. `ANTHROPIC_API_KEY` lives in `.env.local` only.

## Git

Commit after every milestone with a descriptive message.

## Spec mismatches

When a data field or URL doesn't match the spec, log the actual value in `docs/DEV_NOTES.md` and stop; do not guess.
