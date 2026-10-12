# Take-home: the verification loop

You built a loop that stops trusting "done" and starts checking it:

> **observe → ask → decide → bounded repair**

Keep this. Everything below is portable to your real projects.

## Start with one feature this week

The [transfer lesson](../src/content/lessons/07-transfer-debrief.md) has the complete **first-30-minutes plan**, a copyable prompt for building an app-specific verifier, Chrome DevTools setup and a receipt-field map.

1. Map one real user path to a repeatable check. Reuse your existing browser, HTTP or CLI harness.
2. Prove the check rejects a known-broken case and accepts a known-good one. Keep every attempt’s evidence and decision.
3. Turn a failure into a labeled evaluation case. Freeze the grader, change one thing, compare with a baseline, then confirm on untouched cases.

Nick’s Riker and Zack’s CTX independently converged on receipts: evidence for a decision now, and a history you can evaluate later. See the public [CTX blueprint](https://zackproser.com/blog/ctx-personal-context-engine) and [verification retrospective](https://zackproser.com/blog/what-survived-the-experiments).

## The pattern

1. **Observe** real behaviour independently — don't trust the agent's claim.
   Collect evidence from the outside, bound to the exact revision you ran.
2. **Ask** precise yes/no questions whose answers are **probabilities** (Nouls).
   One question per criterion; make missing/empty evidence unable to score a yes.
3. **Decide** with **hard checks that can't be averaged away**, and **fail
   closed** on missing evidence or a judge outage (escalate, don't accept).
4. **Repair once**, then re-observe and re-judge. Still short? Escalate to a
   human. Accept-after-repair (on fresh evidence) is *not* a false accept.

## Transfer worksheet

Fill this in for a system you actually ship. (Printable copy:
[`/materials/transfer-worksheet.md`](../public/materials/transfer-worksheet.md).)

1. **The "done" that lies** — what shallow green do people trust?
2. **Independent evidence** — what would you observe from the outside?
3. **Two honest questions** — yes/no, answerable from the evidence alone.
4. **Hard checks** — what must be true regardless of any probability?
5. **Fail-closed path** — what happens when you *can't* judge?
6. **Repair budget** — how many auto-repairs before a human?
7. **Thresholds + holdout** — acceptance bar, and cases held out to check it.

> Start with one task: a settings change, a support reply, or a dashboard filter. Choose the smallest independent observation that would expose a plausible failure.

## Precise claims (don't overstate what you built)

- A **Noul** is the probability of yes — not a separate confidence, not a proof.
- **Synthetic probabilities are fixtures**, hand-authored for reproducibility —
  not live Jev measurements and not a measure of model accuracy.
- The workshop app is **browser-local**: no real enrollment, email, or payment.
- **Process separation is not a security sandbox**; prompt-injection guidance is
  **not** a security guarantee.
- A **small hand-authored suite is not production reliability**.
- **Missing evidence ≠ product failure**; a **model outage ≠ product failure**.

## Commands worth remembering

| Command | What it does |
| --- | --- |
| `pnpm lab:doctor` | Verify your environment |
| `pnpm lab:exercise browser\|questions\|policy` | Grade one file (add `--solution` for the reference) |
| `pnpm lab:loop --solution` | Scripted worker + synthetic judge: repair → accept |
| `pnpm lab:loop --solution --stubborn` | Repair → escalate (repair didn't help) |
| `pnpm lab:check --scenario <name> --solution` | Run one scenario |
| `pnpm lab:eval --solution` | Single-candidate metrics (no repair performed) |
| `pnpm lab:eval --solution --accept-at 0.8` | Threshold experiment, same cases |
| `pnpm lab:eval --solution --suite heldout` | Freeze policy first, then reveal holdout |
| `pnpm lab:test` | Reference/unit/browser regression — no keys, no cost |

Real Jev (`--judge live`) is part of lesson 4 via your key or the facilitator’s demonstration. The generative worker (`--worker live --judge live`) is optional after class. Automated tests use fake API transports; live Jev examples and a repair loop were smoke-tested, but results may change. `pnpm lab:replay` displays actual recorded responses, not feedback on edited questions. The `--accept-at 0.8` fixture eval intentionally exits 1 when it admits a false accept.

## Preserve the run, not just the final green

Keep failed attempts, repairs, escalation and accepted work under distinct run/attempt IDs. Include the task, exact artifact revision, observations, verifier version, outcome and reasons. Add model/tool versions, environment, wall time and cost in your own system; the lab does not yet record all of those. Hashes bind records to bytes, not to truth.

The lab writes `.lab-runs/<id>/report.json` and eval summaries to `.lab-runs/<id>/evaluation.json`. That directory is gitignored local scratch. Archive the records and underlying artifacts you want to keep; don't assume they are uploaded or durable elsewhere.

A curated archive can support regression cases, tool/prompt comparisons and eventually fine-tuning. Labels must come from independent evaluation; split by task family, remove sensitive data, and preserve a separate evaluation set. Failed traces can be useful cases without being good training targets. The [lesson’s improvement-loop recipe](../src/content/lessons/07-transfer-debrief.md#turn-the-history-into-an-improvement-loop) includes budgets, promotion and rollback. No training is implemented in this workshop.

## Keep your game discoveries

Save your labeled `bluff.json` and `legit.json` examples as future regression cases. The scorecard is in `public/materials/bouncer-scorecard.md`. Candidate JSON contains only `storage` and `confirmation`; labels belong in your evaluation data, not in the judge’s input. `--candidate FILE --judge live` tests novel text; `lab:app --candidate FILE` supports explicit human review.

## Source references

- Lessons: `src/content/lessons/`
- Reference implementations: `lab/solution/{observe,questions,decide}.ts`
- Your files: `lab/exercises/{observe,questions,decide}.ts`
- Run artifacts: `.lab-runs/<id>/report.json` (gitignored)
- Live judge SDK: `@typesafe-ai/sdk` 0.6.0 (`TypeSafeClient`, `noul`, `systemOne`)
