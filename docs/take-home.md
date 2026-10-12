# Take-home: the verification loop

You built a loop that stops trusting "done" and starts checking it:

> **observe → fix → prove**

Keep this. Everything below is portable to your real projects.

## Start with one feature this week

The [transfer lesson](../src/content/lessons/07-transfer-debrief.md) has the complete **first-30-minutes plan**, a copyable prompt for building an app-specific verifier, Chrome DevTools setup and a receipt-field map.

1. Map one real user path to a repeatable check. Reuse your existing browser, HTTP or CLI harness.
2. Prove the check rejects a known-broken case and accepts a known-good one. Keep every attempt’s evidence and decision.
3. Turn a failure into a labeled evaluation case. Freeze the grader, change one thing, compare with a baseline, then confirm on untouched cases.

Nick’s Riker and Zack’s CTX independently converged on receipts: evidence for a decision now, and a history you can evaluate later. See the public [CTX blueprint](https://zackproser.com/blog/ctx-personal-context-engine) and [verification retrospective](https://zackproser.com/blog/what-survived-the-experiments).

## The pattern

1. **Give the agent a lever** — a small CLI that drives the real app and reports
   what happened as JSON. Errors say what to do next; `doctor` comes first.
2. **Define done in a proof** — exercise the user path, check side effects, and
   write a receipt bound to the exact revision you ran.
3. **Read what assertions can't see** — the screenshot, a narrow yes/no judge
   (a Noul is a probability of yes), or a human.
4. **Stop on evidence** — PASS on the current revision. “Can't tell” is never a
   pass. The same failure after two fixes goes to a human, with the receipt.

## Transfer worksheet

Fill this in for a system you actually ship. (Printable copy:
[`/materials/transfer-worksheet.md`](../public/materials/transfer-worksheet.md).)

1. **The "done" that lies** — what shallow green do people trust?
2. **Independent evidence** — what would you observe from the outside?
3. **Meaning checks** — yes/no questions a model or a human could answer.
4. **Hard checks** — the assertions (including side effects) in your proof.
5. **Can't-tell path** — what happens when evidence is missing or stale?
6. **Repair budget** — how many fixes before a human?
7. **Eval cases + holdout** — which misses you keep, and what you hold out.

> Start with one task: a settings change, a support reply, or a dashboard filter. Choose the smallest independent observation that would expose a plausible failure.

## Precise claims (don't overstate what you built)

- A **Noul** is the probability of yes — not a separate confidence, not a proof.
- A **receipt belongs to one revision**; after any edit it proves nothing.
- The workshop app is **browser-local**: no real enrollment, email, or payment.
- A **revision hash is not isolation** from an agent with a shell.
- **One app and five bugs are not production reliability**.
- **Missing evidence ≠ product failure**; a **model outage ≠ product failure**.

## Commands worth remembering

| Command | What it does |
| --- | --- |
| `pnpm snack help` | Every command, grouped |
| `pnpm snack up` / `doctor` / `down` | Start the app and a Chrome you can drive; check it's worth driving; stop it |
| `pnpm snack join` / `reload` / `storage` / `snapshot` / `console` | Drive and look, like an agent would |
| `pnpm snack prove [--solution]` | Fresh visitor → proof → receipt (exit 0 PASS, 1 FAIL, 2 can't tell) |
| `pnpm snack judge` | Ask Jev whether the copy is honest (needs `TYPESAFE_API_KEY`; one billable call) |
| `pnpm snack up --bug random` | Play the game solo; stopping `up` reveals the bug |
| `pnpm lab:exercise [--solution]` | Your proof vs. a correct app and three broken ones |
| `pnpm lab:test` | Lab regression tests — no keys, no cost |

Automated tests use a fake Jev transport; the live calls were smoke-tested, and results may change. The agent handoff is `lab/verify/SKILL.md` plus `lab/verify/features/waitlist.md`.

## Preserve the run, not just the final green

Keep failed attempts, repairs, escalation and accepted work under distinct run/attempt IDs. Include the task, exact artifact revision, observations, verifier version, outcome and reasons. Add model/tool versions, environment, wall time and cost in your own system; snack doesn't record those. Hashes bind records to bytes, not to truth.

snack writes the latest receipt to `.lab-runs/snack/receipt.json`, appends every receipt to `.lab-runs/snack/receipts/`, and saves `proof-<revision>.png`. That directory is gitignored local scratch. Archive the records and underlying artifacts you want to keep; don't assume they are uploaded or durable elsewhere.

A curated archive can support regression cases, tool/prompt comparisons and eventually fine-tuning. Labels must come from independent evaluation; split by task family, remove sensitive data, and preserve a separate evaluation set. Failed traces can be useful cases without being good training targets. The [lesson’s improvement-loop recipe](../src/content/lessons/07-transfer-debrief.md#turn-the-history-into-an-improvement-loop) includes budgets, promotion and rollback. No training is implemented in this workshop.

## Keep your game discoveries

The bugs that got past `prove` (`overpromise`, `console-error`) are your first regression cases: add a check or a gotcha, then rerun `pnpm lab:exercise` and `pnpm snack up --bug <name>` + `pnpm snack prove` to confirm the miss now fails while the correct app still passes. The scorecard is in `public/materials/game-scorecard.md`.

## Source references

- Lessons: `src/content/lessons/`
- The lever: `lab/snack.ts` (CLI), `lab/proof.ts` (receipt harness), `lab/server.ts` (app server and game bugs)
- Your proof: `lab/exercises/prove.ts`; reference: `lab/solution/prove.ts`
- The agent skill and feature map: `lab/verify/`
- Run artifacts: `.lab-runs/snack/` (gitignored); saved examples: `public/materials/snack-receipts/`
- Live judge SDK: `@typesafe-ai/sdk` 0.6.0 (`TypeSafeClient`, `noul`, `systemOne`)
