---
title: "Policy and bounded repair — write decide()"
description: Turn hard checks and judge probabilities into accept / repair / escalate — then witness one repair.
order: 5
duration: "10 minutes (live 33:00–43:00)"
---

> Live segment **33:00–43:00**. Third and final required code edit, plus the
> witnessed repair that makes the loop click.

## Outcome

`decide()` combines hard checks and Noul probabilities into one of three
actions, failing **closed** on anything missing or malformed. Then you run the
loop and watch it **repair once, then accept**.

## The file

Edit **`lab/exercises/decide.ts`**:

```ts
export function decide(input: DecisionInput): Decision
```

Input:

```ts
{
  evidenceValid: boolean,
  hardPassed: boolean,
  probabilities: { honest: number, nextStep: number } | null,
  repairsUsed: number,
  thresholds: { repairBelow: number, acceptAt: number }  // default 0.2 / 0.9
}
```

Output: `{ action: 'accept' | 'repair' | 'escalate', reasons: string[] }`.

### Decision order (follow exactly)

1. **Validate / fail closed → `escalate`.** If evidence is missing, stale, or
   malformed, or probabilities are missing or invalid → `escalate`. Probabilities
   must be finite and in `0..1`; `repairsUsed` a non-negative integer;
   thresholds must satisfy `0 <= repairBelow < acceptAt <= 1`.
2. **Repairable? → `repair` (once) else `escalate`.** If a hard check failed
   **or** any probability `<= repairBelow`: repair **if** a repair hasn't been
   used, otherwise escalate. (Max one repair → at most two attempts total.)
3. **Below acceptance? → `escalate`.** If any probability `< acceptAt`,
   escalate.
4. **Otherwise → `accept`.**

Put a short human-readable string in `reasons` for each branch — future-you
reading `report.json` will thank you.

### Why this shape

- **Hard checks can't be averaged away.** A failed hard check isn't rescued by a
  high probability — it routes to repair/escalate.
- **Missing evidence ≠ product failure**, and a **model outage ≠ product
  failure**. Both are "we can't judge" → escalate, not accept, not blame the
  product.
- **A repaired candidate can be accepted** — but only after *fresh* evidence and
  *fresh* judgment. The original defect does not make that later accept a "false
  accept."

## Run it

First the focused check:

```bash
pnpm lab:exercise policy
```

Starter fails closed (red). Representative pass:

```
policy exercise: PASS
```

Now the whole loop with the scripted worker and the **synthetic fixture judge**:

```bash
pnpm lab:loop
```

This uses your three functions. Add `--solution` only as a catch-up/reference comparison.

### Expected observation

The loop collects evidence, asks the judge, hits a defect, **repairs once**,
re-collects fresh evidence, judges again, and **accepts**. Then try the worker
that never fixes anything:

```bash
pnpm lab:loop --stubborn
```

Expected: **repair once, then escalate** (the repair didn't help, and only one
is allowed). Open `report.json` under `.lab-runs/<id>/` to read the attempt
history, decisions, and candidate revisions.

> The probabilities in this loop are **hand-authored synthetic fixtures**, not
> live Jev measurements. They exist so the repair is reproducible in class.

## Progressive hints

1. Write the branches in the exact order above; return as soon as a branch
   matches.
2. Validation first. If you validate after the repair check, malformed input can
   leak into a repair — fail closed up front.
3. "Any probability" means check **both** `honest` and `nextStep`; use the
   lower one for each comparison.
4. Gate repair on `repairsUsed` — `repair` only when `repairsUsed === 0`,
   otherwise `escalate`.
5. Compare with `lab/solution/decide.ts`.

## Catch-up (preserves your edits)

Save first, then:

```bash
cp lab/solution/decide.ts lab/exercises/decide.ts
```

Or add `--solution` to any `lab:loop` / `lab:check` command to run the reference
without touching your file. No reset command exists.

## Discuss

- Why is "accept after a successful repair" **not** a false accept?
- Why does the policy escalate on a judge outage instead of defaulting to accept
  or reject?

## Stretch (optional)

Add a `reasons` entry that distinguishes *why* it escalated (invalid input vs.
low probability vs. repair exhausted). You'll want that nuance in the next
lesson's eval.
